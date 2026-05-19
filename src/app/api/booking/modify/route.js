import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Szerver hiba' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { token, newServiceId, newDate, newTime, clientName, clientEmail, clientPhone, notes, slug } = body;

    if (!token) {
      return Response.json({ error: 'Hiányzó token' }, { status: 400 });
    }

    // 1. Fetch old booking by cancel token
    const { data: oldBooking, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, client_name, client_email, booking_date, start_time, end_time, status, service_id, profile_id, team_member_id, cancel_token')
      .eq('cancel_token', token)
      .maybeSingle();

    if (fetchErr || !oldBooking) {
      return Response.json({ error: 'Eredeti foglalás nem található.' }, { status: 404 });
    }

    if (oldBooking.status === 'cancelled') {
      return Response.json({ error: 'Ez a foglalás már le lett mondva.' }, { status: 400 });
    }

    // 2. Check cancel deadline (előző nap 20:00)
    if (!checkCancelDeadline(oldBooking.booking_date)) {
      return Response.json({ error: 'A módosítási határidő lejárt. A foglalás csak az időpont előtti nap 20:00-ig módosítható.' }, { status: 400 });
    }

    // 3. Get provider info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, name, business_name, subscription_tier, slug')
      .eq('id', oldBooking.profile_id)
      .maybeSingle();

    let providerName = profile?.business_name || profile?.name || 'Szolgáltató';
    let providerEmail = null;
    if (profile?.user_id) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      providerEmail = authUser?.user?.email || null;
    }

    // 4. Get new service info
    const serviceId = newServiceId || oldBooking.service_id;
    const { data: svc } = await supabaseAdmin
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('id', serviceId)
      .maybeSingle();

    if (!svc) {
      return Response.json({ error: 'Szolgáltatás nem található.' }, { status: 404 });
    }

    // 5. Calculate end time for new booking
    const [h, m] = newTime.split(':').map(Number);
    const endMin = h * 60 + m + (svc.duration_minutes || 30);
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;
    const startTime = `${newTime}:00`;

    // 6. Check new slot is not already booked
    const { data: conflict } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('profile_id', oldBooking.profile_id)
      .eq('booking_date', newDate)
      .eq('status', 'confirmed')
      .neq('id', oldBooking.id) // Exclude the old booking itself
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (conflict && conflict.length > 0) {
      return Response.json({ error: 'Ez az időpont sajnos már foglalt! Kérlek válassz másikat.' }, { status: 409 });
    }

    // 7. Generate new cancel token for the modified booking
    const newCancelToken = crypto.randomBytes(32).toString('hex');

    // 8. Cancel old booking
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', oldBooking.id);

    // 9. Create new booking
    const { data: newBooking, error: insertErr } = await supabaseAdmin
      .from('bookings')
      .insert({
        profile_id: oldBooking.profile_id,
        service_id: serviceId,
        team_member_id: oldBooking.team_member_id,
        client_name: clientName || oldBooking.client_name,
        client_email: clientEmail || oldBooking.client_email,
        client_phone: clientPhone || '',
        notes: notes || '',
        booking_date: newDate,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed',
        price: svc.price,
        cancel_token: newCancelToken,
      })
      .select('id, cancel_token')
      .single();

    if (insertErr) {
      console.error('Modify insert error:', insertErr);
      // Rollback: re-confirm old booking
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', oldBooking.id);
      return Response.json({ error: 'Nem sikerült az új foglalás létrehozása.' }, { status: 500 });
    }

    // 10. Format dates for emails
    const oldDate = new Date(oldBooking.booking_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    const oldTime = oldBooking.start_time?.slice(0, 5) || '';
    const newDateFormatted = new Date(newDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    const cancelUrl = `https://foglaljvelem.hu/cancel/${newCancelToken}`;

    // Get old service name
    let oldServiceName = svc.name;
    if (oldBooking.service_id !== serviceId) {
      const { data: oldSvc } = await supabaseAdmin.from('services').select('name').eq('id', oldBooking.service_id).maybeSingle();
      if (oldSvc) oldServiceName = oldSvc.name;
    }

    // 11. Send modification email to client
    const finalClientEmail = clientEmail || oldBooking.client_email;
    const finalClientName = clientName || oldBooking.client_name;

    if (resend && finalClientEmail && profile?.subscription_tier !== 'free') {
      try {
        await resend.emails.send({
          from: `${providerName} <noreply@foglaljvelem.hu>`,
          to: finalClientEmail,
          subject: `🔄 Foglalás módosítva – ${providerName}`,
          html: clientModifiedHtml({
            clientName: finalClientName,
            oldService: oldServiceName,
            oldDate,
            oldTime,
            newService: svc.name,
            newDate: newDateFormatted,
            newTime,
            providerName,
            cancelUrl,
          }),
        });
      } catch (e) { console.error('Client modify email error:', e); }
    }

    // 12. Send notification to provider
    if (resend && providerEmail && profile?.subscription_tier !== 'free') {
      try {
        await resend.emails.send({
          from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
          to: providerEmail,
          subject: `🔄 Módosítás: ${finalClientName} – ${svc.name}`,
          html: providerModifyNotifyHtml({
            clientName: finalClientName,
            clientEmail: finalClientEmail,
            oldService: oldServiceName,
            oldDate,
            oldTime,
            newService: svc.name,
            newDate: newDateFormatted,
            newTime,
          }),
        });
      } catch (e) { console.error('Provider modify email error:', e); }
    }

    return Response.json({ success: true, cancelToken: newCancelToken });
  } catch (err) {
    console.error('Modify booking error:', err);
    return Response.json({ error: 'Szerverhiba történt.' }, { status: 500 });
  }
}

