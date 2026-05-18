'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import QRCode from 'react-qr-code';
import s from '../dashboard.module.css';

const TEMPLATES = [
    {
        id: 'modern',
        name: 'Modern',
        desc: 'Letisztult, világos design',
        preview: '🎨',
    },
    {
        id: 'bold',
        name: 'Merész',
        desc: 'Színes, feltűnő megjelenés',
        preview: '🔥',
    },
    {
        id: 'elegant',
        name: 'Elegáns',
        desc: 'Sötét, prémium stílus',
        preview: '✨',
    },
];

const PRESET_COLORS = [
    '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2',
    '#db2777', '#4f46e5', '#0d9488', '#ea580c', '#1e3a5f', '#000000',
];

function CardPreview({ template, data, cardRef }) {
    const { name, businessName, phone, email, website, logoUrl, color, bookingUrl } = data;

    if (template === 'modern') {
        return (
            <div ref={cardRef} style={{
                width: 600, height: 340, borderRadius: 20, overflow: 'hidden',
                background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif',
                display: 'flex', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            }}>
                {/* Left color accent */}
                <div style={{ width: 8, background: color, flexShrink: 0 }} />
                {/* Content */}
                <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {logoUrl && (
                        <img src={logoUrl} alt="" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10, marginBottom: 12 }} crossOrigin="anonymous" />
                    )}
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4, lineHeight: 1.2 }}>
                        {name || 'Neved'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color, marginBottom: 16, letterSpacing: 0.5 }}>
                        {businessName || 'Vállalkozás neve'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {phone && <div style={{ fontSize: 12, color: '#64748b' }}>📞 {phone}</div>}
                        {email && <div style={{ fontSize: 12, color: '#64748b' }}>📧 {email}</div>}
                        {website && <div style={{ fontSize: 12, color: '#64748b' }}>🌐 {website}</div>}
                    </div>
                </div>
                {/* QR code right side */}
                <div style={{
                    width: 200, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#f8fafc', borderLeft: '1px solid #e2e8f0',
                    padding: 24,
                }}>
                    <div style={{ background: 'white', padding: 12, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <QRCode value={bookingUrl || 'https://foglaljvelem.hu'} size={120} fgColor={color} />
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 10, textAlign: 'center', fontWeight: 600 }}>
                        Foglalj online!
                    </div>
                </div>
            </div>
        );
    }

    if (template === 'bold') {
        return (
            <div ref={cardRef} style={{
                width: 600, height: 340, borderRadius: 20, overflow: 'hidden',
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                display: 'flex', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                {/* Content */}
                <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
                    {logoUrl && (
                        <img src={logoUrl} alt="" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12, marginBottom: 12, border: '2px solid rgba(255,255,255,0.3)' }} crossOrigin="anonymous" />
                    )}
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4, lineHeight: 1.2 }}>
                        {name || 'Neved'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 20, letterSpacing: 0.5 }}>
                        {businessName || 'Vállalkozás neve'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {phone && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>📞 {phone}</div>}
                        {email && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>📧 {email}</div>}
                        {website && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>🌐 {website}</div>}
                    </div>
                </div>
                {/* QR code */}
                <div style={{
                    width: 200, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 24, zIndex: 1,
                }}>
                    <div style={{ background: 'white', padding: 14, borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                        <QRCode value={bookingUrl || 'https://foglaljvelem.hu'} size={120} fgColor={color} />
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 10, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
                        FOGLALJ ONLINE
                    </div>
                </div>
            </div>
        );
    }

    // Elegant (dark)
    return (
        <div ref={cardRef} style={{
            width: 600, height: 340, borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>
            {/* Gold accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
            {/* Content */}
            <div style={{ flex: 1, padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
                {logoUrl && (
                    <img src={logoUrl} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, marginBottom: 14 }} crossOrigin="anonymous" />
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase' }}>
                    {businessName || 'Vállalkozás neve'}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', marginBottom: 18, lineHeight: 1.2 }}>
                    {name || 'Neved'}
                </div>
                <div style={{ width: 40, height: 2, background: color, borderRadius: 2, marginBottom: 16 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {phone && <div style={{ fontSize: 12, color: '#94a3b8' }}>📞 {phone}</div>}
                    {email && <div style={{ fontSize: 12, color: '#94a3b8' }}>📧 {email}</div>}
                    {website && <div style={{ fontSize: 12, color: '#94a3b8' }}>🌐 {website}</div>}
                </div>
            </div>
            {/* QR code */}
            <div style={{
                width: 200, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 24, borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 14 }}>
                    <QRCode value={bookingUrl || 'https://foglaljvelem.hu'} size={120} fgColor="#1a1a2e" />
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 10, textAlign: 'center', fontWeight: 600, letterSpacing: 1 }}>
                    Foglalj online
                </div>
            </div>
        </div>
    );
}

export default function BusinessCardPage() {
    const { profile } = useAuth();
    const cardRef = useRef(null);
    const fileInputRef = useRef(null);

    const [template, setTemplate] = useState('modern');
    const [color, setColor] = useState('#2563eb');
    const [customColor, setCustomColor] = useState('#2563eb');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const [cardData, setCardData] = useState({
        name: '',
        businessName: '',
        phone: '',
        email: '',
        website: '',
    });

    // Pre-fill from profile
    useEffect(() => {
        if (profile) {
            setCardData({
                name: profile.name || '',
                businessName: profile.business_name || '',
                phone: profile.phone || '',
                email: profile.email || '',
                website: profile.slug ? `foglaljvelem.hu/${profile.slug}` : '',
            });
            if (profile.avatar_url) setLogoUrl(profile.avatar_url);
        }
    }, [profile?.id]);

    const bookingUrl = profile?.slug ? `https://foglaljvelem.hu/book/${profile.slug}` : 'https://foglaljvelem.hu';
    const isPro = profile?.subscription_tier === 'pro';

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('A fájl max 2MB lehet!'); return; }
        setLogoUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setLogoUrl(ev.target.result);
            setLogoUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `nevjegykartya-${template}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download error:', err);
            alert('Hiba a letoltesnel. Kerjuk probald ujra!');
        } finally {
            setDownloading(false);
        }
    };

    if (!isPro) {
        return (
            <div className={s.pageContent}>
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🪪</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12, color: 'var(--gray-800)' }}>
                        Névjegykártya generátor
                    </h1>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        Készíts személyre szabott névjegykártyát QR kóddal a foglalási linkedhez! Ez a funkció a Profi csomagban érhető el.
                    </p>
                    <a href="/dashboard/settings" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        🏢 Profi csomagra váltás →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={s.pageContent}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6, color: 'var(--gray-800)' }}>
                    🪪 Névjegykártya generátor
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    Készíts személyre szabott névjegykártyát QR kóddal — ügyfeleid egyből foglalhatnak!
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
                {/* LEFT — Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Template selection */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>📐 Sablon választás</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                                    padding: '14px 10px', borderRadius: 12, border: template === t.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                    background: template === t.id ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>{t.preview}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: template === t.id ? 'var(--primary-600)' : 'var(--gray-700)' }}>{t.name}</span>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 2 }}>{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>🎨 Szín</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {PRESET_COLORS.map(c => (
                                <button key={c} onClick={() => { setColor(c); setCustomColor(c); }} style={{
                                    width: 32, height: 32, borderRadius: 10, background: c, border: color === c ? '3px solid var(--gray-800)' : '2px solid var(--gray-200)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); }}
                                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Egyedi szín</span>
                        </div>
                    </div>

                    {/* Logo upload */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>🖼️ Logó</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--gray-100)' }} />
                            ) : (
                                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)', fontSize: '1.4rem' }}>📷</div>
                            )}
                            <div>
                                <button onClick={() => fileInputRef.current?.click()} style={{
                                    padding: '8px 16px', borderRadius: 10, border: '1px solid var(--gray-200)',
                                    background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)',
                                }}>
                                    {logoUploading ? 'Feltöltés...' : logoUrl ? 'Csere' : 'Feltöltés'}
                                </button>
                                {logoUrl && (
                                    <button onClick={() => setLogoUrl('')} style={{
                                        padding: '8px 12px', borderRadius: 10, border: 'none',
                                        background: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626',
                                    }}>Törlés</button>
                                )}
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </div>

                    {/* Card data */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>✏️ Adatok</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { key: 'name', label: 'Név', placeholder: 'Kiss Anna' },
                                { key: 'businessName', label: 'Vállalkozás', placeholder: 'Anna Szépségszalon' },
                                { key: 'phone', label: 'Telefon', placeholder: '+36 30 123 4567' },
                                { key: 'email', label: 'Email', placeholder: 'info@example.com' },
                                { key: 'website', label: 'Weboldal', placeholder: 'foglaljvelem.hu/anna' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                                    <input
                                        type="text"
                                        value={cardData[field.key]}
                                        onChange={e => setCardData(d => ({ ...d, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--gray-200)',
                                            fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary-400)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — Preview + Download */}
                <div style={{ position: 'sticky', top: 20 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem', color: 'var(--gray-700)' }}>👁️ Előnézet</h3>
                        <div style={{ transform: 'scale(0.58)', transformOrigin: 'top left', height: 200, marginBottom: 16 }}>
                            <CardPreview
                                template={template}
                                data={{ ...cardData, logoUrl, color, bookingUrl }}
                                cardRef={cardRef}
                            />
                        </div>
                    </div>

                    <button onClick={handleDownload} disabled={downloading} style={{
                        width: '100%', marginTop: 16, padding: '16px 24px',
                        borderRadius: 14, border: 'none', fontWeight: 700, fontSize: '1rem',
                        background: downloading ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--primary-500), var(--accent-500, #7c3aed))',
                        color: 'white', cursor: downloading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s',
                    }}>
                        {downloading ? '⏳ Generálás...' : '📥 Letöltés PNG-ben'}
                    </button>

                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                        A QR kód a foglalási oldaladra mutat: <strong style={{ color: 'var(--gray-600)' }}>foglaljvelem.hu/book/{profile?.slug || '...'}</strong>
                    </p>
                </div>
            </div>

            {/* Mobile layout override */}
            <style>{`
                @media (max-width: 800px) {
                    .business-card-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
