'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${mobileOpen ? styles.menuOpen : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>📅</span>
                    <span className={styles.logoText}>Foglalj Velem</span>
                </Link>

                <div className={`${styles.links} ${mobileOpen ? styles.open : ''}`}>
                    <a href="#funkcio" className={styles.link} onClick={() => setMobileOpen(false)}>Funkciók</a>
                    <a href="#hogyan" className={styles.link} onClick={() => setMobileOpen(false)}>Hogyan működik?</a>
                    <a href="#arak" className={styles.link} onClick={() => setMobileOpen(false)}>Árak</a>
                    <a href="#velemenyek" className={styles.link} onClick={() => setMobileOpen(false)}>Vélemények</a>
                    <div className={styles.authButtons}>
                        {!loading && user ? (
                            <Link href="/dashboard" className={`btn btn-primary ${styles.registerBtn}`}>
                                📊 Irányítópult
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className={`btn btn-ghost ${styles.loginBtn}`}>
                                    Bejelentkezés
                                </Link>
                                <Link href="/auth/register" className={`btn btn-primary ${styles.registerBtn}`}>
                                    Ingyenes regisztráció
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <button
                    className={`${styles.hamburger} ${mobileOpen ? styles.active : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Menü"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
