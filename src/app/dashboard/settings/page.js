'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function SettingsPage() {
    const { profile, user, updateProfile, signOut } = useAuth();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        business_name: profile?.business_name || profile?.businessName || '',
        phone: profile?.phone || '',
        slug: profile?.slug || '',
        description: profile?.description || '',
        address: profile?.address || '',
        city: profile?.city || '',
    });
    const [saved, setSaved] = useState(false);
    const [subLoading, setSubLoading] = useState('');
    const [subMsg, setSubMsg] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    // Sync form and avatar when profile loads (profile arrives async)
    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || '',
                email: user?.email || profile.email || '',
                business_name: profile.business_name || profile.businessName || '',
                phone: profile.phone || '',
                slug: profile.slug || '',
                description: profile.description || '',
                address: profile.address || '',
                city: profile.city || '',
            });
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
    }, [profile?.id]);

    // Check URL params for subscription success/cancel
    useEffect(() => {
        const sub = searchParams.get('subscription');
        if (sub === 'success') setSubMsg('✅ Előfizetés sikeresen aktiválva!');
        if (sub === 'cancelled') setSubMsg('ℹ️ Az előfizetés nincs aktiválva.');
        if (sub) setTimeout(() => setSubMsg(''), 5000);
    }, [searchParams]);

    const handleSave = async () => {
        try {
            await updateProfile({ ...form, avatar_url: avatarUrl || null });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;
        if (file.size > 2 * 1024 * 1024) { alert('A fájl max 2MB lehet!'); return; }
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${profile.id}/avatar.${ext}`;
            const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
            if (upErr) throw upErr;
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            const url = urlData.publicUrl + '?t=' + Date.now();
            setAvatarUrl(url);
            await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Hiba a feltöltésnél: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarUrl('');
        await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id);
    };

    const tier = profile?.subscription_tier || 'free';
    const planInfo = {
        free:  { emoji: '🆓', label: 'Ingyenes', desc: 'Alap funkciók – korlátozott', price: '0 Ft/hó' },
        basic: { emoji: '⭐', label: 'Alap', desc: 'Minden funkció – 1 felhasználó', price: '4 997 Ft/hó' },
        pro:   { emoji: '🏢', label: 'Profi', desc: 'Csapatkezelés – 6-10 felhasználó', price: '19 997 Ft/hó' },
    };
    const currentPlan = planInfo[tier] || planInfo.free;

    const handleSubscribe = async (planName) => {
        setSubLoading(planName);
        try {
            const res = await fetch('/api/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create-checkout',
                    planName,
                    profileId: profile?.id,
                    email: profile?.email,
                    customerId: profile?.stripe_customer_id,
                }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else setSubMsg('❌ Hiba: ' + (data.error || 'Stripe nincs konfigurálva'));
        } catch (err) {
            setSubMsg('❌ Hiba történt: ' + err.message);
        } finally {
            setSubLoading('');
        }
    };

    const handleManageSubscription = async () => {
        setSubLoading('manage');
        try {
            const res = await fetch('/api/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create-portal',
                    customerId: profile?.stripe_customer_id,
                }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else setSubMsg('❌ ' + (data.error || 'Hiba'));
        } catch (err) {
            setSubMsg('❌ ' + err.message);
        } finally {
            setSubLoading('');
        }
    };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Beállítások ⚙️</h1>
                    <p>Profil és fiók beállítások</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm">{saved ? '✅ Mentve!' : '💾 Mentés'}</button>
                </div>
            </div>

            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>👤 Profil adatok</h3>

                {/* AVATAR UPLOAD */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 16, overflow: 'hidden',
                        background: avatarUrl ? 'none' : 'linear-gradient(135deg, var(--primary-300), var(--accent-300))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: avatarUrl ? 0 : '1.8rem', fontWeight: 700, color: 'white',
                        border: '3px solid var(--gray-100)', flexShrink: 0
                    }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            (profile?.name || profile?.business_name || 'U')[0]?.toUpperCase()
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>Profil fotó</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <input type="file" ref={fileRef} accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                            <button onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm" disabled={uploading}>
                                {uploading ? '⏳ Feltöltés...' : '📷 Kép feltöltése'}
                            </button>
                            {avatarUrl && (
                                <button onClick={handleRemoveAvatar} className="btn btn-secondary btn-sm" style={{ color: 'var(--error)' }}>
                                    🗑 Eltávolítás
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 6 }}>JPG, PNG, max 2MB. Megjelenik a foglalási oldaladon.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    <div className="input-group"><label className="input-label">Teljes név</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="input-group"><label className="input-label">E-mail cím</label><input className="input" value={form.email} readOnly style={{ opacity: 0.6 }} /></div>
                    <div className="input-group"><label className="input-label">Vállalkozás neve</label><input className="input" value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} /></div>
                    <div className="input-group"><label className="input-label">Telefonszám</label><input className="input" placeholder="+36 30 123 4567" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div className="input-group"><label className="input-label">Város</label><input className="input" placeholder="Budapest" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
                    <div className="input-group"><label className="input-label">Cím</label><input className="input" placeholder="Kossuth utca 1." value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">Egyedi URL (slug)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <span style={{ padding: '12px 14px', background: 'var(--gray-100)', border: '1.5px solid var(--gray-200)', borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: '0.9rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>foglaljvelem.hu/book/</span>
                            <input className="input" style={{ borderRadius: '0 10px 10px 0' }} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
                        </div>
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">Leírás</label>
                        <textarea className="input" rows={3} placeholder="Írd le a vállalkozásodat..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* SUBSCRIPTION */}
            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>💰 Előfizetés</h3>
                {subMsg && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: subMsg.includes('✅') ? 'var(--success-light)' : subMsg.includes('❌') ? 'var(--error-light)' : 'var(--primary-50)', fontSize: '0.9rem', fontWeight: 500 }}>{subMsg}</div>}

                {/* Current plan */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'var(--primary-50)', borderRadius: 14, marginBottom: 20 }}>
                    <span style={{ fontSize: '2rem' }}>{currentPlan.emoji}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{currentPlan.label} csomag</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{currentPlan.desc} • {currentPlan.price}</div>
                    </div>
                    {tier !== 'free' && profile?.stripe_customer_id && (
                        <button onClick={handleManageSubscription} disabled={subLoading === 'manage'} className="btn btn-secondary btn-sm">
                            {subLoading === 'manage' ? '...' : '⚙️ Előfizetés kezelése'}
                        </button>
                    )}
                </div>

                {/* Plan options */}
                {tier === 'free' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ padding: 24, borderRadius: 14, border: '2px solid var(--primary-300)', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Alap csomag</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary-600)' }}>4 997 Ft<span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--gray-500)' }}>/hó</span></div>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                <li style={{ marginBottom: 4 }}>✓ E-mail értesítések</li>
                                <li style={{ marginBottom: 4 }}>✓ Google Naptár szinkron</li>
                                <li style={{ marginBottom: 4 }}>✓ QR kód generálás</li>
                                <li style={{ marginBottom: 4 }}>✓ Részletes statisztikák</li>
                            </ul>
                            <button onClick={() => handleSubscribe('alap')} disabled={!!subLoading} className="btn btn-primary" style={{ width: '100%' }}>
                                {subLoading === 'alap' ? 'Átirányítás...' : 'Váltás Alap csomagra →'}
                            </button>
                        </div>

                        <div style={{ padding: 24, borderRadius: 14, border: '2px solid var(--accent-300)', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Profi csomag</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-600)' }}>19 997 Ft<span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--gray-500)' }}>/hó</span></div>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                <li style={{ marginBottom: 4 }}>✓ Minden Alap funkció</li>
                                <li style={{ marginBottom: 4 }}>✓ 6-10 munkatárs alfiók</li>
                                <li style={{ marginBottom: 4 }}>✓ Csapat naptár</li>
                                <li style={{ marginBottom: 4 }}>✓ Prioritásos támogatás</li>
                            </ul>
                            <button onClick={() => handleSubscribe('profi')} disabled={!!subLoading} className="btn btn-accent" style={{ width: '100%' }}>
                                {subLoading === 'profi' ? 'Átirányítás...' : 'Váltás Profi csomagra →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className={s.contentCard} style={{ padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, color: 'var(--error)' }}>⚠️ Veszélyes zóna</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>A fiók törlése végleges és nem visszavonható.</p>
                <button className="btn btn-sm" style={{ background: 'var(--error-light)', color: '#991b1b', border: '1px solid var(--error)' }}>Fiók törlése</button>
            </div>
        </div>
    );
}
