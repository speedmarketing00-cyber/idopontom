import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, clientPhone, notes, serviceName, duration, price, date, time, slug, teamMemberId, serviceId: bodyServiceId } = body;

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
        .maybeSingle();

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
    let insertedBooking = null;
    let cancelToken = null;

    if (supabaseAdmin && profileId) {
      // Compute end_time from start_time + duration
      const [th, tm] = time.split(':').map(Number);
      const startMin = th * 60 + tm;
      const durationMin = parseInt(duration, 10) || 30;
      const endTotalMin = startMin + durationMin;
      const endTime = `${String(Math.floor(endTotalMin / 60)).padStart(2, '0')}:${String(endTotalMin % 60).padStart(2, '0')}`;

      // ── Resolve the service to check for group session ──
      let resolvedServiceId = bodyServiceId || body.serviceId || null;
      let isGroupSession = false;
      let maxCapacity = 1;

      if (resolvedServiceId) {
        const { data: svcRow } = await supabaseAdmin.from('services')
          .select('id, is_group_session, max_capacity').eq('id', resolvedServiceId).maybeSingle();
        if (svcRow) {
          isGroupSession = svcRow.is_group_session || false;
          maxCapacity = svcRow.max_capacity || 1;
        }
      } else if (serviceName) {
        const { data: svcRow } = await supabaseAdmin.from('services')
          .select('id, is_group_session, max_capacity')
          .eq('profile_id', profileId).eq('name', serviceName).maybeSingle();
        if (svcRow) {
          resolvedServiceId = svcRow.id;
          isGroupSession = svcRow.is_group_session || false;
          maxCapacity = svcRow.max_capacity || 1;
        }
      }

      // ── Server-side double-booking prevention ──
      const { data: existingBookings, error: selectError } = await supabaseAdmin.from('bookings')
        .select('id, start_time, end_time, team_member_id, service_id')
        .eq('profile_id', profileId)
        .eq('booking_date', date)
        .eq('status', 'confirmed');

      if (selectError) {
        console.error('Booking overlap check failed:', selectError);
        return Response.json({ error: 'Nem sikerült ellenőrizni az időpont elérhetőségét. Kérlek próbáld újra.' }, { status: 500 });
      }

      if (isGroupSession) {
        // ── GROUP SESSION: check capacity instead of overlap ──
        const sameSlotBookings = (existingBookings || []).filter(b =>
          b.service_id === resolvedServiceId &&
          (b.start_time || '').slice(0, 5) === time.slice(0, 5)
        );
        if (sameSlotBookings.length >= maxCapacity) {
          return Response.json({ error: 'Ez a csoportos óra már betelt! Kérlek válassz másik időpontot.' }, { status: 409 });
        }

        // Also check that no individual booking overlaps with this group slot
        // (individual bookings during group session time are not allowed)
      } else {
        // ── REGULAR SERVICE: standard overlap check ──
        if (existingBookings && existingBookings.length > 0) {
          const newMemberId = teamMemberId || null;
          const relevantBookings = existingBookings.filter(b => (b.team_member_id || null) === newMemberId);

          const hasOverlap = relevantBookings.some(b => {
            const [bsh, bsm] = (b.start_time || '00:00').slice(0, 5).split(':').map(Number);
            const [beh, bem] = (b.end_time || '00:30').slice(0, 5).split(':').map(Number);
            const bStart = bsh * 60 + bsm;
            const bEnd = beh * 60 + bem;
            return startMin < bEnd && endTotalMin > bStart;
          });

          if (hasOverlap) {
            return Response.json({ error: 'Ez az időpont már foglalt! Kérlek válassz másik időpontot.' }, { status: 409 });
          }
        }

        // Check if this individual booking overlaps with any group session time
        // Load group schedules for all group services of this provider
        const { data: groupSvcs } = await supabaseAdmin.from('services')
          .select('id').eq('profile_id', profileId).eq('is_group_session', true).eq('is_active', true);
        if (groupSvcs && groupSvcs.length > 0) {
          const dayOfWeek = (new Date(date).getDay() + 6) % 7; // 0=Monday
          const { data: groupSlots } = await supabaseAdmin.from('group_schedule')
            .select('start_time, end_time')
            .in('service_id', groupSvcs.map(s => s.id))
            .eq('day_of_week', dayOfWeek);
          if (groupSlots && groupSlots.length > 0) {
            const overlapsGroup = groupSlots.some(gs => {
              const [gsh, gsm] = (gs.start_time || '09:00').slice(0, 5).split(':').map(Number);
              const [geh, gem] = (gs.end_time || '10:00').slice(0, 5).split(':').map(Number);
              const gStart = gsh * 60 + gsm;
              const gEnd = geh * 60 + gem;
              return startMin < gEnd && endTotalMin > gStart;
            });
            if (overlapsGroup) {
              return Response.json({ error: 'Ez az időpont csoportos órának van fenntartva! Kérlek válassz másik időpontot.' }, { status: 409 });
            }
          }
        }
      }

      // Use already-resolved service ID
      const serviceId = resolvedServiceId;

      // Generate unique cancel token
      cancelToken = crypto.randomBytes(32).toString('hex');

      const { data: insertedRow, error: insertError } = await supabaseAdmin.from('bookings').insert({
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
        is_group_booking: isGroupSession,
        cancel_token: cancelToken,
      }).select('id, cancel_token').single();

      if (insertError) {
        console.error('Booking insert error:', insertError);
        // 23P01 = exclusion constraint violation (bookings_no_overlap)
        // 23505 = unique constraint violation (fallback)
        // These mean: the DB guaranteed atomicity and another booking won the race.
        if (insertError.code === '23P01' || insertError.code === '23505') {
          return Response.json({ error: 'Ez az időpont már foglalt! Kérlek válassz másik időpontot.' }, { status: 409 });
        }
        return Response.json({ error: 'Nem sikerült menteni a foglalást: ' + insertError.message }, { status: 500 });
      }
      insertedBooking = insertedRow;
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

      // Build cancel link
      const bookingCancelToken = insertedBooking?.cancel_token || cancelToken;
      const cancelUrl = `https://foglaljvelem.hu/cancel/${bookingCancelToken}`;

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
            html: confirmationEmailHtml({ clientName, serviceName, date, time, duration, price, providerName, customGreeting: greeting, cancelUrl }),
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

function confirmationEmailHtml({ clientName, serviceName, date, time, duration, price, providerName, customGreeting, cancelUrl }) {
  const formattedDate = new Date(date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  const cancelSection = cancelUrl ? `
    <div style="border-top:1px solid #e5e7eb;margin-top:20px;padding-top:16px;">
      <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin:0 0 10px;">Lemondás az időpont előtti nap 20:00-ig lehetséges:</p>
      <div style="text-align:center;">
        <a href="${cancelUrl}" style="display:inline-block;background:#fef2f2;color:#dc2626;text-decoration:none;padding:10px 24px;border-radius:10px;font-weight:600;font-size:0.85rem;border:1px solid #fca5a5;">❌ Foglalás lemondása</a>
      </div>
    </div>` : '';
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
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin:0;">Emlékeztetőt küldünk az időpont előtti napon és 1 órával az időpont előtt.</p>
    ${cancelSection}
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
