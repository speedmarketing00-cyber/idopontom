import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqs = [
    {
        category: 'Általános',
        icon: '💡',
        questions: [
            {
                q: 'Mi az a FoglaljVelem?',
                a: 'A FoglaljVelem egy online időpontfoglaló rendszer, amellyel az ügyfeleid a weboldaladról, közösségi médiából vagy bármilyen linkről időpontot foglalhatnak nálad. Nem kell telefonálgatni — minden automatikus.',
            },
            {
                q: 'Kinek való a FoglaljVelem?',
                a: 'Fodrászoknak, kozmetikusoknak, edzőknek, tanácsadóknak, masszőröknek és minden olyan szolgáltatónak, aki időpontra dolgozik. Akár egyedül dolgozol, akár csapattal.',
            },
            {
                q: 'Mennyibe kerül?',
                a: 'Van egy teljesen ingyenes csomagunk, amivel elkezdhetsz dolgozni. Az Alap csomag 4 997 Ft/hó, a Profi csomag 19 997 Ft/hó. A fizetős csomagokat 14 napig ingyen kipróbálhatod!',
            },
            {
                q: 'Kell hozzá weboldal?',
                a: 'Nem! Kapsz egy saját foglalási oldalt (pl. foglaljvelem.hu/foglalas/a-te-szalonod), amit bárhol megoszthatsz — Instagramon, Facebookon, WhatsApp-on vagy akár SMS-ben.',
            },
            {
                q: 'Biztonságos az adataim tárolása?',
                a: 'Igen! Az adataidat titkosítva tároljuk, a rendszer megfelel a GDPR előírásoknak. Részletekért olvasd el az Adatvédelmi tájékoztatónkat.',
            },
        ],
    },
    {
        category: 'Regisztráció és fiók',
        icon: '👤',
        questions: [
            {
                q: 'Hogyan regisztrálhatok?',
                a: 'A foglaljvelem.hu oldalon a „Regisztráció" gombra kattintva. Választhatsz Google fiókkal (1 kattintás) vagy e-mail + jelszó kombinációval.',
            },
            {
                q: 'Ingyenesen kipróbálhatom?',
                a: 'Igen! Az Ingyenes csomag korlátlanul ingyenes. Az Alap és Profi csomagoknál pedig 14 napos ingyenes próbaidőszakot kapsz — az első 14 napban nem vonunk le semmit.',
            },
            {
                q: 'Hogyan törölhetem a fiókomat?',
                a: 'A Vezérlőpult → Beállítások oldalon, a „Veszélyes zóna" résznél találod a fiók törlése gombot. A törlés végleges és nem visszavonható.',
            },
        ],
    },
    {
        category: 'Foglalások',
        icon: '📅',
        questions: [
            {
                q: 'Hogyan foglalnak nálam az ügyfeleim?',
                a: 'Megosztod velük a foglalási linked (pl. Instagram bio-ban, Facebookon, weboldaladon), ők kiválasztják a szolgáltatást, időpontot, megadják az adataikat és kész! Te és az ügyfél is kaptok értesítést.',
            },
            {
                q: 'Le lehet mondani egy foglalást?',
                a: 'Igen, a Vezérlőpulton a Naptár vagy Foglalások oldalon bármelyik foglalást lemondhatod. Az ügyfél automatikus e-mailt kap a lemondásról (Alap/Profi csomag).',
            },
            {
                q: 'Mi történik, ha ketten egyszerre akarnak foglalni?',
                a: 'A rendszer automatikusan kezeli ezt — ha egy időpont már foglalt, nem jelenik meg a többi ügyfélnek. Dupla foglalás nem lehetséges.',
            },
            {
                q: 'Rögzíthetek kézi foglalást is?',
                a: 'Igen! Ha telefonon vagy személyesen egyeztetsz egy ügyféllel, a Naptárban kézzel is hozzáadhatod a foglalást, így az bekerül a rendszerbe.',
            },
        ],
    },
    {
        category: 'Fizetés és előfizetés',
        icon: '💳',
        questions: [
            {
                q: 'Milyen fizetési módokat fogadtok el?',
                a: 'Bankkártyás fizetés (Visa, Mastercard) a Stripe rendszerén keresztül. Biztonságos és automatikus havi levonás.',
            },
            {
                q: 'Lemondhatom az előfizetésemet bármikor?',
                a: 'Igen, bármikor lemondhatod a Beállítások → Előfizetés menüpont alatt. A lemondás után a számlázási időszak végéig használhatod a fizetős funkciókat.',
            },
            {
                q: 'Mi történik a próbaidőszak után?',
                a: 'Ha nem mondod le a próbaidőszak alatt, automatikusan elindul az előfizetés. Ha lemondod a 14 napon belül, semmit nem fizetsz.',
            },
            {
                q: 'Kapok számlát?',
                a: 'Igen, minden fizetésről automatikus számlát állítunk ki, amit a Beállítások → Előfizetés résznél tölthetsz le.',
            },
        ],
    },
    {
        category: 'Funkciók',
        icon: '✨',
        questions: [
            {
                q: 'Van Google Naptár szinkronizáció?',
                a: 'Igen! Az Alap és Profi csomagban összekapcsolhatod a Google Naptáradat. A foglalásaid automatikusan megjelennek, és a Google Naptárban lévő elfoglaltságaid blokkolva lesznek.',
            },
            {
                q: 'Kapnak az ügyfeleim emlékeztető e-mailt?',
                a: 'Igen, az Alap és Profi csomagban. A foglalás előtt automatikus emlékeztetőt küldünk az ügyfélnek.',
            },
            {
                q: 'Beágyazhatom a saját weboldalamba?',
                a: 'Igen! Kaphatsz egy iframe kódot vagy egyszerű gomb linket, amit beilleszthetsz bármilyen weboldalba (WordPress, Wix, saját oldal stb.).',
            },
            {
                q: 'Van csoportos foglalás lehetőség?',
                a: 'Igen! Beállíthatod, hogy egy szolgáltatásra egyszerre több résztvevő foglalhasson (pl. csoportos edzés, jóga óra).',
            },
            {
                q: 'Támogatja az Apple Calendar / Outlook naptárat?',
                a: 'Az Apple Calendar és Outlook szinkronizáció fejlesztés alatt áll és hamarosan elérhető lesz ICS naptár formátumban.',
            },
        ],
    },
];

