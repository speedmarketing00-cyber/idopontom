'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import s from './dashboard.module.css';

const navItems = [
    { icon: '🏠', label: 'Áttekintés', href: '/dashboard', tier: 'free' },
    { icon: '📅', label: 'Naptár', href: '/dashboard/calendar', tier: 'free' },
    { icon: '📋', label: 'Foglalások', href: '/dashboard/bookings', tier: 'free' },
    { icon: '💼', label: 'Szolgáltatások', href: '/dashboard/services', tier: 'free' },
    { icon: '🕐', label: 'Elérhetőség', href: '/dashboard/availability', tier: 'free' },
    { divider: true },
    { icon: '⭐', label: 'Értékelések', href: '/dashboard/reviews', tier: 'basic' },
    { icon: '📊', label: 'Statisztikák', href: '/dashboard/statistics', tier: 'basic' },
    { icon: '👥', label: 'Csapat', href: '/dashboard/team', tier: 'pro' },
    { divider: true },
    { icon: '📧', label: 'Email beállítások', href: '/dashboard/email-settings', tier: 'basic' },
    { icon: '📊', label: 'Meta Pixel', href: '/dashboard/meta-pixel', tier: 'free' },
    { icon: '🔗', label: 'Beágyazás', href: '/dashboard/embed', tier: 'free' },
    { icon: '⚙️', label: 'Beállítások', href: '/dashboard/settings', tier: 'free' },
];

const TIER_LEVEL = { free: 0, basic: 1, pro: 2 };

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, profile, loading, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    // Wait for auth to load
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>📅</span>
                    <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>Betöltés...</p>
                </div>
            </div>
        );
    }

    // Redirect if not logged in
    if (!user && !loading) {
        if (typeof window !== 'undefined') router.push('/auth/login');
        return null;
    }

    const displayName = profile?.business_name || profile?.businessName || profile?.name || user?.email?.split('@')[0] || 'Felhasználó';
    const displayEmail = user?.email || profile?.email || '';
    const tier = profile?.subscription_tier || profile?.tier || 'free';
    const tierLabel = { free: 'Ingyenes', basic: '⭐ Alap', pro: '🏢 Profi' };
    const tierClass = { free: s.tierFree, basic: s.tierBasic, pro: s.tierPro };

    return (
        <div className={s.dashboard}>
            <div className={`${s.overlay} ${sidebarOpen ? s.show : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`${s.sidebar} ${sidebarOpen ? s.open : ''}`}>
                <div className={s.sidebarHeader}>
                    <span className={s.sidebarLogo}>📅</span>
                    <span className={s.sidebarTitle}>Foglalj Velem</span>
                </div>
                <nav className={s.sidebarNav}>
                    {navItems.map((item, i) => {
                        if (item.divider) return <div key={i} className={s.navDivider} />;
                        const userLevel = TIER_LEVEL[tier] || 0;
                        const requiredLevel = TIER_LEVEL[item.tier] || 0;
                        const locked = userLevel < requiredLevel;
                        return (
                            <Link key={i}
                                href={locked ? '/dashboard/settings' : item.href}
                                className={`${s.navItem} ${pathname === item.href ? s.active : ''} ${locked ? s.locked : ''}`}
                                onClick={() => setSidebarOpen(false)}
                                title={locked ? `${item.tier === 'basic' ? 'Alap' : 'Profi'} csomag szükséges` : ''}>
                                <span className={s.navIcon}>{item.icon}</span>
                                {item.label}
                                {locked && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>🔒</span>}
                            </Link>
                        );
                    })}
                </nav>
                <div className={s.sidebarFooter}>
                    <div className={s.userCard}>
                        <div className={s.userAvatar}>{displayName[0]?.toUpperCase() || 'U'}</div>
                        <div>
                            <div className={s.userName}>{displayName}</div>
                            <div className={s.userEmail}>{displayEmail}</div>
                            <span className={`${s.tierBadge} ${tierClass[tier] || s.tierFree}`}>
                                {tierLabel[tier] || 'Ingyenes'}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={s.navItem} style={{ marginTop: 8, color: 'var(--error)' }}>
                        <span className={s.navIcon}>🚪</span> Kijelentkezés
                    </button>
                </div>
            </aside>
            <main className={s.main}>
                <button className={s.mobileToggle} onClick={() => setSidebarOpen(true)}>☰</button>
                {/* Persistent top bar – logout always visible on all devices */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    gap: 10, padding: '10px 20px',
                    borderBottom: '1px solid var(--gray-100)',
                    background: 'white', position: 'sticky', top: 0, zIndex: 9,
                }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{displayEmail}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none', border: '1px solid #fee2e2', borderRadius: 8,
                            padding: '5px 12px', fontSize: '0.8rem', color: '#dc2626',
                            cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                        }}
                    >
                        🚪 Kijelentkezés
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}
