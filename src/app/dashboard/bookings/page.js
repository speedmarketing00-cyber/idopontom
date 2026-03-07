'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookings, updateBookingStatus } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function BookingsPage() {
    const { profile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [teamMembers, setTeamMembers] = useState([]);
    const [memberFilter, setMemberFilter] = useState('all');
    const tier = profile?.subscription_tier || 'free';
    const isProfi = tier === 'pro';

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            getBookings(profile.id).then(data => setBookings(data));
            if (isProfi) {
                supabase.from('team_members').select('*').eq('profile_id', profile.id)
                    .order('created_at').then(({ data }) => setTeamMembers(data || []));
            }
        }
    }, [profile]);

    const filtered = bookings
        .filter(b => filter === 'all' ? true : b.status === filter)
        .filter(b => {
            if (memberFilter === 'all') return true;
            if (memberFilter === 'owner') return !b.team_member_id;
            return b.team_member_id === memberFilter;
        });

    const getMemberName = (tmId) => {
        if (!tmId) return null;
        const m = teamMembers.find(x => x.id === tmId);
        return m?.name || null;
    };

    const handleStatus = async (id, status) => {
        if (isSupabaseConfigured) await updateBookingStatus(id, status);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };

    const statusMap = { confirmed: { label: '✓ Megerősítve', cls: s.statusConfirmed }, pending: { label: '⏳ Várakozik', cls: s.statusPending }, cancelled: { label: '✗ Lemondva', cls: '' } };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Foglalások 📋</h1>
                    <p>{bookings.length} foglalás összesen</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { val: 'all', label: 'Összes', count: bookings.length },
                    { val: 'pending', label: '⏳ Várakozik', count: bookings.filter(b => b.status === 'pending').length },
                    { val: 'confirmed', label: '✓ Megerősítve', count: bookings.filter(b => b.status === 'confirmed').length },
                    { val: 'cancelled', label: '✗ Lemondva', count: bookings.filter(b => b.status === 'cancelled').length },
                ].map(f => (
                    <button key={f.val} onClick={() => setFilter(f.val)} className="btn btn-sm" style={{
                        background: filter === f.val ? 'var(--primary-500)' : 'white',
                        color: filter === f.val ? 'white' : 'var(--gray-600)',
                        border: `1.5px solid ${filter === f.val ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                    }}>
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {isProfi && teamMembers.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {[
                        { val: 'all', label: '👥 Mindenki' },
                        { val: 'owner', label: '👤 Saját' },
                        ...teamMembers.map(m => ({ val: m.id, label: m.name })),
                    ].map(f => (
                        <button key={f.val} onClick={() => setMemberFilter(f.val)} className="btn btn-sm" style={{
                            background: memberFilter === f.val ? 'var(--accent-500)' : 'white',
                            color: memberFilter === f.val ? 'white' : 'var(--gray-600)',
                            border: `1.5px solid ${memberFilter === f.val ? 'var(--accent-500)' : 'var(--gray-200)'}`,
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Még nincsenek foglalásaid</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        Amint ügyfelek foglalnak a publikus oldaladról, itt fognak megjelenni.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link href="/dashboard/embed" className="btn btn-primary">🔗 Foglalási link megosztása</Link>
                        <Link href="/dashboard/services" className="btn btn-secondary">📋 Szolgáltatások</Link>
                    </div>
                </div>
            ) : (
                <div className={s.contentCard}>
                    {filtered.map(b => (
                        <div key={b.id} className={s.bookingItem} style={{ padding: '16px 0' }}>
                            <div className={s.bookingTime}>
                                <div className={s.bookingTimeH}>{b.start_time?.slice(0, 5) || b.time}</div>
                                <div className={s.bookingTimeM}>{b.booking_date || b.date}</div>
                            </div>
                            <div className={s.bookingInfo} style={{ flex: 1 }}>
                                <div className={s.bookingName}>{b.client_name}</div>
                                <div className={s.bookingService}>{b.services?.name || 'Szolgáltatás'} • {b.services?.duration_minutes || 30} perc</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 2 }}>
                                    {b.client_email} • {b.client_phone}
                                    {getMemberName(b.team_member_id) && (
                                        <span style={{ marginLeft: 8, color: 'var(--accent-500)', fontWeight: 500 }}>👤 {getMemberName(b.team_member_id)}</span>
                                    )}
                                </div>
                            </div>
                            <span className={`${s.bookingStatus} ${statusMap[b.status]?.cls || ''}`} style={b.status === 'cancelled' ? { background: 'var(--error-light)', color: '#991b1b' } : {}}>
                                {statusMap[b.status]?.label}
                            </span>
                            {b.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                                    <button onClick={() => handleStatus(b.id, 'confirmed')} className="btn btn-sm" style={{ background: 'var(--success)', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }}>✓</button>
                                    <button onClick={() => handleStatus(b.id, 'cancelled')} className="btn btn-sm" style={{ background: 'var(--error)', color: 'white', padding: '6px 12px', fontSize: '0.8rem' }}>✗</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
