'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getReviews } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function ReviewsPage() {
    const { profile } = useAuth();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            getReviews(profile.id).then(data => setReviews(data));
        }
    }, [profile]);

    const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '–';

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Értékelések ⭐</h1>
                    <p>{reviews.length} értékelés{reviews.length > 0 ? ` • Átlag: ${avg} ⭐` : ''}</p>
                </div>
            </div>

            {reviews.length > 0 && (
                <div className={s.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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

            {reviews.length === 0 ? (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>⭐</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Még nincsenek értékeléseid</h3>
                    <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto' }}>
                        Az értékelések automatikusan megjelennek, amikor az ügyfeleid visszajelzést adnak a foglalásuk után.
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
                                <div style={{ color: 'var(--accent-400)', fontSize: '1rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{r.comment}&rdquo;</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
