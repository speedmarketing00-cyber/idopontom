'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import s from '../auth.module.css';

export default function CompleteProfilePage() {
    const [form, setForm] = useState({ businessName: '', businessType: 'salon' });
    const [loading, setLoading] = useState(false);
    const { user, updateProfile } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.businessName) return;
        setLoading(true);
        try {
            const slug = form.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36).slice(-4);
            await updateProfile({
                business_name: form.businessName,
                business_type: form.businessType,
                slug,
                name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
            });
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
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
                <form onSubmit={handleSubmit} className={s.authForm}>
                    <div className="input-group">
                        <label className="input-label">Vállalkozás neve</label>
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
