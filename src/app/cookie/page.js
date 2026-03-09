'use client';
import Link from 'next/link';

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: 'var(--primary-700)', borderBottom: '2px solid var(--primary-100)', paddingBottom: 8 }}>{title}</h2>
            <div style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>{children}</div>
        </div>
    );
}

function CookieTable({ cookies }) {
    return (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                    <tr style={{ background: 'var(--gray-50)' }}>
                        {['Cookie neve', 'Típus', 'Megőrzési idő', 'Cél'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cookies.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)', background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-600)' }}>{c.name}</td>
                            <td style={{ padding: '10px 12px' }}><TypeBadge type={c.type} /></td>
                            <td style={{ padding: '10px 12px', color: 'var(--gray-600)' }}>{c.duration}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--gray-600)' }}>{c.purpose}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TypeBadge({ type }) {
    const styles = {
        'Szükséges': { bg: '#dcfce7', color: '#166534' },
        'Funkcionális': { bg: '#dbeafe', color: '#1e40af' },
        'Analitikai': { bg: '#fef9c3', color: '#713f12' },
        'Marketing': { bg: '#fce7f3', color: '#9d174d' },
    };
    const st = styles[type] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
    return (
        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color }}>
            {type}
        </span>
    );
}

export default function CookiePage() {
    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)' }}>
            <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a főoldalra</Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Cookie (Süti) Szabályzat</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 8, fontSize: '0.9rem' }}>Hatályos: 2026. március 9. | Utolsó módosítás: 2026. március 9.</p>
            <p style={{ color: 'var(--gray-600)', marginBottom: 32, lineHeight: 1.7 }}>
                A FoglaljVelem.hu weboldal cookie-kat (sütiket) használ. Ez a szabályzat részletesen ismerteti, hogy milyen sütiket alkalmazunk, miért, és hogyan kezelheti azokat.
            </p>

            <Section title="1. Mi az a cookie?">
                <p>A cookie (süti) egy kis szöveges fájl, amelyet a weboldal helyez el az Ön böngészőjében az Ön eszközén (számítógép, tablet, telefon). A cookie-k segítik a weboldal működését, megjegyzik a beállításait, és lehetővé teszik a forgalomelemzést.</p>
                <p>Az <strong>EU ePrivacy irányelv</strong> (2002/58/EK) és a <strong>GDPR</strong> (2016/679/EU rendelet) értelmében a nem szükséges cookie-k elhelyezéséhez az Ön hozzájárulása szükséges.</p>
            </Section>

            <Section title="2. Milyen cookie-kat használunk?">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                        { type: 'Szükséges', icon: '🔒', desc: 'A weboldal alapvető működéséhez elengedhetetlen. Nem kapcsolhatók ki.' },
                        { type: 'Funkcionális', icon: '⚙️', desc: 'Beállítások megjegyzése, pl. bejelentkezési állapot.' },
                        { type: 'Analitikai', icon: '📊', desc: 'A weboldal látogatottságának elemzése (anonim).' },
                        { type: 'Marketing', icon: '📢', desc: 'Célzott hirdetések megjelenítése (pl. Facebook Pixel).' },
                    ].map(c => (
                        <div key={c.type} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16 }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{c.icon}</div>
                            <TypeBadge type={c.type} />
                            <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: 8, lineHeight: 1.5 }}>{c.desc}</p>
                        </div>
                    ))}
                </div>

                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>2.1 Szükséges (elengedhetetlen) sütik</h3>
                <p style={{ marginBottom: 8 }}>Ezek a sütik a weboldal alapvető működéséhez szükségesek. Hozzájárulás nélkül is elhelyezhetők.</p>
                <CookieTable cookies={[
                    { name: 'sb-*-auth-token', type: 'Szükséges', duration: 'Munkamenet / 1 hét', purpose: 'Supabase hitelesítési token – bejelentkezési állapot megtartása' },
                    { name: 'sb-*-auth-token-code-verifier', type: 'Szükséges', duration: 'Munkamenet', purpose: 'OAuth PKCE hitelesítési folyamat biztonsági eleme' },
                    { name: '__stripe_mid', type: 'Szükséges', duration: '1 év', purpose: 'Stripe – fizetési munkamenet azonosítása, visszaélés megelőzése' },
                    { name: '__stripe_sid', type: 'Szükséges', duration: '30 perc', purpose: 'Stripe – aktív fizetési munkamenet azonosítója' },
                ]} />

                <h3 style={{ fontWeight: 700, marginBottom: 8, marginTop: 24 }}>2.2 Funkcionális sütik</h3>
                <p style={{ marginBottom: 8 }}>A felhasználói élmény javítására szolgálnak, pl. a kiválasztott beállítások megőrzésére.</p>
                <CookieTable cookies={[
                    { name: '__vercel_live_token', type: 'Funkcionális', duration: 'Munkamenet', purpose: 'Vercel – előnézeti módhoz szükséges (csak fejlesztői üzemmódban)' },
                    { name: 'next-auth.session-token', type: 'Funkcionális', duration: '30 nap', purpose: 'Bejelentkezési munkamenet megtartása (ha Next Auth aktív)' },
                ]} />

                <h3 style={{ fontWeight: 700, marginBottom: 8, marginTop: 24 }}>2.3 Analitikai sütik</h3>
                <p style={{ marginBottom: 8 }}>Anonim látogatottsági adatok gyűjtése a weboldal fejlesztéséhez. Csak hozzájárulással!</p>
                <CookieTable cookies={[
                    { name: '_ga', type: 'Analitikai', duration: '2 év', purpose: 'Google Analytics – egyedi látogatók megkülönböztetése (ha aktiválva van)' },
                    { name: '_ga_*', type: 'Analitikai', duration: '2 év', purpose: 'Google Analytics – munkamenet állapotának megőrzése' },
                ]} />

                <h3 style={{ fontWeight: 700, marginBottom: 8, marginTop: 24 }}>2.4 Marketing (célzott hirdetési) sütik</h3>
                <p style={{ marginBottom: 8 }}>A Meta (Facebook) Pixel sütik – kizárólag akkor aktívak, ha a szolgáltató (FoglaljVelem felhasználó) megadott egy Meta Pixel azonosítót a saját dashboardjában, és az ügyfél hozzájárult.</p>
                <CookieTable cookies={[
                    { name: '_fbp', type: 'Marketing', duration: '90 nap', purpose: 'Facebook Pixel – böngésző azonosítása Facebook hirdetési célokra' },
                    { name: '_fbc', type: 'Marketing', duration: '90 nap', purpose: 'Facebook Click ID – kattintáskövetés Facebook hirdetésekből' },
                    { name: 'fr', type: 'Marketing', duration: '90 nap', purpose: 'Facebook – hirdetések megjelenítése és mérése' },
                    { name: 'datr', type: 'Marketing', duration: '2 év', purpose: 'Facebook – böngésző azonosítása biztonsági célból' },
                ]} />
            </Section>

            <Section title="3. Harmadik fél sütik">
                <p>A következő harmadik felek sütiket helyezhetnek el a FoglaljVelem.hu oldalain:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                    {[
                        {
                            name: '💳 Stripe Inc.',
                            url: 'https://stripe.com/hu/privacy',
                            desc: 'Fizetési feldolgozás, visszaélés megelőzése. Saját adatvédelmi szabályzata irányadó.',
                            type: 'Szükséges',
                        },
                        {
                            name: '🌐 Vercel Inc.',
                            url: 'https://vercel.com/legal/privacy-policy',
                            desc: 'Tárhelyszolgáltató. Teljesítmény cookie-kat helyezhet el.',
                            type: 'Szükséges',
                        },
                        {
                            name: '🗄️ Supabase Inc.',
                            url: 'https://supabase.com/privacy',
                            desc: 'Adatbázis és hitelesítési szolgáltató. Hitelesítési tokeneket kezel.',
                            type: 'Szükséges',
                        },
                        {
                            name: '📘 Meta Platforms Ireland Ltd.',
                            url: 'https://www.facebook.com/policies/cookies/',
                            desc: 'Facebook Pixel – csak ha a szolgáltató aktiválta. Marketing cookie-kat helyez el.',
                            type: 'Marketing',
                        },
                    ].map(p => (
                        <div key={p.name} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 6 }}>{p.desc}</p>
                                <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-500)' }}>Adatvédelmi szabályzat →</a>
                            </div>
                            <TypeBadge type={p.type} />
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="4. Az Ön jogai és a sütik kezelése">
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>4.1 Hozzájárulás visszavonása</h3>
                <p>A nem szükséges sütikhez adott hozzájárulását bármikor visszavonhatja. Visszavonás után a marketing és analitikai sütik törlésre kerülnek, de ez a visszavonás előtt végzett adatkezelés jogszerűségét nem érinti.</p>

                <h3 style={{ fontWeight: 700, marginBottom: 8, marginTop: 16 }}>4.2 Böngészőbeállítások</h3>
                <p>A sütik kezelhetők a böngészője beállításaiban. Hogyan tilthatja le a sütiket:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 10 }}>
                    {[
                        { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                        { name: 'Firefox', url: 'https://support.mozilla.org/hu/kb/sutik-torlese-adatok-amelyeket-a-weboldalak-tarol' },
                        { name: 'Safari', url: 'https://support.apple.com/hu-hu/guide/safari/sfri11471/mac' },
                        { name: 'Edge', url: 'https://support.microsoft.com/hu-hu/microsoft-edge' },
                    ].map(b => (
                        <a key={b.name} href={b.url} target="_blank" rel="noreferrer" style={{
                            padding: '10px 14px', borderRadius: 10, border: '1px solid var(--gray-200)',
                            textAlign: 'center', color: 'var(--primary-600)', textDecoration: 'none',
                            fontWeight: 600, fontSize: '0.85rem', display: 'block',
                        }}>
                            {b.name} →
                        </a>
                    ))}
                </div>
                <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                    ⚠️ Figyelem: a szükséges sütik letiltása esetén a weboldal egyes funkciói (pl. bejelentkezés, foglalás) nem működnek megfelelően.
                </p>

                <h3 style={{ fontWeight: 700, marginBottom: 8, marginTop: 16 }}>4.3 Facebook Pixel letiltása</h3>
                <p>A Meta hirdetési sütiket az alábbi helyeken kezelheti:</p>
                <ul style={{ paddingLeft: 20 }}>
                    <li><a href="https://www.facebook.com/settings/?tab=ads" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>Facebook hirdetési beállítások</a></li>
                    <li><a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>Digital Advertising Alliance opt-out</a></li>
                    <li>Böngészőbe telepíthető: <a href="https://www.facebook.com/business/help/1044896635009024" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>Facebook Pixel Helper Chrome bővítmény</a></li>
                </ul>
            </Section>

            <Section title="5. Adatkezelő és kapcsolat">
                <p><strong>Adatkezelő:</strong> Euro Simon Family Korlátolt Felelősségű Társaság</p>
                <p><strong>Cím:</strong> 2100 Gödöllő, Csalogány utca 6.</p>
                <p><strong>E-mail:</strong> info@foglaljvelem.hu</p>
                <p>Cookie-kkal kapcsolatos kérdéseivel forduljon hozzánk bizalommal. Kérésére részletes tájékoztatást adunk az általunk elhelyezett sütikről.</p>
                <p>A személyes adatok kezeléséről bővebben: <Link href="/adatvedelem" style={{ color: 'var(--primary-500)' }}>Adatvédelmi Tájékoztató</Link></p>
            </Section>

            <Section title="6. A szabályzat módosítása">
                <p>A FoglaljVelem.hu fenntartja a jogot e Cookie Szabályzat módosítására. A lényeges módosításokról e-mailben értesítjük regisztrált felhasználóinkat. A weboldal használatával a módosítást elfogadottnak tekintjük.</p>
            </Section>

            <div style={{ marginTop: 40, padding: 24, background: 'var(--gray-50)', borderRadius: 14, textAlign: 'center', border: '1px solid var(--gray-100)' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Euro Simon Family Kft. – FoglaljVelem.hu</p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 12 }}>© {new Date().getFullYear()} Minden jog fenntartva.</p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <Link href="/aszf" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>ÁSZF</Link>
                    <Link href="/adatvedelem" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>Adatvédelmi Tájékoztató</Link>
                </div>
            </div>
        </div>
    );
}
