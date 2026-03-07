import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin || !resend) {
        return Response.json({ error: 'Not configured' }, { status: 500 });
    }

    try {
        const now = new Date();

        // Budapest timezone offset
        const isCEST = now.getUTCMonth() >= 2 && now.getUTCMonth() <= 9;
        const tzOffsetHours = isCEST ? 2 : 1;
        const localNow = new Date(now.getTime() + tzOffsetHours * 60 * 60 * 1000);
        const todayStr = localNow.toISOString().split('T')[0];

        // Current local time in minutes
        const localHour = localNow.getUTCHours();
        const localMin = localNow.getUTCMinutes();
        const nowMinutes = localHour * 60 + localMin;

        // Get all confirmed bookings for today that haven't had 1h reminder sent
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*, profiles!bookings_profile_id_fkey(subscription_tier, business_name, name)')
            .eq('status', 'confirmed')
            .eq('booking_date', todayStr)
            .eq('reminder_1h_sent', false);

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return Response.json({ message: 'No bookings needing 1h reminder', sent: 0 });
        }

        const sent = [];

        for (const booking of bookings) {
            const tier = booking.profiles?.subscription_tier || 'free';
            if (tier !== 'basic' && tier !== 'pro') continue;

            // Parse booking time
            const [bh, bm] = (booking.start_time || '00:00').slice(0, 5).split(':').map(Number);
            const bookingMinutes = bh * 60 + bm;

            // Check if booking is 30-90 minutes away
            const minutesUntil = bookingMinutes - nowMinutes;
            if (minutesUntil < 30 || minutesUntil > 90) continue;

            // Load email settings
            let reminder1hEnabled = true;
            try {
                const { data: es } = await supabaseAdmin.from('email_settings')
                    .select('reminder_1h').eq('profile_id', booking.profile_id).maybeSingle();
                if (es) reminder1hEnabled = es.reminder_1h !== false;
            } catch (esErr) {
                console.warn('email_settings query failed:', esErr.message);
            }

            if (!reminder1hEnabled) continue;

            // Get service name
            let serviceName = 'Foglalás';
            if (booking.service_id) {
                const { data: svc } = await supabaseAdmin.from('services').select('name').eq('id', booking.service_id).maybeSingle();
                if (svc) serviceName = svc.name;
            }

            try {
                const providerName = booking.profiles?.business_name || booking.profiles?.name || 'Szolgáltató';
                await resend.emails.send({
                    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                    to: booking.client_email,
                    subject: `🔔 1 óra múlva időpontod van – ${providerName}`,
                    html: reminder1hEmailHtml({
                        clientName: booking.client_name,
                        serviceName,
                        providerName,
                        time: booking.start_time?.slice(0, 5),
                    }),
                });
                await supabaseAdmin.from('bookings').update({ reminder_1h_sent: true }).eq('id', booking.id);
                sent.push(booking.id);
                console.log('1h reminder sent to:', booking.client_email);
            } catch (e) {
                console.error('1h reminder error for booking', booking.id, e);
            }
        }

        return Response.json({ success: true, todayStr, checked: bookings.length, sent: sent.length });
    } catch (error) {
        console.error('1h cron error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

function reminder1hEmailHtml({ clientName, serviceName, providerName, time }) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2.5rem;">🔔</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Hamarosan kezdődik!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}!</p>
    </div>
    <div style="background:#fff0f0;border-radius:12px;padding:20px;border:1px solid #fca5a5;">
      <p style="margin:0;color:#374151;font-size:0.95rem;">1 óra múlva időpontod van <strong>${providerName}</strong> szolgáltatónál.</p>
      <p style="margin:8px 0 0;color:#374151;font-size:0.95rem;">📋 Szolgáltatás: <strong>${serviceName}</strong></p>
      <p style="margin:4px 0 0;color:#374151;font-size:0.95rem;">🕐 Időpont: <strong>${time}</strong></p>
    </div>
    <p style="color:#374151;font-size:0.95rem;text-align:center;margin-top:20px;font-weight:500;">Kérlek ne felejtsd el! 🙂</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}
