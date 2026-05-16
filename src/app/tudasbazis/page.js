import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Tudásbázis – FoglaljVelem | Súgó és útmutatók',
    description: 'Részletes útmutatók a FoglaljVelem online időpontfoglaló rendszer használatához. Kezdő lépések, beállítások, funkciók és integrációk.',
    openGraph: {
        title: 'Tudásbázis – FoglaljVelem',
        description: 'Útmutatók és tippek az online időpontfoglaló rendszer használatához.',
        url: 'https://foglaljvelem.hu/tudasbazis',
    },
};

const categories = [
    {
        id: 'kezdo',
        icon: '🚀',
        title: 'Kezdő lépések',
        desc: 'Az első beállításoktól a foglalási link megosztásáig.',
        color: '#2563eb',
        bg: '#eff6ff',
        articles: [
            { slug: 'regisztracio-es-fiok-letrehozas', title: 'Regisztráció és fiók létrehozása', desc: 'Hogyan hozd létre a fiókodat email címmel vagy Google fiókkal.' },
            { slug: 'szolgaltatasok-hozzaadasa', title: 'Szolgáltatások hozzáadása', desc: 'Állítsd be a szolgáltatásaidat, árakat és időtartamokat.' },
            { slug: 'elerhetoseg-beallitasa', title: 'Elérhetőség beállítása', desc: 'Munkaidő és szünetnapok megadása, mikor fogadj foglalásokat.' },
            { slug: 'foglalasi-oldal-megosztasa', title: 'Foglalási oldal megosztása', desc: 'Hogyan oszd meg a foglalási linked ügyfeleidnek.' },
            { slug: 'elso-foglalas-kezelese', title: 'Első foglalás kezelése', desc: 'Amikor megérkezik az első foglalás — értesítések és kezelés.' },
        ],
    },
    {
        id: 'beallitasok',
        icon: '⚙️',
        title: 'Beállítások',
        desc: 'Profilod, megjelenésed és értesítéseid testreszabása.',
        color: '#7c3aed',
        bg: '#f5f3ff',
        articles: [
            { slug: 'profil-es-vallalkozas-beallitasa', title: 'Profil és vállalkozás beállítása', desc: 'Név, leírás, cím, logó és egyéb vállalkozási adatok megadása.' },
            { slug: 'email-ertesitesek-beallitasa', title: 'Email értesítések beállítása', desc: 'Automatikus visszaigazolás, emlékeztető és lemondási emailek.' },
            { slug: 'meta-pixel-beallitasa', title: 'Meta Pixel beállítása', desc: 'Facebook/Instagram hirdetések mérése a foglalási oldalon.' },
            { slug: 'koszonjuk-oldal-testreszabasa', title: 'Köszönjük oldal testreszabása', desc: 'Foglalás utáni köszönő oldal szövegének és megjelenésének szerkesztése.' },
            { slug: 'jelszo-valtoztatas', title: 'Jelszó változtatás', desc: 'Hogyan változtasd meg a jelszavad biztonságosan.' },
        ],
    },
    {
        id: 'funkciok',
        icon: '✨',
        title: 'Funkciók',
        desc: 'Haladó funkciók a hatékonyabb munkához.',
        color: '#059669',
        bg: '#f0fdf4',
        articles: [
            { slug: 'naptar-hasznalata', title: 'Naptár használata', desc: 'Heti és havi nézet, foglalások áttekintése egy helyen.' },
            { slug: 'manualis-foglalas-rogzitese', title: 'Manuális foglalás rögzítése', desc: 'Telefonos vagy személyes foglalások kézi rögzítése a rendszerben.' },
            { slug: 'csoportos-foglalasok', title: 'Csoportos foglalások', desc: 'Több résztvevős szolgáltatások kezelése (pl. csoportos edzés).' },
            { slug: 'ertekelesi-rendszer', title: 'Értékelési rendszer', desc: 'Ügyfélvélemények gyűjtése és megjelenítése a foglalási oldalon.' },
            { slug: 'statisztikak-es-riportok', title: 'Statisztikák és riportok', desc: 'Foglalások, bevételek és népszerű szolgáltatások elemzése.' },
        ],
    },
    {
        id: 'csapat',
        icon: '👥',
        title: 'Csapatkezelés',
        desc: 'Több munkatárs, közös naptár, jogosultságok.',
        color: '#d97706',
        bg: '#fffbeb',
        articles: [
            { slug: 'csapattag-hozzaadasa', title: 'Csapattag hozzáadása', desc: 'Munkatársak meghívása és jogosultságaik beállítása.' },
            { slug: 'csapat-naptar-kezelese', title: 'Csapat naptár kezelése', desc: 'Közös naptárnézet és foglalások elosztása munkatársak között.' },
            { slug: 'jogosultsagok-beallitasa', title: 'Jogosultságok beállítása', desc: 'Ki mit láthat és szerkeszthet a rendszerben.' },
        ],
    },
    {
        id: 'integraciok',
        icon: '🔗',
        title: 'Integrációk',
        desc: 'Külső rendszerek összekapcsolása.',
        color: '#dc2626',
        bg: '#fef2f2',
        articles: [
            { slug: 'beagyazas-weboldalba', title: 'Beágyazás weboldalba', desc: 'Foglalási rendszer beágyazása iframe-mel vagy widgettel a saját weboldaladba.' },
            { slug: 'google-naptar-szinkron', title: 'Google Naptár szinkronizáció', desc: 'Foglalásaid automatikus megjelenítése a Google Naptárban.' },
            { slug: 'meta-pixel-es-konverziomeres', title: 'Meta Pixel és konverziómérés', desc: 'Facebook/Instagram hirdetések pontos mérése a Conversions API-val.' },
        ],
    },
    {
        id: 'fizetes',
        icon: '💳',
        title: 'Fizetés és csomagok',
        desc: 'Előfizetés, csomagváltás, számlázás.',
        color: '#0891b2',
        bg: '#ecfeff',
        articles: [
            { slug: 'csomagok-es-arak', title: 'Csomagok és árak', desc: 'Az Ingyenes, Alap és Profi csomagok összehasonlítása.' },
            { slug: 'elofizetes-es-csomagvaltas', title: 'Előfizetés és csomagváltás', desc: 'Hogyan frissíts magasabb csomagra vagy mondj le.' },
            { slug: 'szamlazas', title: 'Számlázás', desc: 'Számlák kezelése és a számlázási beállítások.' },
        ],
    },
];

