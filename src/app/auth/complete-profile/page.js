'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import s from '../auth.module.css';

export default function CompleteProfilePage() {
    const [form, setForm] = useState({ businessName: '', businessType: 'salon', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, updateProfile } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.businessName) { setError('Add meg a vállalkozásod nevét!'); return; }
        if (!form.phone) { setError('Add meg a telefonszámodat!'); return; }
        setLoading(true);
        try {
            const slug = form.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36).slice(-4);
            const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
            const userEmail = user?.email || '';
            await updateProfile({
                business_name: form.businessName,
                business_type: form.businessType,
                phone: form.phone,
                slug,
                name: userName,
            });

            // 📧 Registration emails (welcome + admin notification)
            try {
                await fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'registration_welcome',
                        data: { userName: userName || form.businessName, userEmail },
                    }),
                });
                await fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'registration_admin_notify',
                        data: {
                            userName: userName || form.businessName,
                            userEmail,
                            userPhone: form.phone,
                            businessName: form.businessName,
                            businessType: form.businessType,
                            method: 'Google',
                        },
                    }),
                });
            } catch (emailErr) { console.warn('Registration email error:', emailErr); }

            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Hiba történt a mentés során.');
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
                <h1 className={s.authTitle}>Még egy lépés! 🎯</h1>
                <p className={s.authSubtitle}>Add meg a vállalkozásod adatait</p>
                {error && <div className={s.errorMsg}>{error}</div>}
                <form onSubmit={handleSubmit} className={s.authForm}>
                    <div className="input-group">
                        <label className="input-label">Telefonszám *</label>
                        <input type="tel" className="input" placeholder="+36 30 123 4567" value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Vállalkozás neve *</label>
                        <input type="text" className="input" placeholder="pl. Szépség Szalon Kati" value={form.businessName}
                            onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Szakterület</label>
                        <select className="input" value={form.businessType} onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))}>
                            <option value="salon">💇 Fodrász szalon</option>
                            <option value="beauty">💅 Kozmetika</option>
                            <option value="fitness">💪 Edző / Fitness</option>
                            <option value="consulting">💼 Tanácsadó</option>
                            <option value="health">🏥 Egészségügy</option>
                            <option value="other">📋 Egyéb</option>
                        </select>
                    </div>
                    <button type="submit" className={`btn btn-primary ${s.authSubmitBtn}`} disabled={loading}>
                        {loading ? 'Mentés...' : 'Indítsd el a foglalásokat! →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
