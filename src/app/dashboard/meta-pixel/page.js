'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function MetaPixelPage() {
    const { profile } = useAuth();
    const [pixelId, setPixelId] = useState('');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testMode, setTestMode] = useState(false);

    useEffect(() => {
        if (profile?.meta_pixel_id) setPixelId(profile.meta_pixel_id);
    }, [profile]);

    const handleSave = async () => {
        if (!profile?.id || !isSupabaseConfigured) return;
        setSaving(true);
        try {
            const cleanId = pixelId.trim().replace(/[^0-9]/g, '');
            const { error } = await supabase.from('profiles').update({
                meta_pixel_id: cleanId || null
            }).eq('id', profile.id);
            if (error) throw error;
            setPixelId(cleanId);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Meta Pixel save error:', err);
            alert('Hiba: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm('Biztosan eltávolítod a Meta Pixel-t?')) return;
        setPixelId('');
        setSaving(true);
        try {
            await supabase.from('profiles').update({ meta_pixel_id: null }).eq('id', profile.id);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Meta Pixel 📊</h1>
                    <p>Facebook/Instagram hirdetések nyomkövetése</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        {saved ? '✅ Mentve!' : saving ? '⏳...' : '💾 Mentés'}
                    </button>
                </div>
            </div>

            {/* INFO */}
            <div className={s.contentCard} style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f0f7ff, #e8f4fd)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontSize: '2rem' }}>📘</span>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--gray-800)' }}>
                            Mi az a Meta Pixel?
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                            A Meta Pixel (korábban Facebook Pixel) egy JavaScript kód, amellyel nyomon követheted a foglalási oldalad látogatóit.
                            Segítségével hatékonyabb Facebook és Instagram hirdetéseket futtathatsz, mert a Meta pontosan tudja, kik foglaltak nálad időpontot.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 8 }}>
                            📌 A Pixel kódot a <strong>Meta Business Suite → Events Manager</strong>-ben találod.
                        </p>
                    </div>
                </div>
            </div>

            {/* PIXEL ID INPUT */}
            <div className={s.contentCard} style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
                    🔧 Pixel beállítás
                </h3>
                <div className="input-group" style={{ marginBottom: 16 }}>
                    <label className="input-label">Meta Pixel ID</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            className="input"
                            placeholder="pl. 1234567890123456"
                            value={pixelId}
                            onChange={e => setPixelId(e.target.value)}
                            style={{ flex: 1, fontFamily: 'monospace', letterSpacing: 1 }}
                        />
                        {pixelId && (
                            <button onClick={handleRemove} className="btn btn-secondary btn-sm" style={{ color: 'var(--error)' }}>
                                🗑
                            </button>
                        )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
                        Csak a számsor kell, pl. <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>1234567890123456</code>
                    </p>
                </div>

                {pixelId && (
                    <div style={{ background: 'var(--success-light)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <div>
                            <div style={{ fontWeight: 600, color: '#065f46', fontSize: '0.9rem' }}>Pixel aktív</div>
                            <div style={{ fontSize: '0.8rem', color: '#065f46', opacity: 0.7 }}>
                                ID: {pixelId} — Automatikusan beágyazva a foglalási oldaladra.
                            </div>
                        </div>
                    </div>
                )}

                {!pixelId && (
                    <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.9rem' }}>Nincs Pixel beállítva</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                                Add meg a Pixel ID-t a nyomkövetés aktiválásához.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* GUIDE */}
            <div className={s.contentCard}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
                    📋 Hogyan szerezd meg a Pixel ID-t?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { num: '1', text: 'Menj a Meta Business Suite-ba', link: 'https://business.facebook.com', linkText: 'business.facebook.com' },
                        { num: '2', text: 'Válaszd az Events Manager-t a bal oldali menüben' },
                        { num: '3', text: 'Kattints a „Data Sources" → „Pixels" menüre' },
                        { num: '4', text: 'Másold ki a Pixel ID-t (16 számjegyű szám)' },
                        { num: '5', text: 'Illeszd be ide fent és kattints a Mentés gombra' },
                    ].map(step => (
                        <div key={step.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{
                                minWidth: 32, height: 32, borderRadius: '50%',
                                background: 'var(--primary-500)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.85rem'
                            }}>{step.num}</div>
                            <div style={{ paddingTop: 5 }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{step.text}</span>
                                {step.link && (
                                    <a href={step.link} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary-500)', marginTop: 2 }}>
                                        🔗 {step.linkText}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 12, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    <strong>💡 Tipp:</strong> A Pixel automatikusan rögzíteni fogja a PageView és Lead (foglalás) eseményeket a te foglalási oldaladon.
                    Más felhasználók Pixel-je nem zavarja a tiédet — mindenki a saját Pixel-jét látja csak.
                </div>
            </div>
        </div>
    );
}
