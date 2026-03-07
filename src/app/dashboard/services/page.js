'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getServices, createService, updateService, deleteService, saveCommunityTemplate, getAllCommunityTemplates } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SERVICE_CATALOG, searchTemplates, getAllTemplatesPrioritized, getTemplatesForType } from '@/lib/service-catalog';
import s from '../dashboard.module.css';

export default function ServicesPage() {
    const { profile } = useAuth();
    const [services, setServices] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', duration_minutes: 30, price: '', category: '', description: '' });
    const [showCatalog, setShowCatalog] = useState(false);
    const [search, setSearch] = useState('');
    const [catalogSection, setCatalogSection] = useState('mine');
    const [catFilter, setCatFilter] = useState('all');
    const [communityTemplates, setCommunityTemplates] = useState([]);

    const businessType = profile?.business_type || profile?.businessType || 'salon';
    const allSections = useMemo(() => getAllTemplatesPrioritized(businessType), [businessType]);
    const currentSection = useMemo(() => {
        if (catalogSection === 'community') return null;
        return allSections.find(s => s.type === catalogSection) || allSections[0];
    }, [allSections, catalogSection]);

    useEffect(() => {
        if (isSupabaseConfigured && profile?.id) {
            getServices(profile.id).then(data => setServices(data));
            getAllCommunityTemplates().then(data => setCommunityTemplates(data));
        }
    }, [profile]);

    const searchResults = useMemo(() => searchTemplates(search, businessType), [search, businessType]);

    const filteredCatalogServices = useMemo(() => {
        if (catalogSection === 'community') return communityTemplates.map(t => ({ ...t, businessLabel: '👥 Közösségi' }));
        if (!currentSection) return [];
        if (catFilter === 'all') return currentSection.services;
        return currentSection.services.filter(s => s.category === catFilter);
    }, [currentSection, catFilter, catalogSection, communityTemplates]);

    const handleSave = async () => {
        if (!form.name || !form.price) return;
        try {
            if (editId) {
                const updated = { name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price), category: form.category, description: form.description };
                if (isSupabaseConfigured && profile?.id) {
                    const data = await updateService(editId, updated);
                    setServices(prev => prev.map(s => s.id === editId ? data : s));
                } else {
                    setServices(prev => prev.map(s => s.id === editId ? { ...s, ...updated } : s));
                }
                setEditId(null);
            } else {
                const newSvc = { name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price), category: form.category, description: form.description, profile_id: profile?.id };
                if (isSupabaseConfigured && profile?.id) {
                    const data = await createService(newSvc);
                    setServices(prev => [...prev, data]);
                    // Save as community template so others can find it
                    saveCommunityTemplate({ ...newSvc, business_type: businessType }).catch(() => { });
                } else {
                    setServices(prev => [...prev, { ...newSvc, id: Date.now(), is_active: true }]);
                }
            }
            setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '' });
            setIsAdding(false);
        } catch (err) { console.error(err); }
    };

    const handleAddFromCatalog = async (tpl) => {
        const newSvc = { name: tpl.name, duration_minutes: tpl.duration_minutes, price: tpl.price, category: tpl.category, description: '', profile_id: profile?.id };
        if (isSupabaseConfigured && profile?.id) {
            const data = await createService(newSvc);
            setServices(prev => [...prev, data]);
        } else {
            setServices(prev => [...prev, { ...newSvc, id: Date.now(), is_active: true }]);
        }
    };

    const handleEdit = (svc) => { setForm({ name: svc.name, duration_minutes: svc.duration_minutes, price: svc.price, category: svc.category || '', description: svc.description || '' }); setEditId(svc.id); setIsAdding(true); setShowCatalog(false); };

    const handleToggle = async (id) => {
        const svc = services.find(s => s.id === id);
        if (isSupabaseConfigured) await updateService(id, { is_active: !svc.is_active });
        setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
    };

    const handleDelete = async (id) => {
        if (isSupabaseConfigured) await deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Szolgáltatások 💼</h1>
                    <p>{services.length} szolgáltatás</p>
                </div>
                <div className={s.topBarRight} style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setShowCatalog(!showCatalog); setIsAdding(false); }} className="btn btn-secondary btn-sm">
                        {showCatalog ? '← Vissza' : '📚 Katalógus'}
                    </button>
                    <button onClick={() => { setIsAdding(true); setEditId(null); setShowCatalog(false); setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '' }); }} className="btn btn-primary btn-sm">+ Egyéni</button>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
                    <input className="input" placeholder="Keresés a szolgáltatások között..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 42 }} />
                </div>
            </div>

            {/* SEARCH RESULTS */}
            {search.length >= 2 && (
                <div className={s.contentCard} style={{ marginBottom: 20, padding: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>
                        🔍 Keresési találatok ({searchResults.length})
                    </h3>
                    {searchResults.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Nincs találat &ldquo;{search}&rdquo; kifejezésre.</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                        {searchResults.slice(0, 12).map((tpl, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--gray-100)', background: 'white' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-800)' }}>{tpl.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{tpl.businessLabel} • {tpl.category} • {tpl.duration_minutes}p</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>{tpl.price.toLocaleString('hu-HU')} Ft</span>
                                    <button onClick={() => handleAddFromCatalog(tpl)} className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>+ Hozzáad</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CATALOG BROWSER */}
            {showCatalog && (
                <div className={s.contentCard} style={{ marginBottom: 20, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>📚 Szolgáltatás katalógus</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>A neked releváns szolgáltatások elöl vannak. Böngészd az összes szakterületet!</p>

                    {/* BUSINESS TYPE TABS */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {allSections.map(sec => (
                            <button key={sec.type} onClick={() => { setCatalogSection(sec.type); setCatFilter('all'); }} className="btn btn-sm"
                                style={{ background: catalogSection === sec.type ? 'var(--primary-500)' : 'white', color: catalogSection === sec.type ? 'white' : 'var(--gray-600)', border: `1.5px solid ${catalogSection === sec.type ? 'var(--primary-500)' : 'var(--gray-200)'}`, fontWeight: sec.isUserType ? 700 : 400 }}>
                                {sec.label}{sec.isUserType ? ' ★' : ''}
                            </button>
                        ))}
                        {communityTemplates.length > 0 && (
                            <button onClick={() => { setCatalogSection('community'); setCatFilter('all'); }} className="btn btn-sm"
                                style={{ background: catalogSection === 'community' ? 'var(--accent-500)' : 'white', color: catalogSection === 'community' ? 'white' : 'var(--gray-600)', border: `1.5px solid ${catalogSection === 'community' ? 'var(--accent-500)' : 'var(--gray-200)'}` }}>
                                👥 Közösségi ({communityTemplates.length})
                            </button>
                        )}
                    </div>

                    {/* CATEGORY FILTER */}
                    {currentSection && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                            <button onClick={() => setCatFilter('all')} className="btn btn-sm" style={{ background: catFilter === 'all' ? 'var(--gray-700)' : 'var(--gray-50)', color: catFilter === 'all' ? 'white' : 'var(--gray-600)', border: 'none', fontSize: '0.8rem' }}>Összes</button>
                            {currentSection.categories.map(c => (
                                <button key={c} onClick={() => setCatFilter(c)} className="btn btn-sm" style={{ background: catFilter === c ? 'var(--gray-700)' : 'var(--gray-50)', color: catFilter === c ? 'white' : 'var(--gray-600)', border: 'none', fontSize: '0.8rem' }}>{c}</button>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                        {filteredCatalogServices.map((tpl, i) => {
                            const alreadyAdded = services.some(sv => sv.name === tpl.name);
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: 12, border: `1.5px solid ${alreadyAdded ? 'var(--success)' : 'var(--gray-100)'}`, background: alreadyAdded ? 'var(--success-light)' : 'white', opacity: alreadyAdded ? 0.7 : 1 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>{tpl.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{tpl.category} • {tpl.duration_minutes} perc{catalogSection === 'community' && tpl.usage_count > 1 ? ` • ${tpl.usage_count}x használva` : ''}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-600)' }}>{Number(tpl.price).toLocaleString('hu-HU')} Ft</span>
                                        {alreadyAdded ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ Hozzáadva</span>
                                        ) : (
                                            <button onClick={() => handleAddFromCatalog(tpl)} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ADD/EDIT FORM */}
            {isAdding && (
                <div className={s.contentCard} style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {editId ? '✏️ Szolgáltatás szerkesztése' : '➕ Egyéni szolgáltatás'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group"><label className="input-label">Név</label><input className="input" placeholder="pl. Hajvágás" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                        <div className="input-group"><label className="input-label">Kategória</label><input className="input" placeholder="pl. Hajápolás" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
                        <div className="input-group"><label className="input-label">Időtartam (perc)</label><input type="number" className="input" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} /></div>
                        <div className="input-group"><label className="input-label">Ár (Ft)</label><input type="number" className="input" placeholder="5000" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
                    </div>
                    <div className="input-group" style={{ marginTop: 16 }}>
                        <label className="input-label">Leírás</label>
                        <textarea className="input" rows={2} placeholder="Rövid leírás..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button onClick={handleSave} className="btn btn-primary btn-sm">💾 Mentés</button>
                        <button onClick={() => { setIsAdding(false); setEditId(null); }} className="btn btn-secondary btn-sm">Mégse</button>
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {services.length === 0 && !showCatalog && !isAdding && (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>💼</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Még nincsenek szolgáltatásaid</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                        Adj hozzá szolgáltatásokat a katalógusból, vagy hozz létre sajátot. Az ügyfelek ezek közül fognak választani a foglaláskor.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button onClick={() => setShowCatalog(true)} className="btn btn-primary">📚 Szolgáltatás katalógus</button>
                        <button onClick={() => { setIsAdding(true); setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '' }); }} className="btn btn-secondary">+ Egyéni szolgáltatás</button>
                    </div>
                </div>
            )}

            {/* SERVICE LIST */}
            {services.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map(svc => (
                        <div key={svc.id} className={s.contentCard} style={{ opacity: svc.is_active !== false ? 1 : 0.5, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                        {businessType === 'salon' ? '💇' : businessType === 'beauty' ? '💅' : businessType === 'fitness' ? '💪' : businessType === 'health' ? '🏥' : businessType === 'consulting' ? '💼' : '📋'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{svc.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{svc.category ? `${svc.category} • ` : ''}{svc.duration_minutes} perc{svc.description ? ` • ${svc.description}` : ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-800)' }}>{Number(svc.price).toLocaleString('hu-HU')} Ft</span>
                                    <button onClick={() => handleToggle(svc.id)} className="btn btn-ghost btn-sm">{svc.is_active !== false ? '✅' : '❌'}</button>
                                    <button onClick={() => handleEdit(svc)} className="btn btn-ghost btn-sm">✏️</button>
                                    <button onClick={() => handleDelete(svc.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
