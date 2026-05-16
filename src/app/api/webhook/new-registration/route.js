import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// This webhook is called by Supabase Database Trigger when a new profile is created/updated
// It sends an admin notification email about the new registration
export async function POST(request) {
    try {
        const body = await request.json();

        // Support both direct calls and Supabase webhook format
        const profile = body.record || body;

        const userName = profile.name || profile.business_name || 'Ismeretlen';
        const userEmail = profile.email || '';
        const userPhone = profile.phone || 'Nincs megadva';
        const businessName = profile.business_name || 'Nincs megadva';
        const businessType = profile.business_type || 'other';

        // Skip if no business_name (profile not yet completed)
        if (!profile.business_name) {
            return Response.json({ skipped: true, reason: 'No business_name yet' });
        }

        if (!resend) {
            console.error('RESEND_API_KEY not configured');
            return Response.json({ error: 'Email not configured' }, { status: 500 });
        }

        const typeLabels = {
            salon: 'Fodrász szalon',
            beauty: 'Kozmetika',
            fitness: 'Edző / Fitness',
            consulting: 'Tanácsadó',
            health: 'Egészségügy',
            other: 'Egyéb',
        };
        const typeLabel = typeLabels[businessType] || businessType || 'N/A';

        // Determine if Google or email registration
        const method = profile.method || (profile.provider === 'google' ? 'Google' : 'email');

        // Send admin notification
        const adminResult = await resend.emails.send({
            from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
            to: 'speedmarketing00@gmail.com',
            subject: `🆕 Új regisztráció: ${userName} (${businessName})`,
            html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">🆕</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Új felhasználó regisztrált!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Valaki létrehozta a fiókját a FoglaljVelem.hu oldalon.</p>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">👤 Név:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${userName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📧 E-mail:</td><td style="padding:6px 0;text-align:right;">${userEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📞 Telefon:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${userPhone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🏢 Vállalkozás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${businessName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📋 Szakterület:</td><td style="padding:6px 0;text-align:right;">${typeLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🔑 Módszer:</td><td style="padding:6px 0;text-align:right;">${method}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">📅 Regisztráció ideje: ${new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' })}</p>
  </div>
</div>
</body></html>`
        });

        // Also send welcome email to the user
        if (userEmail) {
            await resend.emails.send({
                from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                to: userEmail,
                subject: `🎉 Üdvözlünk a FoglaljVelem-ben, ${userName}!`,
                html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">🎉</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Üdvözlünk a FoglaljVelem-ben!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${userName}, a fiókod sikeresen létrejött!</p>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;margin-bottom:20px;">
      <h3 style="margin:0 0 12px;font-size:0.95rem;color:#166534;">🚀 Első lépések:</h3>
      <ol style="margin:0;padding-left:20px;color:#374151;font-size:0.85rem;line-height:1.8;">
        <li><strong>Szolgáltatások hozzáadása</strong> – Állítsd be milyen szolgáltatásokat kínálsz</li>
        <li><strong>Elérhetőség beállítása</strong> – Válaszd ki, mikor vagy elérhető</li>
        <li><strong>Foglalási link megosztása</strong> – Oszd meg az ügyfeleiddel</li>
      </ol>
    </div>
    <div style="text-align:center;">
      <a href="https://foglaljvelem.hu/dashboard" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:0.95rem;">📅 Irány a vezérlőpult →</a>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:20px;">Ha bármilyen kérdésed van, írj nekünk: <a href="mailto:speedmarketing00@gmail.com" style="color:#2563eb;">speedmarketing00@gmail.com</a></p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`
            }).catch(e => console.warn('Welcome email error:', e));
        }

        return Response.json({
            success: true,
            adminEmailId: adminResult?.data?.id,
            user: userName
        });
    } catch (error) {
        console.error('Webhook new-registration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
