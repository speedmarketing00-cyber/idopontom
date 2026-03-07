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

        // Tomorrow's date in Budapest timezone (CET/CEST)
        const isCEST = now.getUTCMonth() >= 2 && now.getUTCMonth() <= 9;
        const tzOffsetHours = isCEST ? 2 : 1;
        const localNow = new Date(now.getTime() + tzOffsetHours * 60 * 60 * 1000);
        const localTomorrow = new Date(localNow);
        localTomorrow.setUTCDate(localTomorrow.getUTCDate() + 1);
        const tomorrowStr = localTomorrow.toISOString().split('T')[0];

        console.log('Cron running at UTC:', now.toISOString(), '| Sending reminders for:', tomorrowStr);

        // Get all confirmed bookings for tomorrow
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*, profiles!bookings_profile_id_fkey(subscription_tier)')
            .eq('status', 'confirmed')
            .eq('booking_date', tomorrowStr);

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return Response.json({ message: 'No bookings for tomorrow', tomorrowStr, sent: 0 });
        }

        const sent = [];

        for (const booking of bookings) {
            // Only send for basic/pro tier providers
            const tier = booking.profiles?.subscription_tier || 'free';
            if (tier !== 'basic' && tier !== 'pro') continue;

            // Skip if already sent
            if (booking.reminder_24h_sent) continue;

            // Load email settings
            let reminder24hEnabled = true;
            try {
                const { data: es } = await supabaseAdmin.from('email_settings')
                    .select('reminder_24h').eq('profile_id', booking.profile_id).maybeSingle();
                if (es) reminder24hEnabled = es.reminder_24h !== false;
            } catch (esErr) {
                console.warn('email_settings query failed:', esErr.message);
            }

            if (!reminder24hEnabled) continue;

            // Get service name
            let serviceName = 'Foglalás';
            if (booking.service_id) {
                const { data: svc } = await supabaseAdmin.from('services').select('name').eq('id', booking.service_id).maybeSingle();
                if (svc) serviceName = svc.name;
            }

            try {
                const formattedDate = new Date(booking.booking_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
                await resend.emails.send({
                    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                    to: booking.client_email,
                    subject: `⏰ Emlékeztető: holnapi időpontod – ${serviceName}`,
                    html: reminderEmailHtml({
                        clientName: booking.client_name,
                        serviceName,
                        date: formattedDate,
                        time: booking.start_time?.slice(0, 5),
                    }),
                });
                await supabaseAdmin.from('bookings').update({ reminder_24h_sent: true }).eq('id', booking.id);
                sent.push(booking.id);
                console.log('Reminder sent to:', booking.client_email, 'for', tomorrowStr, booking.start_time);
            } catch (e) {
                console.error('Reminder error for booking', booking.id, e);
            }
        }

        return Response.json({ success: true, tomorrowStr, checked: bookings.length, sent: sent.length });
    } catch (error) {
        console.error('Cron error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

function reminderEmailHtml({ clientName, serviceName, date, time }) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2.5rem;">⏰</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Holnapi emlékeztető</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, ne felejtsd el a holnapi időpontodat!</p>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:20px;border:1px solid #fde68a;">
      <p style="margin:0;font-weight:700;font-size:1.1rem;color:#1e3a5f;">${serviceName}</p>
      <p style="margin:6px 0 0;color:#6b7280;font-size:0.95rem;">📅 ${date} – 🕐 ${time}</p>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:20px;">Várunk szeretettel! 🙂</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}
