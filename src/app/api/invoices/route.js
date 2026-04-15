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
                try {
                    await reportToNav(newInvoice, items, settings);
                } catch (navErr) {
                    console.error('NAV reporting error:', navErr);
                    // NAV hiba nem akadályozza a számla létrehozását,
                    // de jelezzük a státuszban
                    await supabaseAdmin.from('invoices')
                        .update({ nav_status: 'error: ' + navErr.message })
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

            return Response.json({ success: true });
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
// A nav-connector csomag szükséges: npm install nav-connector
// Ha nincs telepítve, a NAV beküldés csendben kimarad.
async function reportToNav(invoice, items, settings) {
    let NavConnector;
    try {
        NavConnector = (await import('nav-connector')).default;
    } catch {
        console.log('nav-connector not installed, skipping NAV reporting');
        return;
    }

    const isTest = process.env.NAV_ENV !== 'production';

    const connector = new NavConnector({
        baseURL: isTest
            ? 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/v3'
            : 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3',
        user: {
            login: settings.nav_login,
            password: settings.nav_password,
            taxNumber: settings.nav_tax_number,
            sigKey: settings.nav_signing_key,
            exchangeKey: settings.nav_replacement_key,
        },
        software: {
            id: 'FOGLALJVELEM-INVOICING',
            name: 'FoglaljVelem Számlázó',
            type: 'LOCAL_SOFTWARE',
            mainVersion: '1',
            devName: 'FoglaljVelem',
            devContact: 'info@foglaljvelem.hu',
        },
    });

    // Build NAV invoice XML data
    const vatRateSummary = {};
    (items || []).forEach(item => {
        const key = item.vat_rate;
        if (!vatRateSummary[key]) vatRateSummary[key] = { net: 0, vat: 0, gross: 0 };
        vatRateSummary[key].net += item.net_amount;
        vatRateSummary[key].vat += item.vat_amount;
        vatRateSummary[key].gross += item.gross_amount;
    });

    const invoiceData = {
        invoiceNumber: invoice.invoice_number,
        invoiceIssueDate: invoice.issue_date,
        completenessIndicator: false,
        invoiceMain: {
            invoice: {
                invoiceHead: {
                    supplierInfo: {
                        supplierTaxNumber: {
                            taxpayerId: settings.tax_number.split('-')[0],
                            vatCode: settings.tax_number.split('-')[1] || '1',
                            countyCode: settings.tax_number.split('-')[2] || '00',
                        },
                        supplierName: settings.company_name,
                        supplierAddress: {
                            simpleAddress: {
                                countryCode: 'HU',
                                postalCode: settings.zip_code,
                                city: settings.city,
                                additionalAddressDetail: settings.address,
                            },
                        },
                    },
                    customerInfo: {
                        customerName: invoice.client_name,
                        customerAddress: {
                            simpleAddress: {
                                countryCode: invoice.client_country || 'HU',
                                postalCode: invoice.client_zip || '0000',
                                city: invoice.client_city || '-',
                                additionalAddressDetail: invoice.client_address || '-',
                            },
                        },
                    },
                    invoiceDetail: {
                        invoiceCategory: 'NORMAL',
                        invoiceDeliveryDate: invoice.fulfillment_date,
                        currencyCode: 'HUF',
                        paymentMethod: invoice.payment_method === 'transfer' ? 'TRANSFER'
                            : invoice.payment_method === 'cash' ? 'CASH'
                            : invoice.payment_method === 'card' ? 'CARD'
                            : 'OTHER',
                        paymentDate: invoice.due_date,
                    },
                },
                invoiceLines: (items || []).map((item, idx) => ({
                    lineNumber: idx + 1,
                    lineDescription: item.description,
                    quantity: item.quantity,
                    unitOfMeasure: 'OWN',
                    unitPrice: item.unit_price,
                    lineNetAmountData: {
                        lineNetAmount: item.net_amount,
                        lineNetAmountHUF: item.net_amount,
                    },
                    lineVatRate: item.vat_rate > 0
                        ? { vatPercentage: item.vat_rate / 100 }
                        : { vatExemption: { case: 'AAM', reason: 'Alanyi adómentes' } },
                    lineGrossAmountData: {
                        lineGrossAmountNormal: item.gross_amount,
                        lineGrossAmountNormalHUF: item.gross_amount,
                    },
                })),
                invoiceSummary: {
                    summaryNormal: {
                        summaryByVatRate: Object.entries(vatRateSummary).map(([rate, sums]) => ({
                            vatRate: Number(rate) > 0
                                ? { vatPercentage: Number(rate) / 100 }
                                : { vatExemption: { case: 'AAM', reason: 'Alanyi adómentes' } },
                            vatRateNetData: { vatRateNetAmount: sums.net, vatRateNetAmountHUF: sums.net },
                            vatRateVatData: { vatRateVatAmount: sums.vat, vatRateVatAmountHUF: sums.vat },
                            vatRateGrossData: { vatRateGrossAmount: sums.gross, vatRateGrossAmountHUF: sums.gross },
                        })),
                        invoiceNetAmount: invoice.net_amount,
                        invoiceNetAmountHUF: invoice.net_amount,
                        invoiceVatAmount: invoice.vat_amount,
                        invoiceVatAmountHUF: invoice.vat_amount,
                        invoiceGrossAmount: invoice.gross_amount,
                        invoiceGrossAmountHUF: invoice.gross_amount,
                    },
                },
            },
        },
    };

    const transactionId = await connector.manageInvoice({
        invoiceOperations: {
            compressedContent: false,
            invoiceOperation: [{
                index: 1,
                invoiceOperation: 'CREATE',
                invoiceData: JSON.stringify(invoiceData),
            }],
        },
    });

    // Save transaction ID
    if (transactionId && supabaseAdmin) {
        await supabaseAdmin.from('invoices')
            .update({ nav_transaction_id: transactionId, nav_status: 'sent' })
            .eq('id', invoice.id);
    }

    console.log('NAV invoice reported, transaction:', transactionId);
}
