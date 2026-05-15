import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getArticleBySlug, getAllSlugs, getRelatedArticles, getAdjacentArticles } from '../articles';

// ISR: revalidate every 7 days (content doesn't change often)
export const revalidate = 604800;

// Generate all static paths at build time
export async function generateStaticParams() {
    return getAllSlugs().map(slug => ({ slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return { title: 'Cikk nem található – FoglaljVelem' };

    return {
        title: article.seoTitle,
        description: article.seoDesc,
        openGraph: {
            title: article.seoTitle,
            description: article.seoDesc,
            url: `https://foglaljvelem.hu/tudasbazis/${slug}`,
            type: 'article',
        },
        alternates: {
            canonical: `https://foglaljvelem.hu/tudasbazis/${slug}`,
        },
    };
}

export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) notFound();

    const related = getRelatedArticles(slug, article.categoryId);
    const { prev, next } = getAdjacentArticles(slug);

    // Schema.org structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.seoDesc,
        url: `https://foglaljvelem.hu/tudasbazis/${slug}`,
        publisher: { '@type': 'Organization', name: 'FoglaljVelem', url: 'https://foglaljvelem.hu' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://foglaljvelem.hu/tudasbazis/${slug}` },
    };

    // Breadcrumb structured data
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Főoldal', item: 'https://foglaljvelem.hu' },
            { '@type': 'ListItem', position: 2, name: 'Tudásbázis', item: 'https://foglaljvelem.hu/tudasbazis' },
            { '@type': 'ListItem', position: 3, name: article.title, item: `https://foglaljvelem.hu/tudasbazis/${slug}` },
        ],
    };

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 40%)' }}>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

                <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 0' }}>
                    {/* Breadcrumb */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#6b7280', flexWrap: 'wrap', marginBottom: 32 }}>
                        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Főoldal</Link>
                        <span>›</span>
                        <Link href="/tudasbazis" style={{ color: '#2563eb', textDecoration: 'none' }}>Tudásbázis</Link>
                        <span>›</span>
                        <span style={{ color: '#374151' }}>{article.title}</span>
                    </nav>

                    {/* Category badge */}
                    <div style={{ marginBottom: 16 }}>
                        <Link
                            href={`/tudasbazis#${article.categoryId}`}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#eff6ff', color: '#2563eb', padding: '6px 14px',
                                borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                            }}
                        >
                            {article.icon} {article.category}
                        </Link>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '2.2rem', fontWeight: 800, color: '#1e3a5f', lineHeight: 1.3,
                        marginBottom: 12, fontFamily: 'var(--font-display)',
                    }}>
                        {article.title}
                    </h1>

                    {/* Meta info */}
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: '#6b7280', marginBottom: 40 }}>
                        <span>⏱️ {article.readTime} olvasás</span>
                    </div>

                    {/* Article content */}
                    <article
                        className="kb-article-content"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                        style={{ lineHeight: 1.8, color: '#374151', fontSize: '1rem' }}
                    />

                    {/* Prev / Next navigation */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
                        gap: 16, marginTop: 56, marginBottom: 40,
                    }}>
                        {prev && (
                            <Link href={`/tudasbazis/${prev.slug}`} className="kb-nav-card" style={{
                                textDecoration: 'none', color: 'inherit', background: 'white',
                                border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>← Előző cikk</span>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginTop: 4, fontSize: '0.95rem' }}>{prev.title}</div>
                            </Link>
                        )}
                        {next && (
                            <Link href={`/tudasbazis/${next.slug}`} className="kb-nav-card" style={{
                                textDecoration: 'none', color: 'inherit', background: 'white',
                                border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px',
                                textAlign: prev ? 'right' : 'left', transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Következő cikk →</span>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginTop: 4, fontSize: '0.95rem' }}>{next.title}</div>
                            </Link>
                        )}
                    </div>

                    {/* Related articles */}
                    {related.length > 0 && (
                        <div style={{ marginBottom: 60 }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 20, fontFamily: 'var(--font-display)' }}>
                                Kapcsolódó cikkek a „{article.category}" kategóriából
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                                {related.map(r => (
                                    <Link key={r.slug} href={`/tudasbazis/${r.slug}`} className="kb-related-card" style={{
                                        textDecoration: 'none', color: 'inherit', background: 'white',
                                        border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px',
                                        transition: 'all 0.2s',
                                    }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>{r.title}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{r.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div style={{ background: '#1e3a5f', padding: '48px 20px', textAlign: 'center' }}>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                        Nem találtad meg a választ?
                    </h2>
                    <p style={{ color: '#93c5fd', marginBottom: 24, fontSize: '1rem' }}>
                        Írj nekünk és segítünk mindent beállítani!
                    </p>
                    <a href="mailto:info@foglaljvelem.hu" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                        color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 600,
                        textDecoration: 'none', fontSize: '1rem',
                    }}>
                        📧 info@foglaljvelem.hu
                    </a>
                </div>

                <style>{`
                    .kb-article-content h2 {
                        font-size: 1.35rem;
                        font-weight: 800;
                        color: #1e3a5f;
                        margin-top: 40px;
                        margin-bottom: 16px;
                        font-family: var(--font-display);
                    }
                    .kb-article-content h3 {
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #1e3a5f;
                        margin-top: 28px;
                        margin-bottom: 12px;
                    }
                    .kb-article-content p {
                        margin-bottom: 16px;
                    }
                    .kb-article-content ul, .kb-article-content ol {
                        margin-bottom: 16px;
                        padding-left: 24px;
                    }
                    .kb-article-content li {
                        margin-bottom: 8px;
                    }
                    .kb-article-content strong {
                        color: #1e3a5f;
                    }
                    .kb-article-content code {
                        background: #f1f5f9;
                        padding: 2px 8px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        color: #1e293b;
                        word-break: break-all;
                    }
                    .kb-tip {
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin: 20px 0;
                        font-size: 0.9rem;
                        color: #1e40af;
                    }
                    .kb-tip ul {
                        margin-top: 8px;
                        margin-bottom: 0;
                    }
                    .kb-info {
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin: 20px 0;
                        font-size: 0.9rem;
                        color: #166534;
                    }
                    .kb-warning {
                        background: #fffbeb;
                        border: 1px solid #fde68a;
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin: 20px 0;
                        font-size: 0.9rem;
                        color: #92400e;
                    }
                    .kb-code {
                        background: #1e293b;
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin: 16px 0;
                        overflow-x: auto;
                    }
                    .kb-code code {
                        background: none;
                        color: #e2e8f0;
                        padding: 0;
                        font-size: 0.82rem;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                    .kb-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 16px 0;
                        font-size: 0.9rem;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                    }
                    .kb-table th {
                        background: #f8fafc;
                        padding: 12px 16px;
                        text-align: left;
                        font-weight: 700;
                        color: #1e3a5f;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    .kb-table td {
                        padding: 10px 16px;
                        border-bottom: 1px solid #f1f5f9;
                        color: #374151;
                    }
                    .kb-table tr:last-child td {
                        border-bottom: none;
                    }
                    .kb-nav-card:hover, .kb-related-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        border-color: #bfdbfe;
                    }
                    @media (max-width: 600px) {
                        .kb-article-content h2 { font-size: 1.2rem; }
                        .kb-table { font-size: 0.8rem; }
                        .kb-table th, .kb-table td { padding: 8px 10px; }
                    }
                `}</style>
            </div>
            <Footer />
        </>
    );
}
