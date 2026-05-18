import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET — fetch booking details by cancel token (for the cancel page)
export async function GET(request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Szerver hiba' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Hiányzó token' }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('id, client_name, client_email, booking_date, start_time, end_time, status, price, service_id, profile_id, cancel_token')
    .eq('cancel_token', token)
    .maybeSingle();

  if (error || !booking) {
    return Response.json({ error: 'Foglalás nem található' }, { status: 404 });
  }

  // Get service name
  let serviceName = 'Szolgáltatás';
  if (booking.service_id) {
    const { data: svc } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', booking.service_id)
      .maybeSingle();
    if (svc) serviceName = svc.name;
  }

  // Get provider name
  let providerName = 'Szolgáltató';
  if (booking.profile_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, business_name')
      .eq('id', booking.profile_id)
      .maybeSingle();
    if (profile) providerName = profile.business_name || profile.name || 'Szolgáltató';
  }

  // Check if cancellation is still allowed (előző nap 20:00-ig)
  const canCancel = checkCancelDeadline(booking.booking_date);

  return Response.json({
    booking: {
      id: booking.id,
      clientName: booking.client_name,
      date: booking.booking_date,
      time: booking.start_time?.slice(0, 5),
      status: booking.status,
      serviceName,
      providerName,
      price: booking.price,
    },
    canCancel,
  });
}

// POST — actually cancel the booking
export async function POST(request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Szerver hiba' }, { status: 500 });
  }

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return Response.json({ error: 'Hiányzó token' }, { status: 400 });
  }

  // Fetch booking
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('id, client_name, client_email, booking_date, start_time, status, service_id, profile_id, cancel_token')
    .eq('cancel_token', token)
    .maybeSingle();

  if (error || !booking) {
    return Response.json({ error: 'Foglalás nem található' }, { status: 404 });
  }

  // Already cancelled?
  if (booking.status === 'cancelled') {
    return Response.json({ error: 'Ez a foglalás már le lett mondva.' }, { status: 400 });
  }

  // Check deadline: előző nap 20:00 (Budapest time)
  if (!checkCancelDeadline(booking.booking_date)) {
    return Response.json({ error: 'A lemondási határidő lejárt. A foglalás csak az időpont előtti nap 20:00-ig mondható le.' }, { status: 400 });
  }

  // Update booking status to cancelled
  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', booking.id);

  if (updateError) {
    console.error('Cancel update error:', updateError);
    return Response.json({ error: 'Nem sikerült lemondani a foglalást.' }, { status: 500 });
  }

  // Get service name + provider info for emails
  let serviceName = 'Szolgáltatás';
  if (booking.service_id) {
    const { data: svc } = await supabaseAdmin.from('services').select('name').eq('id', booking.service_id).maybeSingle();
    if (svc) serviceName = svc.name;
  }

  let providerName = 'Szolgáltató';
  let providerEmail = null;
  if (booking.profile_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, business_name, user_id')
      .eq('id', booking.profile_id)
      .maybeSingle();
    if (profile) {
      providerName = profile.business_name || profile.name || 'Szolgáltató';
      // Get provider email
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      providerEmail = authUser?.user?.email || null;
    }
  }

  const formattedDate = new Date(booking.booking_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = booking.start_time?.slice(0, 5) || '';

  // Send cancellation email to client
  if (resend && booking.client_email) {
    try {
      await resend.emails.send({
        from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
        to: booking.client_email,
        subject: `❌ Foglalás lemondva – ${providerName}`,
        html: clientCancelledHtml({ clientName: booking.client_name, serviceName, date: formattedDate, time: timeStr, providerName }),
      });
    } catch (e) { console.error('Client cancel email error:', e); }
  }

  // Send notification to provider
  if (resend && providerEmail) {
    try {
      await resend.emails.send({
        from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
        to: providerEmail,
        subject: `❌ Lemondás: ${booking.client_name} – ${serviceName}`,
        html: providerCancelNotifyHtml({ clientName: booking.client_name, clientEmail: booking.client_email, serviceName, date: formattedDate, time: timeStr }),
      });
    } catch (e) { console.error('Provider cancel email error:', e); }
  }

  return Response.json({ success: true });
}

// Check if cancellation is allowed: előző nap 20:00 Budapest time
function checkCancelDeadline(bookingDate) {
  // Get current time in Budapest
  const now = new Date();
  const budapestNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));

  // Booking date at 00:00
  const bookingDay = new Date(bookingDate + 'T00:00:00');

  // Deadline: day before booking at 20:00
  const deadline = new Date(bookingDay);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(20, 0, 0, 0);

  return budapestNow < deadline;
}

// ======= Email templates =======

function clientCancelledHtml({ clientName, serviceName, date, time, providerName }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">❌</span>
      <h1 style="font-size:1.3rem;color:#dc2626;margin:8px 0 4px;">Foglalásod lemondva</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, a foglalásod sikeresen lemondásra került.</p>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:20px;border:1px solid #fca5a5;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📋 Szolgáltatás:</td><td style="padding:6px 0;font-weight:600;text-align:right;text-decoration:line-through;">${serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📅 Dátum:</td><td style="padding:6px 0;font-weight:600;text-align:right;text-decoration:line-through;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🕐 Időpont:</td><td style="padding:6px 0;font-weight:600;text-align:right;text-decoration:line-through;">${time}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">🏢 Szolgáltató:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${providerName}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin:0;">Bármikor foglalhatsz új időpontot a szolgáltató oldalán.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}

function providerCancelNotifyHtml({ clientName, clientEmail, serviceName, date, time }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2rem;">❌</span>
      <h1 style="font-size:1.3rem;color:#dc2626;margin:8px 0 4px;">Foglalás lemondva!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Egy vendéged lemondta az időpontját.</p>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:20px;border:1px solid #fca5a5;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">👤 Vendég:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${clientName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📧 E-mail:</td><td style="padding:6px 0;text-align:right;">${clientEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📋 Szolgáltatás:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:0.85rem;">📅 Időpont:</td><td style="padding:6px 0;font-weight:600;text-align:right;">${date} – ${time}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">Az időpont felszabadult — más vendégek foglalhatják.</p>
  </div>
</div>
</body></html>`;
}
