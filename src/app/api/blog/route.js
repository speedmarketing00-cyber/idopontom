import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function GET(request) {
    if (!supabaseAdmin) return Response.json({ posts: [] });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
        // Admin: list ALL posts (drafts + published)
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ posts: data || [] });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(request) {
    if (!supabaseAdmin) return Response.json({ error: 'DB not configured' }, { status: 500 });

    try {
        const { action, post, postId } = await request.json();

        if (action === 'create') {
            const { id, ...insertData } = post;
            const { data, error } = await supabaseAdmin.from('blog_posts').insert(insertData).select().single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true, post: data });
        }

        if (action === 'update') {
            const { id, ...updateData } = post;
            const { data, error } = await supabaseAdmin.from('blog_posts').update(updateData).eq('id', id).select().single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true, post: data });
        }

        if (action === 'delete') {
            const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', postId);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
        }

        if (action === 'publish') {
            const { data, error } = await supabaseAdmin.from('blog_posts')
                .update({ status: 'published', published_at: new Date().toISOString() })
                .eq('id', postId).select().single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true, post: data });
        }

        return Response.json({ error: 'Unknown action' }, { status: 400 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
