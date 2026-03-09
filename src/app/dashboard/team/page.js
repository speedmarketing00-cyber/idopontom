'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import s from '../dashboard.module.css';

export default function TeamPage() {
    const { profile, teamMemberInfo } = useAuth();
    const isTeamMember = !!profile?._isTeamMemberOnly;
    // For pro check: team members have owner's profile (tier=pro) but mustn't manage the team
    const tier = isTeamMember ? 'basic' : (profile?.subscription_tier || 'free');
    const isProfi = tier === 'pro';

    const [members, setMembers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Load team members via API (admin supabase – bypasses RLS)
    useEffect(() => {
        async function load() {
            if (!profile?.id || !isProfi) { setLoading(false); return; }
            try {
                const res = await fetch(`/api/team?profileId=${profile.id}`);
                const json = await res.json();
                setMembers(json.members || []);
            } catch (e) {
                console.error('Failed to load team:', e);
            }
            setLoading(false);
        }
        load();
    }, [profile?.id, isProfi]);

    const handleAdd = async () => {
        if (!form.name || !form.email || !profile?.id) return;
        if (members.length >= 8) return;
        setError('');
        setSaving(true);
        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: profile.id,
                    name: form.name,
                    email: form.email,
                    ownerName: profile?.name || profile?.business_name || 'Tulajdonos',
                    businessName: profile?.business_name || 'Vállalkozás',
                }),
            });
            const json = await res.json();
            if (json.member) {
                setMembers(prev => [...prev, json.member]);
                setForm({ name: '', email: '' });
                setIsAdding(false);
            } else {
                setError(json.error || 'Hiba történt a meghívás során');
            }
        } catch (e) {
            setError('Hiba a mentés során');
        }
        setSaving(false);
    };

    const handleRemove = async (member) => {
        if (!confirm(`Biztosan eltávolítod ${member.name} csapattagot?`)) return;
        try {
            await fetch('/api/team/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: member.id,
                    memberEmail: member.email,
                    memberName: member.name,
                    ownerName: profile?.name || profile?.business_name || 'Tulajdonos',
                    businessName: profile?.business_name || 'Vállalkozás',
                }),
            });
            setMembers(prev => prev.filter(x => x.id !== member.id));
        } catch (e) {
            console.error('Remove error:', e);
        }
    };

    // Team members see a read-only "you belong to this team" view
    if (isTeamMember) {
        const ownerBusiness = teamMemberInfo?.ownerProfile?.business_name || teamMemberInfo?.ownerProfile?.name || 'Ismeretlen';
        const ownerName = teamMemberInfo?.ownerProfile?.name || '';
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>Csapat 👥</h1>
                        <p>Csapattagság</p>
                    </div>
                </div>
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>👥</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, fontSize: '1.5rem' }}>
                        Te egy csapat tagja vagy
                    </h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 8, maxWidth: 440, margin: '0 auto 12px', lineHeight: 1.7 }}>
                        Jelenleg a <strong>{ownerBusiness}</strong>{ownerName ? ` (${ownerName})` : ''} csapatában dolgozol.
                    </p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', maxWidth: 420, margin: '0 auto 28px' }}>
                        Csapattagként automatikusan megkaptad az <strong>⭐ Alap csomag</strong> összes funkcióját ingyenesen – amíg a csapatban maradsz.
                    </p>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))',
                        borderRadius: 16, padding: 20, maxWidth: 360, margin: '0 auto',
                        border: '1.5px solid var(--primary-100)', textAlign: 'left'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10, color: 'var(--gray-800)' }}>⭐ Aktív csomag: Alap</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.9 }}>
                            <li>✅ E-mail értesítések & emlékeztetők</li>
                            <li>✅ Statisztikák</li>
                            <li>✅ Értékelések</li>
                            <li>✅ Email beállítások</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

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
                        A csapatkezelés funkció a <strong>Profi csomagban</strong> érhető el, amely max. 8 csapattagot tartalmaz.
                    </p>

                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))',
                        borderRadius: 16, padding: 24, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px',
                        border: '1.5px solid var(--primary-100)'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>🏢 Profi csomag</div>
                        <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: 8 }}>19 997 Ft/hó</div>
                        <ul style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                            <li>✅ Max. 8 csapattag meghívása</li>
                            <li>✅ Csapattagok Alap csomagot kapnak</li>
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
                    <p>{members.length} csapattag meghívva • Profi csomag</p>
                </div>
                <div className={s.topBarRight}>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn btn-primary btn-sm"
                        disabled={members.length >= 8}
                        title={members.length >= 8 ? 'Elérted a maximum 8 fős limitet' : ''}
                    >
                        {members.length >= 8 ? '🔒 Max. elérve' : '+ Meghívás'}
                    </button>
                </div>
            </div>

            {/* Info: subscription warning */}
            <div style={{
                background: '#fffdf0', border: '1px solid #fde68a', borderRadius: 12,
                padding: 16, marginBottom: 20, fontSize: '0.85rem', color: '#92400e', lineHeight: 1.6,
            }}>
                <strong>💡 Fontos:</strong> Ha a meghívni kívánt személynek van fizetős előfizetése (Alap csomag), kérd meg, hogy váltson vissza az <strong>Ingyenes</strong> csomagra a Beállítások oldalon, mielőtt csatlakozik a csapathoz. Így a rendszer nem vonja tovább automatikusan a havidíjat – csapattagként ingyenesen megkapja az Alap csomag funkcióit!
            </div>

            {/* Progress bar */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>Profi csomag – max. 8 csapattag</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{members.length}/8 meghívott csapattag</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 120, height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(members.length / 8) * 100}%`, background: members.length >= 8 ? 'var(--error)' : 'var(--primary-500)', borderRadius: 4 }} />
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 14, marginBottom: 16, color: '#dc2626', fontSize: '0.85rem' }}>
                    ❌ {error}
                </div>
            )}

            {/* Add member form */}
            {isAdding && (
                <div className={s.contentCard} style={{ marginBottom: 20, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>👤 Új csapattag meghívása</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
                        A meghívott kolléga maga regisztrál és állítja be a profilját. Automatikusan ⭐ Alap csomagot kap, amíg a csapat tagja.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="input-group">
                            <label className="input-label">Név</label>
                            <input className="input" placeholder="Vezetéknév Keresztnév" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-mail cím</label>
                            <input className="input" placeholder="email@pelda.hu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button onClick={handleAdd} className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? '⏳ Mentés...' : '📧 Meghívó küldése'}
                        </button>
                        <button onClick={() => { setIsAdding(false); setError(''); }} className="btn btn-secondary btn-sm">Mégse</button>
                    </div>
                </div>
            )}

            {/* Member list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Owner card */}
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
                        <span className="badge badge-primary">Tulajdonos</span>
                    </div>
                </div>

                {/* Team members */}
                {members.map(m => (
                    <div key={m.id} className={s.contentCard} style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-300), var(--accent-300))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                    {(m.name || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{m.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(m)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--error)', fontSize: '0.85rem' }}
                            >
                                🗑 Törlés
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty state */}
                {!loading && members.length === 0 && (
                    <div className={s.contentCard} style={{ padding: 32, textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Még nincs csapattagod. Kattints a <strong>+ Meghívás</strong> gombra!</p>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className={s.contentCard} style={{ padding: 32, textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Betöltés...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
