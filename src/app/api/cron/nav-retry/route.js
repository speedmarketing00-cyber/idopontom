import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function GET(request) {
    if (!supabaseAdmin) {
        return Response.json({ error: 'DB not configured' }, { status: 500 });
    }

    // Keresünk retry_needed vagy storno_retry státuszú számlákat
    const { data: retryInvoices } = await supabaseAdmin
        .from('invoices')
        .select('*, invoice_items(*)')
        .or('nav_status.like.retry_needed:%,nav_status.like.storno_retry:%,nav_status.eq.pending')
        .in('status', ['issued', 'paid', 'storno'])
        .order('created_at', { ascending: true })
        .limit(10);

    if (!retryInvoices?.length) {
        return Response.json({ message: 'No NAV retries needed', count: 0 });
    }

    console.log(`NAV retry cron: ${retryInvoices.length} invoice(s) to retry`);

    let NavConnector;
    try {
        NavConnector = (await import('@angro/nav-connector')).default;
    } catch {
        return Response.json({ error: '@angro/nav-connector not installed' }, { status: 500 });
    }

    const results = [];

    for (const invoice of retryInvoices) {
        const { data: settings } = await supabaseAdmin
            .from('invoice_settings')
            .select('*')
            .eq('profile_id', invoice.profile_id)
            .maybeSingle();

        if (!settings?.nav_login || !settings?.nav_signing_key) {
            results.push({ id: invoice.id, number: invoice.invoice_number, result: 'skipped: no NAV config' });
            continue;
        }

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

        const connector = new NavConnector({ technicalUser, softwareData, baseURL });

        const isStorno = invoice.nav_status?.startsWith('storno_retry');

        try {
            await connector.testConnection();

            if (isStorno) {
                // Stornó újrapróbálás
                const annulmentXml = `<?xml version="1.0" encoding="UTF-8"?>
<InvoiceAnnulment xmlns="http://schemas.nav.gov.hu/OSA/3.0/annul">
    <annulmentReference>${escapeXml(invoice.invoice_number)}</annulmentReference>
    <annulmentTimestamp>${new Date().toISOString()}</annulmentTimestamp>
    <annulmentCode>ERRATIC_DATA</annulmentCode>
    <annulmentReason>Szamla sztornozasa - ${escapeXml(invoice.invoice_number)}</annulmentReason>
</InvoiceAnnulment>`;
                const annulmentBase64 = Buffer.from(annulmentXml, 'utf-8').toString('base64');

                const txId = await connector.manageAnnulment({
                    annulmentOperation: [{ index: 1, annulmentOperation: 'ANNUL', invoiceAnnulment: annulmentBase64 }],
                });

                await supabaseAdmin.from('invoices')
                    .update({ nav_status: 'storno_sent', nav_transaction_id: txId })
                    .eq('id', invoice.id);

                console.log(`NAV retry storno OK: ${invoice.invoice_number}, tx: ${txId}`);
                results.push({ id: invoice.id, number: invoice.invoice_number, result: 'storno_sent', txId });

            } else {
                // Számla beküldés újrapróbálás
                const items = invoice.invoice_items || [];
                const supplierTaxParts = (settings.tax_number || '').split('-');
                const paymentMethodMap = { transfer: 'TRANSFER', cash: 'CASH', card: 'CARD' };
                const navPaymentMethod = paymentMethodMap[invoice.payment_method] || 'OTHER';

                const vatRateSummary = {};
                items.forEach(item => {
                    const key = String(item.vat_rate || 0);
                    if (!vatRateSummary[key]) vatRateSummary[key] = { net: 0, vat: 0, gross: 0 };
                    vatRateSummary[key].net += Number(item.net_amount || 0);
                    vatRateSummary[key].vat += Number(item.vat_amount || 0);
                    vatRateSummary[key].gross += Number(item.gross_amount || 0);
                });

                const linesXml = items.map((item, idx) => {
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

                const invoiceBase64 = Buffer.from(invoiceXml, 'utf-8').toString('base64');

                const txId = await connector.manageInvoice({
                    compressedContent: false,
                    invoiceOperation: [{ index: 1, invoiceOperation: 'CREATE', invoiceData: invoiceBase64 }],
                });

                await supabaseAdmin.from('invoices')
                    .update({ nav_transaction_id: txId, nav_status: 'sent' })
                    .eq('id', invoice.id);

                console.log(`NAV retry invoice OK: ${invoice.invoice_number}, tx: ${txId}`);
                results.push({ id: invoice.id, number: invoice.invoice_number, result: 'sent', txId });
            }

        } catch (err) {
            console.error(`NAV retry FAILED for ${invoice.invoice_number}:`, err.message);
            const retryCount = (invoice.nav_retry_count || 0) + 1;
            const prefix = isStorno ? 'storno_retry' : 'retry_needed';

            if (retryCount >= 10) {
                await supabaseAdmin.from('invoices')
                    .update({ nav_status: `failed: ${err.message.substring(0, 400)}`, nav_retry_count: retryCount })
                    .eq('id', invoice.id);
                results.push({ id: invoice.id, number: invoice.invoice_number, result: 'permanently_failed' });
            } else {
                await supabaseAdmin.from('invoices')
                    .update({ nav_status: `${prefix}: ${err.message.substring(0, 400)}`, nav_retry_count: retryCount })
                    .eq('id', invoice.id);
                results.push({ id: invoice.id, number: invoice.invoice_number, result: `retry_${retryCount}/10` });
            }
        }
    }

    return Response.json({ message: 'NAV retry complete', results });
}

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
