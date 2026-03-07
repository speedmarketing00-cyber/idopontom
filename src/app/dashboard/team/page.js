'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import s from '../dashboard.module.css';

export default function TeamPage() {
    const { profile } = useAuth();
    const tier = profile?.subscription_tier || 'free';
    const isProfi = tier === 'pro';

    const [members, setMembers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: 'Fodrász' });
    const [loading, setLoading] = useState(true);
    const [emailStatus, setEmailStatus] = useState({}); // { [memberId]: 'sending' | 'sent' | 'error' }

    // Load team members from DB
    useEffect(() => {
        async function load() {
            if (!profile?.id || !isProfi) { setLoading(false); return; }
            const { data } = await supabase.from('team_members').select('*')
                .eq('profile_id', profile.id).order('created_at');
            setMembers(data || []);
            setLoading(false);
        }
        load();
    }, [profile?.id, isProfi]);

    const sendInviteEmail = async (member) => {
        setEmailStatus(prev => ({ ...prev, [member.id]: 'sending' }));
        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'team_invite',
                    data: {
                        memberEmail: member.email,
                        memberName: member.name,
                        ownerName: profile?.name || profile?.business_name || 'Tulajdonos',
                        businessName: profile?.business_name || 'Vállalkozás',
                        role: member.role,
                    },
                }),
            });
            if (res.ok) {
                setEmailStatus(prev => ({ ...prev, [member.id]: 'sent' }));
                setTimeout(() => setEmailStatus(prev => ({ ...prev, [member.id]: null })), 3000);
            } else {
                setEmailStatus(prev => ({ ...prev, [member.id]: 'error' }));
            }
        } catch {
            setEmailStatus(prev => ({ ...prev, [member.id]: 'error' }));
        }
    };

    const handleAdd = async () => {
        if (!form.name || !form.email || !profile?.id) return;
        if (members.length >= 9) return; // max 10 including owner
        const { data, error } = await supabase.from('team_members').insert({
            profile_id: profile.id, name: form.name, email: form.email, role: form.role, is_active: true
        }).select().single();
        if (!error && data) {
            setMembers(prev => [...prev, data]);
            await sendInviteEmail(data);
        }
        setForm({ name: '', email: '', role: 'Fodrász' });
        setIsAdding(false);
    };

    const handleRemove = async (id) => {
        await supabase.from('team_members').delete().eq('id', id);
        setMembers(prev => prev.filter(m => m.id !== id));
    };
    const handleToggle = async (id) => {
        const m = members.find(x => x.id === id);
        if (!m) return;
        await supabase.from('team_members').update({ is_active: !m.is_active }).eq('id', id);
        setMembers(prev => prev.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
    };

    // Free and Alap users see upgrade message
    if (!isProfi) {
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>Csapat 👥</h1>
                        <p>Csapatkezelés</p>
                    </div>
                </div>

                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>👥</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, fontSize: '1.5rem' }}>
                        Csapatkezelés
                    </h2>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 8, maxWidth: 450, margin: '0 auto', lineHeight: 1.6 }}>
                        Hívj meg kollégákat, osszátok meg a naptárat, és kezeljétek együtt a foglalásokat!
                    </p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: 28, maxWidth: 450, margin: '12px auto 28px' }}>
                        A csapatkezelés funkció a <strong>Profi csomagban</strong> érhető el, amely max. 10 alfiókot tartalmaz.
                    </p>

                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))',
                        borderRadius: 16, padding: 24, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px',
                        border: '1.5px solid var(--primary-100)'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>🏢 Profi csomag</div>
                        <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: 8 }}>19 997 Ft/hó</div>
                        <ul style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                            <li>✅ 6-10 alfiók (csapattag)</li>
                            <li>✅ Csapat naptár</li>
                            <li>✅ Jogosultság kezelés</li>
                            <li>✅ Prioritásos támogatás</li>
                        </ul>
                    </div>

                    <Link href="/dashboard/settings" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }}>
                        ⬆️ Váltás Profi csomagra
                    </Link>
                </div>
            </div>
        );
    }

    // Profi users see team management
    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Csapat 👥</h1>
                    <p>{members.length + 1} csapattag • Profi csomag</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary btn-sm">+ Meghívás</button>
                </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>Profi csomag – max. 10 alfiók</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{members.length + 1}/10 helyet használsz</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 120, height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((members.length + 1) / 10) * 100}%`, background: 'var(--primary-500)', borderRadius: 4 }} />
                </div>
            </div>

            {isAdding && (
                <div className={s.contentCard} style={{ marginBottom: 20, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>👤 Új csapattag meghívása</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                            <label className="input-label">Név</label>
                            <input className="input" placeholder="Vezetéknév Keresztnév" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-mail</label>
                            <input className="input" placeholder="email@pelda.hu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Szerepkör</label>
                            <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                <option>Fodrász</option>
                                <option>Kozmetikus</option>
                                <option>Asszisztens</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button onClick={handleAdd} className="btn btn-primary btn-sm">📧 Meghívó küldése</button>
                        <button onClick={() => setIsAdding(false)} className="btn btn-secondary btn-sm">Mégse</button>
                    </div>
                </div>
            )}

            {/* Owner card always shown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className={s.contentCard} style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-300), var(--accent-300))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                {(profile?.name || profile?.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{profile?.name || 'Tulajdonos'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{profile?.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className="badge badge-primary">Tulajdonos</span>
                            <span className="btn btn-ghost btn-sm">✅</span>
                        </div>
                    </div>
                </div>

                {members.map(m => (
                    <div key={m.id} className={s.contentCard} style={{ padding: 18, opacity: m.is_active ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-300), var(--accent-300))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{(m.name || '?')[0].toUpperCase()}</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{m.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="badge badge-primary">{m.role}</span>
                                <button
                                    onClick={() => sendInviteEmail(m)}
                                    disabled={emailStatus[m.id] === 'sending'}
                                    className="btn btn-ghost btn-sm"
                                    title="Meghívó újraküldése"
                                    style={{ fontSize: '0.75rem', color: emailStatus[m.id] === 'sent' ? 'var(--success)' : emailStatus[m.id] === 'error' ? 'var(--error)' : 'var(--gray-500)' }}
                                >
                                    {emailStatus[m.id] === 'sending' ? '⏳' : emailStatus[m.id] === 'sent' ? '✓ Elküldve' : emailStatus[m.id] === 'error' ? '✗ Hiba' : '📧'}
                                </button>
                                <button onClick={() => handleToggle(m.id)} className="btn btn-ghost btn-sm">{m.is_active ? '✅' : '❌'}</button>
                                <button onClick={() => handleRemove(m.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>🗑</button>
                            </div>
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className={s.contentCard} style={{ padding: 32, textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Még nincs csapattagod. Kattints a <strong>+ Meghívás</strong> gombra!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
