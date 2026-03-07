'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookingStats, getServices } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function StatisticsPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            getBookingStats(profile.id).then(data => setStats(data));
            getServices(profile.id).then(data => setServices(data));
        }
    }, [profile]);

    const isEmpty = !stats || (stats.total === 0);

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Statisztikák 📊</h1>
                    <p>Részletes kimutatások a teljesítményedről</p>
                </div>
            </div>

            <div className={s.statsGrid}>
                {[
                    { icon: '📅', value: stats ? String(stats.today) : '0', label: 'Mai foglalások', bg: 'var(--primary-50)' },
                    { icon: '📆', value: stats ? String(stats.week) : '0', label: 'Heti foglalások', bg: 'var(--accent-50)' },
                    { icon: '📊', value: stats ? String(stats.month) : '0', label: 'Havi foglalások', bg: 'var(--success-light)' },
                    { icon: '📋', value: stats ? String(stats.total) : '0', label: 'Összes foglalás', bg: '#ede9fe' },
                ].map((stat, i) => (
                    <div key={i} className={s.statCard}>
                        <div className={s.statCardIcon} style={{ background: stat.bg }}>{stat.icon}</div>
                        <div className={s.statCardValue}>{stat.value}</div>
                        <div className={s.statCardLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {isEmpty ? (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Még nincsenek statisztikáid</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        A foglalásaid alapján automatikusan generálódnak a kimutatások.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link href="/dashboard/embed" className="btn btn-primary">🔗 Oszd meg a foglalási linkedet</Link>
                        <Link href="/dashboard/services" className="btn btn-secondary">📋 Szolgáltatások</Link>
                    </div>
                </div>
            ) : (
                <div className={s.contentGrid}>
                    <div className={s.contentCard}>
                        <div className={s.cardHeader}><h3>Szolgáltatásaid ({services.length})</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {services.length > 0 ? services.map((svc, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-700)' }}>{svc.name}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700 }}>{Number(svc.price).toLocaleString('hu-HU')} Ft</span>
                                </div>
                            )) : <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Még nincsenek szolgáltatásaid.</p>}
                        </div>
                    </div>
                    <div className={s.contentCard}>
                        <div className={s.cardHeader}><h3>Összesítés</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Mai foglalások</span>
                                <span style={{ fontWeight: 700 }}>{stats?.today || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Heti foglalások</span>
                                <span style={{ fontWeight: 700 }}>{stats?.week || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Havi foglalások</span>
                                <span style={{ fontWeight: 700 }}>{stats?.month || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Összes foglalás</span>
                                <span style={{ fontWeight: 700 }}>{stats?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
