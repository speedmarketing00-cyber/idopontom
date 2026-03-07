import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, clientPhone, notes, serviceName, duration, price, date, time, slug, teamMemberId } = body;

    // 1. Find the provider profile by slug
    let providerName = 'Szolgáltató';
    let providerEmail = null;
    let profileId = null;
    let subscriptionTier = 'free';

    if (supabaseAdmin && slug) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, name, business_name, address, subscription_tier')
        .eq('slug', slug)
        .single();

      if (profile) {
        profileId = profile.id;
        providerName = profile.business_name || profile.name || 'Szolgáltató';
        subscriptionTier = profile.subscription_tier || 'free';

        // Fetch provider email from auth.users (not in profiles table)
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        providerEmail = authUser?.user?.email || null;
        console.log('Provider found:', { profileId, providerName, providerEmail, subscriptionTier });
      } else {
        console.error('Profile not found for slug:', slug);
      }
    }

    // 2. Save booking to database
    if (supabaseAdmin && profileId) {
      // Compute end_time from start_time + duration
      const [th, tm] = time.split(':').map(Number);
      const endTotalMin = th * 60 + tm + (parseInt(duration, 10) || 30);
      const endTime = `${String(Math.floor(endTotalMin / 60)).padStart(2, '0')}:${String(endTotalMin % 60).padStart(2, '0')}`;

      // Find service_id by name
      let serviceId = null;
      if (body.serviceId) {
        serviceId = body.serviceId;
      } else if (serviceName) {
        const { data: svcRow } = await supabaseAdmin.from('services')
          .select('id').eq('profile_id', profileId).eq('name', serviceName).maybeSingle();
        serviceId = svcRow?.id || null;
      }

      const { error: insertError } = await supabaseAdmin.from('bookings').insert({
        profile_id: profileId,
        service_id: serviceId,
        team_member_id: teamMemberId || null,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        notes: notes || '',
        booking_date: date,
        start_time: time,
        end_time: endTime,
        price: price,
        status: 'confirmed',
      });

      if (insertError) {
        console.error('Booking insert error:', insertError);
        return Response.json({ error: 'Nem sikerült menteni a foglalást: ' + insertError.message }, { status: 500 });
      }
    }

    // 3. Send emails (only for paid tiers: basic/pro, respecting email_settings)
    const canSendEmails = subscriptionTier === 'basic' || subscriptionTier === 'pro';

    if (resend && canSendEmails && profileId && supabaseAdmin) {
      // Load email settings for this provider
      let emailSettings = { booking_confirmation: true, provider_notification: true, custom_greeting: '' };
      try {
        const { data: es } = await supabaseAdmin.from('email_settings')
          .select('*').eq('profile_id', profileId).maybeSingle();
        if (es) emailSettings = es;
      } catch (esErr) {
        console.warn('email_settings query failed (table may not exist yet):', esErr.message);
      }
      console.log('Email settings:', emailSettings);

      // Send confirmation to client
      if (clientEmail && emailSettings.booking_confirmation) {
        try {
          console.log('Sending confirmation email to:', clientEmail);
          const greeting = emailSettings.custom_greeting
            ? `<p style="color:#374151;font-size:0.95rem;text-align:center;margin-bottom:20px;font-style:italic;">"${emailSettings.custom_greeting}"</p>`
            : '';
          const result = await resend.emails.send({
            from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
            to: clientEmail,
            subject: `✅ Foglalásod megerősítve – ${providerName}`,
            html: confirmationEmailHtml({ clientName, serviceName, date, time, duration, price, providerName, customGreeting: greeting }),
          });
          console.log('Confirmation email sent:', result);
        } catch (e) { console.error('Client email error:', e); }
      } else {
        console.log('Skipping confirmation email:', { clientEmail, booking_confirmation: emailSettings.booking_confirmation });
      }

      // Send notification to provider
      if (providerEmail && emailSettings.provider_notification) {
        try {
          console.log('Sending provider notification to:', providerEmail);
          const result = await resend.emails.send({
            from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
            to: providerEmail,
            subject: `🆕 Új foglalás: ${clientName} – ${serviceName}`,
            html: providerNotificationHtml({ clientName, clientEmail, clientPhone, serviceName, date, time, duration, price }),
          });
          console.log('Provider notification sent:', result);
        } catch (e) { console.error('Provider email error:', e); }
      } else {
        console.log('Skipping provider notification:', { providerEmail, provider_notification: emailSettings.provider_notification });
      }
    } else {
      console.log('Email sending skipped:', { hasResend: !!resend, canSendEmails, profileId: !!profileId });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Booking API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================
// EMAIL HTML TEMPLATES
// ============================

function confirmationEmailHtml({ clientName, serviceName, date, time, duration, price, providerName, customGreeting }) {
  const formattedDate = new Date(date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">✅</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Foglalásod megerősítve!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, az időpontod le van foglalva.</p>
    </div>
    ${customGreeting || ''}
    <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📋 Szolgáltatás:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📅 Dátum:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${formattedDate}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">🕐 Időpont:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${time}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">⏱ Időtartam:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${duration} perc</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">💰 Ár:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${Number(price).toLocaleString('hu-HU')} Ft</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">🏢 Helyszín:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${providerName}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin:0;">Emlékeztetőt küldünk 24 órával és 1 órával az időpont előtt.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}

function providerNotificationHtml({ clientName, clientEmail, clientPhone, serviceName, date, time, duration, price }) {
  const formattedDate = new Date(date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2.5rem;">🆕</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Új foglalás érkezett!</h1>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #bbf7d0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">👤 Ügyfél:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${clientName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📧 E-mail:</td><td style="padding:8px 0;text-align:right;">${clientEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📞 Telefon:</td><td style="padding:8px 0;text-align:right;">${clientPhone}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📋 Szolgáltatás:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">📅 Időpont:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${formattedDate} – ${time}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">⏱ Időtartam:</td><td style="padding:8px 0;text-align:right;">${duration} perc</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:0.85rem;">💰 Ár:</td><td style="padding:8px 0;font-weight:600;text-align:right;">${Number(price).toLocaleString('hu-HU')} Ft</td></tr>
      </table>
    </div>
  </div>
</div>
</body></html>`;
}
