import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// GET — load provider profile by slug (for the review form header)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug || !supabaseAdmin) return Response.json({ profile: null }, { status: 400 });

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, business_name, business_type, avatar_url, city, slug')
        .eq('slug', slug)
        .maybeSingle();

    if (error || !profile) return Response.json({ profile: null }, { status: 404 });
    return Response.json({ profile });
}

// POST — submit a review
export async function POST(request) {
    try {
        const { slug, rating, reviewer_name, comment } = await request.json();

        if (!slug || !rating || !reviewer_name?.trim()) {
            return Response.json({ error: 'Hiányzó adatok' }, { status: 400 });
        }
        if (rating < 1 || rating > 5) {
            return Response.json({ error: 'Érvénytelen értékelés' }, { status: 400 });
        }
        if (!supabaseAdmin) {
            return Response.json({ error: 'Szerver hiba' }, { status: 500 });
        }

        // Look up profile by slug
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

        if (!profile) return Response.json({ error: 'Nem található a szolgáltató' }, { status: 404 });

        // Insert review
        const { error: insertError } = await supabaseAdmin
            .from('reviews')
            .insert({
                profile_id: profile.id,
                reviewer_name: reviewer_name.trim(),
                rating: Number(rating),
                comment: comment?.trim() || null,
            });

        if (insertError) {
            console.error('Review insert error:', insertError);
            return Response.json({ error: insertError.message }, { status: 500 });
        }

        return Response.json({ success: true });
    } catch (err) {
        console.error('Review POST error:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
