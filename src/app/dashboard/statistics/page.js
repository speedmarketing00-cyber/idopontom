'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function StatisticsPage() {
    const { profile } = useAuth();
    const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'all'
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);
    const [serviceStats, setServiceStats] = useState([]); // [{ name, count, revenue }]
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured || !profile?.id) return;
        setLoading(true);

        const now = new Date();
        const periodStart = period === 'week'
            ? new Date(now.getTime() - 7  * 86400000).toISOString().split('T')[0]
            : period === 'month'
            ? new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]
            : null; // 'all' = no filter

        const today    = now.toISOString().split('T')[0];
        const weekAgo  = new Date(now.getTime() -  7 * 86400000).toISOString().split('T')[0];
        const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

        // Run all queries in parallel
        Promise.all([
            // Summary stats (always absolute)
            supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profile.id).eq('booking_date', today),
            supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profile.id).gte('booking_date', weekAgo),
            supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profile.id).gte('booking_date', monthAgo),
            supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profile.id),
            // Revenue for selected period
            periodStart
                ? supabase.from('bookings').select('price').eq('profile_id', profile.id).gte('booking_date', periodStart).neq('status', 'cancelled')
                : supabase.from('bookings').select('price').eq('profile_id', profile.id).neq('status', 'cancelled'),
            // Service breakdown for selected period
            periodStart
                ? supabase.from('bookings').select('services(name), price, status').eq('profile_id', profile.id).gte('booking_date', periodStart)
                : supabase.from('bookings').select('services(name), price, status').eq('profile_id', profile.id),
            // All services list
            supabase.from('services').select('*').eq('profile_id', profile.id).eq('is_active', true).order('sort_order'),
        ]).then(([todayR, weekR, monthR, totalR, revenueR, breakdownR, svcsR]) => {
            const revenue = (revenueR.data || []).reduce((sum, b) => sum + (Number(b.price) || 0), 0);

            // Build service popularity
            const svcMap = {};
            (breakdownR.data || []).forEach(b => {
                const name = b.services?.name || 'Ismeretlen';
                if (!svcMap[name]) svcMap[name] = { name, count: 0, revenue: 0 };
                svcMap[name].count++;
                if (b.status !== 'cancelled') svcMap[name].revenue += Number(b.price) || 0;
            });
            const svcList = Object.values(svcMap).sort((a, b) => b.count - a.count);
            const maxCount = svcList[0]?.count || 1;

            setStats({
                today: todayR.count || 0,
                week:  weekR.count  || 0,
                month: monthR.count || 0,
                total: totalR.count || 0,
                revenue,
            });
            setServiceStats(svcList.map(s => ({ ...s, pct: Math.round((s.count / maxCount) * 100) })));
            setServices(svcsR.data || []);
            setLoading(false);
        });
    }, [profile?.id, period]);

    const isEmpty = !stats || stats.total === 0;

    const periodRevLabel = period === 'week' ? 'heti' : period === 'month' ? 'havi' : 'összes';

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Statisztikák 📊</h1>
                    <p>Részletes kimutatások a teljesítményedről</p>
                </div>
                {/* Period filter */}
                <div className={s.topBarRight}>
                    {[
                        { val: 'week',  label: '7 nap' },
                        { val: 'month', label: '30 nap' },
                        { val: 'all',   label: 'Összes' },
                    ].map(p => (
                        <button key={p.val} onClick={() => setPeriod(p.val)} className="btn btn-sm" style={{
                            background: period === p.val ? 'var(--primary-500)' : 'white',
                            color: period === p.val ? 'white' : 'var(--gray-600)',
                            border: `1.5px solid ${period === p.val ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                        }}>{p.label}</button>
                    ))}
                </div>
            </div>

            {/* Summary stat cards */}
            <div className={s.statsGrid}>
                {[
                    { icon: '📅', value: loading ? '–' : String(stats?.today ?? 0),  label: 'Mai foglalások',  bg: 'var(--primary-50)' },
                    { icon: '📆', value: loading ? '–' : String(stats?.week  ?? 0),  label: 'Heti foglalások', bg: 'var(--accent-50)' },
                    { icon: '📊', value: loading ? '–' : String(stats?.month ?? 0),  label: 'Havi foglalások', bg: 'var(--success-light)' },
                    {
                        icon: '💰',
                        value: loading ? '–' : (stats?.revenue > 0 ? `${Math.round(stats.revenue / 1000)}k Ft` : '0 Ft'),
                        label: `Bevétel (${periodRevLabel})`,
                        bg: '#ede9fe',
                    },
                ].map((stat, i) => (
                    <div key={i} className={s.statCard}>
                        <div className={s.statCardIcon} style={{ background: stat.bg }}>{stat.icon}</div>
                        <div className={s.statCardValue}>{stat.value}</div>
                        <div className={s.statCardLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {isEmpty && !loading ? (
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
                    {/* Service popularity */}
                    <div className={s.contentCard}>
                        <div className={s.cardHeader}>
                            <h3>🏆 Legnépszerűbb szolgáltatások</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{period === 'week' ? 'elmúlt 7 nap' : period === 'month' ? 'elmúlt 30 nap' : 'összesen'}</span>
                        </div>
                        {serviceStats.length === 0 ? (
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', padding: '12px 0' }}>Nincs adat a kiválasztott időszakban.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {serviceStats.map((svc, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {svc.name}
                                            </span>
                                            <span style={{ color: 'var(--gray-500)' }}>{svc.count} db {svc.revenue > 0 ? `• ${Math.round(svc.revenue / 1000)}k Ft` : ''}</span>
                                        </div>
                                        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${svc.pct}%`,
                                                background: i === 0 ? 'var(--primary-500)' : i === 1 ? 'var(--accent-400)' : 'var(--gray-300)',
                                                borderRadius: 4,
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary + services list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className={s.contentCard}>
                            <div className={s.cardHeader}><h3>📋 Összesítés</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Mai foglalások',    val: stats?.today ?? 0 },
                                    { label: 'Heti foglalások',   val: stats?.week  ?? 0 },
                                    { label: 'Havi foglalások',   val: stats?.month ?? 0 },
                                    { label: 'Összes foglalás',   val: stats?.total ?? 0 },
                                ].map((row, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--gray-50)' : 'none' }}>
                                        <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{row.label}</span>
                                        <span style={{ fontWeight: 700 }}>{loading ? '–' : row.val}</span>
                                    </div>
                                ))}
                                {stats?.revenue > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', borderTop: '2px solid var(--gray-100)', marginTop: 4 }}>
                                        <span style={{ color: 'var(--gray-700)', fontWeight: 600, fontSize: '0.9rem' }}>💰 Bevétel ({periodRevLabel})</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>{Number(stats.revenue).toLocaleString('hu-HU')} Ft</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={s.contentCard}>
                            <div className={s.cardHeader}><h3>⚙️ Aktív szolgáltatások ({services.length})</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {services.length > 0 ? services.map((svc, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>{svc.name}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700 }}>{Number(svc.price).toLocaleString('hu-HU')} Ft</span>
                                    </div>
                                )) : <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Még nincsenek szolgáltatásaid.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
