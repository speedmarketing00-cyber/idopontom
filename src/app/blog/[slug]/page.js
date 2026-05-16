import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 60; // ISR + on-demand revalidation from API

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    if (!supabase) return { title: 'Blog – FoglaljVelem' };
    const { data: post } = await supabase
        .from('blog_posts')
        .select('title, meta_title, meta_description, excerpt, cover_image')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
    if (!post) return { title: 'Cikk nem található – FoglaljVelem' };
    return {
        title: post.meta_title || `${post.title} – FoglaljVelem Blog`,
        description: post.meta_description || post.excerpt || '',
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            url: `https://foglaljvelem.hu/blog/${slug}`,
            images: post.cover_image ? [{ url: post.cover_image }] : [],
        },
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    let post = null;
    if (supabase) {
        const { data } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .maybeSingle();
        post = data;
    }

    if (!post) notFound();

    const dateStr = post.published_at
        ? new Date(post.published_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    const categoryLabels = {
        tippek: 'Tippek',
        esettanulmany: 'Esettanulmány',
        ujdonsag: 'Újdonság',
        seo: 'Marketing',
    };

    // Structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.meta_description || post.excerpt || '',
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: { '@type': 'Organization', name: post.author || 'FoglaljVelem' },
        publisher: { '@type': 'Organization', name: 'FoglaljVelem', url: 'https://foglaljvelem.hu' },
        mainEntityOfPage: `https://foglaljvelem.hu/blog/${slug}`,
        image: post.cover_image || undefined,
    };

    return (
        <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', padding: '48px 20px 32px' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <Link href="/blog" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Vissza a blogra
                    </Link>
                    <div style={{ marginTop: 16, marginBottom: 12 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#eff6ff', color: '#2563eb' }}>
                            {categoryLabels[post.category] || 'Tippek'}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.3, color: '#1e3a5f', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p style={{ fontSize: '1.1rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
                            {post.excerpt}
                        </p>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                        {dateStr} {post.author && `• ${post.author}`}
                    </div>
                </div>
            </div>

            {/* Cover image */}
            {post.cover_image && (
                <div style={{ maxWidth: 720, margin: '0 auto 32px', padding: '0 20px' }}>
                    <img src={post.cover_image} alt={post.title} style={{ width: '100%', borderRadius: 16, maxHeight: 400, objectFit: 'cover' }} />
                </div>
            )}

            {/* Content */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' }}>
                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{
                        fontSize: '1.05rem', lineHeight: 1.8, color: '#374151',
                    }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <span key={tag} style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div style={{
                    marginTop: 48, padding: 32, borderRadius: 16,
                    background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
                    border: '1px solid #dbeafe', textAlign: 'center',
                }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#1e3a5f' }}>
                        Szeretnéd te is egyszerűsíteni a foglalásaidat?
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: 20, fontSize: '0.95rem' }}>
                        Próbáld ki ingyen a FoglaljVelem online időpontfoglaló rendszert!
                    </p>
                    <Link href="/auth/register" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                        color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        Ingyenes regisztráció →
                    </Link>
                </div>
            </div>

            {/* Blog content styles */}
            <style>{`
                .blog-content h2 { font-size: 1.4rem; font-weight: 700; color: #1e3a5f; margin: 32px 0 12px; }
                .blog-content h3 { font-size: 1.15rem; font-weight: 700; color: #374151; margin: 24px 0 10px; }
                .blog-content p { margin-bottom: 16px; }
                .blog-content ul, .blog-content ol { margin-bottom: 16px; padding-left: 24px; }
                .blog-content li { margin-bottom: 8px; }
                .blog-content strong { color: #1e3a5f; }
                .blog-content a { color: #2563eb; text-decoration: underline; }
                .blog-content blockquote {
                    border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0;
                    background: #f0f7ff; border-radius: 0 12px 12px 0; font-style: italic; color: #374151;
                }
                .blog-content img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
                .blog-content .your-input {
                    background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 10px;
                    padding: 12px 16px; margin: 12px 0; font-style: italic; color: #92400e;
                }
            `}</style>
        </div>
        <Footer />
        </>
    );
}
