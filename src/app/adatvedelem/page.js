'use client';
import Link from 'next/link';

export default function AdatvedelemPage() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)' }}>
            <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a főoldalra</Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Adatkezelési Tájékoztató</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>Utolsó módosítás: 2026. március 9.</p>

            <Section title="1. Az adatkezelő adatai">
                <p><strong>Cégnév:</strong> Euro Simon Family Korlátolt Felelősségű Társaság</p>
                <p><strong>Székhely:</strong> 2100 Gödöllő, Csalogány utca 6.</p>
                <p><strong>Adószám:</strong> 28734886-1-13</p>
                <p><strong>E-mail:</strong> info@foglaljvelem.hu</p>
                <p><strong>Weboldal:</strong> https://foglaljvelem.hu</p>
            </Section>

            <Section title="2. Az adatkezelés célja és jogalapja">
                <p>A FoglaljVelem.hu online időpontfoglaló rendszer üzemeltetése során az alábbi célokból kezelünk személyes adatokat:</p>
                <ul>
                    <li><strong>Felhasználói fiók létrehozása és kezelése</strong> – Jogalap: hozzájárulás (GDPR 6. cikk (1) a))</li>
                    <li><strong>Időpontfoglalás lebonyolítása</strong> – Jogalap: szerződés teljesítése (GDPR 6. cikk (1) b))</li>
                    <li><strong>E-mail értesítések és emlékeztetők küldése</strong> – Jogalap: jogos érdek (GDPR 6. cikk (1) f))</li>
                    <li><strong>Számlázás és fizetés feldolgozása</strong> – Jogalap: jogi kötelezettség (GDPR 6. cikk (1) c))</li>
                    <li><strong>Marketing célú nyomkövetés</strong> (Meta Pixel, Google Analytics) – Jogalap: hozzájárulás (GDPR 6. cikk (1) a)) – csak sütibeleegyezés esetén</li>
                    <li><strong>Értékelések gyűjtése</strong> – Jogalap: hozzájárulás (GDPR 6. cikk (1) a))</li>
                </ul>
            </Section>

            <Section title="3. Kezelt adatok köre">
                <h4>Szolgáltatók (regisztrált felhasználók):</h4>
                <ul>
                    <li>Név, e-mail cím, telefonszám</li>
                    <li>Üzleti adatok (vállalkozás neve, típusa, leírása, városl cím, slug)</li>
                    <li>Profilkép (önkéntes feltöltés esetén)</li>
                    <li>Stripe előfizetési adatok (customer ID, subscription tier)</li>
                </ul>
                <h4>Ügyfelek (időpontfoglalók):</h4>
                <ul>
                    <li>Név, e-mail cím, telefonszám</li>
                    <li>Foglalási adatok (dátum, időpont, szolgáltatás, megjegyzés)</li>
                </ul>
                <h4>Értékelést beküldők:</h4>
                <ul>
                    <li>Megjelenített név, csillag-értékelés, szöveges vélemény</li>
                    <li>Beküldés időpontja</li>
                </ul>
                <h4>Látogatók (cookie hozzájárulás esetén):</h4>
                <ul>
                    <li>Böngésző típusa, IP-cím (anonimizálva), oldalak látogatottsága</li>
                    <li>Konverziós események (Meta Pixel Lead esemény foglaláskor)</li>
                </ul>
            </Section>

            <Section title="4. Adatok megőrzési ideje">
                <ul>
                    <li><strong>Felhasználói fiókok:</strong> a fiók törléséig</li>
                    <li><strong>Foglalási adatok:</strong> a foglalás teljesítésétől számított 5 évig (számviteli kötelezettség)</li>
                    <li><strong>Számlázási adatok:</strong> 8 évig (Szt. 169. §)</li>
                    <li><strong>Értékelések:</strong> a fiók törléséig vagy törlési kérelemig</li>
                    <li><strong>Analitikai adatok:</strong> 26 hónap (Google Analytics alapbeállítás)</li>
                    <li><strong>Marketing adatok:</strong> 180 nap (Meta Pixel adatmegőrzés)</li>
                </ul>
            </Section>

            <Section title="5. Adatfeldolgozók">
                <p>Az adatkezelés során az alábbi adatfeldolgozókat vesszük igénybe:</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 }}>
                    <thead>
                        <tr style={{ background: 'var(--gray-100)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Cég</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Feladat</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '0 8px 0 0' }}>Székhely</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Supabase Inc.', 'Adatbázis tárolás', 'USA (EU Frankfurt régió)'],
                            ['Vercel Inc.', 'Weboldal kiszolgálás, hosting', 'USA'],
                            ['Stripe Inc.', 'Fizetés feldolgozás, előfizetések', 'USA (SCCs alapján)'],
                            ['Resend Inc.', 'Tranzakciós e-mail küldés', 'USA'],
                            ['Google LLC', 'OAuth bejelentkezés, Google Analytics', 'USA (SCCs alapján)'],
                            ['Meta Platforms Inc.', 'Meta Pixel – csak hozzájárulás esetén', 'USA (SCCs alapján)'],
                        ].map(([ceg, feladat, szekhely]) => (
                            <tr key={ceg} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{ceg}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--gray-600)' }}>{feladat}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--gray-600)' }}>{szekhely}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 8 }}>
                    Az USA-ba irányuló adattovábbítás az EU–USA Adatvédelmi Keretrendszer (DPF) és Standard Szerződéses Záradékok (SCCs) alapján történik.
                </p>
            </Section>

            <Section title="6. Cookie-k (sütik)">
                <p>A weboldal az alábbi kategóriájú sütiket használja. A nem feltétlenül szükséges sütiket csak az Ön hozzájárulásával alkalmazzuk.</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 }}>
                    <thead>
                        <tr style={{ background: 'var(--gray-100)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Kategória</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Süti neve</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Cél</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['🔒 Szükséges', 'sb-*, supabase-auth-token', 'Bejelentkezés fenntartása'],
                            ['🔒 Szükséges', 'foglaljvelem_cookie_consent', 'Cookie beleegyezés tárolása'],
                            ['⚙️ Funkcionális', 'localStorage beállítások', 'Felhasználói preferenciák'],
                            ['📊 Analitikai', '_ga, _gid', 'Google Analytics látogatók mérése'],
                            ['📣 Marketing', '_fbp, _fbc, fr', 'Meta Pixel konverzió mérés'],
                            ['💳 Szükséges', '__stripe_*, __cf_bm', 'Stripe fizetési biztonság'],
                        ].map(([kat, nev, cel]) => (
                            <tr key={nev} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 500, fontSize: '0.82rem' }}>{kat}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--gray-600)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{nev}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--gray-600)' }}>{cel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ marginTop: 12, fontSize: '0.85rem' }}>
                    Részletes cookie leírásért lásd: <Link href="/cookie" style={{ color: 'var(--primary-500)' }}>Cookie nyilatkozat</Link>
                </p>
            </Section>

            <Section title="7. Az érintettek jogai">
                <p>A GDPR alapján Önnek joga van:</p>
                <ul>
                    <li><strong>Hozzáférés joga</strong> – tájékoztatást kérhet a kezelt adatairól</li>
                    <li><strong>Helyesbítés joga</strong> – kérheti adatai kijavítását</li>
                    <li><strong>Törlés joga</strong> – kérheti adatai törlését ("elfeledtetéshez való jog")</li>
                    <li><strong>Korlátozás joga</strong> – kérheti az adatkezelés korlátozását</li>
                    <li><strong>Adathordozhatóság joga</strong> – géppel olvasható formátumban kérheti adatait</li>
                    <li><strong>Tiltakozás joga</strong> – tiltakozhat a jogos érdeken alapuló adatkezelés ellen</li>
                    <li><strong>Hozzájárulás visszavonása</strong> – a sütibeleegyezés bármikor visszavonható a böngésző beállításaiban</li>
                </ul>
                <p>Jogai gyakorlásához írjon az <strong>info@foglaljvelem.hu</strong> email címre. Kérésére 30 napon belül válaszolunk.</p>
            </Section>

            <Section title="8. Automatizált döntéshozatal">
                <p>A rendszer nem alkalmaz automatizált döntéshozatalt vagy profilalkotást, amely jogi hatással lenne az érintettekre.</p>
            </Section>

            <Section title="9. Panaszkezelés">
                <p>Ha úgy érzi, hogy adatait jogellenesen kezeljük, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):</p>
                <p><strong>Cím:</strong> 1055 Budapest, Falk Miksa utca 9-11.</p>
                <p><strong>Web:</strong> <a href="https://www.naih.hu" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>www.naih.hu</a></p>
                <p><strong>E-mail:</strong> ugyfelszolgalat@naih.hu</p>
                <p style={{ marginTop: 8 }}>Kérjük, hogy panasza benyújtása előtt először vegye fel velünk a kapcsolatot, hogy a problémát közvetlenül megoldhassuk.</p>
            </Section>

            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/aszf" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>📄 ÁSZF</Link>
                <Link href="/cookie" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>🍪 Cookie nyilatkozat</Link>
                <Link href="/" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>← Főoldal</Link>
            </div>

            <div style={{ marginTop: 32, padding: 20, background: 'var(--gray-100)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', margin: 0 }}>
                    © {new Date().getFullYear()} Euro Simon Family Kft. — FoglaljVelem.hu
                </p>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, color: 'var(--primary-700)' }}>{title}</h2>
            <div style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>{children}</div>
        </div>
    );
}