// Schema.org FAQ structured data — SEO gold
const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap(cat =>
        cat.questions.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
            },
        }))
    ),
};

export const metadata = {
    title: 'Gyakran Ismételt Kérdések (GYIK) – FoglaljVelem',
    description: 'Válaszok a leggyakoribb kérdésekre a FoglaljVelem online időpontfoglaló rendszerről. Árak, funkciók, regisztráció, foglalások.',
    openGraph: {
        title: 'GYIK – FoglaljVelem',
        description: 'Minden, amit tudnod kell a FoglaljVelem időpontfoglaló rendszerről.',
        url: 'https://foglaljvelem.hu/gyik',
    },
    alternates: { canonical: 'https://foglaljvelem.hu/gyik' },
};

export default function GyikPage() {
    const totalQuestions = faqs.reduce((sum, cat) => sum + cat.questions.length, 0);

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#ffffff' }}>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)', padding: '64px 20px 48px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>❓</span>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                            Gyakran Ismételt Kérdések
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#c4b5fd', lineHeight: 1.6 }}>
                            {totalQuestions} válasz a leggyakoribb kérdésekre.
                        </p>
                    </div>
                </div>

                {/* Category quick-links */}
                <div style={{ maxWidth: 800, margin: '-28px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
                        background: 'white', borderRadius: 16, padding: '18px 24px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
                    }}>
                        {faqs.map(cat => (
                            <a key={cat.category} href={`#${cat.category.toLowerCase().replace(/\s+/g, '-')}`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                                background: '#f8fafc', color: '#374151', textDecoration: 'none',
                                border: '1px solid #e5e7eb', transition: 'all 0.2s',
                            }}>
                                {cat.icon} {cat.category}
                            </a>
                        ))}
                    </div>
                </div>

                {/* FAQ sections */}
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px 80px' }}>
                    {faqs.map(cat => (
                        <section key={cat.category} id={cat.category.toLowerCase().replace(/\s+/g, '-')} style={{ marginBottom: 48 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #f1f5f9' }}>
                                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a5f', margin: 0, fontFamily: 'var(--font-display)' }}>
                                    {cat.category}
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {cat.questions.map((faq, i) => (
                                    <details key={i} className="faq-item" style={{
                                        background: 'white', border: '1px solid #e5e7eb', borderRadius: 14,
                                        overflow: 'hidden', transition: 'all 0.2s',
                                    }}>
                                        <summary style={{
                                            padding: '18px 24px', cursor: 'pointer', fontWeight: 700,
                                            fontSize: '0.95rem', color: '#1e3a5f', lineHeight: 1.5,
                                            listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                            {faq.q}
                                            <span className="faq-arrow" style={{ fontSize: '0.8rem', color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>▼</span>
                                        </summary>
                                        <div style={{
                                            padding: '0 24px 20px', fontSize: '0.9rem', color: '#4b5563',
                                            lineHeight: 1.7, borderTop: '1px solid #f1f5f9',
                                            paddingTop: 16,
                                        }}>
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* CTA */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)',
                    padding: '56px 20px', textAlign: 'center',
                }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>💬</span>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                        Nem találtad meg a választ?
                    </h2>
                    <p style={{ color: '#c4b5fd', marginBottom: 24, fontSize: '1rem' }}>
                        Írj nekünk és gyorsan válaszolunk!
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
                    .faq-item:hover { border-color: #93c5fd; }
                    .faq-item[open] { border-color: #93c5fd; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                    .faq-item[open] .faq-arrow { transform: rotate(180deg); }
                    .faq-item summary::-webkit-details-marker { display: none; }
                    .faq-item summary::marker { display: none; content: ""; }
                `}</style>
            </div>
            <Footer />
        </>
    );
}
