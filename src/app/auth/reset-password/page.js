'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../auth.module.css';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const router = useRouter();

    // Supabase automatically picks up the recovery token from the URL hash
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setSessionReady(true);
            }
        });

        // Also check if there's already an active session (user clicked the link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError('Kérlek töltsd ki mindkét mezőt!');
            return;
        }
        if (password.length < 6) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
            return;
        }
        if (password !== confirmPassword) {
            setError('A két jelszó nem egyezik!');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });
            if (updateError) throw updateError;
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 3000);
        } catch (err) {
            setError(err.message || 'Hiba történt a jelszó módosításakor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.authPage}>
            <div className={s.authBg}>
                <div className={s.authBlob1}></div>
                <div className={s.authBlob2}></div>
            </div>
            <div className={`${s.authCard} animate-scale-in`}>
                <Link href="/" className={s.authLogo}>
                    <span className={s.authLogoIcon}>📅</span>
                    <span className={s.authLogoText}>Foglalj Velem</span>
                </Link>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h1 className={s.authTitle}>Jelszó sikeresen módosítva!</h1>
                        <p className={s.authSubtitle}>Átirányítunk a vezérlőpultra...</p>
                    </div>
                ) : !sessionReady ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🔒</div>
                        <h1 className={s.authTitle}>Jelszó visszaállítás</h1>
                        <p className={s.authSubtitle}>Link betöltése... Kérlek várj egy pillanatot.</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 16 }}>
                            Ha nem töltődik be, <Link href="/auth/login" style={{ color: 'var(--primary-500)' }}>kérj új linket</Link>.
                        </p>
                    </div>
                ) : (
                    <>
                        <h1 className={s.authTitle}>Új jelszó beállítása 🔐</h1>
                        <p className={s.authSubtitle}>Add meg az új jelszavadat</p>

                        {error && <div className={s.errorMsg}>{error}</div>}

                        <form onSubmit={handleSubmit} className={s.authForm}>
                            <div className="input-group">
                                <label className="input-label">Új jelszó *</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Min. 6 karakter"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Jelszó megerősítése *</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Írd be újra a jelszót"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`btn btn-primary ${s.authSubmitBtn}`}
                                disabled={loading}
                            >
                                {loading ? '⏳ Mentés...' : '🔒 Jelszó mentése'}
                            </button>
                        </form>
                    </>
                )}

                <p className={s.authFooter}>
                    <Link href="/auth/login">Vissza a bejelentkezéshez</Link>
                </p>
            </div>
        </div>
    );
}
