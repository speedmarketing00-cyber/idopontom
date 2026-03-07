'use client';
import Link from 'next/link';

export default function AdatvedelemPage() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)' }}>
            <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a főoldalra</Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Adatkezelési Tájékoztató</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>Utolsó módosítás: 2026. március 2.</p>

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
                    <li><strong>Felhasználói fiók létrehozása és kezelése</strong> – Jogalap: a felhasználó hozzájárulása (GDPR 6. cikk (1) a))</li>
                    <li><strong>Időpontfoglalás lebonyolítása</strong> – Jogalap: szerződés teljesítése (GDPR 6. cikk (1) b))</li>
                    <li><strong>Email értesítések küldése</strong> (foglalás megerősítés, emlékeztetők) – Jogalap: jogos érdek (GDPR 6. cikk (1) f))</li>
                    <li><strong>Számlázás és fizetés</strong> – Jogalap: jogi kötelezettség (GDPR 6. cikk (1) c))</li>
                </ul>
            </Section>

            <Section title="3. Kezelt adatok köre">
                <h4>Szolgáltatók (regisztrált felhasználók):</h4>
                <ul>
                    <li>Név, e-mail cím, telefonszám</li>
                    <li>Üzleti adatok (szalon neve, címe, szolgáltatások)</li>
                    <li>Számlázási adatok</li>
                </ul>
                <h4>Ügyfelek (időpontfoglalók):</h4>
                <ul>
                    <li>Név, e-mail cím, telefonszám</li>
                    <li>Foglalási adatok (időpont, szolgáltatás)</li>
                </ul>
            </Section>

            <Section title="4. Adatok megőrzési ideje">
                <ul>
                    <li><strong>Felhasználói fiókok:</strong> a fiók törléséig</li>
                    <li><strong>Foglalási adatok:</strong> a foglalás teljesítésétől számított 5 évig (számviteli kötelezettség)</li>
                    <li><strong>Számlázási adatok:</strong> 8 évig (jogszabályi kötelezettség)</li>
                </ul>
            </Section>

            <Section title="5. Adatfeldolgozók">
                <p>Az adatkezelés során az alábbi adatfeldolgozókat vesszük igénybe:</p>
                <ul>
                    <li><strong>Supabase Inc.</strong> – adatbázis tárolás (EU régió – Frankfurt)</li>
                    <li><strong>Vercel Inc.</strong> – weboldal kiszolgálás</li>
                    <li><strong>Stripe Inc.</strong> – fizetés feldolgozás</li>
                    <li><strong>Resend Inc.</strong> – email küldés</li>
                    <li><strong>Google LLC</strong> – OAuth bejelentkezés</li>
                </ul>
            </Section>

            <Section title="6. Az érintettek jogai">
                <p>A GDPR alapján Önnek joga van:</p>
                <ul>
                    <li><strong>Hozzáférés joga</strong> – tájékoztatást kérhet a kezelt adatairól</li>
                    <li><strong>Helyesbítés joga</strong> – kérheti adatai kijavítását</li>
                    <li><strong>Törlés joga</strong> – kérheti adatai törlését</li>
                    <li><strong>Adathordozhatóság joga</strong> – kérheti adatai géppel olvasható formátumban történő kiadását</li>
                    <li><strong>Tiltakozás joga</strong> – tiltakozhat az adatkezelés ellen</li>
                </ul>
                <p>Jogai gyakorlásához írjon az <strong>info@foglaljvelem.hu</strong> email címre.</p>
            </Section>

            <Section title="7. Cookie-k (sütik)">
                <p>A weboldal az alábbi sütiket használja:</p>
                <ul>
                    <li><strong>Munkamenet sütik</strong> – a bejelentkezés fenntartásához (feltétlenül szükséges)</li>
                    <li><strong>Supabase auth sütik</strong> – felhasználó azonosítás</li>
                </ul>
                <p>Harmadik féltől származó analitikai vagy marketing sütiket nem használunk.</p>
            </Section>

            <Section title="8. Panaszkezelés">
                <p>Amennyiben úgy érzi, hogy adatait jogellenesen kezeljük, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):</p>
                <p><strong>Cím:</strong> 1055 Budapest, Falk Miksa utca 9-11.</p>
                <p><strong>Web:</strong> <a href="https://www.naih.hu" target="_blank">www.naih.hu</a></p>
                <p><strong>E-mail:</strong> ugyfelszolgalat@naih.hu</p>
            </Section>

            <div style={{ marginTop: 40, padding: 20, background: 'var(--gray-100)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
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
