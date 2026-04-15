'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

export default function InvoiceSettingsPage() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        company_name: '',
        tax_number: '',
        eu_tax_number: '',
        address: '',
        city: '',
        zip_code: '',
        country: 'HU',
        bank_name: '',
        bank_account: '',
        invoice_prefix: 'FV',
        nav_login: '',
        nav_password: '',
        nav_signing_key: '',
        nav_replacement_key: '',
        nav_tax_number: '',
    });

    useEffect(() => {
        if (!profile?.id) return;
        loadSettings();
    }, [profile?.id]);

    const loadSettings = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('profile_id', profile.id)
            .maybeSingle();

        if (data) {
            setForm({
                company_name: data.company_name || '',
                tax_number: data.tax_number || '',
                eu_tax_number: data.eu_tax_number || '',
                address: data.address || '',
                city: data.city || '',
                zip_code: data.zip_code || '',
                country: data.country || 'HU',
                bank_name: data.bank_name || '',
                bank_account: data.bank_account || '',
                invoice_prefix: data.invoice_prefix || 'FV',
                nav_login: data.nav_login || '',
                nav_password: data.nav_password || '',
                nav_signing_key: data.nav_signing_key || '',
                nav_replacement_key: data.nav_replacement_key || '',
                nav_tax_number: data.nav_tax_number || '',
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            // Validate required fields
            if (!form.company_name || !form.tax_number || !form.address || !form.city || !form.zip_code) {
                setError('Kérlek töltsd ki a kötelező mezőket (Cégnév, Adószám, Cím, Város, Irányítószám).');
                setSaving(false);
                return;
            }

            // Upsert (insert or update)
            const { error: upsertError } = await supabase
                .from('invoice_settings')
                .upsert({
                    profile_id: profile.id,
                    ...form,
                }, { onConflict: 'profile_id' });

            if (upsertError) throw upsertError;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Mentés sikertelen: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const f = (key, label, placeholder, opts = {}) => (
        <div className="input-group" style={opts.style}>
            <label className="input-label">
                {label}
                {opts.required && <span style={{ color: 'var(--error)', marginLeft: 4 }}>*</span>}
            </label>
            <input
                className="input"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                type={opts.type || 'text'}
            />
        </div>
    );

    if (loading) {
        return (
            <div>
                <div className={s.topBar}><div className={s.topBarLeft}><h1>Cégadatok 🏢</h1><p>Betöltés...</p></div></div>
            </div>
        );
    }

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Cégadatok 🏢</h1>
                    <p>Számlázási adatok és NAV beállítások</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? '⏳ Mentés...' : saved ? '✅ Mentve!' : '💾 Mentés'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', borderRadius: 10, margin: '0 0 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* Company Data */}
            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>📋 Cégadatok</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                    Ezek az adatok jelennek meg a számláidon mint kiállító.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    {f('company_name', 'Cégnév / Vállalkozó neve', 'Példa Kft.', { required: true })}
                    {f('tax_number', 'Adószám', '12345678-1-23', { required: true })}
                    {f('eu_tax_number', 'EU adószám (opcionális)', 'HU12345678')}
                    {f('zip_code', 'Irányítószám', '1011', { required: true })}
                    {f('city', 'Város', 'Budapest', { required: true })}
                    {f('address', 'Cím', 'Fő utca 1.', { required: true })}
                </div>
            </div>

            {/* Bank Data */}
            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>🏦 Bankszámla</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                    Átutalásos számlákhoz megjelenik a bankszámlaszámod.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    {f('bank_name', 'Bank neve', 'OTP Bank')}
                    {f('bank_account', 'Bankszámlaszám', '11111111-22222222-33333333')}
                </div>
            </div>

            {/* Invoice Prefix */}
            <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>🔢 Számla sorszámozás</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20 }}>
                    A számlák automatikusan sorszámozódnak. Az előtag (prefix) a számla sorszám eleje.
                    Pl.: <strong>{form.invoice_prefix || 'FV'}-2026-001</strong>
                </p>
                <div style={{ maxWidth: 300 }}>
                    {f('invoice_prefix', 'Számla előtag (prefix)', 'FV')}
                </div>
            </div>

            {/* NAV Settings */}
            <div className={s.contentCard} style={{ padding: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>🏛️ NAV Online Számla</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 20, lineHeight: 1.6 }}>
                    A NAV Online Számla rendszerbe való adatszolgáltatáshoz szükséges technikai felhasználó adatok.
                    Ezeket a <a href="https://onlineszamla.nav.gov.hu" target="_blank" rel="noopener" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>onlineszamla.nav.gov.hu</a> oldalon tudod létrehozni.
                </p>
                <div style={{
                    padding: '14px 18px', borderRadius: 10, marginBottom: 20,
                    background: '#fffbeb', border: '1px solid #fcd34d', fontSize: '0.85rem', color: '#92400e', lineHeight: 1.6
                }}>
                    ⚠️ <strong>Opcionális:</strong> Ha nem töltöd ki, a számlák akkor is kiállíthatók, de nem lesznek automatikusan beküldve a NAV-nak.
                    Ebben az esetben manuálisan kell bejelentened a számlákat.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    {f('nav_tax_number', 'NAV technikai felhasználó adószám', '12345678')}
                    {f('nav_login', 'Technikai felhasználó login', '')}
                    {f('nav_password', 'Technikai felhasználó jelszó', '', { type: 'password' })}
                    {f('nav_signing_key', 'Aláíró kulcs (signing key)', '', { type: 'password' })}
                    {f('nav_replacement_key', 'Csere kulcs (replacement key)', '', { type: 'password' })}
                </div>
            </div>
        </div>
    );
}
