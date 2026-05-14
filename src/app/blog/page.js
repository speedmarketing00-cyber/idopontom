import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 60; // ISR: regenerate every minute + on-demand revalidation from API

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export const metadata = {
    title: 'Blog – FoglaljVelem | Tippek szolgáltatóknak',
    description: 'Hasznos cikkek fodrászoknak, kozmetikusoknak és szolgáltatóknak: időpontfoglalás, ügyfélkezelés, marketing tippek.',
    openGraph: {
        title: 'Blog – FoglaljVelem',
        description: 'Tippek és trükkök szolgáltatóknak az online időpontfoglaláshoz.',
        url: 'https://foglaljvelem.hu/blog',
    },
};

export default async function BlogPage() {
    let posts = [];
    if (supabase) {
        const { data } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, cover_image, category, published_at, author')
            .eq('status', 'published')
            .order('published_at', { ascending: false });
        posts = data || [];
    }

    const categoryLabels = {
        tippek: { label: 'Tippek', color: '#2563eb', bg: '#eff6ff' },
        esettanulmany: { label: 'Esettanulmány', color: '#059669', bg: '#f0fdf4' },
        ujdonsag: { label: 'Újdonság', color: '#d97706', bg: '#fffbeb' },
        seo: { label: 'Marketing', color: '#7c3aed', bg: '#f5f3ff' },
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 40%)' }}>
            {/* Header */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 0' }}>
                <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Vissza a főoldalra
                </Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 16, marginBottom: 8, fontFamily: 'var(--font-display)', color: '#1e3a5f' }}>
                    FoglaljVelem Blog 📝
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: 48, maxWidth: 600 }}>
                    Tippek, trükkök és inspiráció szolgáltatóknak – hogyan szerezz több ügyfelet és spórolj időt.
                </p>
            </div>

            {/* Post grid */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
                {posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                        <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>Hamarosan jönnek a cikkek!</h3>
                        <p style={{ color: '#6b7280' }}>Iratkozz fel és értesítünk az első posztokról.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                        {posts.map(post => {
                            const cat = categoryLabels[post.category] || categoryLabels.tippek;
                            const dateStr = post.published_at
                                ? new Date(post.published_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '';
                            return (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <article style={{
                                        background: 'white', borderRadius: 16, overflow: 'hidden',
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
                                    >
                                        {post.cover_image && (
                                            <div style={{ height: 180, background: `url(${post.cover_image}) center/cover`, borderBottom: '1px solid #f3f4f6' }} />
                                        )}
                                        {!post.cover_image && (
                                            <div style={{ height: 120, background: 'linear-gradient(135deg, #e0efff, #f0f7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                                                📝
                                            </div>
                                        )}
                                        <div style={{ padding: 20 }}>
                                            <span style={{
                                                display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
                                                padding: '3px 10px', borderRadius: 20,
                                                background: cat.bg, color: cat.color, marginBottom: 10,
                                            }}>
                                                {cat.label}
                                            </span>
                                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.4, color: '#1e3a5f' }}>
                                                {post.title}
                                            </h2>
                                            {post.excerpt && (
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>
                                                    {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '...' : post.excerpt}
                                                </p>
                                            )}
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {dateStr} {post.author && `• ${post.author}`}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA */}
            <div style={{ background: '#1e3a5f', padding: '48px 20px', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                    Készen állsz az online foglalásra?
                </h2>
                <p style={{ color: '#93c5fd', marginBottom: 24, fontSize: '1rem' }}>
                    Próbáld ki ingyen a FoglaljVelem időpontfoglaló rendszert!
                </p>
                <Link href="/auth/register" style={{
                    display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                    color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 600,
                    textDecoration: 'none', fontSize: '1rem',
                }}>
                    Ingyenes regisztráció →
                </Link>
            </div>
        </div>
    );
}
