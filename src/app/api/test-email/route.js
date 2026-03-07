import { Resend } from 'resend';

export async function GET(request) {
    const results = {
        timestamp: new Date().toISOString(),
        resendKeyExists: !!process.env.RESEND_API_KEY,
        resendKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 6) + '...' : 'MISSING',
        supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // Try sending a test email
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const emailResult = await resend.emails.send({
                from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                to: 'speedmarketing00@gmail.com',
                subject: 'FoglaljVelem – Teszt email ✅',
                html: '<h1>Teszt email</h1><p>Ha ezt látod, az email küldés működik! 🎉</p><p>Küldve: ' + new Date().toISOString() + '</p>',
            });
            results.emailSent = true;
            results.emailResult = emailResult;
        } catch (error) {
            results.emailSent = false;
            results.emailError = error.message;
            results.emailErrorFull = JSON.stringify(error);
        }
    } else {
        results.emailSent = false;
        results.emailError = 'RESEND_API_KEY not configured';
    }

    return Response.json(results);
}
// deployed Mon Mar  2 20:19:52 CET 2026
