'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookings, updateBookingStatus } from '@/lib/db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

// ─── Mini booking popup in calendar ─────────────────────────────────────────
function CalendarBookingPopup({ booking, onClose, onStatusChange }) {
    const statusLabels = {
        confirmed: { label: '✓ Megerősítve', bg: '#dcfce7', color: '#166534' },
        pending:   { label: '⏳ Várakozik',  bg: '#fef9c3', color: '#854d0e' },
        cancelled: { label: '✗ Lemondva',    bg: '#fee2e2', color: '#991b1b' },
    };
    const st = statusLabels[booking.status] || statusLabels.pending;

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-800)' }}>{booking.client_name}</div>
                        <span style={{ display: 'inline-block', marginTop: 4, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><span style={{ color: 'var(--gray-500)' }}>📋 Szolgáltatás: </span><strong>{booking.services?.name || '–'}</strong></div>
                    <div><span style={{ color: 'var(--gray-500)' }}>📅 Dátum: </span><strong>{booking.booking_date}</strong></div>
                    <div><span style={{ color: 'var(--gray-500)' }}>🕐 Időpont: </span><strong>{booking.start_time?.slice(0,5)} • {booking.services?.duration_minutes || 30} perc</strong></div>
                    <div><span style={{ color: 'var(--gray-500)' }}>📧 E-mail: </span><strong>{booking.client_email}</strong></div>
                    {booking.client_phone && <div><span style={{ color: 'var(--gray-500)' }}>📞 Telefon: </span><strong>{booking.client_phone}</strong></div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {booking.status === 'pending' && (
                        <button onClick={() => { onStatusChange(booking.id, 'confirmed'); onClose(); }} className="btn btn-sm" style={{ background: '#22c55e', color: 'white', flex: 1 }}>✓ Megerősítés</button>
                    )}
                    {booking.status !== 'cancelled' && (
                        <button onClick={async () => {
                            if (!confirm('Biztosan lemondod? Az ügyfél értesítést kap emailben.')) return;
                            onStatusChange(booking.id, 'cancelled');
                            // Send cancellation email to client
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
                            } catch (e) { console.warn('Cancel email error:', e); }
                            onClose();
                        }} className="btn btn-sm" style={{ background: 'var(--error-light)', color: '#991b1b', flex: 1 }}>✗ Lemondás</button>
                    )}
                    <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ flex: 1 }}>Bezárás</button>
                </div>
            </div>
        </div>
    );
}

const weekDays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
const dayAbbr  = ['H',     'K',    'Sze',    'Cs',        'P',      'Szo',     'V'];

// ISO week number helper
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Pad to 2 digits
function pad2(n) { return String(n).padStart(2, '0'); }

// Format date as MM.DD.
function fmtDate(d) { return `${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}.`; }

// Format date as YYYY-MM-DD (for matching booking_date)
function toDateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

