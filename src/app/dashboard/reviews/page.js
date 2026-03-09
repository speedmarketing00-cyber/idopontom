'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getReviews } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function ReviewsPage() {
    const { profile } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            getReviews(profile.id).then(data => setReviews(data));
        }
    }, [profile]);

    const avg = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '–';

    const reviewUrl = profile?.slug
        ? `https://foglaljvelem.hu/review/${profile.slug}`
        : null;

    const qrUrl = reviewUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reviewUrl)}&bgcolor=ffffff&color=1e3a5f&margin=10`
        : null;

    const handleCopy = () => {
        if (!reviewUrl) return;
        navigator.clipboard.writeText(reviewUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Értékelések ⭐</h1>
                    <p>{reviews.length} értékelés{reviews.length > 0 ? ` • Átlag: ${avg} ⭐` : ''}</p>
                </div>
            </div>

            {/* QR CODE + LINK SECTION */}
            {profile?.slug ? (
                <div className={s.contentCard} style={{ padding: 28, marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6, fontSize: '1.05rem' }}>
                        📲 Értékelési link & QR kód
                    </h3>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>
                        Mutasd meg ezt a QR kódot az ügyfeleidnek helyszínen, vagy küld el nekik az értékelési linket. Az értékelések azonnal megjelennek itt, a dashboardon.
                    </p>

                    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* QR Code */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <div style={{
                                background: 'white', border: '2px solid var(--gray-100)',
                                borderRadius: 16, padding: 12, display: 'inline-block',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                            }}>
                                {qrUrl && (
                                    <img
                                        src={qrUrl}
                                        alt="Értékelési QR kód"
                                        width={160}
                                        height={160}
                                        style={{ display: 'block', borderRadius: 8 }}
                                    />
                                )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 8 }}>
                                Nyomtasd ki vagy mutasd telefonon
                            </p>
                            <a
                                href={qrUrl}
                                download="ertekeles-qr.png"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-block', marginTop: 4,
                                    fontSize: '0.78rem', color: 'var(--primary-600)', textDecoration: 'underline'
                                }}
                            >
                                ⬇ QR letöltése
                            </a>
                        </div>

                        {/* Link + tips */}
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--gray-700)' }}>
                                Értékelési link:
                            </div>
                            <div style={{
                                display: 'flex', gap: 8, alignItems: 'center',
                                background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)',
                                borderRadius: 10, padding: '10px 14px', marginBottom: 16
                            }}>
                                <span style={{ fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 500, wordBreak: 'break-all', flex: 1 }}>
                                    {reviewUrl}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: 'none',
                                        background: copied ? 'var(--success-light)' : 'var(--primary-100)',
                                        color: copied ? '#166534' : 'var(--primary-700)',
                                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit'
                                    }}
                                >
                                    {copied ? '✅ Másolva!' : '📋 Másolás'}
                                </button>
                            </div>

                            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.8 }}>
                                <strong style={{ color: 'var(--gray-700)' }}>💡 Hogyan használd?</strong><br />
                                📱 <strong>Helyszínen:</strong> Mutasd a QR kódot a telefonon – az ügyfél beszkenneli és azonnal értékelhet<br />
                                🔗 <strong>Távolról:</strong> Küldd el WhatsApp-on, SMS-ben, vagy email aláírásban<br />
                                🖨️ <strong>Nyomtatva:</strong> Töltsd le a QR kódot és nyomtasd ki a pultra
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={s.contentCard} style={{ padding: 20, marginBottom: 24, background: '#fffdf0', border: '1px solid #fde68a' }}>
                    <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0 }}>
                        ⚠️ Nincs beállítva egyedi URL (slug) a profilodon. <a href="/dashboard/settings" style={{ color: '#2563eb' }}>Menj a Beállításokhoz</a> és töltsd ki az "Egyedi URL" mezőt, hogy QR kódot generálhass.
                    </p>
                </div>
            )}

            {/* Stats */}
            {reviews.length > 0 && (
                <div className={s.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                    <div className={s.statCard}>
                        <div className={s.statCardIcon} style={{ background: 'var(--accent-50)' }}>⭐</div>
                        <div className={s.statCardValue}>{avg}</div>
                        <div className={s.statCardLabel}>Átlag értékelés</div>
                    </div>
                    <div className={s.statCard}>
                        <div className={s.statCardIcon} style={{ background: 'var(--success-light)' }}>📝</div>
                        <div className={s.statCardValue}>{reviews.length}</div>
                        <div className={s.statCardLabel}>Összes értékelés</div>
                    </div>
                    <div className={s.statCard}>
                        <div className={s.statCardIcon} style={{ background: 'var(--primary-50)' }}>🏆</div>
                        <div className={s.statCardValue}>{reviews.filter(r => r.rating === 5).length}</div>
                        <div className={s.statCardLabel}>5 csillagos</div>
                    </div>
                </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>⭐</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Még nincsenek értékeléseid</h3>
                    <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                        Mutasd meg a fenti QR kódot az ügyfeleidnek, vagy küldd el nekik az értékelési linket!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map(r => (
                        <div key={r.id} className={s.contentCard} style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-600)', fontSize: '1rem' }}>
                                        {(r.reviewer_name || r.name || '?')[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{r.reviewer_name || r.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{r.created_at?.split('T')[0] || r.date}</div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--accent-400)', fontSize: '1.1rem' }}>
                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                </div>
                            </div>
                            {r.comment && (
                                <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>&ldquo;{r.comment}&rdquo;</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
