import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  if (!resend) {
    return Response.json({ error: 'Resend nincs konfigurálva. Add meg a RESEND_API_KEY-t az .env.local fájlban.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    let emailConfig;

    switch (type) {
      case 'booking_confirmation':
        emailConfig = bookingConfirmationEmail(data);
        break;
      case 'booking_reminder':
        emailConfig = bookingReminderEmail(data);
        break;
      case 'booking_cancelled':
        emailConfig = bookingCancelledEmail(data);
        break;
      case 'new_booking_provider':
        emailConfig = newBookingProviderEmail(data);
        break;
      case 'team_invite':
        emailConfig = teamInviteEmail(data);
        break;
      default:
        return Response.json({ error: 'Ismeretlen e-mail típus' }, { status: 400 });
    }

    const result = await resend.emails.send(emailConfig);
    return Response.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Email sending error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

function bookingConfirmationEmail({ clientName, clientEmail, serviceName, date, time, duration, providerName, providerAddress }) {
  return {
    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
    to: clientEmail,
    subject: `✅ Foglalásod megerősítve – ${providerName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2rem;">📅</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Foglalásod megerősítve!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, az időpontod lefoglalva.</p>
    </div>
    <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Szolgáltatás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Dátum:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Időpont:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${time}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Időtartam:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${duration} perc</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Helyszín:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${providerName}</td></tr>
        ${providerAddress ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Cím:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${providerAddress}</td></tr>` : ''}
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin:0;">Ha le szeretnéd mondani, keresd a szolgáltatót közvetlenül.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`
  };
}

function bookingReminderEmail({ clientName, clientEmail, serviceName, date, time, providerName }) {
  return {
    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
    to: clientEmail,
    subject: `⏰ Emlékeztető: holnapi időpontod – ${providerName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">⏰</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Holnapi emlékeztető</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, ne felejtsd el a holnapi időpontodat!</p>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:20px;border:1px solid #fde68a;">
      <p style="margin:0;font-weight:600;">${serviceName}</p>
      <p style="margin:4px 0 0;color:#6b7280;">${date} – ${time} • ${providerName}</p>
    </div>
  </div>
</div>
</body></html>`
  };
}

function bookingCancelledEmail({ clientName, clientEmail, serviceName, date, time, providerName }) {
  return {
    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
    to: clientEmail,
    subject: `❌ Foglalás lemondva – ${providerName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">❌</span>
      <h1 style="font-size:1.3rem;color:#dc2626;margin:8px 0 4px;">Foglalás lemondva</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, az alábbi foglalásod lemondásra került.</p>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:20px;">
      <p style="margin:0;font-weight:600;text-decoration:line-through;">${serviceName}</p>
      <p style="margin:4px 0 0;color:#6b7280;text-decoration:line-through;">${date} – ${time} • ${providerName}</p>
    </div>
  </div>
</div>
</body></html>`
  };
}

function newBookingProviderEmail({ providerEmail, providerName, clientName, clientEmail, clientPhone, serviceName, date, time }) {
  return {
    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
    to: providerEmail,
    subject: `🆕 Új foglalás: ${clientName} – ${serviceName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">🆕</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Új foglalás érkezett!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">${providerName}, új időpontot foglaltak nálad.</p>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Ügyfél:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${clientName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">E-mail:</td><td style="padding:6px 0;text-align:right;">${clientEmail}</td></tr>
        ${clientPhone ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Telefon:</td><td style="padding:6px 0;text-align:right;">${clientPhone}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Szolgáltatás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Időpont:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${date} – ${time}</td></tr>
      </table>
    </div>
  </div>
</div>
</body></html>`
  };
}

function teamInviteEmail({ memberEmail, memberName, ownerName, businessName, role }) {
  return {
    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
    to: memberEmail,
    subject: `👥 Meghívó: csatlakozz a ${businessName} csapatához!`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">👥</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Csapatmeghívó</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${memberName}, meghívtak a ${businessName} csapatába!</p>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Meghívó:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${ownerName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Vállalkozás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${businessName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">Szerepkör:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${role}</td></tr>
      </table>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:16px;border:1px solid #fde68a;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:0.85rem;line-height:1.6;">📌 <strong>Fontos:</strong> Regisztrálj ezzel az email címmel (<strong>${memberEmail}</strong>) a FoglaljVelem rendszerbe, hogy hozzáférj a csapat foglalásaihoz.</p>
    </div>
    <div style="text-align:center;">
      <a href="https://foglaljvelem.hu/auth/register" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:0.95rem;">🚀 Regisztráció</a>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">Ha már van fiókod ezzel az email címmel, <a href="https://foglaljvelem.hu/auth/login" style="color:#2563eb;">jelentkezz be itt</a>.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`
  };
}
