'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getBookings } from '@/lib/db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

const weekDays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

export default function CalendarPage() {
    const { profile } = useAuth();
    const [view, setView] = useState('week');
    const [selectedDay, setSelectedDay] = useState(0);
    const [events, setEvents] = useState([]);
    const [availability, setAvailability] = useState([]);

    const today = new Date();

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            Promise.all([
                getBookings(profile.id),
                supabase.from('availability').select('*').eq('profile_id', profile.id).eq('is_active', true),
            ]).then(([bookingData, { data: availData }]) => {
                const mapped = bookingData.map(b => {
                    const h = parseInt(b.start_time?.split(':')[0] || '9');
                    const m = parseInt(b.start_time?.split(':')[1] || '0');
                    const dur = b.services?.duration_minutes || 30;
                    const d = new Date(b.booking_date);
                    const dayOfWeek = (d.getDay() + 6) % 7;
                    return { day: dayOfWeek, startH: h + m / 60, dur: dur / 60, name: b.client_name, service: b.services?.name || 'Foglalás', color: 'var(--primary-200)' };
                });
                setEvents(mapped);
                setAvailability(availData || []);
            });
        }
    }, [profile]);

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

    const getDateStr = (offset) => {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + 1 + offset);
        return `${d.getMonth() + 1}.${d.getDate()}.`;
    };

    const isEmpty = events.length === 0;

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Naptár 📅</h1>
                    <p>Heti nézet – {today.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={() => setView('week')} className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}>Heti</button>
                    <button onClick={() => setView('day')} className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}>Napi</button>
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
                {view === 'week' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', minWidth: 900 }}>
                        <div style={{ padding: 12, borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}></div>
                        {weekDays.map((d, i) => (
                            <div key={i} style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid var(--gray-100)', borderLeft: '1px solid var(--gray-100)', background: i === ((today.getDay() + 6) % 7) ? 'var(--primary-50)' : 'var(--gray-50)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>{d}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: i === ((today.getDay() + 6) % 7) ? 'var(--primary-600)' : 'var(--gray-800)' }}>{getDateStr(i)}</div>
                            </div>
                        ))}
                        {hours.map(h => (
                            <div key={h} style={{ display: 'contents' }}>
                                <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--gray-400)', textAlign: 'right', borderBottom: '1px solid var(--gray-50)', height: 64, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                    {h}:00
                                </div>
                                {weekDays.map((_, di) => {
                                    const dayEvents = events.filter(e => e.day === di && Math.floor(e.startH) === h);
                                    return (
                                        <div key={di} style={{ borderLeft: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-50)', padding: 2, height: 64, position: 'relative' }}>
                                            {dayEvents.map((ev, ei) => (
                                                <div key={ei} style={{
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
                ) : (
                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                            {weekDays.map((d, i) => (
                                <button key={i} onClick={() => setSelectedDay(i)} className="btn btn-sm" style={{
                                    background: selectedDay === i ? 'var(--primary-500)' : 'white', color: selectedDay === i ? 'white' : 'var(--gray-600)',
                                    border: `1.5px solid ${selectedDay === i ? 'var(--primary-500)' : 'var(--gray-200)'}`, flex: 1,
                                }}>{d.slice(0, 2)}</button>
                            ))}
                        </div>
                        {halfHourSlots.map((slot, idx) => {
                            const isHalfHour = slot.m === 30;
                            const dayEvents = events.filter(e =>
                                e.day === selectedDay &&
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
                                            <div key={i} style={{ background: ev.color || 'var(--primary-200)', padding: '10px 14px', borderRadius: 10, marginBottom: 4, borderLeft: '3px solid var(--primary-500)' }}>
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
            </div>
        </div>
    );
}
