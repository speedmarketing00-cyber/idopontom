'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'foglaljvelem_cookie_consent';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Show banner only if user hasn't decided yet
        const consent = localStorage.getItem(COOKIE_KEY);
        if (!consent) setVisible(true);
    }, []);

    const accept = (all) => {
        const value = all ? 'all' : 'necessary';
        localStorage.setItem(COOKIE_KEY, value);
        // If necessary only: block tracking pixels by removing them
        if (!all) {
            // Signal to the rest of the app that tracking is off
            window.__cookieConsent = 'necessary';
        } else {
            window.__cookieConsent = 'all';
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.10)',
            padding: '0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 20px' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: '1.1rem' }}>🍪</span>
                            <strong style={{ fontSize: '0.95rem', color: '#1e3a5f' }}>Sütiket (cookie-kat) használunk</strong>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                            A weboldal működéséhez szükséges sütiket használunk. Az "Elfogadom" gombbal hozzájárulsz a marketing és analitikai sütikhez (Meta Pixel, Google Analytics) is.{' '}
                            <Link href="/cookie" style={{ color: '#2563eb', textDecoration: 'underline' }}>Cookie nyilatkozat</Link>
                            {' · '}
                            <Link href="/adatvedelem" style={{ color: '#2563eb', textDecoration: 'underline' }}>Adatvédelem</Link>
                        </p>

                        {showDetails && (
                            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                                {[
                                    { icon: '🔒', label: 'Szükséges', desc: 'Bejelentkezés, munkamenet', always: true },
                                    { icon: '⚙️', label: 'Funkcionális', desc: 'Beállítások megjegyzése', always: false },
                                    { icon: '📊', label: 'Analitikai', desc: 'Google Analytics látogatások', always: false },
                                    { icon: '📣', label: 'Marketing', desc: 'Meta Pixel konverziók', always: false },
                                ].map(cat => (
                                    <div key={cat.label} style={{
                                        padding: '8px 12px', borderRadius: 8,
                                        background: '#f9fafb', border: '1px solid #e5e7eb',
                                        fontSize: '0.78rem'
                                    }}>
                                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                                            {cat.icon} {cat.label}
                                            {cat.always && <span style={{ marginLeft: 4, color: '#6b7280', fontWeight: 400 }}>(mindig aktív)</span>}
                                        </div>
                                        <div style={{ color: '#9ca3af' }}>{cat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowDetails(v => !v)}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 0', marginTop: 4, textDecoration: 'underline' }}
                        >
                            {showDetails ? '▲ Részletek elrejtése' : '▼ Részletek'}
                        </button>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => accept(false)}
                            style={{
                                padding: '10px 18px', borderRadius: 10, border: '1.5px solid #d1d5db',
                                background: 'white', color: '#374151', fontWeight: 600,
                                fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Csak szükséges
                        </button>
                        <button
                            onClick={() => accept(true)}
                            style={{
                                padding: '10px 22px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                color: 'white', fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ✓ Elfogadom
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper: check if marketing cookies are accepted (for Meta Pixel etc.)
export function hasMarketingConsent() {
    if (typeof window === 'undefined') return false;
    if (window.__cookieConsent) return window.__cookieConsent === 'all';
    return localStorage.getItem(COOKIE_KEY) === 'all';
}
