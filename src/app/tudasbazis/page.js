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
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 40%)' }}>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Header */}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 0' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: 0, marginBottom: 8, fontFamily: 'var(--font-display)', color: '#1e3a5f' }}>
                        Tudásbázis 📚
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: 12, maxWidth: 600 }}>
                        Részletes útmutatók és tippek a FoglaljVelem használatához. {totalArticles} cikk {categories.length} kategóriában.
                    </p>

                    {/* Quick search hint */}
                    <div style={{
                        background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 12,
                        padding: '14px 20px', marginBottom: 48, fontSize: '0.9rem', color: '#1e40af',
                    }}>
                        💡 <strong>Tipp:</strong> Ha nem találsz választ a kérdésedre, írj nekünk: <a href="mailto:speedmarketing00@gmail.com" style={{ color: '#2563eb', fontWeight: 600 }}>speedmarketing00@gmail.com</a>
                    </div>
                </div>

                {/* Categories */}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 80px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                        {categories.map(cat => (
                            <section key={cat.id} id={cat.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <span style={{
                                        fontSize: '1.5rem', width: 48, height: 48, borderRadius: 12,
                                        background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {cat.icon}
                                    </span>
                                    <div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a5f', margin: 0, fontFamily: 'var(--font-display)' }}>
                                            {cat.title}
                                        </h2>
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{cat.desc}</p>
                                    </div>
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
                                                background: 'white', borderRadius: 14, padding: '20px 24px',
                                                border: '1px solid #e5e7eb', transition: 'all 0.2s',
                                            }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginBottom: 6, lineHeight: 1.4 }}>
                                                    {article.title}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
                                                    {article.desc}
                                                </p>
                                                <span style={{ display: 'inline-block', marginTop: 10, fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
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
                <div style={{ background: '#1e3a5f', padding: '48px 20px', textAlign: 'center' }}>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                        Nem találtad meg a választ?
                    </h2>
                    <p style={{ color: '#93c5fd', marginBottom: 24, fontSize: '1rem' }}>
                        Írj nekünk és segítünk mindent beállítani!
                    </p>
                    <a href="mailto:speedmarketing00@gmail.com" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                        color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 600,
                        textDecoration: 'none', fontSize: '1rem',
                    }}>
                        📧 speedmarketing00@gmail.com
                    </a>
                </div>

                <style>{`
                    .kb-card article:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        border-color: #bfdbfe;
                    }
                `}</style>
            </div>
            <Footer />
        </>
    );
}
