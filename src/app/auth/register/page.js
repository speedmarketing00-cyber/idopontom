'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import s from '../auth.module.css';

const PLANS = [
    {
        id: 'free',
        name: 'Ingyenes',
        emoji: '🆓',
        price: '0 Ft/hó',
        desc: 'Alap foglalási rendszer, korlátozott funkciókkal.',
        features: ['Foglalási oldal', 'Naptárkezelés', 'E-mail értesítők nélkül'],
        highlight: false,
    },
    {
        id: 'alap',
        name: 'Alap',
        emoji: '⭐',
        price: '4 997 Ft/hó',
        trial: '14 nap ingyen',
        desc: 'Egyéni szolgáltatóknak – teljes körű funkciókkal.',
        features: ['E-mail értesítők & emlékeztetők', 'Statisztikák', 'Email beállítások', '14 nap próbaidőszak'],
        highlight: true,
    },
    {
        id: 'profi',
        name: 'Profi',
        emoji: '🏢',
        price: '19 997 Ft/hó',
        trial: '14 nap ingyen',
        desc: 'Csapatoknak – több dolgozó, prioritásos támogatás.',
        features: ['Minden Alap funkció', 'Csapatkezelés (6-10 fő)', 'Prioritásos támogatás', '14 nap próbaidőszak'],
        highlight: false,
    },
];

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '', businessType: 'salon' });
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password) { setError('Kérlek töltsd ki az összes kötelező mezőt!'); return; }
        if (form.password.length < 6) { setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!'); return; }
        setLoading(true);
        try {
            await signUp(form.email, form.password, {
                name: form.name,
                business_name: form.businessName || form.name,
                business_type: form.businessType,
            });

            if (selectedPlan !== 'free') {
                // Redirect to Stripe checkout for paid plan (with 14-day trial)
                // We need profileId — it's created in signUp, so redirect to a special page
                router.push(`/dashboard/settings?startPlan=${selectedPlan}`);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Hiba történt a regisztráció során.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try { await signInWithGoogle(); }
        catch (err) { setError(err.message || 'Google regisztráció sikertelen.'); }
    };

    return (
        <div className={s.authPage}>
            <div className={s.authBg}>
                <div className={s.authBlob1}></div>
                <div className={s.authBlob2}></div>
            </div>
            <div className={`${s.authCard} animate-scale-in`} style={{ maxWidth: 680 }}>
                <Link href="/" className={s.authLogo}>
                    <span className={s.authLogoIcon}>📅</span>
                    <span className={s.authLogoText}>Foglalj Velem</span>
                </Link>
                <h1 className={s.authTitle}>Hozd létre fiókodat! 🚀</h1>
                <p className={s.authSubtitle}>Válassz csomagot – a fizetős csomagok 14 napig ingyenesek</p>
                {error && <div className={s.errorMsg}>{error}</div>}

                {/* Plan selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            style={{
                                border: `2px solid ${selectedPlan === plan.id ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                                borderRadius: 14,
                                padding: '14px 12px',
                                cursor: 'pointer',
                                background: selectedPlan === plan.id ? 'var(--primary-50)' : plan.highlight ? 'var(--gray-50)' : 'white',
                                transition: 'all 0.2s',
                                position: 'relative',
                                textAlign: 'center',
                            }}
                        >
                            {plan.highlight && (
                                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-500)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                                    LEGNÉPSZERŰBB
                                </div>
                            )}
                            {plan.trial && (
                                <div style={{ background: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, marginBottom: 6, display: 'inline-block' }}>
                                    ✓ {plan.trial}
                                </div>
                            )}
                            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{plan.emoji}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{plan.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600, marginBottom: 8 }}>{plan.price}</div>
                            <ul style={{ textAlign: 'left', paddingLeft: 14, fontSize: '0.72rem', color: 'var(--gray-500)', listStyle: 'none' }}>
                                {plan.features.map(f => (
                                    <li key={f} style={{ marginBottom: 2 }}>✓ {f}</li>
                                ))}
                            </ul>
                            {selectedPlan === plan.id && (
                                <div style={{ marginTop: 8, width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 0', color: 'white', fontSize: '0.8rem' }}>✓</div>
                            )}
                        </div>
                    ))}
                </div>

                {selectedPlan !== 'free' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#92400e' }}>
                        💳 A <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong> csomagnál kártyaadatot kell megadni, de az első 14 napban <strong>nem vonódik le semmi</strong>. Bármikor lemondható.
                    </div>
                )}

                <div className={s.authSocial}>
                    <button onClick={handleGoogleLogin} className={s.authSocialBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Regisztráció Google-lal
                    </button>
                </div>

                <div className={s.authDivider}>vagy e-mail címmel</div>

                <form onSubmit={handleSubmit} className={s.authForm}>
                    <div className={s.authRow}>
                        <div className="input-group">
                            <label className="input-label">Teljes neved *</label>
                            <input type="text" className="input" placeholder="Kiss Anna" value={form.name} onChange={handleChange('name')} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-mail cím *</label>
                            <input type="email" className="input" placeholder="pelda@email.hu" value={form.email} onChange={handleChange('email')} required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Vállalkozás neve <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.8rem' }}>(opcionális)</span></label>
                        <input type="text" className="input" placeholder="Szépség Szalon Kati" value={form.businessName} onChange={handleChange('businessName')} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Szakterület</label>
                        <select className="input" value={form.businessType} onChange={handleChange('businessType')}>
                            <option value="salon">💇 Fodrász szalon</option>
                            <option value="beauty">💅 Kozmetika</option>
                            <option value="fitness">💪 Edző / Fitness</option>
                            <option value="consulting">💼 Tanácsadó</option>
                            <option value="health">🏥 Egészségügy</option>
                            <option value="other">📋 Egyéb</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Jelszó *</label>
                        <input type="password" className="input" placeholder="Min. 6 karakter" value={form.password} onChange={handleChange('password')} required />
                    </div>
                    <button type="submit" className={`btn btn-primary ${s.authSubmitBtn}`} disabled={loading}>
                        {loading ? 'Fiók létrehozása...' : selectedPlan === 'free' ? 'Ingyenes regisztráció →' : `Regisztráció és 14 napos trial →`}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
                        A regisztrációval elfogadod az <Link href="/aszf" style={{ color: 'var(--primary-500)' }}>ÁSZF</Link>-et és az <Link href="/adatvedelem" style={{ color: 'var(--primary-500)' }}>Adatvédelmi tájékoztatót</Link>.
                    </p>
                </form>
                <p className={s.authFooter}>Már van fiókod? <Link href="/auth/login">Bejelentkezés</Link></p>
            </div>
        </div>
    );
}
