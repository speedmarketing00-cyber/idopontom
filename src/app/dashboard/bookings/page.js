'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookings, updateBookingStatus } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

// ─── Booking Detail Modal ──────────────────────────────────────────────────
function BookingModal({ booking, onClose, onStatusChange, onNotesSaved }) {
    const [noteText, setNoteText] = useState(booking.notes || '');
    const [savingNote, setSavingNote] = useState(false);
    const [noteSaved, setNoteSaved] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const statusLabels = {
        confirmed: { label: '✓ Megerősítve', bg: '#dcfce7', color: '#166534' },
        pending:   { label: '⏳ Várakozik',  bg: '#fef9c3', color: '#854d0e' },
        cancelled: { label: '✗ Lemondva',    bg: '#fee2e2', color: '#991b1b' },
    };
    const st = statusLabels[booking.status] || statusLabels.pending;

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            await supabase.from('bookings').update({ notes: noteText }).eq('id', booking.id);
            onNotesSaved(booking.id, noteText);
            setNoteSaved(true);
            setTimeout(() => setNoteSaved(false), 2000);
        } catch (e) { console.error(e); }
        finally { setSavingNote(false); }
    };

    const handleCancel = async () => {
        if (!window.confirm('Biztosan lemondod ezt a foglalást? Az ügyfél értesítést kap.')) return;
        setCancelling(true);
        await onStatusChange(booking.id, 'cancelled');
        // Send cancellation email
        try {
            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'booking_cancelled',
                    data: {
                        clientName: booking.client_name,
                        clientEmail: booking.client_email,
                        serviceName: booking.services?.name || 'Szolgáltatás',
                        date: booking.booking_date,
                        time: booking.start_time?.slice(0, 5),
                        providerName: booking.profiles?.business_name || booking.profiles?.name || '',
                    },
                }),
            });
        } catch (e) { console.warn(e); }
        setCancelling(false);
        onClose();
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                            {booking.client_name}
                        </h2>
                        <span style={{ display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: st.bg, color: st.color }}>
                            {st.label}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--gray-400)', lineHeight: 1 }}>✕</button>
                </div>

                {/* Details */}
                <div style={{ background: 'var(--gray-50)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {[
                            { label: '📋 Szolgáltatás', value: booking.services?.name || 'Szolgáltatás' },
                            { label: '📅 Dátum', value: booking.booking_date },
                            { label: '🕐 Időpont', value: booking.start_time?.slice(0, 5) },
                            { label: '⏱ Időtartam', value: `${booking.services?.duration_minutes || 30} perc` },
                            { label: '💰 Ár', value: booking.price ? `${Number(booking.price).toLocaleString('hu-HU')} Ft` : '–' },
                            { label: '📧 E-mail', value: booking.client_email },
                            { label: '📞 Telefon', value: booking.client_phone || '–' },
                        ].map((row, i) => (
                            <div key={i} style={i === 5 || i === 6 ? { gridColumn: '1 / -1' } : {}}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>{row.label}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-800)', wordBreak: 'break-all' }}>{row.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8 }}>
                        📝 Megjegyzés (belső)
                    </label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Belső megjegyzés a foglaláshoz..."
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        style={{ resize: 'vertical', fontSize: '0.9rem' }}
                    />
                    <button
                        onClick={handleSaveNote}
                        disabled={savingNote}
                        className="btn btn-sm btn-secondary"
                        style={{ marginTop: 8 }}
                    >
                        {noteSaved ? '✅ Mentve!' : savingNote ? '⏳...' : '💾 Megjegyzés mentése'}
                    </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
                    {booking.status === 'pending' && (
                        <button
                            onClick={() => { onStatusChange(booking.id, 'confirmed'); onClose(); }}
                            className="btn btn-sm"
                            style={{ background: '#22c55e', color: 'white', flex: 1 }}
                        >
                            ✓ Megerősítés
                        </button>
                    )}
                    {booking.status !== 'cancelled' && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="btn btn-sm"
                            style={{ background: 'var(--error-light)', color: '#991b1b', border: '1px solid #fca5a5', flex: 1 }}
                        >
                            {cancelling ? '⏳...' : '✗ Lemondás'}
                        </button>
                    )}
                    <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ flex: 1 }}>Bezárás</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function BookingsPage() {
    const { profile, teamMemberInfo } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [teamMembers, setTeamMembers] = useState([]);
    const [memberFilter, setMemberFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);

    // P3: search + date filter
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const effectiveProfileId = teamMemberInfo?.ownerProfileId || profile?.id;
    const tier = teamMemberInfo ? 'pro' : (profile?.subscription_tier || 'free');
    const isProfi = tier === 'pro';

    useEffect(() => {
        if (isSupabaseConfigured && effectiveProfileId) {
            getBookings(effectiveProfileId).then(data => {
                if (teamMemberInfo) {
                    setBookings(data.filter(b => b.team_member_id === teamMemberInfo.teamMemberId));
                } else {
                    setBookings(data);
                }
            });
            if (isProfi && !teamMemberInfo) {
                supabase.from('team_members').select('*').eq('owner_profile_id', effectiveProfileId)
                    .order('created_at').then(({ data }) => setTeamMembers(data || []));
            }
        }
    }, [profile, teamMemberInfo]);

    const filtered = bookings
        .filter(b => filter === 'all' ? true : b.status === filter)
        .filter(b => {
            if (memberFilter === 'all') return true;
            if (memberFilter === 'owner') return !b.team_member_id;
            return b.team_member_id === memberFilter;
        })
        .filter(b => {
            if (!search) return true;
            return b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                   b.client_email?.toLowerCase().includes(search.toLowerCase());
        })
        .filter(b => {
            if (dateFrom && b.booking_date < dateFrom) return false;
            if (dateTo   && b.booking_date > dateTo)   return false;
            return true;
        });

    const getMemberName = (tmId) => {
        if (!tmId) return null;
        const m = teamMembers.find(x => x.id === tmId);
        return m?.name || null;
    };

    const handleStatus = async (id, status) => {
        if (isSupabaseConfigured) await updateBookingStatus(id, status);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status }));
    };

    const handleNotesSaved = (id, notes) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, notes } : b));
    };

    const statusMap = {
        confirmed: { label: '✓ Megerősítve', cls: s.statusConfirmed },
        pending:   { label: '⏳ Várakozik',  cls: s.statusPending },
        cancelled: { label: '✗ Lemondva',    cls: '' }
    };

    return (
        <div>
            {selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onStatusChange={handleStatus}
                    onNotesSaved={handleNotesSaved}
                />
            )}

            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Foglalások 📋</h1>
                    <p>{bookings.length} foglalás összesen</p>
                </div>
            </div>

            {/* P3: Search + Date filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    className="input"
                    placeholder="🔍 Keresés ügyfél neve vagy emailje alapján..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: '2 1 200px', fontSize: '0.9rem' }}
                />
                <input
                    type="date"
                    className="input"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    style={{ flex: '1 1 140px', fontSize: '0.9rem' }}
                    title="Dátumtól"
                />
                <input
                    type="date"
                    className="input"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    style={{ flex: '1 1 140px', fontSize: '0.9rem' }}
                    title="Dátumig"
                />
                {(search || dateFrom || dateTo) && (
                    <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }} className="btn btn-sm btn-secondary">
                        ✕ Szűrők törlése
                    </button>
                )}
            </div>

            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { val: 'all',       label: 'Összes',        count: bookings.length },
                    { val: 'pending',   label: '⏳ Várakozik',  count: bookings.filter(b => b.status === 'pending').length },
                    { val: 'confirmed', label: '✓ Megerősítve', count: bookings.filter(b => b.status === 'confirmed').length },
                    { val: 'cancelled', label: '✗ Lemondva',    count: bookings.filter(b => b.status === 'cancelled').length },
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

            {/* Team member filter (Profi only) */}
            {isProfi && teamMembers.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                    {[
                        { val: 'all',   label: '👥 Mindenki' },
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
            ) : filtered.length === 0 ? (
                <div className={s.contentCard} style={{ padding: 32, textAlign: 'center' }}>
                    <p style={{ color: 'var(--gray-500)' }}>Nincs a feltételeknek megfelelő foglalás.</p>
                </div>
            ) : (
                <div className={s.contentCard}>
                    {filtered.map(b => (
                        <div
                            key={b.id}
                            className={s.bookingItem}
                            style={{ padding: '16px 0', cursor: 'pointer', transition: 'background 0.15s' }}
                            onClick={() => setSelectedBooking(b)}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
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
                                    {b.notes && <span style={{ marginLeft: 8, color: 'var(--primary-500)' }}>📝</span>}
                                </div>
                            </div>
                            <span
                                className={`${s.bookingStatus} ${statusMap[b.status]?.cls || ''}`}
                                style={b.status === 'cancelled' ? { background: 'var(--error-light)', color: '#991b1b' } : {}}
                            >
                                {statusMap[b.status]?.label}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--gray-300)', marginLeft: 8 }}>›</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
