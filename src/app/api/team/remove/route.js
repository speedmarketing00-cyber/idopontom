import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
    try {
        const { memberEmail, memberName, ownerName, businessName } = await request.json();
        if (!memberEmail) return Response.json({ error: 'Missing memberEmail' }, { status: 400 });

        // Find the user by email and downgrade subscription_tier basic → free
        if (supabaseAdmin) {
            try {
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 10000 });
                const user = users?.find(u => u.email === memberEmail);
                if (user) {
                    // Only downgrade from 'basic' (team-granted), leave 'pro' (own paid) untouched
                    await supabaseAdmin.from('profiles')
                        .update({ subscription_tier: 'free' })
                        .eq('user_id', user.id)
                        .eq('subscription_tier', 'basic');
                }
            } catch (e) {
                console.error('Error downgrading team member tier:', e);
            }
        }

        // Send removal notification email
        if (resend) {
            try {
                await resend.emails.send({
                    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                    to: memberEmail,
                    subject: `😔 Eltávolítottak a(z) ${businessName} csapatából`,
                    html: teamRemovedEmailHtml({ memberName, ownerName, businessName }),
                });
            } catch (e) {
                console.error('Team removal email error:', e);
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Team remove API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

function teamRemovedEmailHtml({ memberName, ownerName, businessName }) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">😔</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Csapatból eltávolítottak</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${memberName}!</p>
    </div>
    <div style="background:#fef2f2;border-radius:12px;padding:20px;border:1px solid #fca5a5;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:0.95rem;">Eltávolítottak a <strong>${businessName}</strong> csapatából (tulajdonos: <strong>${ownerName}</strong>).</p>
      <p style="margin:10px 0 0;color:#6b7280;font-size:0.9rem;">Az Alap csomag funkciói (emlékeztetők, értékelések, statisztikák) az ingyenes csomagra kerültek vissza.</p>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:20px;border:1px solid #fde68a;margin-bottom:24px;">
      <p style="margin:0;color:#374151;font-size:0.9rem;font-weight:600;">⭐ Szeretnéd megtartani a funkciókat?</p>
      <p style="margin:8px 0 0;color:#374151;font-size:0.85rem;line-height:1.6;">Ha szeretnéd, hogy az ügyfeleid továbbra is kapjanak emlékeztetőt 24 órával és 1 órával az időpontjuk előtt, iratkozz fel az <strong>Alap csomagra</strong> – ez megakadályozza a lemondásokat és az elfelejtett időpontokat.</p>
    </div>
    <div style="text-align:center;">
      <a href="https://foglaljvelem.hu/dashboard/settings" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:0.95rem;">⭐ Alap csomag előfizetése</a>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">Ha kérdésed van, keress minket a <a href="mailto:hello@foglaljvelem.hu" style="color:#2563eb;">hello@foglaljvelem.hu</a> címen.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}
