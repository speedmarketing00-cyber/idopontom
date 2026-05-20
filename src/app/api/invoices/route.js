import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, profileId } = body;

        if (!supabaseAdmin || !profileId) {
            return Response.json({ error: 'Szerver konfiguráció hiba' }, { status: 500 });
        }

        // ===================== CREATE INVOICE =====================
        if (action === 'create') {
            const { invoice, items } = body;

            // Get settings + next invoice number (atomic)
            const { data: settings, error: settingsError } = await supabaseAdmin
                .from('invoice_settings')
                .select('*')
                .eq('profile_id', profileId)
                .maybeSingle();

            if (!settings || settingsError) {
                return Response.json({ error: 'Először töltsd ki a cégadatokat!' }, { status: 400 });
            }

            // Generate invoice number: PREFIX-YYYY-NNN
            const year = new Date().getFullYear();
            const num = String(settings.next_invoice_number).padStart(3, '0');
            const invoiceNumber = `${settings.invoice_prefix}-${year}-${num}`;

            // Insert invoice
            const { data: newInvoice, error: insertError } = await supabaseAdmin
                .from('invoices')
                .insert({
                    profile_id: profileId,
                    invoice_number: invoiceNumber,
                    status: invoice.status || 'draft',
                    client_name: invoice.client_name,
                    client_tax_number: invoice.client_tax_number || '',
                    client_address: invoice.client_address || '',
                    client_city: invoice.client_city || '',
                    client_zip: invoice.client_zip || '',
                    client_country: invoice.client_country || 'HU',
                    client_email: invoice.client_email || '',
                    issue_date: invoice.issue_date,
                    fulfillment_date: invoice.fulfillment_date,
                    due_date: invoice.due_date,
                    net_amount: invoice.net_amount,
                    vat_amount: invoice.vat_amount,
                    gross_amount: invoice.gross_amount,
                    currency: 'HUF',
                    payment_method: invoice.payment_method || 'transfer',
                    notes: invoice.notes || '',
                })
                .select()
                .single();

            if (insertError) {
                console.error('Invoice insert error:', insertError);
                if (insertError.code === '23505') {
                    return Response.json({ error: 'Ez a számlaszám már létezik!' }, { status: 409 });
                }
                return Response.json({ error: insertError.message }, { status: 500 });
            }

            // Insert items
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    invoice_id: newInvoice.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit || 'db',
                    unit_price: item.unit_price,
                    vat_rate: item.vat_rate,
                    net_amount: item.net_amount,
                    vat_amount: item.vat_amount,
                    gross_amount: item.gross_amount,
                    sort_order: item.sort_order || 0,
                }));

                const { error: itemsError } = await supabaseAdmin
                    .from('invoice_items')
                    .insert(itemsToInsert);

                if (itemsError) console.error('Invoice items error:', itemsError);
            }

            // Increment next invoice number
            await supabaseAdmin
                .from('invoice_settings')
                .update({ next_invoice_number: settings.next_invoice_number + 1 })
                .eq('profile_id', profileId);

            // NAV Online Számla beküldés (ha kiállított és van NAV konfig)
            if (invoice.status === 'issued' && settings.nav_login && settings.nav_signing_key) {
                await supabaseAdmin.from('invoices')
                    .update({ nav_status: 'pending' })
                    .eq('id', newInvoice.id);
                try {
                    await reportToNav(newInvoice, items, settings);
                } catch (navErr) {
                    console.error('NAV reporting error:', navErr);
                    await supabaseAdmin.from('invoices')
                        .update({ nav_status: 'retry_needed: ' + navErr.message.substring(0, 400) })
                        .eq('id', newInvoice.id);
                }
            }

            return Response.json({ success: true, invoice: newInvoice });
        }

        // ===================== UPDATE STATUS =====================
        if (action === 'update-status') {
            const { invoiceId, status } = body;

            // Validate status transition
            const { data: existing } = await supabaseAdmin
                .from('invoices')
                .select('status')
                .eq('id', invoiceId)
                .eq('profile_id', profileId)
                .single();

            if (!existing) {
                return Response.json({ error: 'Számla nem található' }, { status: 404 });
            }

            // Business rules
            if (existing.status === 'storno' || existing.status === 'cancelled') {
                return Response.json({ error: 'Sztornózott/visszavont számla nem módosítható' }, { status: 400 });
            }
            if (status === 'storno' && existing.status !== 'issued' && existing.status !== 'paid') {
                return Response.json({ error: 'Csak kiállított vagy fizetett számla sztornózható' }, { status: 400 });
            }

            const { error: updateError } = await supabaseAdmin
                .from('invoices')
                .update({ status })
                .eq('id', invoiceId)
                .eq('profile_id', profileId);

            if (updateError) {
                return Response.json({ error: updateError.message }, { status: 500 });
            }

            // NAV beküldés ha draft → issued státusz változás
            if (status === 'issued' && existing.status === 'draft') {
                const { data: settings } = await supabaseAdmin
                    .from('invoice_settings')
                    .select('*')
                    .eq('profile_id', profileId)
                    .maybeSingle();

                if (settings?.nav_login && settings?.nav_signing_key) {
                    await supabaseAdmin.from('invoices')
                        .update({ nav_status: 'pending' })
                        .eq('id', invoiceId);

                    const [{ data: fullInvoice }, { data: invoiceItems }] = await Promise.all([
                        supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).single(),
                        supabaseAdmin.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
                    ]);

                    try {
                        await reportToNav(fullInvoice, invoiceItems || [], settings);
                        await supabaseAdmin.from('invoices')
                            .update({ nav_status: 'reported' })
                            .eq('id', invoiceId);
                    } catch (navErr) {
                        console.error('NAV reporting error on status change:', navErr);
                        await supabaseAdmin.from('invoices')
                            .update({ nav_status: 'retry_needed: ' + navErr.message.substring(0, 400) })
                            .eq('id', invoiceId);
                    }
                }
            }

            // NAV sztornó beküldés ha issued/paid → storno státusz változás
            if (status === 'storno' && (existing.status === 'issued' || existing.status === 'paid')) {
                const { data: settings } = await supabaseAdmin
                    .from('invoice_settings')
                    .select('*')
                    .eq('profile_id', profileId)
                    .maybeSingle();

                if (settings?.nav_login && settings?.nav_signing_key) {
                    const { data: fullInvoice } = await supabaseAdmin
                        .from('invoices')
                        .select('*')
                        .eq('id', invoiceId)
                        .single();

                    if (fullInvoice?.nav_transaction_id || fullInvoice?.nav_status === 'reported' || fullInvoice?.nav_status === 'sent') {
                        try {
                            await stornoOnNav(fullInvoice, settings);
                            await supabaseAdmin.from('invoices')
                                .update({ nav_status: 'storno_sent' })
                                .eq('id', invoiceId);
                        } catch (navErr) {
                            console.error('NAV storno error:', navErr);
                            await supabaseAdmin.from('invoices')
                                .update({ nav_status: 'storno_retry: ' + navErr.message.substring(0, 400) })
                                .eq('id', invoiceId);
                        }
                    }
                }
            }

            return Response.json({ success: true });
        }

        // ===================== QUERY NAV TRANSACTION STATUS =====================
        if (action === 'query-nav-status') {
            const { invoiceId } = body;

            const { data: invoice } = await supabaseAdmin
                .from('invoices')
                .select('*')
                .eq('id', invoiceId)
                .eq('profile_id', profileId)
                .single();

            if (!invoice?.nav_transaction_id) {
                return Response.json({ error: 'Nincs NAV tranzakció ehhez a számlához' }, { status: 400 });
            }

            const { data: settings } = await supabaseAdmin
                .from('invoice_settings')
                .select('*')
                .eq('profile_id', profileId)
                .maybeSingle();

            let NavConnector;
            try {
                NavConnector = (await import('@angro/nav-connector')).default;
            } catch {
                return Response.json({ error: 'nav-connector not installed' }, { status: 500 });
            }

            const { connector } = createNavConnector(NavConnector, settings);
            const status = await connector.queryTransactionStatus({ transactionId: invoice.nav_transaction_id });

            return Response.json({ transactionId: invoice.nav_transaction_id, status });
        }

        // ===================== GENERATE PDF (HTML) =====================
        if (action === 'generate-pdf') {
            const { invoiceId } = body;

            // Load invoice + items + settings
            const [
                { data: invoice },
                { data: items },
                { data: settings },
            ] = await Promise.all([
                supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).eq('profile_id', profileId).single(),
                supabaseAdmin.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
                supabaseAdmin.from('invoice_settings').select('*').eq('profile_id', profileId).maybeSingle(),
            ]);

            if (!invoice || !settings) {
                return Response.json({ error: 'Számla nem található' }, { status: 404 });
            }

            const html = generateInvoiceHtml(invoice, items || [], settings);
            return Response.json({ success: true, html });
        }

        // ===================== SEND EMAIL =====================
        if (action === 'send-email') {
            const { invoiceId } = body;

            const [
                { data: invoice },
                { data: items },
                { data: settings },
            ] = await Promise.all([
                supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).eq('profile_id', profileId).single(),
                supabaseAdmin.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
                supabaseAdmin.from('invoice_settings').select('*').eq('profile_id', profileId).maybeSingle(),
            ]);

            if (!invoice || !settings || !invoice.client_email) {
                return Response.json({ error: 'Számla vagy email cím nem található' }, { status: 400 });
            }

            if (!resend) {
                return Response.json({ error: 'Email szolgáltatás nincs konfigurálva' }, { status: 500 });
            }

            const html = generateInvoiceHtml(invoice, items || [], settings);

            await resend.emails.send({
                from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                to: invoice.client_email,
                subject: `Számla: ${invoice.invoice_number} – ${settings.company_name}`,
                html: html,
            });

            return Response.json({ success: true });
        }

        return Response.json({ error: 'Ismeretlen művelet' }, { status: 400 });
    } catch (error) {
        console.error('Invoice API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

// =============================================
// INVOICE HTML TEMPLATE (for PDF & email)
// =============================================
function generateInvoiceHtml(invoice, items, settings) {
    const fmtDate = (d) => new Date(d).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    const fmtNum = (n) => Number(n).toLocaleString('hu-HU');
    const paymentLabels = { transfer: 'Átutalás', cash: 'Készpénz', card: 'Bankkártya', other: 'Egyéb' };
    const statusLabels = { draft: 'PISZKOZAT', issued: 'SZÁMLA', paid: 'FIZETVE', storno: 'SZTORNÓ', cancelled: 'VISSZAVONVA' };

    const isStorno = invoice.status === 'storno';

    const itemRows = items.map(item => `
        <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">${item.description}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.quantity} ${item.unit}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtNum(item.unit_price)} Ft</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.vat_rate}%</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtNum(item.net_amount)} Ft</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${fmtNum(item.gross_amount)} Ft</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <title>${invoice.invoice_number}</title>
    <style>
        @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; margin: 0; padding: 20px; background: #fff; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
<div class="container">
    <!-- Print button -->
    <div class="no-print" style="text-align:right;margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:0.9rem;cursor:pointer;">
            🖨️ Nyomtatás / Mentés PDF-ként
        </button>
    </div>

    ${isStorno ? '<div style="text-align:center;padding:12px;background:#fef2f2;border:2px solid #dc2626;border-radius:8px;margin-bottom:20px;color:#dc2626;font-weight:700;font-size:1.1rem;">SZTORNÓ SZÁMLA</div>' : ''}

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #2563eb;">
        <div>
            <h1 style="margin:0;font-size:1.8rem;color:#1e3a5f;">${statusLabels[invoice.status] || 'SZÁMLA'}</h1>
            <div style="font-size:1.1rem;color:#2563eb;font-weight:700;margin-top:4px;">${invoice.invoice_number}</div>
        </div>
        <div style="text-align:right;">
            <div style="font-weight:700;font-size:1.1rem;">${settings.company_name}</div>
            <div style="font-size:0.85rem;color:#6b7280;">${settings.zip_code} ${settings.city}, ${settings.address}</div>
            <div style="font-size:0.85rem;color:#6b7280;">Adószám: ${settings.tax_number}</div>
            ${settings.bank_account ? `<div style="font-size:0.85rem;color:#6b7280;">Bankszámla: ${settings.bank_account}</div>` : ''}
            ${settings.bank_name ? `<div style="font-size:0.85rem;color:#6b7280;">${settings.bank_name}</div>` : ''}
        </div>
    </div>

    <!-- Dates + Client -->
    <div style="display:flex;justify-content:space-between;margin-bottom:30px;gap:30px;">
        <div style="flex:1;">
            <div style="font-size:0.75rem;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Vevő</div>
            <div style="font-weight:700;font-size:1rem;">${invoice.client_name}</div>
            ${invoice.client_tax_number ? `<div style="font-size:0.85rem;color:#6b7280;">Adószám: ${invoice.client_tax_number}</div>` : ''}
            <div style="font-size:0.85rem;color:#6b7280;">${invoice.client_zip} ${invoice.client_city}${invoice.client_address ? ', ' + invoice.client_address : ''}</div>
            ${invoice.client_email ? `<div style="font-size:0.85rem;color:#6b7280;">${invoice.client_email}</div>` : ''}
        </div>
        <div style="text-align:right;">
            <div style="margin-bottom:6px;"><span style="font-size:0.8rem;color:#9ca3af;">Kiállítás:</span> <strong>${fmtDate(invoice.issue_date)}</strong></div>
            <div style="margin-bottom:6px;"><span style="font-size:0.8rem;color:#9ca3af;">Teljesítés:</span> <strong>${fmtDate(invoice.fulfillment_date)}</strong></div>
            <div style="margin-bottom:6px;"><span style="font-size:0.8rem;color:#9ca3af;">Fizetési határidő:</span> <strong>${fmtDate(invoice.due_date)}</strong></div>
            <div><span style="font-size:0.8rem;color:#9ca3af;">Fizetés módja:</span> <strong>${paymentLabels[invoice.payment_method] || invoice.payment_method}</strong></div>
        </div>
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
            <tr style="background:#f3f4f6;">
                <th style="padding:12px 8px;text-align:left;font-size:0.8rem;color:#6b7280;font-weight:600;">Megnevezés</th>
                <th style="padding:12px 8px;text-align:right;font-size:0.8rem;color:#6b7280;font-weight:600;">Mennyiség</th>
                <th style="padding:12px 8px;text-align:right;font-size:0.8rem;color:#6b7280;font-weight:600;">Egységár</th>
                <th style="padding:12px 8px;text-align:right;font-size:0.8rem;color:#6b7280;font-weight:600;">ÁFA</th>
                <th style="padding:12px 8px;text-align:right;font-size:0.8rem;color:#6b7280;font-weight:600;">Nettó</th>
                <th style="padding:12px 8px;text-align:right;font-size:0.8rem;color:#6b7280;font-weight:600;">Bruttó</th>
            </tr>
        </thead>
        <tbody>
            ${itemRows}
        </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;">
        <div style="min-width:280px;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.9rem;color:#6b7280;">
                <span>Nettó összesen:</span><span>${fmtNum(invoice.net_amount)} Ft</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.9rem;color:#6b7280;">
                <span>ÁFA összesen:</span><span>${fmtNum(invoice.vat_amount)} Ft</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:1.2rem;font-weight:700;border-top:2px solid #1f2937;">
                <span>Fizetendő:</span><span>${fmtNum(invoice.gross_amount)} Ft</span>
            </div>
        </div>
    </div>

    ${invoice.notes ? `<div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;font-size:0.85rem;color:#6b7280;"><strong>Megjegyzés:</strong> ${invoice.notes}</div>` : ''}

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:0.75rem;color:#9ca3af;">
        Készítette: FoglaljVelem.hu számlázó modul
    </div>
</div>
</body>
</html>`;
}

// =============================================
// NAV ONLINE SZÁMLA REPORTING
// =============================================
// @angro/nav-connector v6 — base64 kódolt NAV 3.0 XML szükséges

function createNavConnector(NavConnector, settings) {
    const isTest = process.env.NAV_ENV !== 'production';
    const navTaxNumber = (settings.nav_tax_number || '').split('-')[0];

    const technicalUser = {
        login: settings.nav_login,
        password: settings.nav_password,
        taxNumber: navTaxNumber,
        signatureKey: settings.nav_signing_key,
        exchangeKey: settings.nav_replacement_key,
    };

    const softwareData = {
        softwareId: 'FOGLALJVELEM000001',
        softwareName: 'FoglaljVelem Szamlazo',
        softwareOperation: 'LOCAL_SOFTWARE',
        softwareMainVersion: '1.0',
        softwareDevName: 'FoglaljVelem',
        softwareDevContact: 'info@foglaljvelem.hu',
        softwareDevCountryCode: 'HU',
        softwareDevTaxNumber: navTaxNumber,
    };

    const baseURL = isTest
        ? 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/v3/'
        : 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3/';

    return { connector: new NavConnector({ technicalUser, softwareData, baseURL }), navTaxNumber };
}

async function withRetry(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isRetryable = err.message?.includes('ETIMEDOUT') || err.message?.includes('ECONNREFUSED')
                || err.message?.includes('ECONNRESET') || err.message?.includes('ENOTFOUND')
                || err.message?.includes('socket hang up') || err.code === 'ETIMEDOUT';
            if (!isRetryable || attempt === maxRetries) throw err;
            const delay = attempt * 3000;
            console.log(`NAV retry ${attempt}/${maxRetries}, waiting ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function reportToNav(invoice, items, settings) {
    let NavConnector;
    try {
        NavConnector = (await import('@angro/nav-connector')).default;
    } catch {
        console.log('@angro/nav-connector not installed, skipping NAV reporting');
        return;
    }

    const { connector, navTaxNumber } = createNavConnector(NavConnector, settings);

    await withRetry(async () => {
        try {
            await connector.testConnection();
            console.log('NAV connection test successful');
        } catch (connErr) {
            console.error('NAV connection test failed:', connErr?.response?.data || connErr.message);
            throw new Error('NAV kapcsolat teszt sikertelen: ' + (connErr?.response?.data?.result?.message || connErr.message));
        }
    });

    const supplierTaxParts = (settings.tax_number || '').split('-');
    const paymentMethodMap = { transfer: 'TRANSFER', cash: 'CASH', card: 'CARD' };
    const navPaymentMethod = paymentMethodMap[invoice.payment_method] || 'OTHER';

    // ÁFA összesítő
    const vatRateSummary = {};
    (items || []).forEach(item => {
        const key = String(item.vat_rate || 0);
        if (!vatRateSummary[key]) vatRateSummary[key] = { net: 0, vat: 0, gross: 0 };
        vatRateSummary[key].net += Number(item.net_amount || 0);
        vatRateSummary[key].vat += Number(item.vat_amount || 0);
        vatRateSummary[key].gross += Number(item.gross_amount || 0);
    });

    // Számla tételek XML
    const linesXml = (items || []).map((item, idx) => {
        const vatRateXml = Number(item.vat_rate) > 0
            ? `<vatPercentage>${(Number(item.vat_rate) / 100).toFixed(4)}</vatPercentage>`
            : `<vatExemption><case>AAM</case><reason>Alanyi adómentes</reason></vatExemption>`;

        return `<line>
            <lineNumber>${idx + 1}</lineNumber>
            <lineExpressionIndicator>true</lineExpressionIndicator>
            <lineDescription>${escapeXml(item.description || '')}</lineDescription>
            <quantity>${Number(item.quantity || 1).toFixed(2)}</quantity>
            <unitOfMeasure>OWN</unitOfMeasure>
            <unitPrice>${Number(item.unit_price || 0).toFixed(2)}</unitPrice>
            <lineAmountsNormal>
                <lineNetAmountData>
                    <lineNetAmount>${Number(item.net_amount || 0).toFixed(2)}</lineNetAmount>
                    <lineNetAmountHUF>${Number(item.net_amount || 0).toFixed(2)}</lineNetAmountHUF>
                </lineNetAmountData>
                <lineVatRate>${vatRateXml}</lineVatRate>
                <lineVatData>
                    <lineVatAmount>${Number(item.vat_amount || 0).toFixed(2)}</lineVatAmount>
                    <lineVatAmountHUF>${Number(item.vat_amount || 0).toFixed(2)}</lineVatAmountHUF>
                </lineVatData>
                <lineGrossAmountData>
                    <lineGrossAmountNormal>${Number(item.gross_amount || 0).toFixed(2)}</lineGrossAmountNormal>
                    <lineGrossAmountNormalHUF>${Number(item.gross_amount || 0).toFixed(2)}</lineGrossAmountNormalHUF>
                </lineGrossAmountData>
            </lineAmountsNormal>
        </line>`;
    }).join('\n');

    // ÁFA összesítő XML
    const summaryByVatRateXml = Object.entries(vatRateSummary).map(([rate, sums]) => {
        const vatRateXml = Number(rate) > 0
            ? `<vatPercentage>${(Number(rate) / 100).toFixed(4)}</vatPercentage>`
            : `<vatExemption><case>AAM</case><reason>Alanyi adómentes</reason></vatExemption>`;

        return `<summaryByVatRate>
            <vatRate>${vatRateXml}</vatRate>
            <vatRateNetData>
                <vatRateNetAmount>${sums.net.toFixed(2)}</vatRateNetAmount>
                <vatRateNetAmountHUF>${sums.net.toFixed(2)}</vatRateNetAmountHUF>
            </vatRateNetData>
            <vatRateVatData>
                <vatRateVatAmount>${sums.vat.toFixed(2)}</vatRateVatAmount>
                <vatRateVatAmountHUF>${sums.vat.toFixed(2)}</vatRateVatAmountHUF>
            </vatRateVatData>
        </summaryByVatRate>`;
    }).join('\n');

    // Ügyfél adatok XML
    let customerVatXml = '';
    if (invoice.client_tax_number) {
        const clientTaxParts = invoice.client_tax_number.split('-');
        customerVatXml = `<customerVatStatus>DOMESTIC</customerVatStatus>
                    <customerVatData>
                        <customerTaxNumber>
                            <base:taxpayerId>${clientTaxParts[0] || ''}</base:taxpayerId>
                            <base:vatCode>${clientTaxParts[1] || '1'}</base:vatCode>
                            <base:countyCode>${clientTaxParts[2] || '00'}</base:countyCode>
                        </customerTaxNumber>
                    </customerVatData>`;
    } else {
        customerVatXml = `<customerVatStatus>PRIVATE_PERSON</customerVatStatus>`;
    }

    // Teljes NAV InvoiceData XML (v3.0 séma)
    const invoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<InvoiceData xmlns="http://schemas.nav.gov.hu/OSA/3.0/data" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:base="http://schemas.nav.gov.hu/OSA/3.0/base">
    <invoiceNumber>${escapeXml(invoice.invoice_number)}</invoiceNumber>
    <invoiceIssueDate>${invoice.issue_date}</invoiceIssueDate>
    <completenessIndicator>false</completenessIndicator>
    <invoiceMain>
        <invoice>
            <invoiceHead>
                <supplierInfo>
                    <supplierTaxNumber>
                        <base:taxpayerId>${supplierTaxParts[0] || navTaxNumber}</base:taxpayerId>
                        <base:vatCode>${supplierTaxParts[1] || '1'}</base:vatCode>
                        <base:countyCode>${supplierTaxParts[2] || '00'}</base:countyCode>
                    </supplierTaxNumber>
                    <supplierName>${escapeXml(settings.company_name || '')}</supplierName>
                    <supplierAddress>
                        <base:simpleAddress>
                            <base:countryCode>HU</base:countryCode>
                            <base:postalCode>${escapeXml(settings.zip_code || '0000')}</base:postalCode>
                            <base:city>${escapeXml(settings.city || '-')}</base:city>
                            <base:additionalAddressDetail>${escapeXml(settings.address || '-')}</base:additionalAddressDetail>
                        </base:simpleAddress>
                    </supplierAddress>
                </supplierInfo>
                <customerInfo>
                    ${customerVatXml}
                    <customerName>${escapeXml(invoice.client_name || '')}</customerName>
                    <customerAddress>
                        <base:simpleAddress>
                            <base:countryCode>${invoice.client_country || 'HU'}</base:countryCode>
                            <base:postalCode>${escapeXml(invoice.client_zip || '0000')}</base:postalCode>
                            <base:city>${escapeXml(invoice.client_city || '-')}</base:city>
                            <base:additionalAddressDetail>${escapeXml(invoice.client_address || '-')}</base:additionalAddressDetail>
                        </base:simpleAddress>
                    </customerAddress>
                </customerInfo>
                <invoiceDetail>
                    <invoiceCategory>NORMAL</invoiceCategory>
                    <invoiceDeliveryDate>${invoice.fulfillment_date}</invoiceDeliveryDate>
                    <currencyCode>HUF</currencyCode>
                    <exchangeRate>1</exchangeRate>
                    <paymentMethod>${navPaymentMethod}</paymentMethod>
                    <paymentDate>${invoice.due_date}</paymentDate>
                    <invoiceAppearance>ELECTRONIC</invoiceAppearance>
                </invoiceDetail>
            </invoiceHead>
            <invoiceLines>
                <mergedItemIndicator>false</mergedItemIndicator>
                ${linesXml}
            </invoiceLines>
            <invoiceSummary>
                <summaryNormal>
                    ${summaryByVatRateXml}
                    <invoiceNetAmount>${Number(invoice.net_amount || 0).toFixed(2)}</invoiceNetAmount>
                    <invoiceNetAmountHUF>${Number(invoice.net_amount || 0).toFixed(2)}</invoiceNetAmountHUF>
                    <invoiceVatAmount>${Number(invoice.vat_amount || 0).toFixed(2)}</invoiceVatAmount>
                    <invoiceVatAmountHUF>${Number(invoice.vat_amount || 0).toFixed(2)}</invoiceVatAmountHUF>
                </summaryNormal>
                <summaryGrossData>
                    <invoiceGrossAmount>${Number(invoice.gross_amount || 0).toFixed(2)}</invoiceGrossAmount>
                    <invoiceGrossAmountHUF>${Number(invoice.gross_amount || 0).toFixed(2)}</invoiceGrossAmountHUF>
                </summaryGrossData>
            </invoiceSummary>
        </invoice>
    </invoiceMain>
</InvoiceData>`;

    // Base64 kódolás (a nav-connector base64 stringet vár)
    const invoiceBase64 = Buffer.from(invoiceXml, 'utf-8').toString('base64');

    console.log('NAV invoice XML built, sending to NAV...');

    const transactionId = await withRetry(() => connector.manageInvoice({
        compressedContent: false,
        invoiceOperation: [{
            index: 1,
            invoiceOperation: 'CREATE',
            invoiceData: invoiceBase64,
        }],
    }));

    // Save transaction ID
    if (transactionId && supabaseAdmin) {
        await supabaseAdmin.from('invoices')
            .update({ nav_transaction_id: transactionId, nav_status: 'sent' })
            .eq('id', invoice.id);
    }

    console.log('NAV invoice reported, transaction:', transactionId);

    // Tranzakció státusz lekérdezés (pár másodperc múlva, háttérben)
    setTimeout(async () => {
        try {
            const status = await connector.queryTransactionStatus({ transactionId });
            const processingResults = status?.processingResults?.processingResult;
            if (processingResults) {
                const results = Array.isArray(processingResults) ? processingResults : [processingResults];
                for (const r of results) {
                    console.log('NAV transaction status:', JSON.stringify(r, null, 2));
                    if (r.invoiceStatus === 'DONE') {
                        await supabaseAdmin.from('invoices')
                            .update({ nav_status: 'reported' })
                            .eq('id', invoice.id);
                    } else if (r.invoiceStatus === 'ABORTED') {
                        const errMsg = r.technicalValidationMessages?.map(m => m.message).join('; ') || 'ABORTED';
                        console.error('NAV ABORTED:', errMsg);
                        await supabaseAdmin.from('invoices')
                            .update({ nav_status: 'error: ' + errMsg.substring(0, 500) })
                            .eq('id', invoice.id);
                    }
                }
            }
        } catch (e) {
            console.log('NAV transaction status query failed (will retry on portal):', e.message);
        }
    }, 5000);
}

// =============================================
// NAV SZTORNÓ BEKÜLDÉS
// =============================================
async function stornoOnNav(invoice, settings) {
    let NavConnector;
    try {
        NavConnector = (await import('@angro/nav-connector')).default;
    } catch {
        console.log('@angro/nav-connector not installed, skipping NAV storno');
        return;
    }

    const { connector } = createNavConnector(NavConnector, settings);
    const annulmentXml = `<?xml version="1.0" encoding="UTF-8"?>
<InvoiceAnnulment xmlns="http://schemas.nav.gov.hu/OSA/3.0/annul">
    <annulmentReference>${escapeXml(invoice.invoice_number)}</annulmentReference>
    <annulmentTimestamp>${new Date().toISOString()}</annulmentTimestamp>
    <annulmentCode>ERRATIC_DATA</annulmentCode>
    <annulmentReason>Szamla sztornozasa - ${escapeXml(invoice.invoice_number)}</annulmentReason>
</InvoiceAnnulment>`;

    const annulmentBase64 = Buffer.from(annulmentXml, 'utf-8').toString('base64');

    console.log('NAV storno sending for invoice:', invoice.invoice_number);

    const transactionId = await withRetry(() => connector.manageAnnulment({
        annulmentOperation: [{
            index: 1,
            annulmentOperation: 'ANNUL',
            invoiceAnnulment: annulmentBase64,
        }],
    }));

    console.log('NAV storno sent, transaction:', transactionId);
}

// XML special karakter escape
function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
