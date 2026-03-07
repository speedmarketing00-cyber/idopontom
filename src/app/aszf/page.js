'use client';
import Link from 'next/link';

export default function AszfPage() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)' }}>
            <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a főoldalra</Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Általános Szerződési Feltételek (ÁSZF)</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>Hatályos: 2026. március 2-től</p>

            <Section title="1. Szolgáltató adatai">
                <p><strong>Cégnév:</strong> Euro Simon Family Korlátolt Felelősségű Társaság</p>
                <p><strong>Székhely:</strong> 2100 Gödöllő, Csalogány utca 6.</p>
                <p><strong>Adószám:</strong> 28734886-1-13</p>
                <p><strong>E-mail:</strong> info@foglaljvelem.hu</p>
                <p><strong>Weboldal:</strong> https://foglaljvelem.hu</p>
            </Section>

            <Section title="2. A szolgáltatás leírása">
                <p>A <strong>FoglaljVelem.hu</strong> egy online időpontfoglaló platform, amely lehetővé teszi szolgáltatók (pl. fodrász, kozmetikus, edző) számára, hogy:</p>
                <ul>
                    <li>Online foglalási felületet biztosítsanak ügyfeleiknek</li>
                    <li>Kezeljék időpontjaikat és foglalásaikat</li>
                    <li>Automatikus email értesítéseket küldjenek ügyfeleiknek</li>
                </ul>
            </Section>

            <Section title="3. Regisztráció és fiók">
                <ul>
                    <li>A szolgáltatás használatához regisztráció szükséges.</li>
                    <li>A regisztráció során megadott adatoknak valósnak és pontosnak kell lenniük.</li>
                    <li>A felhasználó felelős a fiókja biztonságáért és jelszavának megőrzéséért.</li>
                    <li>A fiók nem átruházható.</li>
                </ul>
            </Section>

            <Section title="4. Előfizetési csomagok">
                <h4>Ingyenes csomag:</h4>
                <ul>
                    <li>Foglalási oldal</li>
                    <li>Korlátozott funkciók</li>
                </ul>
                <h4>Alap csomag (4 997 Ft/hó):</h4>
                <ul>
                    <li>Egyéni szolgáltatóknaknak</li>
                    <li>Email értesítések</li>
                    <li>Emlékeztetők</li>
                    <li>Statisztikák</li>
                </ul>
                <h4>Profi csomag (19 997 Ft/hó):</h4>
                <ul>
                    <li>Csapatkezelés (több dolgozó)</li>
                    <li>Minden Alap funkció</li>
                    <li>Prioritásos támogatás</li>
                </ul>
                <p>Az árak magyar forintban (HUF) értendőek, bruttó árak (az ÁFA-t tartalmazzák).</p>
            </Section>

            <Section title="5. Fizetési feltételek">
                <ul>
                    <li>A fizetés a <strong>Stripe</strong> fizetési szolgáltatón keresztül történik.</li>
                    <li>Az előfizetés havonta automatikusan megújul.</li>
                    <li>Az előfizetés bármikor lemondható, a lemondás a következő számlázási ciklus elejétől lép érvénybe.</li>
                    <li>Már kifizetett időszakra visszatérítés nem jár.</li>
                </ul>
            </Section>

            <Section title="6. A szolgáltató jogai és kötelezettségei">
                <ul>
                    <li>A FoglaljVelem.hu biztosítja a platform zavartalan működését.</li>
                    <li>Fenntartjuk a jogot a szolgáltatás fejlesztésére, módosítására.</li>
                    <li>Tervezett karbantartásról előzetesen értesítjük felhasználóinkat.</li>
                    <li>Nem vállalunk felelősséget a szolgáltatók és ügyfeleik közötti jogviszonyért.</li>
                </ul>
            </Section>

            <Section title="7. A felhasználó jogai és kötelezettségei">
                <ul>
                    <li>A felhasználó köteles a platformot jogszerűen és rendeltetésszerűen használni.</li>
                    <li>Tilos a rendszer visszaélésszerű használata, beleértve a spam küldését.</li>
                    <li>A felhasználó felelős az általa feltöltött tartalmakért.</li>
                    <li>A felhasználó bármikor törölheti fiókját.</li>
                </ul>
            </Section>

            <Section title="8. Felelősség korlátozása">
                <ul>
                    <li>A FoglaljVelem.hu közvetítő platformként működik, és nem fél a szolgáltató-ügyfél jogviszonyban.</li>
                    <li>Nem vállalunk felelősséget a szolgáltatók által nyújtott szolgáltatások minőségéért.</li>
                    <li>A platform vis maior (elháríthatatlan külső körülmény) esetén nem felelős a szolgáltatás kimaradásáért.</li>
                </ul>
            </Section>

            <Section title="9. Elállás joga">
                <p>A 45/2014. (II. 26.) Korm. rendelet alapján a fogyasztónak minősülő felhasználó a szerződés megkötésétől számított 14 napon belül indokolás nélkül elállhat a szerződéstől. Az elállási jog gyakorlásához írjon az <strong>info@foglaljvelem.hu</strong> e-mail címre.</p>
            </Section>

            <Section title="10. Panaszkezelés, jogviták">
                <p>Panaszát az alábbi elérhetőségeken jelezheti:</p>
                <p><strong>E-mail:</strong> info@foglaljvelem.hu</p>
                <p>Jogvitás esetekben a Gödöllői Járásbíróság az illetékes. Online vitarendezési felület: <a href="https://ec.europa.eu/odr" target="_blank">https://ec.europa.eu/odr</a></p>
            </Section>

            <Section title="11. Záró rendelkezések">
                <p>Jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a Polgári Törvénykönyvről szóló 2013. évi V. törvény rendelkezései az irányadóak.</p>
                <p>A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására, amelyről a felhasználókat előzetesen értesíti.</p>
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