export default function CalendarPage() {
    const { profile, teamMemberInfo } = useAuth();
    const effectiveProfileId = teamMemberInfo?.ownerProfileId || profile?.id;
    const [view, setView] = useState('week');
    const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7); // default to today
    const [events, setEvents] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [monthDayPopup, setMonthDayPopup] = useState(null); // { dateStr, events }
    const [daysOff, setDaysOff] = useState([]); // szabadnapok

    const today = new Date();
    const weekNum = getWeekNumber(today);

    // Default to day view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setView('day');
        }
    }, []);

    useEffect(() => {
        if (isSupabaseConfigured && effectiveProfileId) {
            Promise.all([
                getBookings(effectiveProfileId),
                supabase.from('availability').select('*').eq('profile_id', effectiveProfileId).eq('is_active', true),
                supabase.from('days_off').select('*').eq('profile_id', effectiveProfileId).order('start_date'),
            ]).then(([bookingData, { data: availData }, { data: offData }]) => {
                setDaysOff(offData || []);
                const filtered = teamMemberInfo
                    ? bookingData.filter(b => b.team_member_id === teamMemberInfo.teamMemberId)
                    : bookingData;
                const mapped = filtered.map(b => {
                    const h = parseInt(b.start_time?.split(':')[0] || '9');
                    const m = parseInt(b.start_time?.split(':')[1] || '0');
                    const dur = b.services?.duration_minutes || 30;
                    const d = new Date(b.booking_date);
                    const dayOfWeek = (d.getDay() + 6) % 7;
                    return { day: dayOfWeek, startH: h + m / 60, dur: dur / 60, name: b.client_name, service: b.services?.name || 'Foglalás', color: 'var(--primary-200)', raw: b };
                });
                setEvents(mapped);
                setAvailability(availData || []);
            });
        }
    }, [profile, teamMemberInfo]);

    // Calculate time range from availability settings
    const getTimeRange = () => {
        if (availability.length === 0) return { start: 8, end: 18 };
        const starts = availability.map(a => parseInt(a.start_time?.split(':')[0] || '8'));
        const ends = availability.map(a => {
            const [h, m] = (a.end_time || '18:00').split(':').map(Number);
            return m > 0 ? h + 1 : h;
        });
        return { start: Math.min(...starts), end: Math.max(...ends) };
    };

    const timeRange = getTimeRange();

    // Full hours for weekly view
    const hours = Array.from({ length: timeRange.end - timeRange.start }, (_, i) => i + timeRange.start);

    // Half-hour slots for daily view
    const halfHourSlots = [];
    for (let h = timeRange.start; h < timeRange.end; h++) {
        halfHourSlots.push({ h, m: 0, decimal: h, label: `${h}:00` });
        halfHourSlots.push({ h, m: 30, decimal: h + 0.5, label: `${h}:30` });
    }

    // Date for week column (by day index 0=Monday)
    const getWeekDate = (offset) => {
        const d = new Date(today);
        d.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset);
        return d;
    };

    // Date string for week header (padded 2 digits)
    const getDateStr = (offset) => fmtDate(getWeekDate(offset));

    // Full date string for matching days_off
    const getWeekDateStr = (offset) => toDateStr(getWeekDate(offset));

    // Month grid for monthly view
    const getMonthGrid = () => {
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
        const daysInMonth = lastDay.getDate();

        const days = [];
        // Previous month padding
        for (let i = startDow - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, dateStr: toDateStr(d), isCurrentMonth: false, dayNum: d.getDate() });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, dateStr: toDateStr(d), isCurrentMonth: true, dayNum: i });
        }
        // Next month padding
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let i = 1; i <= remaining; i++) {
                const d = new Date(year, month + 1, i);
                days.push({ date: d, dateStr: toDateStr(d), isCurrentMonth: false, dayNum: i });
            }
        }
        return days;
    };

    // Check if a date string (YYYY-MM-DD) falls within any day off
    const getDayOff = (dateStr) => {
        return daysOff.find(d => dateStr >= d.start_date && dateStr <= d.end_date);
    };

    const handleStatusChange = async (id, status) => {
        if (isSupabaseConfigured) await updateBookingStatus(id, status);
        setEvents(prev => prev.map(ev => ev.raw?.id === id ? { ...ev, raw: { ...ev.raw, status } } : ev));
    };

    const isEmpty = events.length === 0;
    const todayStr = toDateStr(today);

    // View subtitle
    const viewSubtitle = view === 'week'
        ? `Heti nézet – ${weekNum}. hét – ${today.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}`
        : view === 'day'
        ? `Napi nézet – ${weekDays[selectedDay]} – ${today.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}`
        : `Havi nézet – ${today.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })} – ${weekNum}. hét`;

    return (
        <div>
            {selectedBooking && (
                <CalendarBookingPopup
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Naptár 📅</h1>
                    <p>{viewSubtitle}</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={() => setView('day')} className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}>Napi</button>
                    <button onClick={() => setView('week')} className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}>Heti</button>
                    <button onClick={() => setView('month')} className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}>Havi</button>
                </div>
            </div>

            {isEmpty && (
                <div className={s.contentCard} style={{ padding: 40, textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>A naptárad még üres</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                        Amint ügyfelek foglalnak időpontot, itt fognak megjelenni a foglalásaid.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <Link href="/dashboard/embed" className="btn btn-primary btn-sm">🔗 Foglalási link megosztása</Link>
                        <Link href="/dashboard/services" className="btn btn-secondary btn-sm">📋 Szolgáltatások beállítása</Link>
                    </div>
                </div>
            )}

            <div className={s.contentCard} style={{ overflow: 'auto', padding: 0 }}>
                {/* ─── WEEKLY VIEW ─── */}
                {view === 'week' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', minWidth: 900 }}>
                        <div style={{ padding: 12, borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-500)' }}>{weekNum}. hét</span>
                        </div>
                        {weekDays.map((d, i) => {
                            const dayOff = getDayOff(getWeekDateStr(i));
                            const isToday = i === ((today.getDay() + 6) % 7);
                            return (
                                <div key={i} style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid var(--gray-100)', borderLeft: '1px solid var(--gray-100)', background: dayOff ? '#fef2f2' : isToday ? 'var(--primary-50)' : 'var(--gray-50)' }}>
                                    <div style={{ fontSize: '0.8rem', color: dayOff ? '#dc2626' : 'var(--gray-500)', fontWeight: 500 }}>{d}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: dayOff ? '#dc2626' : isToday ? 'var(--primary-600)' : 'var(--gray-800)' }}>{getDateStr(i)}</div>
                                    {dayOff && <div style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 600, marginTop: 2 }}>🏖️ {dayOff.reason || 'Szabadnap'}</div>}
                                </div>
                            );
                        })}
                        {hours.map(h => (
                            <div key={h} style={{ display: 'contents' }}>
                                <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--gray-400)', textAlign: 'right', borderBottom: '1px solid var(--gray-50)', height: 64, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                    {h}:00
                                </div>
                                {weekDays.map((_, di) => {
                                    const weekDate = getWeekDateStr(di);
                                    const dayEvents = events.filter(e => e.raw?.booking_date === weekDate && Math.floor(e.startH) === h);
                                    return (
                                        <div key={di} style={{ borderLeft: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-50)', padding: 2, height: 64, position: 'relative' }}>
                                            {dayEvents.map((ev, ei) => (
                                                <div key={ei} onClick={() => ev.raw && setSelectedBooking(ev.raw)} style={{
                                                    position: 'absolute', top: (ev.startH - h) * 64,
                                                    left: 2, right: 2, height: Math.max(ev.dur * 64 - 2, 20),
                                                    background: ev.color || 'var(--primary-200)', borderRadius: 6, padding: '4px 8px',
                                                    fontSize: '0.75rem', overflow: 'hidden', cursor: 'pointer',
                                                    borderLeft: '3px solid var(--primary-500)',
                                                }}>
                                                    <strong>{ev.name}</strong>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)' }}>{ev.service}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── DAILY VIEW ─── */}
                {view === 'day' && (
                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            {weekDays.map((d, i) => {
                                const dayDate = getWeekDateStr(i);
                                const dayOff = getDayOff(dayDate);
                                const isToday = dayDate === todayStr;
                                return (
                                    <button key={i} onClick={() => setSelectedDay(i)} className="btn btn-sm" style={{
                                        background: dayOff ? '#fef2f2' : selectedDay === i ? 'var(--primary-500)' : 'white',
                                        color: dayOff ? '#dc2626' : selectedDay === i ? 'white' : 'var(--gray-600)',
                                        border: `1.5px solid ${dayOff ? '#fca5a5' : selectedDay === i ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                                        flex: 1, position: 'relative',
                                    }}>
                                        {dayAbbr[i]}
                                        {isToday && <span style={{ fontSize: '0.55rem', position: 'absolute', bottom: 2, right: 4, color: selectedDay === i ? 'rgba(255,255,255,0.7)' : 'var(--primary-400)' }}>ma</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                            {weekDays[selectedDay]} – {getWeekDateStr(selectedDay).replace(/-/g, '.')}
                            {getDayOff(getWeekDateStr(selectedDay)) && (
                                <span style={{ marginLeft: 8, color: '#dc2626', fontWeight: 600 }}>🏖️ {getDayOff(getWeekDateStr(selectedDay)).reason || 'Szabadnap'}</span>
                            )}
                        </div>
                        {halfHourSlots.map((slot, idx) => {
                            const isHalfHour = slot.m === 30;
                            const selectedDayDateStr = getWeekDateStr(selectedDay);
                            const dayEvents = events.filter(e =>
                                e.raw?.booking_date === selectedDayDateStr &&
                                e.startH >= slot.decimal &&
                                e.startH < slot.decimal + 0.5
                            );
                            return (
                                <div key={idx} style={{
                                    display: 'flex', gap: 16,
                                    padding: isHalfHour ? '6px 0' : '10px 0 6px',
                                    borderBottom: `1px solid ${isHalfHour ? 'var(--gray-50)' : 'var(--gray-100)'}`,
                                    minHeight: 32,
                                }}>
                                    <span style={{
                                        minWidth: 50, fontSize: isHalfHour ? '0.75rem' : '0.85rem',
                                        color: isHalfHour ? 'var(--gray-300)' : 'var(--gray-400)',
                                        textAlign: 'right', paddingTop: 2,
                                    }}>{slot.label}</span>
                                    <div style={{ flex: 1 }}>
                                        {dayEvents.map((ev, i) => (
                                            <div key={i} onClick={() => ev.raw && setSelectedBooking(ev.raw)} style={{ background: ev.color || 'var(--primary-200)', padding: '10px 14px', borderRadius: 10, marginBottom: 4, borderLeft: '3px solid var(--primary-500)', cursor: 'pointer' }}>
                                                <strong style={{ fontSize: '0.9rem' }}>{ev.name}</strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginLeft: 8 }}>{ev.service} • {Math.round(ev.dur * 60)} perc</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ─── MONTHLY VIEW ─── */}
                {view === 'month' && (() => {
                    const monthDays = getMonthGrid();
                    const weeks = [];
                    for (let i = 0; i < monthDays.length; i += 7) {
                        weeks.push(monthDays.slice(i, i + 7));
                    }
                    return (
                        <div style={{ padding: 0 }}>
                            {/* Month header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)' }}>
                                <div style={{ padding: 10, background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)', textAlign: 'center', fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600 }}>Hét</div>
                                {dayAbbr.map((d, i) => (
                                    <div key={i} style={{ padding: 10, textAlign: 'center', borderBottom: '1px solid var(--gray-100)', borderLeft: '1px solid var(--gray-100)', background: 'var(--gray-50)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)' }}>{d}</div>
                                ))}
                            </div>
                            {/* Month rows */}
                            {weeks.map((week, wi) => {
                                const weekNumRow = getWeekNumber(week.find(d => d.isCurrentMonth)?.date || week[0].date);
                                return (
                                    <div key={wi} style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)' }}>
                                        <div style={{ padding: 8, textAlign: 'center', borderBottom: '1px solid var(--gray-50)', fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {weekNumRow}.
                                        </div>
                                        {week.map((day, di) => {
                                            const dayEvts = events.filter(ev => ev.raw?.booking_date === day.dateStr);
                                            const isToday = day.dateStr === todayStr;
                                            const dayOff = getDayOff(day.dateStr);
                                            const hasEvents = dayEvts.length > 0;
                                            return (
                                                <div
                                                    key={di}
                                                    onClick={() => {
                                                        if (hasEvents) {
                                                            setMonthDayPopup({ dateStr: day.dateStr, date: day.date, events: dayEvts });
                                                        }
                                                    }}
                                                    style={{
                                                        borderLeft: '1px solid var(--gray-100)',
                                                        borderBottom: '1px solid var(--gray-50)',
                                                        padding: 8,
                                                        minHeight: 80,
                                                        background: dayOff ? '#fef2f2' : isToday ? 'var(--primary-50)' : 'white',
                                                        opacity: day.isCurrentMonth ? 1 : 0.35,
                                                        cursor: hasEvents ? 'pointer' : 'default',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => { if (hasEvents && !dayOff) e.currentTarget.style.background = 'var(--primary-50)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = dayOff ? '#fef2f2' : isToday ? 'var(--primary-50)' : 'white'; }}
                                                >
                                                    <div style={{
                                                        fontWeight: isToday ? 800 : 600,
                                                        fontSize: '0.85rem',
                                                        color: dayOff ? '#dc2626' : isToday ? 'var(--primary-600)' : 'var(--gray-700)',
                                                        marginBottom: 4,
                                                    }}>
                                                        {pad2(day.dayNum)}
                                                    </div>
                                                    {dayOff && (
                                                        <div style={{ fontSize: '0.6rem', padding: '2px 6px', marginBottom: 2, borderRadius: 4, background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>
                                                            🏖️ {dayOff.reason || 'Szabadnap'}
                                                        </div>
                                                    )}
                                                    {/* Event indicators */}
                                                    {dayEvts.slice(0, 3).map((ev, ei) => (
                                                        <div key={ei} style={{
                                                            fontSize: '0.65rem',
                                                            padding: '2px 6px',
                                                            marginBottom: 2,
                                                            borderRadius: 4,
                                                            background: ev.raw?.status === 'cancelled' ? '#fee2e2' : 'var(--primary-100)',
                                                            color: ev.raw?.status === 'cancelled' ? '#991b1b' : 'var(--primary-700)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {ev.raw?.start_time?.slice(0, 5)} {ev.name}
                                                        </div>
                                                    ))}
                                                    {dayEvts.length > 3 && (
                                                        <div style={{ fontSize: '0.6rem', color: 'var(--gray-400)', paddingLeft: 6 }}>+{dayEvts.length - 3} további</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* ─── Month day popup (when clicking a day with events) ─── */}
            {monthDayPopup && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setMonthDayPopup(null)}
                >
                    <div
                        style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
                                📅 {monthDayPopup.date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            <button onClick={() => setMonthDayPopup(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {monthDayPopup.events.map((ev, i) => {
                                const statusColors = {
                                    confirmed: { bg: '#dcfce7', border: '#22c55e' },
                                    pending: { bg: '#fef9c3', border: '#eab308' },
                                    cancelled: { bg: '#fee2e2', border: '#ef4444' },
                                };
                                const sc = statusColors[ev.raw?.status] || statusColors.pending;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => { setMonthDayPopup(null); setSelectedBooking(ev.raw); }}
                                        style={{
                                            padding: '12px 16px', borderRadius: 10,
                                            background: sc.bg, borderLeft: `3px solid ${sc.border}`,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>{ev.raw?.start_time?.slice(0, 5)} – {ev.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{ev.service} • {Math.round(ev.dur * 60)} perc</div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => setMonthDayPopup(null)} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 16 }}>Bezárás</button>
                    </div>
                </div>
            )}
        </div>
    );
}
