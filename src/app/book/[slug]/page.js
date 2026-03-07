'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../book.module.css';

function generateSlots(start, end, breakStart, breakEnd, duration, bookedRanges, isToday) {
    const slots = [];
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const bsMin = breakStart ? breakStart.split(':').map(Number).reduce((h, m) => h * 60 + m) : null;
    const beMin = breakEnd ? breakEnd.split(':').map(Number).reduce((h, m) => h * 60 + m) : null;

    // Current time filter for today
    const now = new Date();
    const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

    while (cur + duration <= endMin) {
        // Skip break times
        if (bsMin !== null && beMin !== null && cur >= bsMin && cur < beMin) { cur += 30; continue; }
        // Skip past times for today
        if (isToday && cur < nowMin) { cur += 30; continue; }

        const slotEnd = cur + duration;
        // Check if this slot overlaps with any existing booking range
        const isBooked = bookedRanges.some(range => {
            const bStart = range.start;
            const bEnd = range.end;
            // Overlap: slot starts before booking ends AND slot ends after booking starts
            return cur < bEnd && slotEnd > bStart;
        });

        if (!isBooked) {
            const hh = String(Math.floor(cur / 60)).padStart(2, '0');
            const mm = String(cur % 60).padStart(2, '0');
            slots.push(`${hh}:${mm}`);
        }
        cur += 30;
    }
    return slots;
}

const businessTypeIcons = {
    'hair_salon': '💇',
    'beauty_salon': '💅',
    'barber': '💈',
    'nail_salon': '💅',
    'massage': '💆',
    'fitness': '🏋️',
    'doctor': '🏥',
    'dentist': '🦷',
    'consultant': '💼',
    'tutor': '📚',
    'photographer': '📷',
    'other': '📅',
};

