import { createClient } from '@supabase/supabase-js';

// Uses service role key to bypass RLS — needed because the client-side
// profiles JOIN on team_members fails when the invited user doesn't own
// the profiles row (RLS blocks cross-user reads).
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId'); // passed by client to enable server-side upgrade

    if (!email || !supabaseAdmin) {
        return Response.json({ teamRecord: null });
    }

    try {
        const { data: teamRecord, error } = await supabaseAdmin
            .from('team_members')
            .select('*, profiles!team_members_owner_profile_id_fkey(*)')
            .eq('email', email)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('team/me error:', error.message);
            return Response.json({ teamRecord: null });
        }

        // Auto-upgrade: active team member gets basic tier for free.
        // Must be server-side (admin) — RLS blocks client-side subscription_tier writes.
        if (teamRecord && userId) {
            try {
                await supabaseAdmin
                    .from('profiles')
                    .update({ subscription_tier: 'basic' })
                    .eq('user_id', userId)
                    .eq('subscription_tier', 'free'); // never touch paid tiers
            } catch (e) {
                console.warn('Team auto-upgrade failed:', e.message);
            }
        }

        return Response.json({ teamRecord: teamRecord || null });
    } catch (err) {
        console.error('team/me exception:', err);
        return Response.json({ teamRecord: null });
    }
}
