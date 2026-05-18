'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import s from '../dashboard.module.css';

const TEMPLATES = [
    { id: 'classic', name: 'Klasszikus', desc: 'Vízszintes, letisztult elrendezés', preview: '📋' },
    { id: 'bold', name: 'Színes', desc: 'Merész, feltűnő, középre rendezett', preview: '🔥' },
    { id: 'elegant', name: 'Elegáns', desc: 'Sötét, prémium, függőleges hangsúly', preview: '✨' },
];

const FONTS = [
    { id: 'modern', name: 'Modern', family: 'system-ui, -apple-system, sans-serif' },
    { id: 'classic', name: 'Klasszikus', family: 'Georgia, "Times New Roman", serif' },
    { id: 'clean', name: 'Egyszerű', family: 'Arial, Helvetica, sans-serif' },
    { id: 'rounded', name: 'Kerekített', family: '"Trebuchet MS", "Lucida Grande", sans-serif' },
];

const PRESET_COLORS = [
    '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2',
    '#db2777', '#4f46e5', '#0d9488', '#ea580c', '#1e3a5f', '#000000',
];

// ---- Canvas Drawing Engine ----

async function generateQRDataUrl(text, size, fgColor) {
    const QRCode = (await import('qrcode')).default;
    return QRCode.toDataURL(text, {
        width: size,
        margin: 0,
        color: { dark: fgColor || '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = src;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

async function drawCard(canvas, { template, data, fonts }) {
    const W = 1200;
    const H = 680;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const { name, businessName, phone, email, website, logoUrl, color, bookingUrl, fontFamily, nameSize, businessSize } = {
        ...data,
        fontFamily: fonts.family,
        nameSize: data.nameSize || 48,
        businessSize: data.businessSize || 28,
    };

    // Generate QR
    let qrImg = null;
    try {
        const qrUrl = await generateQRDataUrl(bookingUrl || 'https://foglaljvelem.hu', 400, template === 'bold' ? color : '#1a1a2e');
        qrImg = await loadImage(qrUrl);
    } catch (e) { console.warn('QR error:', e); }

    // Load logo
    let logoImg = null;
    if (logoUrl) {
        try { logoImg = await loadImage(logoUrl); } catch (e) { console.warn('Logo error:', e); }
    }

    // ===== TEMPLATE: CLASSIC =====
    if (template === 'classic') {
        // White background with rounded corners
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, 0, 0, W, H, 32);
        ctx.fill();

        // Subtle border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        roundRect(ctx, 1, 1, W - 2, H - 2, 32);
        ctx.stroke();

        // Left accent bar
        ctx.fillStyle = color;
        roundRect(ctx, 0, 0, 12, H, 32);
        ctx.fill();
        ctx.fillRect(6, 0, 8, H);

        // Logo
        let contentY = 80;
        if (logoImg) {
            ctx.save();
            roundRect(ctx, 60, contentY, 90, 90, 18);
            ctx.clip();
            ctx.drawImage(logoImg, 60, contentY, 90, 90);
            ctx.restore();
            contentY += 110;
        }

        // Name
        ctx.fillStyle = '#1e293b';
        ctx.font = `800 ${nameSize * 2}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillText(name || 'Neved', 60, contentY);
        contentY += nameSize * 2 + 12;

        // Business name
        ctx.fillStyle = color;
        ctx.font = `700 ${businessSize * 2}px ${fontFamily}`;
        ctx.fillText(businessName || 'Vállalkozás neve', 60, contentY);
        contentY += businessSize * 2 + 30;

        // Contact details
        ctx.fillStyle = '#64748b';
        ctx.font = `500 26px ${fontFamily}`;
        const details = [];
        if (phone) details.push({ icon: '☎', text: phone });
        if (email) details.push({ icon: '✉', text: email });
        if (website) details.push({ icon: '⬤', text: website });

        details.forEach((d, i) => {
            ctx.fillStyle = color;
            ctx.font = `500 22px ${fontFamily}`;
            ctx.fillText(d.icon, 64, contentY + i * 38);
            ctx.fillStyle = '#64748b';
            ctx.font = `500 26px ${fontFamily}`;
            ctx.fillText(d.text, 100, contentY + i * 38);
        });

        // Divider line
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W - 320, 60);
        ctx.lineTo(W - 320, H - 60);
        ctx.stroke();

        // QR code on the right
        if (qrImg) {
            const qrSize = 240;
            const qrX = W - 280;
            const qrY = (H - qrSize - 50) / 2;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.08)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
            ctx.fill();
            ctx.restore();
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // "Foglalj online" text
            ctx.fillStyle = '#94a3b8';
            ctx.font = `700 22px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.fillText('Foglalj online!', qrX + qrSize / 2, qrY + qrSize + 40);
            ctx.textAlign = 'left';
        }
    }

    // ===== TEMPLATE: BOLD =====
    else if (template === 'bold') {
        // Full color background
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, color);
        grad.addColorStop(1, adjustColor(color, -30));
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, W, H, 32);
        ctx.fill();

        // Decorative circles
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(W - 80, -40, 200, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-60, H + 20, 180, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W / 2, H + 80, 300, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Logo (centered top)
        let contentY = 60;
        if (logoImg) {
            const logoSize = 80;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 16;
            roundRect(ctx, W / 2 - logoSize / 2, contentY, logoSize, logoSize, 18);
            ctx.clip();
            ctx.drawImage(logoImg, W / 2 - logoSize / 2, contentY, logoSize, logoSize);
            ctx.restore();
            contentY += logoSize + 20;
        }

        // Business name (top, smaller)
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `700 ${businessSize * 1.6}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(businessName || 'Vállalkozás neve', W / 2, contentY);
        contentY += businessSize * 1.6 + 12;

        // Name (large, centered)
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${nameSize * 2.4}px ${fontFamily}`;
        ctx.fillText(name || 'Neved', W / 2, contentY);
        contentY += nameSize * 2.4 + 24;

        // Decorative line
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        roundRect(ctx, W / 2 - 50, contentY, 100, 4, 2);
        ctx.fill();
        contentY += 28;

        // Contact details (row)
        ctx.font = `500 24px ${fontFamily}`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        const contactParts = [phone, email, website].filter(Boolean);
        ctx.fillText(contactParts.join('  |  '), W / 2, contentY);

        // QR code (bottom right)
        if (qrImg) {
            const qrSize = 160;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, W - qrSize - 60, H - qrSize - 60, qrSize + 32, qrSize + 32, 18);
            ctx.fill();
            ctx.restore();
            ctx.drawImage(qrImg, W - qrSize - 44, H - qrSize - 44, qrSize, qrSize);
        }

        // "FoglaljVelem" small watermark
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `600 18px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText('foglaljvelem.hu', 48, H - 40);

        ctx.textAlign = 'left';
    }

    // ===== TEMPLATE: ELEGANT =====
    else {
        // Dark background
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, W, H, 32);
        ctx.fill();

        // Top accent line
        ctx.fillStyle = color;
        roundRect(ctx, 0, 0, W, 6, 32);
        ctx.fill();
        ctx.fillRect(0, 3, W, 4);

        // Left content area
        let contentY = 60;

        // Logo
        if (logoImg) {
            ctx.save();
            roundRect(ctx, 64, contentY, 72, 72, 14);
            ctx.clip();
            ctx.drawImage(logoImg, 64, contentY, 72, 72);
            ctx.restore();
            contentY += 92;
        }

        // Business name (small, caps, spaced)
        ctx.fillStyle = color;
        ctx.font = `700 ${businessSize * 1.4}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '4px';
        ctx.fillText((businessName || 'Vállalkozás neve').toUpperCase(), 64, contentY);
        contentY += businessSize * 1.4 + 16;

        // Name (large)
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `800 ${nameSize * 2.2}px ${fontFamily}`;
        ctx.fillText(name || 'Neved', 64, contentY);
        contentY += nameSize * 2.2 + 20;

        // Accent line divider
        ctx.fillStyle = color;
        roundRect(ctx, 64, contentY, 80, 4, 2);
        ctx.fill();
        contentY += 28;

        // Contact details (vertical)
        ctx.font = `400 26px ${fontFamily}`;
        const details = [];
        if (phone) details.push(phone);
        if (email) details.push(email);
        if (website) details.push(website);

        details.forEach((text, i) => {
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(text, 64, contentY + i * 38);
        });

        // Right side - QR with elegant frame
        if (qrImg) {
            const qrSize = 240;
            const qrX = W - qrSize - 100;
            const qrY = (H - qrSize - 60) / 2;

            // Subtle frame
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 76, 20);
            ctx.stroke();

            // White QR background
            ctx.fillStyle = '#f8fafc';
            roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
            ctx.fill();

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = `600 20px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.fillText('Foglalj online', qrX + qrSize / 2, qrY + qrSize + 36);
            ctx.textAlign = 'left';
        }
    }
}

// Color utility
function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ---- Component ----

export default function BusinessCardPage() {
    const { profile } = useAuth();
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const [template, setTemplate] = useState('classic');
    const [color, setColor] = useState('#2563eb');
    const [customColor, setCustomColor] = useState('#2563eb');
    const [fontId, setFontId] = useState('modern');
    const [nameSize, setNameSize] = useState(48);
    const [businessSize, setBusinessSize] = useState(28);
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
    const currentFont = FONTS.find(f => f.id === fontId) || FONTS[0];

    // Redraw canvas on any change
    const redrawCanvas = useCallback(async () => {
        if (!canvasRef.current) return;
        try {
            await drawCard(canvasRef.current, {
                template,
                data: { ...cardData, logoUrl, color, bookingUrl, nameSize, businessSize },
                fonts: { family: currentFont.family },
            });
        } catch (err) {
            console.error('Draw error:', err);
        }
    }, [template, cardData, logoUrl, color, bookingUrl, nameSize, businessSize, currentFont]);

    useEffect(() => {
        const timer = setTimeout(redrawCanvas, 100);
        return () => clearTimeout(timer);
    }, [redrawCanvas]);

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('A fajl max 2MB lehet!'); return; }
        setLogoUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setLogoUrl(ev.target.result);
            setLogoUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Create a fresh high-res canvas for download
            const dlCanvas = document.createElement('canvas');
            await drawCard(dlCanvas, {
                template,
                data: { ...cardData, logoUrl, color, bookingUrl, nameSize, businessSize },
                fonts: { family: currentFont.family },
            });
            const link = document.createElement('a');
            link.download = `nevjegykartya-${template}.png`;
            link.href = dlCanvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (err) {
            console.error('Download error:', err);
            alert('Hiba a letoltesnel. Probald ujra!');
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

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}>
                {/* LEFT — Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Template selection */}
                    <Card title="📐 Sablon">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                                    padding: '12px 8px', borderRadius: 12,
                                    border: template === t.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                    background: template === t.id ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 4 }}>{t.preview}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: template === t.id ? 'var(--primary-600)' : 'var(--gray-700)' }}>{t.name}</span>
                                    <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--gray-400)', marginTop: 2 }}>{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Font style */}
                    <Card title="🔤 Betűstílus">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {FONTS.map(f => (
                                <button key={f.id} onClick={() => setFontId(f.id)} style={{
                                    padding: '10px 8px', borderRadius: 10,
                                    border: fontId === f.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                    background: fontId === f.id ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                                }}>
                                    <span style={{ fontFamily: f.family, fontWeight: 700, fontSize: '0.95rem', color: fontId === f.id ? 'var(--primary-600)' : 'var(--gray-700)', display: 'block' }}>Abc</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{f.name}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Font sizes */}
                    <Card title="📏 Betűméret">
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-500)' }}>Név méret</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>{nameSize}px</span>
                            </div>
                            <input type="range" min={28} max={72} value={nameSize} onChange={e => setNameSize(Number(e.target.value))}
                                style={{ width: '100%', accentColor: color }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-500)' }}>Vállalkozás méret</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>{businessSize}px</span>
                            </div>
                            <input type="range" min={16} max={48} value={businessSize} onChange={e => setBusinessSize(Number(e.target.value))}
                                style={{ width: '100%', accentColor: color }} />
                        </div>
                    </Card>

                    {/* Color picker */}
                    <Card title="🎨 Szín">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                            {PRESET_COLORS.map(c => (
                                <button key={c} onClick={() => { setColor(c); setCustomColor(c); }} style={{
                                    width: 30, height: 30, borderRadius: 9, background: c,
                                    border: color === c ? '3px solid var(--gray-800)' : '2px solid var(--gray-200)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); }}
                                style={{ width: 32, height: 32, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Egyedi szín</span>
                        </div>
                    </Card>

                    {/* Logo upload */}
                    <Card title="🖼️ Logó">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--gray-100)' }} />
                            ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)', fontSize: '1.2rem' }}>+</div>
                            )}
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => fileInputRef.current?.click()} style={{
                                    padding: '7px 14px', borderRadius: 8, border: '1px solid var(--gray-200)',
                                    background: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)',
                                }}>
                                    {logoUploading ? '...' : logoUrl ? 'Csere' : 'Feltöltés'}
                                </button>
                                {logoUrl && (
                                    <button onClick={() => setLogoUrl('')} style={{
                                        padding: '7px 10px', borderRadius: 8, border: '1px solid #fecaca',
                                        background: '#fef2f2', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626',
                                    }}>✕</button>
                                )}
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </Card>

                    {/* Card data */}
                    <Card title="✏️ Adatok">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { key: 'name', label: 'Név', placeholder: 'Kiss Anna' },
                                { key: 'businessName', label: 'Vállalkozás', placeholder: 'Anna Szépségszalon' },
                                { key: 'phone', label: 'Telefon', placeholder: '+36 30 123 4567' },
                                { key: 'email', label: 'Email', placeholder: 'info@example.com' },
                                { key: 'website', label: 'Weboldal', placeholder: 'foglaljvelem.hu/anna' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 3 }}>{field.label}</label>
                                    <input type="text" value={cardData[field.key]}
                                        onChange={e => setCardData(d => ({ ...d, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        style={{
                                            width: '100%', padding: '8px 12px', borderRadius: 8,
                                            border: '1px solid var(--gray-200)', fontSize: '0.85rem',
                                            outline: 'none', boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary-400)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* RIGHT — Preview + Download */}
                <div style={{ position: 'sticky', top: 20 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem', color: 'var(--gray-700)' }}>👁️ Előnézet</h3>
                        <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'center' }}>
                            <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 600, height: 'auto', borderRadius: 10 }} />
                        </div>
                    </div>

                    <button onClick={handleDownload} disabled={downloading} style={{
                        width: '100%', marginTop: 16, padding: '16px 24px',
                        borderRadius: 14, border: 'none', fontWeight: 700, fontSize: '1rem',
                        background: downloading ? 'var(--gray-300)' : `linear-gradient(135deg, ${color}, ${adjustColor(color, -40)})`,
                        color: 'white', cursor: downloading ? 'wait' : 'pointer',
                        boxShadow: `0 4px 16px ${color}44`, transition: 'all 0.2s',
                    }}>
                        {downloading ? '⏳ Generálás...' : '📥 Letöltés PNG-ben (nyomtatható minőség)'}
                    </button>

                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                        1200×680px • A QR kód ide mutat: <strong style={{ color: 'var(--gray-600)' }}>foglaljvelem.hu/book/{profile?.slug || '...'}</strong>
                    </p>
                </div>
            </div>

            {/* Responsive */}
            <style>{`
                @media (max-width: 860px) {
                    [style*="grid-template-columns: 360px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

// Reusable settings card
function Card({ title, children }) {
    return (
        <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--gray-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.88rem', color: 'var(--gray-700)' }}>{title}</h3>
            {children}
        </div>
    );
}