export default function BookingPage({ params }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [provider, setProvider] = useState(null);
    const [services, setServices] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [daysOff, setDaysOff] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [monthOffset, setMonthOffset] = useState(0);

    const [selectedMember, setSelectedMember] = useState(null); // null = owner, or team_member id
    const hasTeam = teamMembers.length > 0;
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
    const [booked, setBooked] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Step mapping: with team → 1=member, 2=service, 3=date, 4=form; without team → 1=service, 2=date, 3=form
    const STEP_MEMBER = hasTeam ? 1 : -1;
    const STEP_SERVICE = hasTeam ? 2 : 1;
    const STEP_DATE = hasTeam ? 3 : 2;
    const STEP_FORM = hasTeam ? 4 : 3;
    const TOTAL_STEPS = hasTeam ? 4 : 3;

    // Load provider and services from Supabase
    useEffect(() => {
        async function loadData() {
            if (!isSupabaseConfigured || !supabase) {
                setError('A rendszer jelenleg nem elérhető.');
                setLoadingData(false);
                return;
            }

            try {
                // 1. Find provider by slug
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (profileError || !profile) {
                    setError('Ez a szolgáltató nem található.');
                    setLoadingData(false);
                    return;
                }

                setProvider(profile);

                // Inject Meta Pixel if provider has one
                if (profile.meta_pixel_id) {
                    const pixelId = profile.meta_pixel_id;
                    if (!window.fbq) {
                        const script = document.createElement('script');
                        script.innerHTML = `
                            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                            document,'script','https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${pixelId}');
                            fbq('track', 'PageView');
                        `;
                        document.head.appendChild(script);
                    }
                }

                // 2. Load team members (for Profi providers)
                if (profile.subscription_tier === 'pro') {
                    const { data: team } = await supabase.from('team_members').select('*')
                        .eq('owner_profile_id', profile.id).eq('is_active', true).order('created_at');
                    setTeamMembers(team || []);
                }

                // 3. Load services
                const { data: svcs } = await supabase.from('services').select('*')
                    .eq('profile_id', profile.id).eq('is_active', true)
                    .order('sort_order').order('name');
                setServices(svcs || []);

                // 4. Load availability
                const { data: avail } = await supabase.from('availability').select('*')
                    .eq('profile_id', profile.id);
                setAvailability(avail || []);

                // 5. Load existing bookings (next 90 days)
                const today = new Date().toISOString().split('T')[0];
                const future = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
                const { data: bookings } = await supabase.from('bookings').select('booking_date, start_time, end_time, team_member_id')
                    .eq('profile_id', profile.id).eq('status', 'confirmed')
                    .gte('booking_date', today).lte('booking_date', future);
                setBookedSlots(bookings || []);

                // 6. Load days off (date ranges)
                const { data: off } = await supabase.from('days_off').select('start_date, end_date')
                    .eq('profile_id', profile.id);
                setDaysOff(off || []);
            } catch (err) {
                console.error('Load error:', err);
                setError('Hiba történt az adatok betöltésekor.');
            } finally {
                setLoadingData(false);
            }
        }

        loadData();
    }, [slug]);

    const today = new Date();
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const monthName = viewDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });

    // Filter services and availability by selected team member
    const filteredServices = services.filter(s => {
        if (!hasTeam) return true; // no team → show all (owner's)
        if (selectedMember === 'owner') return !s.team_member_id; // owner selected
        return s.team_member_id === selectedMember || !s.team_member_id; // member selected → show member's + owner's shared
    });
    const filteredAvailability = availability.filter(a => {
        if (!hasTeam) return true;
        if (selectedMember === 'owner') return !a.team_member_id;
        return a.team_member_id === selectedMember || !a.team_member_id;
    });
    const filteredBookedSlots = bookedSlots.filter(b => {
        if (!hasTeam) return true;
        if (selectedMember === 'owner') return !b.team_member_id;
        return b.team_member_id === selectedMember;
    });

    const svc = filteredServices.find(s => s.id === selectedService);

    // Get available time slots for selected date
    const getTimeSlotsForDate = (day) => {
        if (!day || !svc) return [];
        const dateObj = new Date(viewYear, viewMonth, day);
        const dayOfWeek = (dateObj.getDay() + 6) % 7; // 0=Monday
        const avail = filteredAvailability.find(a => a.day_of_week === dayOfWeek && a.is_active);
        if (!avail) return [];
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Build booked time ranges (start + end in minutes) for proper overlap detection
        const dayBookings = filteredBookedSlots.filter(b => b.booking_date === dateStr).map(b => {
            const [bsh, bsm] = (b.start_time || '00:00').slice(0, 5).split(':').map(Number);
            const [beh, bem] = (b.end_time || b.start_time || '00:30').slice(0, 5).split(':').map(Number);
            return { start: bsh * 60 + bsm, end: beh * 60 + bem };
        });

        // Check if this is today
        const todayObj = new Date();
        const isToday = dateObj.getFullYear() === todayObj.getFullYear() && dateObj.getMonth() === todayObj.getMonth() && dateObj.getDate() === todayObj.getDate();

        return generateSlots(avail.start_time?.slice(0, 5) || '09:00', avail.end_time?.slice(0, 5) || '17:00',
            avail.break_start?.slice(0, 5), avail.break_end?.slice(0, 5), svc.duration_minutes || 30, dayBookings, isToday);
    };

    const isDayAvailable = (day) => {
        const dateObj = new Date(viewYear, viewMonth, day);
        if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (daysOff.some(d => dateStr >= d.start_date && dateStr <= d.end_date)) return false;
        const dow = (dateObj.getDay() + 6) % 7;
        return filteredAvailability.some(a => a.day_of_week === dow && a.is_active);
    };

    const availableTimesForDay = getTimeSlotsForDate(selectedDate);

    const selectedMemberName = selectedMember === 'owner'
        ? (provider?.name || provider?.business_name)
        : teamMembers.find(m => m.id === selectedMember)?.name;

    const handleBook = async () => {
        if (!form.name || !form.email || !form.phone) return;
        setBookingLoading(true);
        try {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
            await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: form.name,
                    clientEmail: form.email,
                    clientPhone: form.phone,
                    notes: form.notes,
                    serviceName: svc?.name,
                    serviceId: svc?.id,
                    duration: svc?.duration_minutes,
                    price: svc?.price,
                    date: dateStr,
                    time: selectedTime,
                    slug: slug,
                    teamMemberId: (hasTeam && selectedMember !== 'owner') ? selectedMember : null,
                }),
            });
            setBooked(true);
            // Fire Meta Pixel Lead event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead', { content_name: svc?.name, value: svc?.price, currency: 'HUF' });
            }
        } catch (err) {
            console.error('Booking error:', err);
            setBooked(true);
        } finally {
            setBookingLoading(false);
        }
    };

    // Loading state
    if (loadingData) {
        return (
            <div className={s.bookingPage}>
                <div className={s.bookingContainer}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>📅</div>
                        <p style={{ color: 'var(--gray-500)' }}>Betöltés...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={s.bookingPage}>
                <div className={s.bookingContainer}>
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>😕</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>{error}</h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Kérjük ellenőrizze a linket, vagy próbálja újra később.</p>
                        <Link href="/" className="btn btn-primary">← Vissza a főoldalra</Link>
                    </div>
                </div>
            </div>
        );
    }

    // No services (only check when member is selected or no team)
    if (!hasTeam && services.length === 0) {
        return (
            <div className={s.bookingPage}>
                <div className={s.bookingContainer}>
                    <div className={s.bookingHeader}>
                        <div className={s.providerAvatar}>{businessTypeIcons[provider?.business_type] || '📅'}</div>
                        <h1 className={s.providerName}>{provider?.business_name || 'Szolgáltató'}</h1>
                        {provider?.business_type && <p className={s.providerType}>{provider.business_type}</p>}
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ color: 'var(--gray-500)' }}>Ez a szolgáltató jelenleg nem rendelkezik aktív szolgáltatásokkal.</p>
                    </div>
                </div>
            </div>
        );
    }

    const icon = businessTypeIcons[provider?.business_type] || '📅';

    return (
        <div className={s.bookingPage}>
            <div className={s.bookingContainer}>
                <div className={s.bookingHeader}>
                    {provider?.avatar_url ? (
                        <img src={provider.avatar_url} alt={provider?.business_name} style={{
                            width: 56, height: 56, borderRadius: 14, objectFit: 'cover',
                            border: '2px solid var(--gray-100)'
                        }} />
                    ) : (
                        <div className={s.providerAvatar}>{icon}</div>
                    )}
                    <h1 className={s.providerName}>{provider?.business_name || 'Szolgáltató'}</h1>
                    {provider?.business_type && <p className={s.providerType}>{provider.business_type}</p>}
                    {(provider?.address || provider?.city) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
                            📍 {[provider.address, provider.city].filter(Boolean).join(', ')}
                        </p>
                    )}
                </div>

                {!booked && (
                    <div className={s.bookingCard}>
                        <div className={s.stepIndicator}>
                            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                                const stepNum = i + 1;
                                return (
                                    <div key={stepNum} style={{ display: 'contents' }}>
                                        {i > 0 && <div className={`${s.stepLine} ${step > stepNum - 1 ? s.done : ''}`} />}
                                        <div className={`${s.stepDot} ${step >= stepNum ? (step > stepNum ? s.done : s.active) : s.inactive}`}>
                                            {step > stepNum ? '✓' : stepNum}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* STEP: Team member selection (Profi only) */}
                        {step === STEP_MEMBER && hasTeam && (
                            <>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Kivel szeretnél foglalni?</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                                    {/* Owner card */}
                                    <div onClick={() => setSelectedMember('owner')} style={{
                                        padding: 20, borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                                        border: selectedMember === 'owner' ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                        background: selectedMember === 'owner' ? 'var(--primary-50)' : 'white',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 14, margin: '0 auto 10px',
                                            background: 'linear-gradient(135deg, var(--primary-300), var(--accent-300))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '1.2rem',
                                        }}>{(provider?.name || 'T')[0].toUpperCase()}</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>{provider?.name || 'Tulajdonos'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>Tulajdonos</div>
                                    </div>
                                    {/* Team member cards */}
                                    {teamMembers.map(m => (
                                        <div key={m.id} onClick={() => setSelectedMember(m.id)} style={{
                                            padding: 20, borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                                            border: selectedMember === m.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                            background: selectedMember === m.id ? 'var(--primary-50)' : 'white',
                                            transition: 'all 0.2s',
                                        }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 14, margin: '0 auto 10px',
                                                background: 'linear-gradient(135deg, var(--primary-300), var(--accent-300))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 700, fontSize: '1.2rem',
                                            }}>{(m.name || '?')[0].toUpperCase()}</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>{m.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>{m.role}</div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { if (selectedMember) { setSelectedService(null); setStep(STEP_SERVICE); } }}
                                    className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                                    disabled={!selectedMember}>
                                    Tovább – Szolgáltatás választás →
                                </button>
                            </>
                        )}

                        {/* STEP: Service selection */}
                        {step === STEP_SERVICE && (
                            <>
                                {hasTeam && <button className={s.backLink} onClick={() => setStep(STEP_MEMBER)}>← Vissza</button>}
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Válassz szolgáltatást</h3>
                                {hasTeam && selectedMemberName && (
                                    <div style={{ background: 'var(--primary-50)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                        👤 Foglalás: <strong>{selectedMemberName}</strong>
                                    </div>
                                )}
                                <div className={s.serviceList}>
                                    {filteredServices.map(svc => (
                                        <div key={svc.id} className={`${s.serviceOption} ${selectedService === svc.id ? s.selected : ''}`}
                                            onClick={() => setSelectedService(svc.id)}>
                                            <div className={s.serviceDetails}>
                                                <h4>{svc.name}</h4>
                                                <p>{svc.category ? `${svc.category} • ` : ''}{svc.duration_minutes} perc</p>
                                            </div>
                                            <span className={s.servicePrice}>{svc.price?.toLocaleString('hu-HU')} Ft</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => selectedService && setStep(STEP_DATE)} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                                    disabled={!selectedService}>
                                    Tovább – Időpont választás →
                                </button>
                            </>
                        )}

                        {/* STEP: Date & time selection */}
                        {step === STEP_DATE && (
                            <>
                                <button className={s.backLink} onClick={() => setStep(STEP_SERVICE)}>← Vissza</button>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Válassz dátumot és időpontot</h3>
                                {hasTeam && selectedMemberName && (
                                    <div style={{ background: 'var(--primary-50)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                        👤 <strong>{selectedMemberName}</strong> • {svc?.name}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <button onClick={() => { setMonthOffset(p => p - 1); setSelectedDate(null); setSelectedTime(null); }} disabled={monthOffset <= 0} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: monthOffset <= 0 ? 0.3 : 1 }}>←</button>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-600)' }}>{monthName}</span>
                                    <button onClick={() => { setMonthOffset(p => p + 1); setSelectedDate(null); setSelectedTime(null); }} disabled={monthOffset >= 3} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: monthOffset >= 3 ? 0.3 : 1 }}>→</button>
                                </div>
                                <div className={s.dateGrid}>
                                    {['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'].map(d => <div key={d} className={s.dayLabel}>{d}</div>)}
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
                                        const disabled = !isDayAvailable(day);
                                        return (
                                            <button key={day} className={`${s.dateCell} ${selectedDate === day ? s.selected : ''} ${isToday ? s.today : ''} ${disabled ? s.disabled : ''}`}
                                                onClick={() => { if (!disabled) { setSelectedDate(day); setSelectedTime(null); } }} disabled={disabled}>
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedDate && (
                                    <>
                                        <h4 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--gray-700)' }}>Elérhető időpontok</h4>
                                        {availableTimesForDay.length === 0 ? (
                                            <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Nincs elérhető időpont ezen a napon.</p>
                                        ) : (
                                            <div className={s.timeGrid}>
                                                {availableTimesForDay.map(t => (
                                                    <button key={t} className={`${s.timeSlot} ${selectedTime === t ? s.selected : ''}`}
                                                        onClick={() => setSelectedTime(t)}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                <button onClick={() => selectedDate && selectedTime && setStep(STEP_FORM)} className="btn btn-primary btn-lg"
                                    style={{ width: '100%', marginTop: 20 }} disabled={!selectedDate || !selectedTime}>
                                    Tovább – Adatok megadása →
                                </button>
                            </>
                        )}

                        {/* STEP: Form */}
                        {step === STEP_FORM && (
                            <>
                                <button className={s.backLink} onClick={() => setStep(STEP_DATE)}>← Vissza</button>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Adataid megadása</h3>

                                <div style={{ background: 'var(--primary-50)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                    {hasTeam && selectedMemberName && (
                                        <div style={{ fontWeight: 500, color: 'var(--gray-600)', marginBottom: 4, fontSize: '0.85rem' }}>👤 {selectedMemberName}</div>
                                    )}
                                    <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{svc?.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                        {monthName} {selectedDate}. • {selectedTime} • {svc?.duration_minutes} perc • {svc?.price?.toLocaleString('hu-HU')} Ft
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div className="input-group">
                                        <label className="input-label">Teljes név *</label>
                                        <input className="input" placeholder="Vezetéknév Keresztnév" value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">E-mail cím *</label>
                                        <input type="email" className="input" placeholder="pelda@email.hu" value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Telefonszám *</label>
                                        <input className="input" placeholder="+36 30 123 4567" value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Megjegyzés (opcionális)</label>
                                        <textarea className="input" rows={3} placeholder="Bármilyen kérés vagy megjegyzés..."
                                            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                                    </div>
                                </div>
                                <button onClick={handleBook} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}
                                    disabled={!form.name || !form.email || !form.phone || bookingLoading}>
                                    {bookingLoading ? '⏳ Foglalás folyamatban...' : '📅 Foglalás megerősítése'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {booked && (
                    <div className={s.bookingCard}>
                        <div className={s.confirmBox}>
                            <div className={s.confirmIcon}>🎉</div>
                            <h2 className={s.confirmTitle}>Sikeres foglalás!</h2>
                            <p className={s.confirmDesc}>A foglalásod rögzítve lett. Hamarosan e-mail visszaigazolást kapsz.</p>
                            <div className={s.summaryList}>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Szolgáltatás</span><span className={s.summaryValue}>{svc?.name}</span></div>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Dátum</span><span className={s.summaryValue}>{monthName} {selectedDate}.</span></div>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Időpont</span><span className={s.summaryValue}>{selectedTime}</span></div>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Időtartam</span><span className={s.summaryValue}>{svc?.duration_minutes} perc</span></div>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Ár</span><span className={s.summaryValue}>{svc?.price?.toLocaleString('hu-HU')} Ft</span></div>
                                <div className={s.summaryRow}><span className={s.summaryLabel}>Név</span><span className={s.summaryValue}>{form.name}</span></div>
                            </div>
                            <Link href="/" className="btn btn-secondary">← Vissza a főoldalra</Link>
                        </div>
                    </div>
                )}

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 16 }}>
                    Működteti a <Link href="/" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>FoglaljVelem.hu</Link>
                </p>
            </div>
        </div>
    );
}
