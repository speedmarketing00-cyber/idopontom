'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import s from '../dashboard.module.css';

const TEMPLATES = [
    { id: 'classic', name: 'Klasszikus', desc: 'Letisztult, világos', preview: '📋' },
    { id: 'bold', name: 'Színes', desc: 'Merész, feltűnő', preview: '🔥' },
    { id: 'elegant', name: 'Elegáns', desc: 'Sötét, prémium', preview: '✨' },
    { id: 'premium', name: 'Prémium', desc: 'Profilképes, különleges', preview: '👔' },
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

function generateQRCanvas(text, size) {
    const qrGen = require('qrcode-generator');
    const qr = qrGen(0, 'M');
    qr.addData(text);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const cellSize = size / moduleCount;
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize + 0.5, cellSize + 0.5);
            }
        }
    }
    return canvas;
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
        qrImg = generateQRCanvas(bookingUrl || 'https://foglaljvelem.hu', 400);
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
    else if (template === 'elegant') {
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

        let contentY = 60;

        if (logoImg) {
            ctx.save();
            roundRect(ctx, 64, contentY, 72, 72, 14);
            ctx.clip();
            ctx.drawImage(logoImg, 64, contentY, 72, 72);
            ctx.restore();
            contentY += 92;
        }

        ctx.fillStyle = color;
        ctx.font = `700 ${businessSize * 1.4}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillText((businessName || 'Vállalkozás neve').toUpperCase(), 64, contentY);
        contentY += businessSize * 1.4 + 16;

        ctx.fillStyle = '#e2e8f0';
        ctx.font = `800 ${nameSize * 2.2}px ${fontFamily}`;
        ctx.fillText(name || 'Neved', 64, contentY);
        contentY += nameSize * 2.2 + 20;

        ctx.fillStyle = color;
        roundRect(ctx, 64, contentY, 80, 4, 2);
        ctx.fill();
        contentY += 28;

        ctx.font = `400 26px ${fontFamily}`;
        const details = [];
        if (phone) details.push(phone);
        if (email) details.push(email);
        if (website) details.push(website);
        details.forEach((text, i) => {
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(text, 64, contentY + i * 38);
        });

        if (qrImg) {
            const qrSize = 240;
            const qrX = W - qrSize - 100;
            const qrY = (H - qrSize - 60) / 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 2;
            roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 76, 20);
            ctx.stroke();
            ctx.fillStyle = '#f8fafc';
            roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
            ctx.fill();
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            ctx.fillStyle = '#64748b';
            ctx.font = `600 20px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.fillText('Foglalj online', qrX + qrSize / 2, qrY + qrSize + 36);
            ctx.textAlign = 'left';
        }
    }

    // ===== TEMPLATE: PREMIUM =====
    else if (template === 'premium') {
        // Load profile photo
        let photoImg = null;
        if (data.photoUrl) {
            try { photoImg = await loadImage(data.photoUrl); } catch (e) { console.warn('Photo error:', e); }
        }

        // Full dark background
        ctx.fillStyle = '#0f0f0f';
        roundRect(ctx, 0, 0, W, H, 32);
        ctx.fill();

        // Right side: diagonal accent shape
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(W * 0.55, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H);
        ctx.lineTo(W * 0.45, H);
        ctx.closePath();
        ctx.clip();

        // Gradient accent on the right diagonal
        const diagGrad = ctx.createLinearGradient(W * 0.5, 0, W, H);
        diagGrad.addColorStop(0, color);
        diagGrad.addColorStop(1, adjustColor(color, -50));
        ctx.fillStyle = diagGrad;
        ctx.fillRect(0, 0, W, H);

        // Profile photo in a circle on the right
        if (photoImg) {
            const photoSize = 260;
            const photoX = W - 200;
            const photoY = H / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            const srcW = photoImg.width;
            const srcH = photoImg.height;
            const scale = Math.max(photoSize / srcW, photoSize / srcH);
            ctx.drawImage(photoImg, photoX - (srcW * scale) / 2, photoY - (srcH * scale) / 2, srcW * scale, srcH * scale);
            ctx.restore();

            // Circle border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2 + 3, 0, Math.PI * 2);
            ctx.stroke();

            // Outer accent ring
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2 + 14, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Placeholder if no photo
            const placeholderX = W - 200;
            const placeholderY = H / 2;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.arc(placeholderX, placeholderY, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = `400 48px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((name || 'N')[0].toUpperCase(), placeholderX, placeholderY);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        }

        ctx.restore(); // Restore diagonal clip

        // Left side content
        let contentY = 56;

        // Logo (small, top left)
        if (logoImg) {
            ctx.save();
            roundRect(ctx, 56, contentY, 64, 64, 14);
            ctx.clip();
            ctx.drawImage(logoImg, 56, contentY, 64, 64);
            ctx.restore();
            contentY += 80;
        }

        // Name (huge, white)
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${nameSize * 2.4}px ${fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillText((name || 'NEVED').toUpperCase(), 56, contentY);
        contentY += nameSize * 2.4 + 8;

        // Business name / tagline with accent underline
        ctx.fillStyle = color;
        ctx.font = `600 ${businessSize * 1.6}px ${fontFamily}`;
        ctx.fillText(businessName || 'Vállalkozás neve', 56, contentY);
        contentY += businessSize * 1.6 + 16;

        // Accent line
        ctx.fillStyle = color;
        roundRect(ctx, 56, contentY, 100, 5, 3);
        ctx.fill();
        contentY += 32;

        // Contact details with icon dots
        ctx.font = `500 24px ${fontFamily}`;
        const contactItems = [];
        if (phone) contactItems.push(phone);
        if (email) contactItems.push(email);
        if (website) contactItems.push(website);

        contactItems.forEach((text, i) => {
            const y = contentY + i * 40;
            // Icon dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(70, y + 10, 6, 0, Math.PI * 2);
            ctx.fill();
            // Text
            ctx.fillStyle = '#d1d5db';
            ctx.fillText(text, 92, y);
        });

        // QR code (bottom left)
        if (qrImg) {
            const qrSize = 110;
            const qrX = 56;
            const qrY = H - qrSize - 44;
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
            ctx.fill();
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            ctx.fillStyle = '#6b7280';
            ctx.font = `600 16px ${fontFamily}`;
            ctx.fillText('Foglalj online', qrX + qrSize + 16, qrY + qrSize / 2 + 5);
        }

        // Bottom accent line
        ctx.fillStyle = color;
        ctx.fillRect(0, H - 8, W, 8);
        roundRect(ctx, 0, H - 8, W, 8, 32);
        ctx.fill();
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
    const [photoUrl, setPhotoUrl] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState(null); // 'png' | 'pdf'

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
                data: { ...cardData, logoUrl, photoUrl, color, bookingUrl, nameSize, businessSize },
                fonts: { family: currentFont.family },
            });
        } catch (err) {
            console.error('Draw error:', err);
        }
    }, [template, cardData, logoUrl, photoUrl, color, bookingUrl, nameSize, businessSize, currentFont]);

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

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { alert('A fajl max 4MB lehet!'); return; }
        setPhotoUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPhotoUrl(ev.target.result);
            setPhotoUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = async (format) => {
        setDownloading(true);
        setDownloadFormat(format);
        try {
            // Create a fresh high-res canvas for download
            const dlCanvas = document.createElement('canvas');
            await drawCard(dlCanvas, {
                template,
                data: { ...cardData, logoUrl, photoUrl, color, bookingUrl, nameSize, businessSize },
                fonts: { family: currentFont.family },
            });

            if (format === 'pdf') {
                const { default: jsPDF } = await import('jspdf');
                // Business card size: 90mm x 50mm (standard)
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 50] });
                const imgData = dlCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(imgData, 'PNG', 0, 0, 90, 50);
                pdf.save(`nevjegykartya-${template}.pdf`);
            } else {
                const link = document.createElement('a');
                link.download = `nevjegykartya-${template}.png`;
                link.href = dlCanvas.toDataURL('image/png', 1.0);
                link.click();
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Hiba a letoltesnel. Probald ujra!');
        } finally {
            setDownloading(false);
            setDownloadFormat(null);
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                                    padding: '12px 6px', borderRadius: 12,
                                    border: template === t.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                    background: template === t.id ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 4 }}>{t.preview}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.7rem', color: template === t.id ? 'var(--primary-600)' : 'var(--gray-700)' }}>{t.name}</span>
                                    <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--gray-400)', marginTop: 2 }}>{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Profile photo (for Premium template) */}
                    {template === 'premium' && (
                        <Card title="📸 Profilkép">
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 10 }}>Töltsd fel a saját fotódat a kártyához</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Profilkép" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', border: `3px solid ${color}` }} />
                                ) : (
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: '1.4rem' }}>👤</div>
                                )}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => photoInputRef.current?.click()} style={{
                                        padding: '7px 14px', borderRadius: 8, border: '1px solid var(--gray-200)',
                                        background: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)',
                                    }}>
                                        {photoUploading ? '...' : photoUrl ? 'Csere' : 'Feltöltés'}
                                    </button>
                                    {photoUrl && (
                                        <button onClick={() => setPhotoUrl('')} style={{
                                            padding: '7px 10px', borderRadius: 8, border: '1px solid #fecaca',
                                            background: '#fef2f2', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626',
                                        }}>✕</button>
                                    )}
                                </div>
                            </div>
                            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        </Card>
                    )}

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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                        <button onClick={() => handleDownload('png')} disabled={downloading} style={{
                            padding: '14px 20px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.9rem',
                            background: downloading && downloadFormat === 'png' ? 'var(--gray-300)' : `linear-gradient(135deg, ${color}, ${adjustColor(color, -40)})`,
                            color: 'white', cursor: downloading ? 'wait' : 'pointer',
                            boxShadow: `0 4px 12px ${color}33`, transition: 'all 0.2s',
                        }}>
                            {downloading && downloadFormat === 'png' ? '⏳...' : '🖼️ PNG letöltés'}
                        </button>
                        <button onClick={() => handleDownload('pdf')} disabled={downloading} style={{
                            padding: '14px 20px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.9rem',
                            background: downloading && downloadFormat === 'pdf' ? 'var(--gray-300)' : '#1e293b',
                            color: 'white', cursor: downloading ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'all 0.2s',
                        }}>
                            {downloading && downloadFormat === 'pdf' ? '⏳...' : '📄 PDF letöltés'}
                        </button>
                    </div>

                    <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                        PNG: 1200×680px digitális használatra • PDF: 90×50mm nyomtatáshoz<br />
                        QR kód → <strong style={{ color: 'var(--gray-600)' }}>foglaljvelem.hu/book/{profile?.slug || '...'}</strong>
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
