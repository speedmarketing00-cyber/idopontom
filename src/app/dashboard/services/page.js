'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getServices, createService, updateService, deleteService, saveCommunityTemplate, getAllCommunityTemplates } from '@/lib/db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { SERVICE_CATALOG, searchTemplates, getAllTemplatesPrioritized, getTemplatesForType } from '@/lib/service-catalog';
import s from '../dashboard.module.css';

// ~30 selectable icons (NO YOGA!)
const SERVICE_ICONS = [
    { emoji: '💇', label: 'Fodrász' },
    { emoji: '💅', label: 'Manikűr' },
    { emoji: '💆', label: 'Masszázs' },
    { emoji: '💈', label: 'Borbély' },
    { emoji: '💄', label: 'Smink' },
    { emoji: '👁️', label: 'Szempilla' },
    { emoji: '✂️', label: 'Varrás' },
    { emoji: '🪒', label: 'Borotválás' },
    { emoji: '🦷', label: 'Fogászat' },
    { emoji: '🏥', label: 'Orvos' },
    { emoji: '💪', label: 'Edzés' },
    { emoji: '🏋️', label: 'Súlyzó' },
    { emoji: '🏃', label: 'Cardio' },
    { emoji: '🚴', label: 'Spinning' },
    { emoji: '🥊', label: 'Box' },
    { emoji: '🎾', label: 'Tenisz' },
    { emoji: '⚽', label: 'Foci' },
    { emoji: '🏊', label: 'Úszás' },
    { emoji: '📚', label: 'Oktatás' },
    { emoji: '💼', label: 'Tanácsadás' },
    { emoji: '📷', label: 'Fotó' },
    { emoji: '🎨', label: 'Művészet' },
    { emoji: '🎵', label: 'Zene' },
    { emoji: '🐾', label: 'Kisállat' },
    { emoji: '🍽️', label: 'Étterem' },
    { emoji: '☕', label: 'Kávézó' },
    { emoji: '🧹', label: 'Takarítás' },
    { emoji: '🔧', label: 'Szerelés' },
    { emoji: '🚗', label: 'Autó' },
    { emoji: '💻', label: 'IT' },
    { emoji: '📅', label: 'Általános' },
];

const DAY_NAMES = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

