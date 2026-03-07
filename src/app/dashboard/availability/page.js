'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getAvailability, upsertAvailability } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

export default function AvailabilityPage() {
    const { profile } = useAuth();
    const [slots, setSlots] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [daysOff, setDaysOff] = useState([]);
    const [newDayOff, setNewDayOff] = useState({ startDate: '', endDate: '', reason: '' });

    // Load from DB
    useEffect(() => {
        async function load() {
            if (!profile?.id) return;
            const data = await getAvailability(profile.id);
            if (data && data.length > 0) {
                // Map DB rows to local state
                const mapped = dayNames.map((day, i) => {
                    const row = data.find(r => r.day_of_week === i);
                    return {
                        day, dayIndex: i,
                        active: row?.is_active ?? (i < 5),
                        start: row?.start_time?.slice(0, 5) || '09:00',
                        end: row?.end_time?.slice(0, 5) || '17:00',
                        hasBreak: !!(row?.break_start),
                        breakStart: row?.break_start?.slice(0, 5) || '12:00',
                        breakEnd: row?.break_end?.slice(0, 5) || '13:00',
                    };
                });
                setSlots(mapped);
            } else {
                // Default slots
                setSlots(dayNames.map((day, i) => ({
                    day, dayIndex: i, active: i < 5, hasBreak: true,
                    start: '09:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00',
                })));
            }
            // Load custom days off
            const { data: offDays } = await supabase.from('days_off').select('*')
                .eq('profile_id', profile.id).order('start_date');
            setDaysOff(offDays || []);
            setLoading(false);
        }
        load();
    }, [profile?.id]);

    const toggle = (i) => setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, active: !s.active } : s));

    const update = (i, field, value) => {
        setSlots(prev => prev.map((sl, idx) => {
            if (idx !== i) return sl;
            let updated = { ...sl, [field]: value };

            // When toggling break off, clear break times
            if (field === 'hasBreak' && !value) {
                updated.breakStart = '';
                updated.breakEnd = '';
            }
            // When toggling break on, set defaults if empty
            if (field === 'hasBreak' && value) {
                if (!updated.breakStart) updated.breakStart = '12:00';
                if (!updated.breakEnd) updated.breakEnd = '13:00';
            }

            // Clear old errors for this slot
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[i];
                return copy;
            });

            return updated;
        }));
    };

    const validate = () => {
        const newErrors = {};
        slots.forEach((slot, i) => {
            if (!slot.active) return;
            if (slot.start >= slot.end) {
                newErrors[i] = 'A kezdés nem lehet későbbi vagy egyenlő a befejezéssel!';
            } else if (slot.hasBreak && slot.breakStart && slot.breakEnd && slot.breakStart >= slot.breakEnd) {
                newErrors[i] = 'A szünet kezdete nem lehet későbbi a szünet végénél!';
            } else if (slot.hasBreak && slot.breakStart && (slot.breakStart < slot.start || slot.breakEnd > slot.end)) {
                newErrors[i] = 'A szünet nem lehet a munkaidőn kívül!';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (!profile?.id) return;

        setSaving(true);
        try {
            const dbSlots = slots.map(slot => ({
                profile_id: profile.id,
                day_of_week: slot.dayIndex,
                start_time: slot.start,
                end_time: slot.end,
                break_start: slot.hasBreak ? (slot.breakStart || null) : null,
                break_end: slot.hasBreak ? (slot.breakEnd || null) : null,
                is_active: slot.active,
            }));
            await upsertAvailability(dbSlots);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save error:', err);
            setErrors({ global: 'Hiba történt a mentésnél. Kérlek próbáld újra.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className={s.topBar}><div className={s.topBarLeft}><h1>Elérhetőség 🕐</h1></div></div>
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Betöltés...</div>
            </div>
        );
    }

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Elérhetőség 🕐</h1>
                    <p>Állítsd be, mikor fogadsz ügyfeleket</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? '⏳ Mentés...' : saved ? '✅ Mentve!' : '💾 Mentés'}
                    </button>
                </div>
            </div>

            {errors.global && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, marginBottom: 16, color: '#dc2626' }}>
                    ❌ {errors.global}
                </div>
            )}

            <div className={s.contentCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {slots.map((slot, i) => (
                        <div key={i}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                                borderRadius: 12, border: errors[i] ? '1px solid #fecaca' : '1px solid var(--gray-100)',
                                opacity: slot.active ? 1 : 0.4, background: slot.active ? (errors[i] ? '#fef2f2' : 'white') : 'var(--gray-50)',
                                transition: 'all 0.2s', flexWrap: 'wrap',
                            }}>
                                <button onClick={() => toggle(i)} style={{
                                    width: 44, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                                    background: slot.active ? 'var(--primary-500)' : 'var(--gray-200)', position: 'relative',
                                    transition: 'background 0.2s',
                                }}>
                                    <span style={{
                                        position: 'absolute', width: 22, height: 22, borderRadius: '50%', background: 'white',
                                        top: 3, left: slot.active ? 19 : 3, transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)',
                                    }} />
                                </button>
                                <span style={{ fontWeight: 600, minWidth: 90, color: 'var(--gray-700)' }}>{slot.day}</span>
                                {slot.active && (
                                    <>
                                        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Kezdés:</span>
                                            <input type="time" className="input" style={{ padding: '8px 12px', width: 120 }}
                                                value={slot.start} onChange={e => update(i, 'start', e.target.value)} />
                                        </div>
                                        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Befejezés:</span>
                                            <input type="time" className="input" style={{ padding: '8px 12px', width: 120 }}
                                                value={slot.end} onChange={e => update(i, 'end', e.target.value)} />
                                        </div>
                                        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => update(i, 'hasBreak', !slot.hasBreak)} style={{
                                                padding: '6px 10px', borderRadius: 8, border: '1px solid var(--gray-200)',
                                                background: slot.hasBreak ? 'var(--primary-50)' : 'var(--gray-50)',
                                                color: slot.hasBreak ? 'var(--primary-600)' : 'var(--gray-400)',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                                            }}>{slot.hasBreak ? '☕ Szünet:' : '☕ Nincs szünet'}</button>
                                            {slot.hasBreak && (
                                                <>
                                                    <input type="time" className="input" style={{ padding: '8px 12px', width: 100 }}
                                                        value={slot.breakStart} onChange={e => update(i, 'breakStart', e.target.value)} />
                                                    <span style={{ color: 'var(--gray-400)' }}>–</span>
                                                    <input type="time" className="input" style={{ padding: '8px 12px', width: 100 }}
                                                        value={slot.breakEnd} onChange={e => update(i, 'breakEnd', e.target.value)} />
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                                {!slot.active && <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Szabadnap</span>}
                            </div>
                            {errors[i] && (
                                <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '4px 0 0 60px' }}>⚠️ {errors[i]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom days off */}
            <div className={s.contentCard} style={{ marginTop: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>🏖️ Egyedi szabadnapok</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>Adj hozzá olyan napokat, amikor nem vagy elérhető (nyaralás, születésnap, stb.)</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
                        <label className="input-label">Mikortól</label>
                        <input type="date" className="input" value={newDayOff.startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setNewDayOff(p => ({ ...p, startDate: e.target.value, endDate: p.endDate < e.target.value ? e.target.value : p.endDate }))} />
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: 140 }}>
                        <label className="input-label">Meddig</label>
                        <input type="date" className="input" value={newDayOff.endDate}
                            min={newDayOff.startDate || new Date().toISOString().split('T')[0]}
                            onChange={e => setNewDayOff(p => ({ ...p, endDate: e.target.value }))} />
                    </div>
                    <div className="input-group" style={{ flex: 2, minWidth: 180 }}>
                        <label className="input-label">Ok (opcionális)</label>
                        <input className="input" placeholder="pl. Nyaralás, Születésnap..." value={newDayOff.reason}
                            onChange={e => setNewDayOff(p => ({ ...p, reason: e.target.value }))} />
                    </div>
                    <button onClick={async () => {
                        if (!newDayOff.startDate || !newDayOff.endDate || !profile?.id) return;
                        try {
                            const { data, error } = await supabase.from('days_off').insert({
                                profile_id: profile.id, start_date: newDayOff.startDate, end_date: newDayOff.endDate, reason: newDayOff.reason || null,
                                date: newDayOff.startDate // backward compat: old 'date' column may still exist with NOT NULL
                            }).select().single();
                            if (error) {
                                console.error('Days off insert error:', error);
                                alert('Hiba: ' + error.message);
                                return;
                            }
                            if (data) {
                                setDaysOff(prev => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)));
                                setNewDayOff({ startDate: '', endDate: '', reason: '' });
                            }
                        } catch (err) {
                            console.error('Days off error:', err);
                            alert('Hiba történt a mentésnél: ' + err.message);
                        }
                    }} className="btn btn-primary btn-sm" disabled={!newDayOff.startDate || !newDayOff.endDate}>+ Hozzáadás</button>
                </div>
                {daysOff.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Nincs beállítva egyedi szabadnap.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {daysOff.map(d => {
                            const start = new Date(d.start_date + 'T00:00');
                            const end = new Date(d.end_date + 'T00:00');
                            const isSame = d.start_date === d.end_date;
                            const label = isSame
                                ? start.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', weekday: 'short' })
                                : `${start.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}`;
                            return (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--gray-100)', background: 'white' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🏖️</span>
                                    <span style={{ fontWeight: 600, minWidth: 140 }}>{label}</span>
                                    <span style={{ flex: 1, color: 'var(--gray-500)', fontSize: '0.85rem' }}>{d.reason || ''}</span>
                                    <button onClick={async () => {
                                        await supabase.from('days_off').delete().eq('id', d.id);
                                        setDaysOff(prev => prev.filter(x => x.id !== d.id));
                                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626' }}>🗑️</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
