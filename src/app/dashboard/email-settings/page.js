'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

const EMAIL_TYPES = [
    { key: 'booking_confirmation', icon: '✅', label: 'Foglalás megerősítés', desc: 'Email az ügyfélnek, amikor lefoglal egy időpontot' },
    { key: 'provider_notification', icon: '🆕', label: 'Új foglalás értesítés', desc: 'Email neked, amikor valaki foglal nálad' },
    { key: 'reminder_24h', icon: '⏰', label: '24 órás emlékeztető', desc: 'Emlékeztető az ügyfélnek 24 órával az időpont előtt' },
    { key: 'reminder_1h', icon: '🔔', label: '1 órás emlékeztető', desc: 'Emlékeztető az ügyfélnek 1 órával az időpont előtt' },
];

export default function EmailSettingsPage() {
    const { profile } = useAuth();
    const tier = profile?.subscription_tier || 'free';
    const canEmail = tier === 'basic' || tier === 'pro';

    const [settings, setSettings] = useState({
        booking_confirmation: true,
        reminder_24h: true,
        reminder_1h: true,
        provider_notification: true,
        custom_greeting: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            if (!profile?.id) { setLoading(false); return; }
            const { data } = await supabase.from('email_settings')
                .select('*').eq('profile_id', profile.id).maybeSingle();
            if (data) {
                setSettings({
                    booking_confirmation: data.booking_confirmation ?? true,
                    reminder_24h: data.reminder_24h ?? true,
                    reminder_1h: data.reminder_1h ?? true,
                    provider_notification: data.provider_notification ?? true,
                    custom_greeting: data.custom_greeting || '',
                });
            }
            setLoading(false);
        }
        load();
    }, [profile?.id]);

    const handleSave = async () => {
        if (!profile?.id) return;
        setSaving(true);
        try {
            const payload = { profile_id: profile.id, ...settings, updated_at: new Date().toISOString() };
            const { error } = await supabase.from('email_settings')
                .upsert(payload, { onConflict: 'profile_id' });
            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!canEmail) {
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>Email beállítások 📧</h1>
                        <p>Email értesítések testreszabása</p>
                    </div>
                </div>
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>📧</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, fontSize: '1.5rem' }}>
                        Email beállítások
                    </h2>
                    <p style={{ color: 'var(--gray-500)', maxWidth: 450, margin: '0 auto', lineHeight: 1.6 }}>
                        Az email értesítések testreszabása az <strong>Alap</strong> és <strong>Profi</strong> csomagban érhető el.
                    </p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: 12, maxWidth: 450, margin: '12px auto 0' }}>
                        Váltson fizetős csomagra a foglalási megerősítő emailek, emlékeztetők és egyedi köszöntő szöveg használatához.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div>
                <div className={s.topBar}><div className={s.topBarLeft}><h1>Email beállítások 📧</h1></div></div>
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>Betöltés...</div>
            </div>
        );
    }

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Email beállítások 📧</h1>
                    <p>Értesítések ki/bekapcsolása és testreszabása</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? '⏳ Mentés...' : saved ? '✅ Mentve!' : '💾 Mentés'}
                    </button>
                </div>
            </div>

            {/* Email toggles */}
            <div className={s.contentCard} style={{ padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>📬 Email típusok</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {EMAIL_TYPES.map(type => (
                        <div key={type.key} style={{
                            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                            borderRadius: 12, border: '1px solid var(--gray-100)',
                            background: settings[type.key] ? 'white' : 'var(--gray-50)',
                            opacity: settings[type.key] ? 1 : 0.6,
                            transition: 'all 0.2s',
                        }}>
                            <button onClick={() => toggleSetting(type.key)} style={{
                                width: 44, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                                background: settings[type.key] ? 'var(--primary-500)' : 'var(--gray-200)',
                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                            }}>
                                <span style={{
                                    position: 'absolute', width: 22, height: 22, borderRadius: '50%', background: 'white',
                                    top: 3, left: settings[type.key] ? 19 : 3, transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)',
                                }} />
                            </button>
                            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{type.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.95rem' }}>{type.label}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 2 }}>{type.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom greeting */}
            <div className={s.contentCard} style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>✍️ Egyedi köszöntő szöveg</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>
                    Ez a szöveg az email értesítések elejére kerül, a fix tartalom elé. Hagyd üresen ha nem szeretnéd testreszabni.
                </p>
                <textarea
                    className="input"
                    rows={3}
                    placeholder="pl. Köszönjük hogy nálunk foglaltál! Várunk szeretettel!"
                    value={settings.custom_greeting}
                    onChange={e => setSettings(prev => ({ ...prev, custom_greeting: e.target.value }))}
                    style={{ resize: 'vertical' }}
                />
                {settings.custom_greeting && (
                    <div style={{
                        marginTop: 12, padding: 16, borderRadius: 12,
                        background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Előnézet</div>
                        <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '0.9rem', fontStyle: 'italic' }}>&quot;{settings.custom_greeting}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}
