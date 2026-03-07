'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookings, getBookingStats } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import s from './dashboard.module.css';

export default function DashboardPage() {
    const { profile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadedFromDb, setLoadedFromDb] = useState(false);

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            const today = new Date().toISOString().split('T')[0];
            Promise.all([
                getBookings(profile.id, { date: today }),
                getBookingStats(profile.id),
            ]).then(([todayData, statsData]) => {
                setBookings(todayData);
                setStats(statsData);
                setLoadedFromDb(true);
            });
        } else {
            setLoadedFromDb(true); // eslint-disable-line react-hooks/set-state-in-effect
        }
    }, [profile]);

    const today = new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const displayName = profile?.name || profile?.business_name || profile?.businessName || '';

    const hasBookings = bookings.length > 0;

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Üdvözöllek{displayName ? `, ${displayName}` : ''}! 👋</h1>
                    <p>{today}</p>
                </div>
                <div className={s.topBarRight}>
                    <Link href="/dashboard/services" className="btn btn-primary btn-sm">+ Új szolgáltatás</Link>
                </div>
            </div>

            <div className={s.statsGrid}>
                {[
                    { icon: '📅', value: String(bookings.length), label: 'Mai foglalások', bg: 'var(--primary-50)' },
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

            <div className={s.contentGrid}>
                <div className={s.contentCard}>
                    <div className={s.cardHeader}>
                        <h3>Mai foglalások</h3>
                        <Link href="/dashboard/bookings" className="btn btn-ghost btn-sm">Összes →</Link>
                    </div>
                    {hasBookings ? bookings.map(b => (
                        <div key={b.id} className={s.bookingItem}>
                            <div className={s.bookingTime}>
                                <div className={s.bookingTimeH}>{b.start_time?.slice(0, 5) || b.start_time}</div>
                                <div className={s.bookingTimeM}>{b.services?.duration_minutes || 30} perc</div>
                            </div>
                            <div className={s.bookingInfo}>
                                <div className={s.bookingName}>{b.client_name}</div>
                                <div className={s.bookingService}>{b.services?.name || 'Szolgáltatás'}</div>
                            </div>
                            <span className={`${s.bookingStatus} ${b.status === 'confirmed' ? s.statusConfirmed : s.statusPending}`}>
                                {b.status === 'confirmed' ? '✓ Megerősítve' : '⏳ Várakozik'}
                            </span>
                        </div>
                    )) : (
                        <div style={{ padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 16 }}>Még nincsenek mai foglalásaid.</p>
                            <Link href="/dashboard/embed" className="btn btn-sm btn-secondary">🔗 Oszd meg a foglalási linkedet</Link>
                        </div>
                    )}
                </div>

                <div className={s.contentCard}>
                    <div className={s.cardHeader}><h3>Gyors műveletek</h3></div>
                    <div className={s.quickActions}>
                        {[
                            { icon: '📋', title: 'Szolgáltatás hozzáadása', desc: 'Katalógusból vagy egyéni', href: '/dashboard/services', bg: 'var(--primary-50)' },
                            { icon: '🕐', title: 'Elérhetőség szerkesztése', desc: 'Mikor fogadsz ügyfeleket?', href: '/dashboard/availability', bg: 'var(--accent-50)' },
                            { icon: '🔗', title: 'Foglalási link', desc: 'Oszd meg vagy ágyazd be', href: '/dashboard/embed', bg: 'var(--success-light)' },
                            { icon: '📊', title: 'Statisztikák', desc: 'Nézd meg a kimutatásokat', href: '/dashboard/statistics', bg: '#ede9fe' },
                        ].map((qa, i) => (
                            <Link key={i} href={qa.href} className={s.quickAction}>
                                <div className={s.qaIcon} style={{ background: qa.bg }}>{qa.icon}</div>
                                <div>
                                    <div className={s.qaTitle}>{qa.title}</div>
                                    <div className={s.qaDesc}>{qa.desc}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
