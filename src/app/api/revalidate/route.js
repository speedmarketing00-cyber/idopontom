import { revalidatePath } from 'next/cache';

export async function POST(request) {
    try {
        const { paths } = await request.json();

        if (!paths || !Array.isArray(paths)) {
            // Default: revalidate blog pages
            revalidatePath('/blog');
            return Response.json({ revalidated: true, paths: ['/blog'] });
        }

        for (const path of paths) {
            revalidatePath(path);
        }

        return Response.json({ revalidated: true, paths });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