// Structured data for SEO
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tudásbázis – FoglaljVelem',
    description: 'Részletes útmutatók a FoglaljVelem online időpontfoglaló rendszer használatához.',
    url: 'https://foglaljvelem.hu/tudasbazis',
    publisher: { '@type': 'Organization', name: 'FoglaljVelem', url: 'https://foglaljvelem.hu' },
};

export default function TudasbazisPage() {
    const totalArticles = categories.reduce((sum, cat) => sum + cat.articles.length, 0);

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#ffffff' }}>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Hero */}
                <div style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', padding: '110px 20px 48px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>📚</span>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                            Tudásbázis
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: 0, lineHeight: 1.6 }}>
                            Részletes útmutatók és tippek a FoglaljVelem használatához.<br/>
                            <strong style={{ color: '#1e3a5f' }}>{totalArticles} cikk</strong> {categories.length} kategóriában.
                        </p>
                    </div>
                </div>

                {/* Category quick-links */}
                <div style={{ maxWidth: 960, margin: '-28px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
                        background: 'white', borderRadius: 16, padding: '18px 24px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
                    }}>
                        {categories.map(cat => (
                            <a key={cat.id} href={`#${cat.id}`} className="kb-cat-link" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                                background: cat.bg, color: cat.color, textDecoration: 'none',
                                border: `1px solid ${cat.bg}`, transition: 'all 0.2s',
                            }}>
                                {cat.icon} {cat.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 80px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
                        {categories.map(cat => (
                            <section key={cat.id} id={cat.id}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
                                    paddingBottom: 16, borderBottom: '2px solid #f1f5f9',
                                }}>
                                    <span style={{
                                        fontSize: '1.6rem', width: 52, height: 52, borderRadius: 14,
                                        background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    }}>
                                        {cat.icon}
                                    </span>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0, fontFamily: 'var(--font-display)' }}>
                                            {cat.title}
                                        </h2>
                                        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>{cat.desc}</p>
                                    </div>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>
                                        {cat.articles.length} cikk
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {cat.articles.map(article => (
                                        <Link
                                            key={article.slug}
                                            href={`/tudasbazis/${article.slug}`}
                                            className="kb-card"
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <article style={{
                                                background: 'white', borderRadius: 14, padding: '22px 24px',
                                                border: '1px solid #e5e7eb', transition: 'all 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                                display: 'flex', flexDirection: 'column', height: '100%',
                                            }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginBottom: 8, lineHeight: 1.4 }}>
                                                    {article.title}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, margin: 0, flex: 1 }}>
                                                    {article.desc}
                                                </p>
                                                <span style={{ display: 'inline-block', marginTop: 14, fontSize: '0.8rem', color: cat.color, fontWeight: 600 }}>
                                                    Elolvasom →
                                                </span>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                    padding: '56px 20px', textAlign: 'center',
                }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>🤔</span>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                        Nem találtad meg a választ?
                    </h2>
                    <p style={{ color: '#bfdbfe', marginBottom: 24, fontSize: '1rem' }}>
                        Írj nekünk és segítünk mindent beállítani!
                    </p>
                    <a href="mailto:speedmarketing00@gmail.com" style={{
                        display: 'inline-block', background: 'white',
                        color: '#1e3a5f', padding: '14px 32px', borderRadius: 12, fontWeight: 700,
                        textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}>
                        📧 speedmarketing00@gmail.com
                    </a>
                </div>

                <style>{`
                    .kb-card article:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 28px rgba(0,0,0,0.1);
                        border-color: #93c5fd;
                    }
                    .kb-cat-link:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    }
                `}</style>
            </div>
            <Footer />
        </>
    );
}
