'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import s from '../dashboard.module.css';

export default function EmbedPage() {
    const [copied, setCopied] = useState('');
    const { profile } = useAuth();

    const slug = profile?.slug || '';
    const baseUrl = 'https://foglaljvelem.hu';
    const bookingUrl = `${baseUrl}/book/${slug}`;

    const snippets = {
        link: bookingUrl,
        iframe: `<iframe src="${bookingUrl}" width="100%" height="650" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1)"></iframe>`,
        button: `<a href="${bookingUrl}" target="_blank" style="display:inline-block;background:#3b8fd9;color:white;padding:14px 28px;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;text-decoration:none">📅 Időpont foglalás</a>`,
    };

    const copy = (key) => {
        navigator.clipboard.writeText(snippets[key]);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    if (!slug) {
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>Beágyazás 🔗</h1>
                        <p>A foglalási linked még nem elérhető. Kérjük töltsd ki a profil adataidat a Beállítások menüben!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Beágyazás 🔗</h1>
                    <p>Oszd meg a foglalási oldalad vagy ágyazd be a weboldaladba</p>
                </div>
            </div>

            <div style={{ background: 'var(--primary-50)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                    📌 A te egyedi foglalási linked: <a href={bookingUrl} target="_blank" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{bookingUrl}</a>
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                    { key: 'link', title: '🔗 Foglalási link', desc: 'Oszd meg közvetlenül az ügyfeleidnek – e-mailben, SMS-ben vagy közösségi médiában.' },
                    { key: 'iframe', title: '📦 Iframe beágyazás', desc: 'Ágyazd be a meglévő weboldaladba. Másold be a kódot a HTML-be.' },
                    { key: 'button', title: '🔘 Foglalás gomb', desc: 'Adj hozzá egy "Időpont foglalás" gombot a weboldaladhoz.' },
                ].map(item => (
                    <div key={item.key} className={s.contentCard} style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 4, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{item.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>{item.desc}</p>
                        <div style={{ background: 'var(--gray-800)', borderRadius: 10, padding: 16, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-200)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 12 }}>
                            {snippets[item.key]}
                        </div>
                        <button onClick={() => copy(item.key)} className="btn btn-primary btn-sm">
                            {copied === item.key ? '✅ Másolva!' : '📋 Másolás'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