export default function ServicesPage() {
    const { profile } = useAuth();
    const [services, setServices] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', duration_minutes: 30, price: '', category: '', description: '', icon: '', is_group_session: false, max_capacity: 10, show_capacity: false });
    const [groupSchedule, setGroupSchedule] = useState([]); // [{day_of_week, start_time, end_time}]
    const [showIconPicker, setShowIconPicker] = useState(false);
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
            const svcFields = {
                name: form.name,
                duration_minutes: Number(form.duration_minutes),
                price: Number(form.price),
                category: form.category,
                description: form.description,
                icon: form.icon || null,
                is_group_session: form.is_group_session || false,
                max_capacity: form.is_group_session ? Number(form.max_capacity) || 10 : 1,
                show_capacity: form.is_group_session ? (form.show_capacity || false) : false,
            };

            if (editId) {
                if (isSupabaseConfigured && profile?.id) {
                    const data = await updateService(editId, svcFields);
                    setServices(prev => prev.map(s => s.id === editId ? data : s));
                    // Save group schedule
                    if (form.is_group_session) {
                        await saveGroupSchedule(editId, groupSchedule);
                    } else {
                        // Clear schedule if no longer group
                        await saveGroupSchedule(editId, []);
                    }
                } else {
                    setServices(prev => prev.map(s => s.id === editId ? { ...s, ...svcFields } : s));
                }
                setEditId(null);
            } else {
                const newSvc = { ...svcFields, profile_id: profile?.id };
                if (isSupabaseConfigured && profile?.id) {
                    const data = await createService(newSvc);
                    setServices(prev => [...prev, data]);
                    // Save group schedule for new service
                    if (form.is_group_session && data?.id) {
                        await saveGroupSchedule(data.id, groupSchedule);
                    }
                    // Save as community template so others can find it
                    saveCommunityTemplate({ ...newSvc, business_type: businessType }).catch(() => { });
                } else {
                    setServices(prev => [...prev, { ...newSvc, id: Date.now(), is_active: true }]);
                }
            }
            setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '', icon: '', is_group_session: false, max_capacity: 10, show_capacity: false });
            setGroupSchedule([]);
            setIsAdding(false);
        } catch (err) { console.error(err); }
    };

    // Save group schedule (delete + re-insert)
    const saveGroupSchedule = async (serviceId, schedule) => {
        if (!isSupabaseConfigured || !supabase) return;
        // Delete existing schedule
        await supabase.from('group_schedule').delete().eq('service_id', serviceId);
        // Insert new schedule entries
        if (schedule.length > 0) {
            const rows = schedule.map(s => ({
                service_id: serviceId,
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
            }));
            await supabase.from('group_schedule').insert(rows);
        }
    };

    // Load group schedule for a service being edited
    const loadGroupSchedule = async (serviceId) => {
        if (!isSupabaseConfigured || !supabase) return [];
        const { data } = await supabase.from('group_schedule').select('*').eq('service_id', serviceId).order('day_of_week');
        return data || [];
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

    const handleEdit = async (svc) => {
        setForm({
            name: svc.name,
            duration_minutes: svc.duration_minutes,
            price: svc.price,
            category: svc.category || '',
            description: svc.description || '',
            icon: svc.icon || '',
            is_group_session: svc.is_group_session || false,
            max_capacity: svc.max_capacity || 10,
            show_capacity: svc.show_capacity || false,
        });
        setEditId(svc.id);
        setIsAdding(true);
        setShowCatalog(false);
        // Load group schedule if it's a group session
        if (svc.is_group_session) {
            const schedule = await loadGroupSchedule(svc.id);
            setGroupSchedule(schedule.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5) })));
        } else {
            setGroupSchedule([]);
        }
    };

    const handleToggle = async (id) => {
        const svc = services.find(s => s.id === id);
        if (isSupabaseConfigured) await updateService(id, { is_active: !svc.is_active });
        setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
    };

    const handleDelete = async (id) => {
        if (isSupabaseConfigured) await deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    // Reusable form renderer — used both at top (new) and inline (edit)
    const renderServiceForm = (title) => (
        <div className={s.contentCard} style={{ marginBottom: 24, borderLeft: editId ? '4px solid var(--primary-500)' : undefined }}>
            <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>

            {/* ICON PICKER */}
            <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Ikon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setShowIconPicker(!showIconPicker)} style={{
                        width: 52, height: 52, borderRadius: 14, border: '2px dashed var(--gray-200)',
                        background: form.icon ? 'var(--primary-50)' : 'var(--gray-50)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {form.icon || '➕'}
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                        {form.icon ? SERVICE_ICONS.find(i => i.emoji === form.icon)?.label || 'Egyéni' : 'Válassz ikont a szolgáltatáshoz'}
                    </span>
                </div>
                {showIconPicker && (
                    <div style={{ marginTop: 10, padding: 16, background: 'var(--gray-50)', borderRadius: 14, border: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                            {SERVICE_ICONS.map(ic => (
                                <button key={ic.emoji} onClick={() => { setForm(p => ({ ...p, icon: ic.emoji })); setShowIconPicker(false); }}
                                    style={{
                                        padding: '10px 4px', borderRadius: 10, border: form.icon === ic.emoji ? '2px solid var(--primary-500)' : '2px solid transparent',
                                        background: form.icon === ic.emoji ? 'var(--primary-50)' : 'white',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                                    }}>
                                    <div style={{ fontSize: '1.4rem' }}>{ic.emoji}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', marginTop: 2 }}>{ic.label}</div>
                                </button>
                            ))}
                        </div>
                        {form.icon && (
                            <button onClick={() => { setForm(p => ({ ...p, icon: '' })); setShowIconPicker(false); }}
                                style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                ✕ Ikon eltávolítása
                            </button>
                        )}
                    </div>
                )}
            </div>

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

            {/* GROUP SESSION TOGGLE */}
            <div style={{ marginTop: 20, padding: 20, background: 'var(--gray-50)', borderRadius: 14, border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.is_group_session ? 16 : 0 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-800)' }}>👥 Csoportos óra</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>Több személy foglalhat ugyanarra az időpontra</div>
                    </div>
                    <button onClick={() => setForm(p => ({ ...p, is_group_session: !p.is_group_session }))}
                        style={{
                            padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                            background: form.is_group_session ? 'var(--primary-500)' : 'var(--gray-200)',
                            color: form.is_group_session ? 'white' : 'var(--gray-600)',
                            transition: 'all 0.2s',
                        }}>
                        {form.is_group_session ? '✅ Bekapcsolva' : '❌ Kikapcsolva'}
                    </button>
                </div>

                {form.is_group_session && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div className="input-group">
                                <label className="input-label">Max. létszám</label>
                                <input type="number" className="input" min="2" max="100" value={form.max_capacity}
                                    onChange={e => setForm(p => ({ ...p, max_capacity: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Létszám mutatása</label>
                                <button onClick={() => setForm(p => ({ ...p, show_capacity: !p.show_capacity }))}
                                    style={{
                                        padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--gray-200)',
                                        background: form.show_capacity ? 'var(--success-light)' : 'white',
                                        color: form.show_capacity ? 'var(--success)' : 'var(--gray-600)',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', width: '100%', textAlign: 'center',
                                    }}>
                                    {form.show_capacity ? '👁️ Látható az ügyfélnek' : '🙈 Rejtett'}
                                </button>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>📅 Órarend</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Add meg, mikor tartod a csoportos órákat</div>
                                </div>
                                <button onClick={() => setGroupSchedule(prev => [...prev, { day_of_week: 0, start_time: '09:00', end_time: '10:00' }])}
                                    className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>+ Időpont</button>
                            </div>

                            {groupSchedule.length === 0 && (
                                <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
                                    Adj hozzá legalább egy időpontot, amikor a csoportos óra elérhető.
                                </p>
                            )}

                            {groupSchedule.map((slot, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                                    <select className="input" value={slot.day_of_week}
                                        onChange={e => {
                                            const updated = [...groupSchedule];
                                            updated[idx] = { ...updated[idx], day_of_week: Number(e.target.value) };
                                            setGroupSchedule(updated);
                                        }}
                                        style={{ flex: 1.2 }}>
                                        {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                                    </select>
                                    <input type="time" className="input" value={slot.start_time}
                                        onChange={e => {
                                            const updated = [...groupSchedule];
                                            updated[idx] = { ...updated[idx], start_time: e.target.value };
                                            setGroupSchedule(updated);
                                        }}
                                        style={{ flex: 1 }} />
                                    <span style={{ color: 'var(--gray-400)' }}>–</span>
                                    <input type="time" className="input" value={slot.end_time}
                                        onChange={e => {
                                            const updated = [...groupSchedule];
                                            updated[idx] = { ...updated[idx], end_time: e.target.value };
                                            setGroupSchedule(updated);
                                        }}
                                        style={{ flex: 1 }} />
                                    <button onClick={() => setGroupSchedule(prev => prev.filter((_, i) => i !== idx))}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '1.1rem', padding: 4 }}>🗑</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button onClick={handleSave} className="btn btn-primary btn-sm">💾 Mentés</button>
                <button onClick={() => { setIsAdding(false); setEditId(null); }} className="btn btn-secondary btn-sm">Mégse</button>
            </div>
        </div>
    );

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
                    <button onClick={() => { setIsAdding(true); setEditId(null); setShowCatalog(false); setGroupSchedule([]); setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '', icon: '', is_group_session: false, max_capacity: 10, show_capacity: false }); }} className="btn btn-primary btn-sm">+ Egyéni</button>
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

            {/* ADD NEW FORM (top position — only for new services, not edits) */}
            {isAdding && !editId && renderServiceForm('➕ Egyéni szolgáltatás')}

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
                        <button onClick={() => { setIsAdding(true); setGroupSchedule([]); setForm({ name: '', duration_minutes: 30, price: '', category: '', description: '', icon: '', is_group_session: false, max_capacity: 10, show_capacity: false }); }} className="btn btn-secondary">+ Egyéni szolgáltatás</button>
                    </div>
                </div>
            )}

            {/* SERVICE LIST */}
            {services.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map(svc => {
                        const defaultIcon = businessType === 'salon' ? '💇' : businessType === 'beauty' ? '💅' : businessType === 'fitness' ? '💪' : businessType === 'health' ? '🏥' : businessType === 'consulting' ? '💼' : '📋';
                        const svcIcon = svc.icon || defaultIcon;
                        const isEditing = editId === svc.id;
                        return (
                            <div key={svc.id}>
                                <div className={s.contentCard} style={{ opacity: svc.is_active !== false ? 1 : 0.5, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: svc.is_group_session ? 'var(--accent-50, #fef3c7)' : 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                                {svcIcon}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{svc.name}</span>
                                                    {svc.is_group_session && (
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--accent-100, #fef3c7)', color: 'var(--accent-700, #92400e)' }}>
                                                            👥 Csoportos • max {svc.max_capacity} fő
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{svc.category ? `${svc.category} • ` : ''}{svc.duration_minutes} perc{svc.description ? ` • ${svc.description}` : ''}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-800)' }}>{Number(svc.price).toLocaleString('hu-HU')} Ft</span>
                                            <button onClick={() => handleToggle(svc.id)} className="btn btn-ghost btn-sm">{svc.is_active !== false ? '✅' : '❌'}</button>
                                            <button onClick={() => isEditing ? setEditId(null) : handleEdit(svc)} className="btn btn-ghost btn-sm" style={isEditing ? { background: 'var(--primary-50)', borderRadius: 8 } : {}}>✏️</button>
                                            <button onClick={() => handleDelete(svc.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>🗑</button>
                                        </div>
                                    </div>
                                </div>
                                {/* Inline edit form — appears right below this service */}
                                {isEditing && renderServiceForm('✏️ Szolgáltatás szerkesztése')}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
