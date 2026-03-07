'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const [msg, setMsg] = useState('');

    const adminFetch = async (action, extra = {}) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, password, ...extra }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const data = await adminFetch('list-profiles');
            setProfiles(data.profiles || []);
            const statsData = await adminFetch('stats');
            setStats(statsData);
            setAuthenticated(true);
        } catch (err) {
            setMsg('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfiles = async () => {
        const data = await adminFetch('list-profiles');
        setProfiles(data.profiles || []);
    };

    const updateTier = async (profileId, tier) => {
        try {
            await adminFetch('update-profile', { profileId, updates: { subscription_tier: tier } });
            setMsg(`✅ Csomag frissítve: ${tier}`);
            await refreshProfiles();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const updateProfile = async (profileId, updates) => {
        try {
            await adminFetch('update-profile', { profileId, updates });
            setMsg('✅ Profil frissítve!');
            setEditing(null);
            await refreshProfiles();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const deleteProfile = async (profileId, name) => {
        if (!confirm(`Biztosan törlöd "${name}" fiókját? Ez nem visszavonható!`)) return;
        try {
            await adminFetch('delete-profile', { profileId });
            setMsg('✅ Fiók törölve.');
            await refreshProfiles();
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const filtered = profiles.filter(p =>
        (p.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(search.toLowerCase())
    );

    const tierColors = { free: '#6b7280', basic: '#2563eb', pro: '#7c3aed' };
    const tierLabels = { free: 'Ingyenes', basic: 'Alap ⭐', pro: 'Profi 🏢' };

    // Login screen
    if (!authenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 48, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Admin Panel</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>FoglaljVelem.hu kezelőpanel</p>
                    </div>
                    {msg && <div style={{ padding: 12, borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}
                    <div style={{ marginBottom: 16 }}>
                        <input type="password" placeholder="Admin jelszó" value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none' }} />
                    </div>
                    <button onClick={handleLogin} disabled={loading}
                        style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                        {loading ? '⏳ Betöltés...' : '🔓 Belépés'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'var(--font-body, system-ui)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '24px 32px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>🔐 Admin Panel</h1>
                        <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: '4px 0 0' }}>FoglaljVelem.hu kezelőpanel</p>
                    </div>
                    <button onClick={() => { setAuthenticated(false); setPassword(''); }}
                        style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        🚪 Kilépés
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
                {msg && <div style={{ padding: 12, borderRadius: 10, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontSize: '0.9rem', marginBottom: 16, fontWeight: 500 }}>{msg}</div>}

                {/* Stats */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                        {[
                            { label: 'Összes fiók', value: stats.totalProfiles, icon: '👥', color: '#3b82f6' },
                            { label: 'Összes foglalás', value: stats.totalBookings, icon: '📅', color: '#10b981' },
                            { label: 'Összes szolgáltatás', value: stats.totalServices, icon: '💼', color: '#8b5cf6' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                    <input placeholder="🔍 Keresés név, vállalkozás vagy slug alapján..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }} />
                </div>

                {/* Profiles */}
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                        {filtered.length} fiók {search ? `("${search}")` : ''}
                    </div>

                    {filtered.map(p => (
                        <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Avatar */}
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                                {(p.business_name || p.name || '?')[0]?.toUpperCase()}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{p.business_name || 'Névtelen'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {p.name} • {p.slug} • {new Date(p.created_at).toLocaleDateString('hu-HU')}
                                </div>
                            </div>

                            {/* Services & Bookings count */}
                            <div style={{ textAlign: 'center', minWidth: 60 }}>
                                <div style={{ fontWeight: 700, color: '#374151' }}>{p.services?.[0]?.count ?? 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>szolg.</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: 60 }}>
                                <div style={{ fontWeight: 700, color: '#374151' }}>{p.bookings?.[0]?.count ?? 0}</div>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>fogl.</div>
                            </div>

                            {/* Tier selector */}
                            <select value={p.subscription_tier || 'free'}
                                onChange={e => updateTier(p.id, e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid #e5e7eb', fontWeight: 600, fontSize: '0.85rem', color: tierColors[p.subscription_tier || 'free'], cursor: 'pointer', background: 'white' }}>
                                <option value="free">🆓 Ingyenes</option>
                                <option value="basic">⭐ Alap</option>
                                <option value="pro">🏢 Profi</option>
                            </select>

                            {/* Actions */}
                            <button onClick={() => setEditing(editing === p.id ? null : p.id)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                                ✏️
                            </button>
                            <button onClick={() => window.open(`/book/${p.slug}`, '_blank')}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                                🔗
                            </button>
                            <button onClick={() => deleteProfile(p.id, p.business_name)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626' }}>
                                🗑️
                            </button>

                            {/* Edit panel */}
                            {editing === p.id && (
                                <EditPanel profile={p} onSave={(updates) => updateProfile(p.id, updates)} onCancel={() => setEditing(null)} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function EditPanel({ profile, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: profile.name || '',
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        phone: profile.phone || '',
        slug: profile.slug || '',
        description: profile.description || '',
        city: profile.city || '',
        address: profile.address || '',
        subscription_tier: profile.subscription_tier || 'free',
    });

    const inputStyle = { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.9rem', width: '100%', outline: 'none' };

    return (
        <div style={{ width: '100%', padding: '20px 0 0', borderTop: '1px solid #e5e7eb', marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Név</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Vállalkozás</label>
                    <input style={inputStyle} value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Slug</label>
                    <input style={inputStyle} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Telefon</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Város</label>
                    <input style={inputStyle} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Csomag</label>
                    <select style={inputStyle} value={form.subscription_tier} onChange={e => setForm(p => ({ ...p, subscription_tier: e.target.value }))}>
                        <option value="free">Ingyenes</option>
                        <option value="basic">Alap</option>
                        <option value="pro">Profi</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => onSave(form)}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    💾 Mentés
                </button>
                <button onClick={onCancel}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#f3f4f6', color: '#374151', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    Mégse
                </button>
            </div>
        </div>
    );
}
