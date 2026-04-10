'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function ThankYouPage() {
    const { profile } = useAuth();
    const [url, setUrl] = useState('');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (profile?.custom_thankyou_url) {
            setUrl(profile.custom_thankyou_url);
        }
    }, [profile?.id]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            // Basic URL validation (only if not empty)
            const trimmed = url.trim();
            if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                setError('Az URL-nek http:// vagy https:// -vel kell kezdődnie.');
                setSaving(false);
                return;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ custom_thankyou_url: trimmed || null })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError('Mentés sikertelen: ' + (err.message || 'Ismeretlen hiba'));
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        setUrl('');
        setSaving(true);
        try {
            await supabase
                .from('profiles')
                .update({ custom_thankyou_url: null })
                .eq('id', profile.id);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Hiba: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Köszönjük oldal 🎯</h1>
                    <p>Irányítsd át az ügyfeleidet a saját köszönjük oldaladra foglalás után</p>
                </div>
            </div>

            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
                    Egyedi köszönjük oldal URL
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
                    Ha megadsz egy URL-t, az ügyfeled a foglalás után ide lesz átirányítva a beépített köszönjük oldal helyett.
                    Ez hasznos lehet ha saját landing oldalt szeretnél használni, pl. hirdetési kampányokhoz.
                </p>

                <div style={{ marginBottom: 20 }}>
                    <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Átirányítási URL</label>
                    <input
                        className="input"
                        placeholder="https://pelda.hu/koszonjuk"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        style={{ maxWidth: 600 }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>
                        Hagyd üresen ha a beépített FoglaljVelem köszönjük oldalt szeretnéd használni.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {saved && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                        background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
                        fontSize: '0.9rem', fontWeight: 500
                    }}>
                        Mentve!
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Mentés...' : 'Mentés'}
                    </button>
                    {url && (
                        <button
                            onClick={handleClear}
                            className="btn btn-secondary"
                            disabled={saving}
                        >
                            Visszaállítás alapértelmezettre
                        </button>
                    )}
                </div>
            </div>

            {/* Preview / explanation card */}
            <div className={s.contentCard} style={{ padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>
                    Hogyan működik?
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>1️⃣</span>
                        <span>Az ügyfél kitölti a foglalási űrlapot a te oldaladon</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>2️⃣</span>
                        <span>A foglalás megtörténik és bekerül a rendszerbe</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>3️⃣</span>
                        <span>
                            {url ? (
                                <>Az ügyfél átirányításra kerül ide: <strong style={{ color: 'var(--primary-600)', wordBreak: 'break-all' }}>{url}</strong></>
                            ) : (
                                <>Az ügyfél a beépített FoglaljVelem köszönjük oldalra kerül (jelenleg ez az alapértelmezés)</>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
