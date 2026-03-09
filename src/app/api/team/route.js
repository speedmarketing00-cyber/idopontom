import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET – list team members for a profile
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get('profileId');
        if (!profileId) return Response.json({ members: [] });
        if (!supabaseAdmin) return Response.json({ members: [], error: 'Server not configured' }, { status: 500 });

        const { data, error } = await supabaseAdmin.from('team_members')
            .select('*')
            .eq('owner_profile_id', profileId)
            .order('created_at');

        if (error) {
            console.error('Team list error:', error);
            return Response.json({ members: [], error: error.message }, { status: 500 });
        }
        return Response.json({ members: data || [] });
    } catch (e) {
        console.error('Team GET error:', e);
        return Response.json({ members: [], error: e.message }, { status: 500 });
    }
}

// POST – add a team member + send invite email
export async function POST(request) {
    try {
        const { profileId, name, email, ownerName, businessName } = await request.json();
        if (!profileId || !name || !email) {
            return Response.json({ error: 'Hiányzó adatok (név, email)' }, { status: 400 });
        }
        if (!supabaseAdmin) {
            return Response.json({ error: 'Szerver konfiguráció hiba' }, { status: 500 });
        }

        // Check max 8
        const { count } = await supabaseAdmin.from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('owner_profile_id', profileId);
        if (count >= 8) {
            return Response.json({ error: 'Maximum 8 csapattag meghívható' }, { status: 400 });
        }

        // Insert team member
        const { data, error } = await supabaseAdmin.from('team_members').insert({
            owner_profile_id: profileId,
            name,
            email,
            role: 'Csapattag',
            is_active: true,
        }).select().single();

        if (error) {
            console.error('Team insert error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        // Immediately upgrade the invitee's subscription if they already have an account
        try {
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('user_id, subscription_tier')
                .eq('email', email)
                .maybeSingle();
            if (existingProfile && existingProfile.subscription_tier === 'free') {
                await supabaseAdmin
                    .from('profiles')
                    .update({ subscription_tier: 'basic' })
                    .eq('user_id', existingProfile.user_id);
            }
        } catch (e) {
            console.warn('Immediate invite upgrade failed:', e.message);
        }

        // Send invite email (don't fail the whole request if email fails)
        if (resend && data) {
            try {
                await resend.emails.send({
                    from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                    to: email,
                    subject: `🎉 Meghívtak a(z) ${businessName || 'csapat'} csapatába!`,
                    html: teamInviteHtml({ memberName: name, ownerName: ownerName || 'Tulajdonos', businessName: businessName || 'Csapat' }),
                });
            } catch (emailErr) {
                console.error('Team invite email error:', emailErr);
            }
        }

        return Response.json({ member: data });
    } catch (e) {
        console.error('Team POST error:', e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}

function teamInviteHtml({ memberName, ownerName, businessName }) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">🎉</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Meghívtak egy csapatba!</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${memberName}!</p>
    </div>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;border:1px solid #86efac;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:0.95rem;"><strong>${ownerName}</strong> meghívott a <strong>${businessName}</strong> csapatába!</p>
      <p style="margin:10px 0 0;color:#6b7280;font-size:0.9rem;">Csapattagként automatikusan megkapod az <strong>⭐ Alap csomag</strong> összes funkcióját ingyenesen (emlékeztetők, értékelések, statisztikák).</p>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:20px;border:1px solid #fde68a;margin-bottom:24px;">
      <p style="margin:0;color:#374151;font-size:0.9rem;font-weight:600;">📋 Teendők:</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#374151;font-size:0.85rem;line-height:1.8;">
        <li>Regisztrálj a <strong>foglaljvelem.hu</strong> oldalon <strong>ezzel az email címmel</strong></li>
        <li>Állítsd be a profilodat és szolgáltatásaidat</li>
        <li>A rendszer automatikusan összekapcsol a csapattal</li>
      </ol>
    </div>
    <div style="text-align:center;">
      <a href="https://foglaljvelem.hu/auth/register" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:0.95rem;">📅 Regisztrálok</a>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:16px;">Ha kérdésed van, keress minket: <a href="mailto:hello@foglaljvelem.hu" style="color:#2563eb;">hello@foglaljvelem.hu</a></p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`;
}
