import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request) {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin || !resend) {
        return Response.json({ error: 'Not configured' }, { status: 500 });
    }

    try {
        const now = new Date();
        const sent24h = [];
        const sent1h = [];

        // Get all confirmed bookings for upcoming dates
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select('*, profiles!bookings_profile_id_fkey(subscription_tier)')
            .eq('status', 'confirmed')
            .gte('booking_date', now.toISOString().split('T')[0]);

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return Response.json({ message: 'No upcoming bookings', sent24h: 0, sent1h: 0 });
        }

        for (const booking of bookings) {
            // Only send reminders for basic/pro tier providers
            const tier = booking.profiles?.subscription_tier || 'free';
            if (tier !== 'basic' && tier !== 'pro') continue;

            // IMPORTANT: booking times are stored in CET (Europe/Budapest), NOT UTC
            // Vercel runs in UTC, so we must account for timezone
            // CET = UTC+1, CEST (summer) = UTC+2
            // Determine if date is in CEST (last Sunday of March to last Sunday of October)
            const bookingDate = new Date(booking.booking_date + 'T00:00:00Z');
            const month = bookingDate.getUTCMonth(); // 0-indexed
            const isCEST = month >= 2 && month <= 9; // roughly March-October
            const tzOffset = isCEST ? '+02:00' : '+01:00';

            const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}${tzOffset}`);
            const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);

            console.log('Checking booking:', {
                id: booking.id,
                client: booking.client_email,
                date: booking.booking_date,
                time: booking.start_time,
                hoursUntil: hoursUntil.toFixed(2),
                tier,
                reminder_24h_sent: booking.reminder_24h_sent,
                reminder_1h_sent: booking.reminder_1h_sent,
            });

            // Get service name for the email
            let serviceName = 'Szolgáltatás';
            if (booking.service_id) {
                const { data: svc } = await supabaseAdmin.from('services').select('name').eq('id', booking.service_id).maybeSingle();
                if (svc) serviceName = svc.name;
            }

            // Load email settings for this provider
            let emailSettings = { reminder_24h: true, reminder_1h: true };
            try {
                const { data: es } = await supabaseAdmin.from('email_settings')
                    .select('reminder_24h, reminder_1h').eq('profile_id', booking.profile_id).maybeSingle();
                if (es) emailSettings = es;
            } catch (esErr) {
                console.warn('email_settings query failed:', esErr.message);
            }

            // 24h reminder: between 22-26 hours before (wider window for hourly cron)
            if (emailSettings.reminder_24h && !booking.reminder_24h_sent && hoursUntil > 22 && hoursUntil <= 26) {
                try {
                    const formattedDate = new Date(booking.booking_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
                    await resend.emails.send({
                        from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                        to: booking.client_email,
                        subject: `⏰ Emlékeztető: holnapi időpontod – ${serviceName}`,
                        html: reminderEmailHtml({
                            clientName: booking.client_name,
                            serviceName: serviceName,
                            date: formattedDate,
                            time: booking.start_time,
                            title: 'Holnapi emlékeztető',
                            emoji: '⏰',
                            message: 'ne felejtsd el a holnapi időpontodat!',
                        }),
                    });
                    await supabaseAdmin.from('bookings').update({ reminder_24h_sent: true }).eq('id', booking.id);
                    sent24h.push(booking.id);
                    console.log('24h reminder sent to:', booking.client_email);
                } catch (e) { console.error('24h reminder error:', e); }
            }

            // 1h reminder: between 0.5-1.5 hours before
            if (emailSettings.reminder_1h && !booking.reminder_1h_sent && hoursUntil > 0.5 && hoursUntil <= 1.5) {
                try {
                    const formattedDate = new Date(booking.booking_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
                    await resend.emails.send({
                        from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                        to: booking.client_email,
                        subject: `🔔 1 óra múlva: ${serviceName}`,
                        html: reminderEmailHtml({
                            clientName: booking.client_name,
                            serviceName: serviceName,
                            date: formattedDate,
                            time: booking.start_time,
                            title: 'Hamarosan!',
                            emoji: '🔔',
                            message: '1 óra múlva kezdődik az időpontod!',
                        }),
                    });
                    await supabaseAdmin.from('bookings').update({ reminder_1h_sent: true }).eq('id', booking.id);
                    sent1h.push(booking.id);
                    console.log('1h reminder sent to:', booking.client_email);
                } catch (e) { console.error('1h reminder error:', e); }
            }
        }

        console.log('Cron run complete:', { checked: bookings.length, sent24h: sent24h.length, sent1h: sent1h.length });
        return Response.json({
            success: true,
            checked: bookings.length,
            sent24h: sent24h.length,
            sent1h: sent1h.length,
        });
    } catch (error) {
        console.error('Cron error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

function reminderEmailHtml({ clientName, serviceName, date, time, title, emoji, message }) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2.5rem;">${emoji}</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">${title}</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${clientName}, ${message}</p>
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
