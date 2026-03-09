'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

const businessTypeIcons = {
    hair_salon: '💇', beauty_salon: '💅', barber: '💈', nail_salon: '💅',
    massage: '💆', personal_trainer: '🏋️', yoga: '🧘', dentist: '🦷',
    doctor: '👨‍⚕️', therapist: '🧠', lawyer: '⚖️', accountant: '📊',
    consultant: '💼', photographer: '📷', tattoo: '🎨', other: '📅',
};

export default function ReviewPage({ params }) {
    const { slug } = use(params);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/review?slug=${encodeURIComponent(slug)}`);
                if (!res.ok) { setNotFound(true); setLoading(false); return; }
                const { profile: p } = await res.json();
                if (!p) { setNotFound(true); } else { setProfile(p); }
            } catch (e) {
                setNotFound(true);
            }
            setLoading(false);
        }
        load();
    }, [slug]);

    const handleSubmit = async () => {
        if (!rating) { setError('Kérlek adj csillag értékelést!'); return; }
        if (!name.trim()) { setError('Kérlek add meg a nevedet!'); return; }
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, rating, reviewer_name: name.trim(), comment: comment.trim() }),
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                const d = await res.json();
                setError(d.error || 'Hiba történt, kérlek próbáld újra.');
            }
        } catch (e) {
            setError('Hálózati hiba, kérlek próbáld újra.');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff' }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📅</div>
                    <p>Betöltés...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff' }}>
                <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: 360 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>😕</div>
                    <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Nem található</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ez a szolgáltató nem létezik.</p>
                    <Link href="/" style={{ display: 'inline-block', marginTop: 20, color: '#2563eb', fontSize: '0.9rem' }}>← Főoldalra</Link>
                </div>
            </div>
        );
    }

    const icon = businessTypeIcons[profile?.business_type] || '📅';
    const bizName = profile?.business_name || profile?.name || 'Szolgáltató';
    const provName = profile?.name || '';

    // Thank you screen
    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #faf5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: 24, padding: '48px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', maxWidth: 400, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>🙏</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, color: '#1e3a5f' }}>Köszönöm az értékelést!</h1>
                    <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: 8 }}>
                        Az értékelésed segít másoknak is megtalálni <strong>{bizName}</strong> kiváló szolgáltatásait!
                    </p>
                    <div style={{ marginTop: 24, fontSize: '1.5rem', color: '#f59e0b' }}>
                        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    </div>
                    <Link href={`/book/${slug}`} style={{
                        display: 'inline-block', marginTop: 28,
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: 'white', textDecoration: 'none',
                        padding: '12px 28px', borderRadius: 12, fontWeight: 600, fontSize: '0.95rem'
                    }}>
                        📅 Időpontot foglalok
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #faf5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: 24, padding: '36px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', maxWidth: 420, width: '100%' }}>

                {/* Provider header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 18, margin: '0 auto 12px',
                        background: profile?.avatar_url ? 'none' : 'linear-gradient(135deg, #bfdbfe, #ddd6fe)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', border: '3px solid #f3f4f6'
                    }}>
                        {profile?.avatar_url
                            ? <img src={profile.avatar_url} alt={bizName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '2rem' }}>{icon}</span>
                        }
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a5f', marginBottom: 4 }}>{bizName}</h1>
                    {provName && provName !== bizName && (
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>{provName}</p>
                    )}
                    {profile?.city && (
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '4px 0 0' }}>📍 {profile.city}</p>
                    )}
                </div>

                <div style={{ height: 1, background: '#f3f4f6', marginBottom: 24 }} />

                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', marginBottom: 6, color: '#374151' }}>
                    Hogyan értékeled a szolgáltatást?
                </h2>
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', marginBottom: 20 }}>
                    Az értékelésed nyilvánosan látható lesz
                </p>

                {/* Star rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '2.4rem', padding: '4px',
                                color: (hover || rating) >= star ? '#f59e0b' : '#d1d5db',
                                transition: 'all 0.1s',
                                transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                            }}
                        >★</button>
                    ))}
                </div>
                {rating > 0 && (
                    <p style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 16, marginTop: -12 }}>
                        {['', 'Nagyon rossz', 'Rossz', 'Megfelelő', 'Jó', 'Kiváló!'][rating]}
                    </p>
                )}

                {/* Name */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, color: '#374151' }}>
                        Neved *
                    </label>
                    <input
                        style={{
                            width: '100%', padding: '11px 14px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', fontSize: '0.95rem',
                            outline: 'none', boxSizing: 'border-box',
                            fontFamily: 'inherit'
                        }}
                        placeholder="Pl. Kovács Erzsébet"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                {/* Comment */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, color: '#374151' }}>
                        Szöveges értékelés <span style={{ color: '#9ca3af', fontWeight: 400 }}>(nem kötelező)</span>
                    </label>
                    <textarea
                        style={{
                            width: '100%', padding: '11px 14px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', fontSize: '0.95rem',
                            outline: 'none', resize: 'vertical', minHeight: 80,
                            boxSizing: 'border-box', fontFamily: 'inherit'
                        }}
                        placeholder="Írd le tapasztalataidat..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                    />
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#dc2626', fontSize: '0.85rem' }}>
                        ❌ {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                        background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: 'white', fontWeight: 700, fontSize: '1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                    }}
                >
                    {submitting ? '⏳ Küldés...' : '⭐ Értékelés elküldése'}
                </button>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', marginTop: 16 }}>
                    FoglaljVelem.hu – Ingyenes időpontfoglalás
                </p>
            </div>
        </div>
    );
}
