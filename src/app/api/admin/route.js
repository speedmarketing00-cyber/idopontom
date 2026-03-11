import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function POST(request) {
    if (!supabaseAdmin) {
        return Response.json({ error: 'Nincs adatbázis kapcsolat.' }, { status: 500 });
    }

    try {
        const { action, password, profileId, updates } = await request.json();

        // Auth check
        if (password !== ADMIN_PASSWORD) {
            return Response.json({ error: 'Hibás admin jelszó.' }, { status: 401 });
        }

        if (action === 'list-profiles') {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*, services(count), bookings!bookings_profile_id_fkey(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return Response.json({ profiles: data });
        }

        if (action === 'get-profile') {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*, services(*), bookings!bookings_profile_id_fkey(count)')
                .eq('id', profileId)
                .single();

            if (error) throw error;
            return Response.json({ profile: data });
        }

        if (action === 'update-profile') {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .update(updates)
                .eq('id', profileId)
                .select()
                .single();

            if (error) throw error;
            return Response.json({ profile: data });
        }

        if (action === 'delete-profile') {
            // Get user_id first
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('user_id')
                .eq('id', profileId)
                .single();

            if (profile?.user_id) {
                await supabaseAdmin.auth.admin.deleteUser(profile.user_id);
            }
            return Response.json({ success: true });
        }

        if (action === 'impersonate') {
            // Get user_id from profile
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('user_id')
                .eq('id', profileId)
                .single();

            if (!profile?.user_id) {
                return Response.json({ error: 'Profil nem található.' }, { status: 404 });
            }

            // Get user email from Supabase auth
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
            if (userError || !userData?.user?.email) {
                return Response.json({ error: 'Felhasználó email nem található.' }, { status: 404 });
            }

            // Generate magic link for this user
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: userData.user.email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foglaljvelem.hu'}/dashboard`,
                },
            });

            if (linkError) throw linkError;

            // The action_link contains the full verification URL
            // We need to extract the token and redirect through our callback
            const actionLink = linkData?.properties?.action_link;
            if (!actionLink) {
                return Response.json({ error: 'Magic link generálás sikertelen.' }, { status: 500 });
            }

            return Response.json({ url: actionLink });
        }

        if (action === 'stats') {
            const [profiles, bookings, services] = await Promise.all([
                supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
                supabaseAdmin.from('bookings').select('id', { count: 'exact' }),
                supabaseAdmin.from('services').select('id', { count: 'exact' }),
            ]);
            return Response.json({
                totalProfiles: profiles.count || 0,
                totalBookings: bookings.count || 0,
                totalServices: services.count || 0,
            });
        }

        return Response.json({ error: 'Ismeretlen action' }, { status: 400 });
    } catch (error) {
        console.error('Admin error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
