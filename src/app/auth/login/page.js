'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import s from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Kérlek töltsd ki az összes mezőt!'); return; }
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('Email not confirmed')) setError('📧 Az e-mail címed még nincs megerősítve! Nézd meg a postaládádat, vagy próbálj Google-lal bejelentkezni.');
            else if (msg === 'Invalid login credentials') setError('Hibás e-mail vagy jelszó!');
            else setError(msg || 'Hiba történt a bejelentkezéskor.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try { await signInWithGoogle(); }
        catch (err) { setError(err.message || 'Google bejelentkezés sikertelen.'); }
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
                <h1 className={s.authTitle}>Üdv újra! 👋</h1>
                <p className={s.authSubtitle}>Jelentkezz be a fiókodba</p>
                {error && <div className={s.errorMsg}>{error}</div>}

                <div className={s.authSocial}>
                    <button onClick={handleGoogleLogin} className={s.authSocialBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Bejelentkezés Google-lal
                    </button>
                </div>

                <div className={s.authDivider}>vagy e-mail címmel</div>

                <form onSubmit={handleSubmit} className={s.authForm}>
                    <div className="input-group">
                        <label className="input-label">E-mail cím</label>
                        <input type="email" className="input" placeholder="pelda@email.hu" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Jelszó</label>
                        <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className={s.forgotLink}><a href="#">Elfelejtett jelszó?</a></div>
                    <button type="submit" className={`btn btn-primary ${s.authSubmitBtn}`} disabled={loading}>
                        {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                    </button>
                </form>
                <p className={s.authFooter}>Még nincs fiókod? <Link href="/auth/register">Regisztrálj ingyen</Link></p>
            </div>
        </div>
    );
}
