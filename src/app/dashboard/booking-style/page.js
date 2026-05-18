'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

const THEMES = [
    {
        id: 'light',
        name: 'Világos',
        icon: '☀️',
        desc: 'Alapértelmezett, világos háttér',
        pageBg: 'linear-gradient(135deg, #f0f7ff 0%, #fffdf0 50%, #e0efff 100%)',
        cardBg: '#ffffff',
        textColor: '#1e293b',
        subtextColor: '#64748b',
    },
    {
        id: 'dark',
        name: 'Sötét',
        icon: '🌙',
        desc: 'Sötét háttér, elegáns megjelenés',
        pageBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        cardBg: '#1e293b',
        textColor: '#f1f5f9',
        subtextColor: '#94a3b8',
    },
    {
        id: 'custom',
        name: 'Egyedi',
        icon: '🎨',
        desc: 'Saját szín kombináció',
        pageBg: null,
        cardBg: null,
        textColor: null,
        subtextColor: null,
    },
];

const ACCENT_COLORS = [
    '#3b82f6', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2',
    '#db2777', '#4f46e5', '#0d9488', '#ea580c', '#1e3a5f', '#6366f1',
];

function BookingPreview({ theme, accentColor, customBg, customCardBg }) {
    const t = THEMES.find(th => th.id === theme) || THEMES[0];
    const pageBg = theme === 'custom' ? (customBg || '#f8fafc') : t.pageBg;
    const cardBg = theme === 'custom' ? (customCardBg || '#ffffff') : t.cardBg;
    const textColor = theme === 'dark' ? '#f1f5f9' : theme === 'custom' ? (isLightColor(customCardBg) ? '#1e293b' : '#f1f5f9') : '#1e293b';
    const subtextColor = theme === 'dark' ? '#94a3b8' : theme === 'custom' ? (isLightColor(customCardBg) ? '#64748b' : '#94a3b8') : '#64748b';

    return (
        <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--gray-200)',
            height: 380, position: 'relative',
        }}>
            {/* Mini booking page preview */}
            <div style={{
                background: pageBg, width: '100%', height: '100%',
                padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
                {/* Provider header */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12, margin: '0 auto 8px',
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    }}>A</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: textColor }}>Anna Szépségszalon</div>
                    <div style={{ fontSize: '0.7rem', color: subtextColor }}>💇 Fodrász</div>
                </div>

                {/* Booking card */}
                <div style={{
                    background: cardBg, borderRadius: 14, padding: 16,
                    width: '100%', maxWidth: 280, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: textColor, marginBottom: 12 }}>
                        Válassz szolgáltatást
                    </div>
                    {/* Fake service items */}
                    {['Női hajvágás', 'Festés + vágás', 'Balayage'].map((svc, i) => (
                        <div key={svc} style={{
                            padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                            border: i === 0 ? `2px solid ${accentColor}` : `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                            background: i === 0 ? (theme === 'dark' ? `${accentColor}22` : `${accentColor}0d`) : 'transparent',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textColor }}>{svc}</div>
                                <div style={{ fontSize: '0.65rem', color: subtextColor }}>{[45, 90, 120][i]} perc</div>
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>
                                {[5000, 15000, 25000][i].toLocaleString()} Ft
                            </div>
                        </div>
                    ))}
                    {/* Fake button */}
                    <div style={{
                        marginTop: 10, padding: '10px 16px', borderRadius: 10,
                        background: accentColor, color: 'white', textAlign: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                    }}>
                        Tovább →
                    </div>
                </div>
            </div>
        </div>
    );
}

function isLightColor(hex) {
    if (!hex) return true;
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function BookingStylePage() {
    const { profile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [theme, setTheme] = useState('light');
    const [accentColor, setAccentColor] = useState('#3b82f6');
    const [customBg, setCustomBg] = useState('#f8fafc');
    const [customCardBg, setCustomCardBg] = useState('#ffffff');
    const [customAccent, setCustomAccent] = useState('#3b82f6');

    const isPro = profile?.subscription_tier === 'pro';

    // Load saved settings
    useEffect(() => {
        if (profile) {
            if (profile.booking_theme) setTheme(profile.booking_theme);
            if (profile.booking_accent_color) {
                setAccentColor(profile.booking_accent_color);
                setCustomAccent(profile.booking_accent_color);
            }
            if (profile.booking_custom_bg) setCustomBg(profile.booking_custom_bg);
            if (profile.booking_custom_card_bg) setCustomCardBg(profile.booking_custom_card_bg);
        }
    }, [profile?.id]);

    const handleSave = async () => {
        if (!profile?.id) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').update({
                booking_theme: theme,
                booking_accent_color: accentColor,
                booking_custom_bg: theme === 'custom' ? customBg : null,
                booking_custom_card_bg: theme === 'custom' ? customCardBg : null,
            }).eq('id', profile.id);
            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            alert('Mentés sikertelen: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isPro) {
        return (
            <div className={s.pageContent}>
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🎨</span>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12, color: 'var(--gray-800)' }}>
                        Foglalási oldal testreszabás
                    </h1>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        Igazítsd a foglalási oldalad színeit a saját márkádhoz! Ez a funkció a Profi csomagban érhető el.
                    </p>
                    <a href="/dashboard/settings" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        🏢 Profi csomagra váltás →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={s.pageContent}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6, color: 'var(--gray-800)' }}>
                    🎨 Foglalási oldal testreszabás
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    Igazítsd a foglalási oldalad designját a saját weboldaladhoz — sötét, világos, vagy egyedi színekkel.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
                {/* LEFT — Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Theme selection */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>🖌️ Téma</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {THEMES.map(t => (
                                <button key={t.id} onClick={() => setTheme(t.id)} style={{
                                    padding: '14px 10px', borderRadius: 12,
                                    border: theme === t.id ? '2px solid var(--primary-500)' : '2px solid var(--gray-100)',
                                    background: theme === t.id ? 'var(--primary-50)' : 'white',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>{t.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: theme === t.id ? 'var(--primary-600)' : 'var(--gray-700)' }}>{t.name}</span>
                                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: 2 }}>{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent color */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem', color: 'var(--gray-700)' }}>🎯 Kiemelő szín</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: 14 }}>Gombok, kijelölések, árak színe</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {ACCENT_COLORS.map(c => (
                                <button key={c} onClick={() => { setAccentColor(c); setCustomAccent(c); }} style={{
                                    width: 32, height: 32, borderRadius: 10, background: c,
                                    border: accentColor === c ? '3px solid var(--gray-800)' : '2px solid var(--gray-200)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="color" value={customAccent} onChange={e => { setCustomAccent(e.target.value); setAccentColor(e.target.value); }}
                                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Egyedi szín</span>
                        </div>
                    </div>

                    {/* Custom colors (only for Custom theme) */}
                    {theme === 'custom' && (
                        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', color: 'var(--gray-700)' }}>🎨 Egyedi színek</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>Háttérszín</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="color" value={customBg} onChange={e => setCustomBg(e.target.value)}
                                            style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
                                        <input type="text" value={customBg} onChange={e => setCustomBg(e.target.value)}
                                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '0.85rem', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>Kártya háttérszín</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="color" value={customCardBg} onChange={e => setCustomCardBg(e.target.value)}
                                            style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }} />
                                        <input type="text" value={customCardBg} onChange={e => setCustomCardBg(e.target.value)}
                                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '0.85rem', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save button */}
                    <button onClick={handleSave} disabled={saving} style={{
                        width: '100%', padding: '16px 24px',
                        borderRadius: 14, border: 'none', fontWeight: 700, fontSize: '1rem',
                        background: saved ? '#059669' : saving ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--primary-500), var(--accent-500, #7c3aed))',
                        color: 'white', cursor: saving ? 'wait' : 'pointer',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s',
                    }}>
                        {saved ? '✅ Mentve!' : saving ? '⏳ Mentés...' : '💾 Mentés'}
                    </button>

                    {saved && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', color: '#166534' }}>
                            A módosítások azonnal érvénybe lépnek a foglalási oldaladon!
                        </div>
                    )}
                </div>

                {/* RIGHT — Preview */}
                <div style={{ position: 'sticky', top: 20 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem', color: 'var(--gray-700)' }}>👁️ Előnézet</h3>
                        <BookingPreview
                            theme={theme}
                            accentColor={accentColor}
                            customBg={customBg}
                            customCardBg={customCardBg}
                        />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                        Így fog kinézni a foglalási oldalad: <strong style={{ color: 'var(--gray-600)' }}>foglaljvelem.hu/book/{profile?.slug || '...'}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
