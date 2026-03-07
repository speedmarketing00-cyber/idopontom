'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.wave}>
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,100 L0,100 Z" fill="currentColor" />
                </svg>
            </div>
            <div className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.brand}>
                            <div className={styles.logo}>
                                <span>📅</span>
                                <span className={styles.logoText}>Foglalj Velem</span>
                            </div>
                            <p className={styles.tagline}>
                                A legegyszerűbb online időpontfoglaló rendszer magyar vállalkozásoknak.
                            </p>
                        </div>

                        <div className={styles.column}>
                            <h4 className={styles.columnTitle}>Termék</h4>
                            <a href="#funkcio" className={styles.footerLink}>Funkciók</a>
                            <a href="#arak" className={styles.footerLink}>Árazás</a>
                            <a href="#hogyan" className={styles.footerLink}>Hogyan működik?</a>
                            <Link href="/auth/register" className={styles.footerLink}>Regisztráció</Link>
                        </div>

                        <div className={styles.column}>
                            <h4 className={styles.columnTitle}>Szakterületek</h4>
                            <span className={styles.footerLink}>Fodrász szalonok</span>
                            <span className={styles.footerLink}>Kozmetikusok</span>
                            <span className={styles.footerLink}>Edzők</span>
                            <span className={styles.footerLink}>Tanácsadók</span>
                        </div>

                        <div className={styles.column}>
                            <h4 className={styles.columnTitle}>Támogatás</h4>
                            <span className={styles.footerLink}>GYIK</span>
                            <span className={styles.footerLink}>Kapcsolat</span>
                            <Link href="/adatvedelem" className={styles.footerLink}>Adatvédelem</Link>
                            <Link href="/aszf" className={styles.footerLink}>ÁSZF</Link>
                        </div>
                    </div>

                    <div className={styles.bottom}>
                        <p>© {new Date().getFullYear()} FoglaljVelem.hu · Euro Simon Family Kft. Minden jog fenntartva.</p>
                        <p className={styles.madeWith}>Készült 💛 -vel Magyarországon</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
