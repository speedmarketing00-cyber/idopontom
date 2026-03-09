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

function Sub({ title, children }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>{title}</h3>
            <div>{children}</div>
        </div>
    );
}

function Alert({ children }) {
    return (
        <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '0.9rem', color: '#92400e' }}>
            ⚠️ {children}
        </div>
    );
}

export default function AszfPage() {
    return (
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)' }}>
            <Link href="/" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a főoldalra</Link>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: 20, marginBottom: 4 }}>Általános Szerződési Feltételek</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 8, fontSize: '0.9rem' }}>Hatályos: 2026. március 2-től | Utolsó módosítás: 2026. március 9.</p>
            <p style={{ color: 'var(--gray-500)', marginBottom: 32, fontSize: '0.85rem', lineHeight: 1.6 }}>
                Kérjük, olvassa el figyelmesen a jelen Általános Szerződési Feltételeket (továbbiakban: ÁSZF) mielőtt igénybe veszi a FoglaljVelem.hu platformot. A regisztrációval és a platform használatával Ön elfogadja a jelen ÁSZF rendelkezéseit.
            </p>

            <Section title="1. Szolgáltató adatai és elérhetőségei">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    {[
                        ['Cégnév', 'Euro Simon Family Korlátolt Felelősségű Társaság'],
                        ['Rövidített név', 'Euro Simon Family Kft.'],
                        ['Székhely', '2100 Gödöllő, Csalogány utca 6.'],
                        ['Cégjegyzékszám', 'Cg. 13-09-238087'],
                        ['Adószám', '28734886-1-13'],
                        ['E-mail', 'info@foglaljvelem.hu'],
                        ['Weboldal', 'https://foglaljvelem.hu'],
                        ['Ügyfélszolgálat', 'Hétfő–Péntek 9:00–17:00'],
                    ].map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                            <td style={{ padding: '8px 12px 8px 0', fontWeight: 600, color: 'var(--gray-600)', minWidth: 160 }}>{k}</td>
                            <td style={{ padding: '8px 0' }}>{v}</td>
                        </tr>
                    ))}
                </table>
            </Section>

            <Section title="2. A platform leírása és jellege">
                <p>A <strong>FoglaljVelem.hu</strong> egy online időpontfoglaló szoftver-szolgáltatás (SaaS), amely kizárólag közvetítő szerepet tölt be a Platformot használó szolgáltatók (továbbiakban: Felhasználó/Előfizető) és az általuk kezelt ügyfelek között.</p>
                <Alert>A FoglaljVelem.hu NEM nyújt az oldalon meghirdetett szolgáltatásokat (pl. fodrász, masszázs, edzés), és NEM részese a szolgáltató és az ügyfél közötti szerződéses jogviszonynak. A platform csupán technikai eszközt biztosít az időpontkezeléshez.</Alert>
                <p>A platform funkcionalitása:</p>
                <ul style={{ paddingLeft: 20 }}>
                    <li>Online foglalási oldal egyedi URL-lel</li>
                    <li>Időpont- és naptárkezelés</li>
                    <li>Automatikus e-mail értesítések és emlékeztetők</li>
                    <li>Statisztikák és riportok</li>
                    <li>Csapatkezelés (Profi csomag)</li>
                </ul>
            </Section>

            <Section title="3. Regisztráció, fiók és próbaidőszak">
                <Sub title="3.1 Regisztráció">
                    <ul style={{ paddingLeft: 20 }}>
                        <li>A platform igénybevételéhez regisztráció szükséges. A regisztrációval a Felhasználó elfogadja a jelen ÁSZF-et.</li>
                        <li>Regisztrálni kizárólag 18. életévét betöltött, cselekvőképes természetes személy vagy jogi személy képviseletében eljáró személy jogosult.</li>
                        <li>A Felhasználó köteles valós, pontos és naprakész adatokat megadni. Hamis adatok megadása azonnali fióktörlést vonhat maga után.</li>
                        <li>A fiók nem ruházható át harmadik személyre.</li>
                        <li>A Felhasználó felelős a bejelentkezési adatai (jelszó) biztonságos kezeléséért.</li>
                    </ul>
                </Sub>
                <Sub title="3.2 Ingyenes próbaidőszak (Trial)">
                    <p>Fizetős csomagra (Alap vagy Profi) való feliratkozáskor a Felhasználó <strong>14 napos ingyenes próbaidőszakot</strong> vesz igénybe az alábbi feltételekkel:</p>
                    <ul style={{ paddingLeft: 20 }}>
                        <li>A próbaidőszak alatt az összes csomag-specifikus funkció teljes körűen elérhető.</li>
                        <li>A próbaidőszakhoz érvényes bankkártya megadása szükséges, amelyet a Stripe biztonságos rendszere tárol.</li>
                        <li>A próbaidőszak lejártakor, amennyiben a Felhasználó nem mondja le az előfizetést, az első díj automatikusan levonásra kerül.</li>
                        <li>A próbaidőszak alatt bármikor, díjmentesen lemondható az előfizetés.</li>
                        <li>Felhasználónként csak egy próbaidőszak vehető igénybe.</li>
                    </ul>
                </Sub>
                <Sub title="3.3 Ingyenes csomag">
                    <p>Az ingyenes csomag regisztrációval, kártyaadat megadása nélkül is igénybe vehető, korlátozott funkciókkal, határozatlan ideig.</p>
                </Sub>
            </Section>

            <Section title="4. Előfizetési csomagok és árak">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                    {[
                        { name: '🆓 Ingyenes', price: '0 Ft/hó', features: ['Foglalási oldal', 'Naptárkezelés', 'Korlátozott funkciók'] },
                        { name: '⭐ Alap', price: '4 997 Ft/hó', features: ['Minden ingyenes funkció', 'E-mail értesítők', 'Emlékeztetők', 'Statisztikák', '14 napos trial'] },
                        { name: '🏢 Profi', price: '19 997 Ft/hó', features: ['Minden Alap funkció', 'Csapatkezelés (6-10 fő)', 'Prioritásos támogatás', '14 napos trial'] },
                    ].map(plan => (
                        <div key={plan.name} style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16 }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                            <div style={{ color: 'var(--primary-600)', fontWeight: 700, marginBottom: 10 }}>{plan.price}</div>
                            <ul style={{ paddingLeft: 16, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                {plan.features.map(f => <li key={f}>{f}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Az árak fogyasztói árak, tartalmazzák az ÁFÁ-t (27%). A Szolgáltató fenntartja az árváltoztatás jogát, melyről a Felhasználókat 30 nappal előre értesíti.</p>
            </Section>

            <Section title="5. Fizetési feltételek és számlázás">
                <ul style={{ paddingLeft: 20 }}>
                    <li>A fizetés a <strong>Stripe Inc.</strong> (1355 Market Street, Suite 900, San Francisco, CA 94103, USA) fizetési rendszeren keresztül, bankkártyával történik. A kártyaadatokat kizárólag a Stripe tárolja, PCI-DSS szabvány szerint, a FoglaljVelem.hu-nak nem áll rendelkezésére.</li>
                    <li>Az előfizetés az első sikeres fizetéstől (próbaidőszak esetén a trial lejártától) számítva <strong>havonta automatikusan megújul</strong>.</li>
                    <li>A számlát elektronikus úton, a Felhasználó által megadott e-mail címre küldjük.</li>
                    <li>Az előfizetés a <strong>Beállítások</strong> menüponton keresztül bármikor lemondható. A lemondás a következő számlázási ciklus kezdetén lép életbe; az előre kifizetett időszakra visszatérítés nem jár.</li>
                    <li>Sikertelen fizetés esetén a Stripe 3 alkalommal kísérli meg a terhelést. Tartós sikertelenség esetén a fiók automatikusan az Ingyenes csomagra áll vissza, és értesítő e-mailt küldünk.</li>
                </ul>
            </Section>

            <Section title="6. A platform elérhetősége és karbantartás">
                <ul style={{ paddingLeft: 20 }}>
                    <li>A FoglaljVelem.hu törekszik a platform folyamatos, megszakítás nélküli működésére, de <strong>100%-os rendelkezésre állást nem garantál</strong>.</li>
                    <li>Tervezett karbantartásról legalább 24 órával előre értesítjük a Felhasználókat e-mailben.</li>
                    <li>A platform infrastruktúráját a Vercel Inc. és a Supabase Inc. biztosítja; ezek kiesése esetén a FoglaljVelem.hu nem vállal felelősséget.</li>
                    <li>Fenntartjuk a jogot a platform fejlesztésére, funkcióinak módosítására, amelyről a Felhasználókat értesítjük.</li>
                </ul>
            </Section>

            <Section title="7. Felelősség korlátozása – KÉRJÜK FIGYELMESEN OLVASSA EL">
                <Alert>Ez a fejezet meghatározza a FoglaljVelem.hu felelősségének korlátait. A platform igénybevételével Ön kifejezetten elfogadja ezeket a korlátozásokat.</Alert>

                <Sub title="7.1 A platform közvetítő jellege">
                    <p>A FoglaljVelem.hu kizárólag technikai platformot nyújt az időpontfoglalás lebonyolításához. <strong>A platform nem felelős:</strong></p>
                    <ul style={{ paddingLeft: 20 }}>
                        <li>A szolgáltatók által nyújtott szolgáltatások minőségéért, biztonságáért, jogszerűségéért.</li>
                        <li>A szolgáltató és ügyfele közötti bármilyen vitáért, kárért, szerződésszegésért.</li>
                        <li>A szolgáltató által megadott adatok (ár, időtartam, leírás) pontosságáért.</li>
                        <li>Azért, hogy a meghirdetett időpontot a szolgáltató valóban teljesíti-e.</li>
                    </ul>
                </Sub>

                <Sub title="7.2 Foglalások elvesztése, technikai hibák">
                    <Alert>A FoglaljVelem.hu nem vállal felelősséget foglalások elvesztéséért, duplikált foglalásokért, vagy nem kézbesített értesítő e-mailekért, amennyiben ezek technikai hiba, hálózati kiesés, harmadik fél (tárhelyszolgáltató, e-mail küldő rendszer, internet-szolgáltató) hibája, vagy a Felhasználó által megadott hibás e-mail cím következtében keletkeztek.</Alert>
                    <p>A Felhasználó kötelezettsége:</p>
                    <ul style={{ paddingLeft: 20 }}>
                        <li>Rendszeresen ellenőrizni a Dashboard-ban a foglalásokat.</li>
                        <li>Helyes e-mail cím megadása a fiókban.</li>
                        <li>Ügyfeleivel a foglalást közvetlenül is megerősíteni, ha szükséges.</li>
                    </ul>
                </Sub>

                <Sub title="7.3 Kárfelelősség maximuma">
                    <p>Amennyiben a FoglaljVelem.hu felelősségét bíróság megállapítja, a megtérítendő kár maximuma nem haladhatja meg a Felhasználó által az előző <strong>3 hónapban</strong> ténylegesen megfizetett előfizetési díjat.</p>
                    <p>A FoglaljVelem.hu kizárja felelősségét az alábbi károkért:</p>
                    <ul style={{ paddingLeft: 20 }}>
                        <li>Elmaradt haszon (pl. elvesztett ügyfelek miatti bevételkiesés).</li>
                        <li>Közvetett, következményes vagy véletlenszerű károk.</li>
                        <li>A Felhasználó üzleti hírneve csorbulása.</li>
                        <li>Adatvesztés, amennyiben az a Felhasználó saját mulasztásából ered.</li>
                    </ul>
                </Sub>

                <Sub title="7.4 Vis maior">
                    <p>A FoglaljVelem.hu mentesül a felelősség alól vis maior esetén: természeti katasztrófa, háború, terrorizmus, járvány, hatósági intézkedés, internetszolgáltató általános kiesése, harmadik fél infrastruktúrájának meghibásodása (pl. Stripe, Supabase, Vercel, e-mail szolgáltató).</p>
                </Sub>

                <Sub title="7.5 Adatbiztonság">
                    <p>A FoglaljVelem.hu iparági szabványoknak megfelelő biztonsági intézkedéseket alkalmaz (SSL titkosítás, Supabase Row Level Security), azonban <strong>nem garantálható az adatok teljes biztonsága</strong> kibertámadás, zero-day sebezhetőség vagy egyéb, elháríthatalan esemény esetén. Ilyen esetben a Felhasználókat haladéktalanul értesítjük.</p>
                </Sub>
            </Section>

            <Section title="8. A Felhasználó kötelezettségei és tiltott tevékenységek">
                <p>A Felhasználó köteles a platformot rendeltetésszerűen és jogszerűen használni. Tilos:</p>
                <ul style={{ paddingLeft: 20 }}>
                    <li>Valótlan adatok megadása a foglalásokban, profilban.</li>
                    <li>A rendszer automatizált eszközökkel való terhelése (botok, scrapersk).</li>
                    <li>Mások személyes adatainak jogosulatlan kezelése a platformon keresztül.</li>
                    <li>Spam vagy kéretlen üzenetek küldése a platform értesítő rendszerén keresztül.</li>
                    <li>A platform szoftveres elemein visszafejtési kísérletek, biztonsági tesztek engedély nélkül.</li>
                    <li>Jogellenes tartalmak közzététele (pl. illegális szolgáltatások hirdetése).</li>
                </ul>
                <p>Jogsértés esetén a FoglaljVelem.hu jogosult a fiókot azonnali hatállyal, visszatérítés nélkül felfüggeszteni vagy törölni.</p>
            </Section>

            <Section title="9. Elállás és felmondás">
                <Sub title="9.1 Felhasználó általi felmondás">
                    <p>A fizetős előfizetés a <strong>Beállítások → Előfizetés kezelése</strong> menüponton keresztül bármikor lemondható. A felmondás az aktuális számlázási időszak végén lép hatályba. A már kifizetett időszakra visszatérítés nem jár.</p>
                </Sub>
                <Sub title="9.2 Elállási jog (fogyasztók esetén)">
                    <p>A 45/2014. (II. 26.) Korm. rendelet alapján fogyasztónak minősülő természetes személy Felhasználó a fizetős előfizetés megkötésétől számított <strong>14 naptári napon belül</strong> indokolás nélkül elállhat a szerződéstől, ha a szolgáltatást még nem vette igénybe (a platformot nem használta az előfizetési időszakban).</p>
                    <Alert>Ha a Felhasználó az előfizetési időszakon belül a platformot ténylegesen igénybe vette (pl. a Dashboardba bejelentkezett, foglalásokat kezelt), az elállási jog megszűnik, a 151/2003. (IX. 22.) Korm. rendelet 29. § (1) l) pontja alapján (digitális tartalom azonnali teljesítése).</Alert>
                    <p>Elállási szándékát az <strong>info@foglaljvelem.hu</strong> e-mail címre küldje, feltüntetve: nevét, e-mail címét, a szerződés dátumát és az elállás tényét. Az elállást az előírt 14 napon belül visszaigazoljuk, és a visszatérítést 14 napon belül teljesítjük.</p>
                </Sub>
                <Sub title="9.3 FoglaljVelem.hu általi felmondás">
                    <p>A FoglaljVelem.hu jogosult a Felhasználó fiókját 30 napos felmondási idővel, indoklással megszüntetni. ÁSZF súlyos megsértése esetén azonnali hatályú felmondásra is jogosult. Ilyen esetben az arányos előfizetési díjat visszatérítjük.</p>
                </Sub>
            </Section>

            <Section title="10. Szellemi tulajdon">
                <ul style={{ paddingLeft: 20 }}>
                    <li>A FoglaljVelem.hu platform szoftvere, tervei, logója, szövegei, adatbázis-struktúrája az Euro Simon Family Kft. szellemi tulajdona, szerzői jogi védelem alatt állnak.</li>
                    <li>A Felhasználónak korlátozott, nem kizárólagos, nem átruházható, visszavonható licenc kerül megadásra a platform használatára.</li>
                    <li>A Felhasználó a platformba feltöltött tartalmakért (pl. szolgáltatás leírások, profilfotók) teljes felelősséget vállal, és szavatol azok jogtisztaságáért.</li>
                    <li>A FoglaljVelem.hu brand nevét, logóját, designját engedély nélkül tilos felhasználni.</li>
                </ul>
            </Section>

            <Section title="11. Adatvédelem">
                <p>A személyes adatok kezelésére vonatkozó részletes tájékoztató az <Link href="/adatvedelem" style={{ color: 'var(--primary-500)' }}>Adatvédelmi Tájékoztatóban</Link> és a <Link href="/cookie" style={{ color: 'var(--primary-500)' }}>Cookie Szabályzatban</Link> található. A platform GDPR-kompatibilis módon kezeli az adatokat.</p>
            </Section>

            <Section title="12. Panaszkezelés és vitarendezés">
                <Sub title="12.1 Ügyfélszolgálat">
                    <p>Panaszát az <strong>info@foglaljvelem.hu</strong> e-mail címen jelezze. Panaszát 5 munkanapon belül megvizsgáljuk és írásban válaszolunk.</p>
                </Sub>
                <Sub title="12.2 Alternatív vitarendezés">
                    <p>Fogyasztói jogvita esetén a Budapesti Békéltető Testülethez fordulhat: <strong>1016 Budapest, Krisztina krt. 99.</strong> | Tel: +36 1 488 2131 | Web: <a href="https://bekeltet.bfkb.hu" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>bekeltet.bfkb.hu</a></p>
                    <p>EU-s online vitarendezési platform: <a href="https://ec.europa.eu/odr" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)' }}>https://ec.europa.eu/odr</a></p>
                </Sub>
                <Sub title="12.3 Bírósági joghatóság">
                    <p>Amennyiben a vita nem oldható meg egyezség útján, a felek a Gödöllői Járásbíróság, vagy értékhatártól függően a Budapest Környéki Törvényszék kizárólagos illetékességét kötik ki. Irányadó jog: magyar jog, különösen a 2013. évi V. tv. (Ptk.).</p>
                </Sub>
            </Section>

            <Section title="13. ÁSZF módosítása">
                <p>A FoglaljVelem.hu fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A módosításokról a Felhasználókat a hatályba lépés előtt legalább <strong>15 nappal</strong> e-mailben értesítjük. Ha a Felhasználó a módosítást nem fogadja el, jogosult az előfizetést a módosítás hatályba lépése előtt díjmentesen felmondani. A módosítás hatályba lépése után a platform további használata a módosítás elfogadásának minősül.</p>
            </Section>

            <Section title="14. Egyéb rendelkezések">
                <ul style={{ paddingLeft: 20 }}>
                    <li>Ha jelen ÁSZF valamely rendelkezése érvénytelen vagy végrehajthatatlan, ez a többi rendelkezés érvényességét nem érinti.</li>
                    <li>A jelen ÁSZF-ben nem szabályozott kérdésekben a Polgári Törvénykönyvről szóló 2013. évi V. törvény, az elektronikus kereskedelmi törvény (2001. évi CVIII. tv.), és egyéb vonatkozó magyar jogszabályok rendelkezései az irányadóak.</li>
                    <li>A platform egyes funkcióinak igénybevételéhez külön feltételek vonatkozhatnak, amelyeket adott funkcióknál tüntetünk fel.</li>
                </ul>
            </Section>

            <div style={{ marginTop: 40, padding: 24, background: 'var(--gray-50)', borderRadius: 14, textAlign: 'center', border: '1px solid var(--gray-100)' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Euro Simon Family Kft. – FoglaljVelem.hu</p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                    2100 Gödöllő, Csalogány utca 6. | info@foglaljvelem.hu<br />
                    © {new Date().getFullYear()} Minden jog fenntartva.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
                    <Link href="/adatvedelem" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>Adatvédelmi Tájékoztató</Link>
                    <Link href="/cookie" style={{ color: 'var(--primary-500)', fontSize: '0.85rem' }}>Cookie Szabályzat</Link>
                </div>
            </div>
        </div>
    );
}