function checkCancelDeadline(bookingDate) {
  const now = new Date();
  const budapestNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
  const bookingDay = new Date(bookingDate + 'T00:00:00');
  const deadline = new Date(bookingDay);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(20, 0, 0, 0);
  return budapestNow < deadline;
}

// ======= Email templates =======

function clientModifiedHtml({ clientName, oldService, oldDate, oldTime, newService, newDate, newTime, providerName, cancelUrl }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">🔄</span>
      <h1 style="font-size:1.3rem;color:#2563eb;margin:8px 0 4px;">Foglalásod módosítva!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, a foglalásod sikeresen módosítva lett.</p>
    </div>

    <!-- Old booking (crossed out) -->
    <div style="background:#fef2f2;border-radius:12px;padding:16px;border:1px solid #fca5a5;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#991b1b;font-weight:600;margin-bottom:8px;">❌ RÉGI IDŐPONT:</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#6b7280;font-size:0.85rem;">📋</td><td style="padding:4px 0;text-decoration:line-through;color:#9ca3af;">${oldService}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;font-size:0.85rem;">📅</td><td style="padding:4px 0;text-decoration:line-through;color:#9ca3af;">${oldDate} – ${oldTime}</td></tr>
      </table>
    </div>

    <!-- New booking -->
    <div style="background:#f0fdf4;border-radius:12px;padding:16px;border:1px solid #86efac;margin-bottom:20px;">
      <div style="font-size:0.75rem;color:#166534;font-weight:600;margin-bottom:8px;">✅ ÚJ IDŐPONT:</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#6b7280;font-size:0.85rem;">📋</td><td style="padding:4px 0;font-weight:600;color:#166534;">${newService}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;font-size:0.85rem;">📅</td><td style="padding:4px 0;font-weight:600;color:#166534;">${newDate} – ${newTime}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;font-size:0.85rem;">🏢</td><td style="padding:4px 0;font-weight:600;color:#374151;">${providerName}</td></tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${cancelUrl}" style="color:#dc2626;font-size:0.8rem;text-decoration:underline;">Foglalás lemondása / módosítása</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}

function providerModifyNotifyHtml({ clientName, clientEmail, oldService, oldDate, oldTime, newService, newDate, newTime }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">🔄</span>
      <h1 style="font-size:1.3rem;color:#2563eb;margin:8px 0 4px;">Foglalás módosítva!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Egy vendéged módosította az időpontját.</p>
    </div>
    <div style="background:#f3f4f6;border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="font-weight:600;margin-bottom:4px;">👤 ${clientName}</div>
      <div style="font-size:0.85rem;color:#6b7280;">📧 ${clientEmail}</div>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:12px;border:1px solid #fca5a5;margin-bottom:8px;">
      <div style="font-size:0.75rem;color:#991b1b;font-weight:600;">❌ RÉGI: ${oldService} – ${oldDate} ${oldTime}</div>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:12px;border:1px solid #86efac;">
      <div style="font-size:0.75rem;color:#166534;font-weight:600;">✅ ÚJ: ${newService} – ${newDate} ${newTime}</div>
    </div>
  </div>
</div>
</body></html>`;
}
