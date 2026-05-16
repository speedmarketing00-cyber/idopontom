import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Kapcsolat – FoglaljVelem | Írj nekünk',
    description: 'Lépj kapcsolatba a FoglaljVelem csapatával! Kérdésed van az időpontfoglaló rendszerről? Szívesen segítünk.',
    openGraph: {
        title: 'Kapcsolat – FoglaljVelem',
        description: 'Írj nekünk bármilyen kérdéssel az online időpontfoglaló rendszerünkkel kapcsolatban.',
        url: 'https://foglaljvelem.hu/kapcsolat',
    },
    alternates: { canonical: 'https://foglaljvelem.hu/kapcsolat' },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FoglaljVelem',
    url: 'https://foglaljvelem.hu',
    email: 'speedmarketing00@gmail.com',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Csalogány utca 6.',
        addressLocality: 'Gödöllő',
        postalCode: '2100',
        addressCountry: 'HU',
    },
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'speedmarketing00@gmail.com',
        contactType: 'customer support',
        availableLanguage: 'Hungarian',
    },
};

const contactMethods = [
    {
        icon: '📧',
        title: 'E-mail',
        desc: 'Írj nekünk bármilyen kérdéssel és általában 24 órán belül válaszolunk.',
        value: 'speedmarketing00@gmail.com',
        href: 'mailto:speedmarketing00@gmail.com',
        action: 'E-mail küldése →',
        color: '#2563eb',
        bg: '#eff6ff',
    },
    {
        icon: '💬',
        title: 'Visszajelzés az appból',
        desc: 'Bejelentkezés után a Beállítások → Visszajelzés menüpont alatt közvetlenül írhatsz nekünk.',
        value: 'Vezérlőpult → Beállítások',
        href: '/dashboard/settings',
        action: 'Vezérlőpult megnyitása →',
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
];

const quickLinks = [
    { icon: '📚', title: 'Tudásbázis', desc: 'Részletes útmutatók a rendszer használatához.', href: '/tudasbazis' },
    { icon: '❓', title: 'GYIK', desc: 'Válaszok a leggyakoribb kérdésekre.', href: '/gyik' },
    { icon: '📝', title: 'Blog', desc: 'Tippek és trükkök szolgáltatóknak.', href: '/blog' },
];

export default function KapcsolatPage() {
    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', background: '#ffffff' }}>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #059669 100%)', padding: '64px 20px 48px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>👋</span>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                            Kapcsolat
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#a7f3d0', lineHeight: 1.6 }}>
                            Bármilyen kérdésed van, szívesen segítünk!
                        </p>
                    </div>
                </div>

                {/* Contact methods */}
                <div style={{ maxWidth: 700, margin: '-28px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {contactMethods.map(method => (
                            <div key={method.title} style={{
                                background: 'white', borderRadius: 16, padding: '32px 28px',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
                                textAlign: 'center',
                            }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 56, height: 56, borderRadius: 14, background: method.bg,
                                    fontSize: '1.5rem', marginBottom: 16,
                                }}>
                                    {method.icon}
                                </span>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                                    {method.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
                                    {method.desc}
                                </p>
                                <a href={method.href} style={{
                                    display: 'inline-block', background: method.bg, color: method.color,
                                    padding: '10px 24px', borderRadius: 10, fontWeight: 700,
                                    textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.2s',
                                }}>
                                    {method.action}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Company info */}
                <div style={{ maxWidth: 700, margin: '48px auto 0', padding: '0 20px' }}>
                    <div style={{
                        background: '#f8fafc', borderRadius: 16, padding: '32px',
                        border: '1px solid #e5e7eb',
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 20, fontFamily: 'var(--font-display)' }}>
                            🏢 Cégadatok
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: '0.9rem', color: '#4b5563' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Cégnév</div>
                                Euro Simon Family Kft.
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Székhely</div>
                                2100 Gödöllő, Csalogány utca 6.
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Adószám</div>
                                28734886-1-13
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>E-mail</div>
                                <a href="mailto:speedmarketing00@gmail.com" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                    speedmarketing00@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div style={{ maxWidth: 700, margin: '48px auto 0', padding: '0 20px 80px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 20, fontFamily: 'var(--font-display)' }}>
                        🔗 Hasznos linkek
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                        {quickLinks.map(link => (
                            <Link key={link.href} href={link.href} className="contact-link" style={{
                                textDecoration: 'none', color: 'inherit', background: 'white',
                                border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 8 }}>{link.icon}</span>
                                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '0.95rem', marginBottom: 4 }}>{link.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{link.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                <style>{`
                    .contact-link:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                        border-color: #93c5fd;
                    }
                `}</style>
            </div>
            <Footer />
        </>
    );
}
