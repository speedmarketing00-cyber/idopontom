import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Server-side registration notification — guaranteed delivery
export async function POST(request) {
  try {
    const { userName, userEmail, userPhone, businessName, businessType, method } = await request.json();

    if (!resend) {
      console.error('RESEND_API_KEY not configured — admin notification NOT sent for:', userEmail);
      return Response.json({ error: 'Email not configured' }, { status: 500 });
    }

    const typeLabels = {
      salon: 'Fodrász szalon', beauty: 'Kozmetika', fitness: 'Edző / Fitness',
      consulting: 'Tanácsadó', health: 'Egészségügy', other: 'Egyéb',
    };
    const typeLabel = typeLabels[businessType] || businessType || 'N/A';
    const regTime = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

    // 1. Admin notification — MUST succeed
    const adminResult = await resend.emails.send({
      from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
      to: 'speedmarketing00@gmail.com',
      subject: `🆕 Új regisztráció: ${userName} (${businessName || userName})`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">🆕</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Új felhasználó regisztrált!</h1>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">👤 Név:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${userName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📧 E-mail:</td><td style="padding:6px 0;text-align:right;">${userEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📞 Telefon:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${userPhone || 'Nincs megadva'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🏢 Vállalkozás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${businessName || 'Nincs megadva'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📋 Szakterület:</td><td style="padding:6px 0;text-align:right;">${typeLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🔑 Módszer:</td><td style="padding:6px 0;text-align:right;">${method || 'email'}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">📅 ${regTime}</p>
  </div>
</div>
</body></html>`,
    });
    console.log('✅ Admin notification sent for:', userEmail, '| Resend ID:', adminResult?.data?.id);

    // 2. Welcome email to user
    if (userEmail) {
      try {
        await resend.emails.send({
          from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
          to: userEmail,
          subject: `🎉 Üdvözlünk a FoglaljVelem-ben, ${userName}!`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
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
        <li><strong>Szolgáltatások hozzáadása</strong></li>
        <li><strong>Elérhetőség beállítása</strong></li>
        <li><strong>Foglalási link megosztása</strong></li>
      </ol>
    </div>
    <div style="text-align:center;">
      <a href="https://foglaljvelem.hu/dashboard" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:0.95rem;">📅 Irány a vezérlőpult →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu</p>
</div>
</body></html>`,
        });
        console.log('✅ Welcome email sent to:', userEmail);
      } catch (e) { console.warn('Welcome email error:', e.message); }
    }

    return Response.json({ success: true, adminEmailId: adminResult?.data?.id });
  } catch (error) {
    console.error('❌ Registration notification FAILED:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
