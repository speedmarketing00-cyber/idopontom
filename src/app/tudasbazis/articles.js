// All knowledge base article content for FoglaljVelem
// Each article has: slug, title, category, categoryId, desc, content (HTML), seoTitle, seoDesc

const articles = {
    // ═══════════════════════════════════════════
    // KEZDŐ LÉPÉSEK
    // ═══════════════════════════════════════════
    'regisztracio-es-fiok-letrehozas': {
        title: 'Regisztráció és fiók létrehozása',
        category: 'Kezdő lépések',
        categoryId: 'kezdo',
        icon: '🚀',
        desc: 'Hogyan hozd létre a fiókodat email címmel vagy Google fiókkal.',
        seoTitle: 'Regisztráció és fiók létrehozása – FoglaljVelem Tudásbázis',
        seoDesc: 'Lépésről lépésre útmutató a FoglaljVelem fiók létrehozásához. Regisztrálj email címmel vagy Google fiókkal percek alatt.',
        readTime: '3 perc',
        content: `
            <p>A FoglaljVelem használatának első lépése a fiók létrehozása. Válaszd ki az általad preferált módszert — mindkettő gyors és egyszerű.</p>

            <h2>🔹 1. módszer: Regisztráció Google fiókkal (ajánlott)</h2>
            <p>Ez a leggyorsabb módszer — egyetlen kattintás és kész!</p>
            <ol>
                <li>Nyisd meg a <strong>foglaljvelem.hu</strong> oldalt</li>
                <li>Kattints a <strong>„Regisztráció"</strong> gombra a jobb felső sarokban</li>
                <li>Kattints a <strong>„Regisztráció Google-lal"</strong> gombra</li>
                <li>Válaszd ki a Google fiókodat a felugró ablakban</li>
                <li>A rendszer automatikusan átveszi a neved és email címed</li>
                <li>Add meg a <strong>vállalkozásod nevét</strong>, <strong>telefonszámát</strong> és <strong>szakterületet</strong></li>
                <li>Kattints az <strong>„Indítsd el a foglalásokat!"</strong> gombra</li>
            </ol>
            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A Google regisztráció előnye, hogy nem kell jelszót megjegyezned — mindig a Google fiókoddal lépsz be.
            </div>

            <h2>🔹 2. módszer: Regisztráció e-mail címmel</h2>
            <ol>
                <li>Nyisd meg a <strong>foglaljvelem.hu</strong> oldalt</li>
                <li>Kattints a <strong>„Regisztráció"</strong> gombra</li>
                <li>Töltsd ki a regisztrációs űrlapot:
                    <ul>
                        <li><strong>Teljes neved</strong> — ahogy az ügyfeleid ismernek</li>
                        <li><strong>E-mail cím</strong> — ide jönnek az értesítések</li>
                        <li><strong>Telefonszám</strong> — legalább 9 számjegy</li>
                        <li><strong>Vállalkozás neve</strong> (opcionális)</li>
                        <li><strong>Szakterület</strong> — válassz a listából</li>
                        <li><strong>Jelszó</strong> — minimum 6 karakter</li>
                    </ul>
                </li>
                <li>Válassz csomagot (az Ingyenes is tökéletes a kezdéshez!)</li>
                <li>Kattints a <strong>„Regisztráció"</strong> gombra</li>
            </ol>

            <h2>🔹 Csomag választása regisztrációkor</h2>
            <p>A regisztráció során három csomag közül választhatsz:</p>
            <ul>
                <li><strong>Ingyenes (0 Ft/hó)</strong> — Foglalási oldal és naptárkezelés, e-mail értesítők nélkül</li>
                <li><strong>Alap (4 997 Ft/hó)</strong> — Teljes funkciókészlet, 14 nap ingyenes próbaidőszakkal</li>
                <li><strong>Profi (19 997 Ft/hó)</strong> — Csapatkezelés, prioritásos támogatás, 14 nap ingyenes próbaidőszakkal</li>
            </ul>
            <div class="kb-info">
                <strong>ℹ️ Fontos:</strong> A fizetős csomagokat 14 napig ingyen kipróbálhatod, és bármikor lemondhatod. Az első 14 napban nem vonódik le semmi.
            </div>

            <h2>🔹 Mi történik regisztráció után?</h2>
            <p>Sikeres regisztráció után automatikusan a <strong>Vezérlőpultra</strong> kerülsz, ahol:</p>
            <ol>
                <li>Hozzáadhatod az első <strong>szolgáltatásodat</strong></li>
                <li>Beállíthatod az <strong>elérhetőségedet</strong> (munkaidő)</li>
                <li>Megkapod a személyes <strong>foglalási linked</strong></li>
            </ol>
            <p>Egy üdvözlő e-mailt is kapsz a regisztrált e-mail címedre a következő lépésekről.</p>
        `,
    },

    'szolgaltatasok-hozzaadasa': {
        title: 'Szolgáltatások hozzáadása',
        category: 'Kezdő lépések',
        categoryId: 'kezdo',
        icon: '🚀',
        desc: 'Állítsd be a szolgáltatásaidat, árakat és időtartamokat.',
        seoTitle: 'Szolgáltatások hozzáadása – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan add hozzá és állítsd be a szolgáltatásaidat a FoglaljVelem rendszerben. Árak, időtartamok, leírások beállítása.',
        readTime: '4 perc',
        content: `
            <p>A szolgáltatások a foglalási rendszered alapja. Állítsd be, hogy mit kínálsz, mennyiért és mennyi ideig tart — az ügyfeleid ebből fognak választani.</p>

            <h2>🔹 Új szolgáltatás hozzáadása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong> (foglaljvelem.hu/dashboard)</li>
                <li>Kattints a bal oldali menüben a <strong>„Szolgáltatások"</strong> menüpontra</li>
                <li>Kattints az <strong>„Új szolgáltatás"</strong> gombra</li>
                <li>Töltsd ki a mezőket:
                    <ul>
                        <li><strong>Szolgáltatás neve</strong> — pl. „Női hajvágás", „Személyi edzés"</li>
                        <li><strong>Leírás</strong> — rövid leírás arról, mit tartalmaz</li>
                        <li><strong>Időtartam</strong> — percben megadva (pl. 30, 60, 90 perc)</li>
                        <li><strong>Ár</strong> — a szolgáltatás ára forintban</li>
                    </ul>
                </li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Szolgáltatás szerkesztése</h2>
            <p>Egy meglévő szolgáltatás módosításához:</p>
            <ol>
                <li>Menj a <strong>Szolgáltatások</strong> oldalra</li>
                <li>Kattints a szerkeszteni kívánt szolgáltatás <strong>„Szerkesztés"</strong> gombjára</li>
                <li>Módosítsd a kívánt mezőket</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Tippek a szolgáltatások beállításához</h2>
            <div class="kb-tip">
                <strong>💡 Tippek:</strong>
                <ul>
                    <li><strong>Adj egyértelmű neveket</strong> — Az ügyfeleid ebből fognak választani, ezért legyen világos</li>
                    <li><strong>Adj hozzá leírást</strong> — Részletezd, mit tartalmaz a szolgáltatás</li>
                    <li><strong>Kalkuláld az időt reálisan</strong> — Számolj bele egy kis puffert a takarításra, átállásra</li>
                    <li><strong>0 Ft ár</strong> — Ha nem szeretnéd megjeleníteni az árat, hagyd 0-n</li>
                </ul>
            </div>

            <h2>🔹 Szolgáltatás törlése</h2>
            <p>Ha egy szolgáltatásra már nincs szükséged:</p>
            <ol>
                <li>Menj a <strong>Szolgáltatások</strong> oldalra</li>
                <li>Kattints a szolgáltatás melletti <strong>„Törlés"</strong> gombra</li>
                <li>Erősítsd meg a törlést a felugró ablakban</li>
            </ol>
            <div class="kb-warning">
                <strong>⚠️ Figyelem:</strong> A törlés végleges, a szolgáltatáshoz tartozó korábbi foglalások viszont megmaradnak az archívumban.
            </div>
        `,
    },

    'elerhetoseg-beallitasa': {
        title: 'Elérhetőség beállítása',
        category: 'Kezdő lépések',
        categoryId: 'kezdo',
        icon: '🚀',
        desc: 'Munkaidő és szünetnapok megadása, mikor fogadj foglalásokat.',
        seoTitle: 'Elérhetőség beállítása – FoglaljVelem Tudásbázis',
        seoDesc: 'Állítsd be a munkaidődet és szünetnapjaidat a FoglaljVelem rendszerben. Határozd meg, mikor fogadhatsz foglalásokat.',
        readTime: '3 perc',
        content: `
            <p>Az elérhetőségi beállítások határozzák meg, hogy az ügyfeleid mikor tudnak hozzád időpontot foglalni. Állítsd be a munkaidődet és a szünetnapjaidat.</p>

            <h2>🔹 Munkaidő beállítása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Kattints a bal oldali menüben az <strong>„Elérhetőség"</strong> menüpontra</li>
                <li>Minden napnál beállíthatod:
                    <ul>
                        <li><strong>Munkaidő kezdete</strong> — pl. 08:00</li>
                        <li><strong>Munkaidő vége</strong> — pl. 18:00</li>
                        <li><strong>Szünet</strong> — pl. 12:00 - 13:00 (ebédszünet)</li>
                    </ul>
                </li>
                <li>A napot ki is kapcsolhatod, ha aznap nem dolgozol (pl. vasárnap)</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Szünetnapok megadása</h2>
            <p>Ha egy adott napon nem szeretnél foglalásokat fogadni (szabadság, ünnepnap, stb.):</p>
            <ol>
                <li>Menj az <strong>Elérhetőség</strong> oldalra</li>
                <li>Keresd meg a <strong>„Szünetnapok"</strong> részt</li>
                <li>Add hozzá a dátumot és opcionálisan egy megjegyzést</li>
                <li>A rendszer automatikusan blokkolja az adott napot a foglalási naptárban</li>
            </ol>

            <h2>🔹 Időköz beállítása</h2>
            <p>Az időköz határozza meg, milyen időközönként kínálja a rendszer a szabad időpontokat:</p>
            <ul>
                <li><strong>15 perc</strong> — Sűrű időbeosztáshoz (pl. fodrász)</li>
                <li><strong>30 perc</strong> — Általános használatra</li>
                <li><strong>60 perc</strong> — Hosszabb konzultációkhoz</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Ha 30 perces és 60 perces szolgáltatásaid is vannak, válaszd a 30 perces időközt — így a rendszer rugalmasabban tudja kezelni az időpontokat.
            </div>

            <h2>🔹 Hogyan látják ezt az ügyfeleid?</h2>
            <p>A foglalási oldaladon az ügyfelek csak azokat az időpontokat látják, amelyek:</p>
            <ul>
                <li>A munkaidődbe esnek</li>
                <li>Nem esnek szünetre vagy szünetnapra</li>
                <li>Nincsenek már lefoglalva más ügyfél által</li>
                <li>Elég hosszúak a választott szolgáltatáshoz</li>
            </ul>
        `,
    },

    'foglalasi-oldal-megosztasa': {
        title: 'Foglalási oldal megosztása',
        category: 'Kezdő lépések',
        categoryId: 'kezdo',
        icon: '🚀',
        desc: 'Hogyan oszd meg a foglalási linked ügyfeleidnek.',
        seoTitle: 'Foglalási oldal megosztása – FoglaljVelem Tudásbázis',
        seoDesc: 'Ismerd meg, hogyan oszthatod meg a foglalási oldaladat az ügyfeleidnek. Link megosztás, QR kód, beágyazás.',
        readTime: '3 perc',
        content: `
            <p>Miután beállítottad a szolgáltatásaidat és az elérhetőségedet, itt az ideje megosztani a foglalási oldaladat az ügyfeleidkel!</p>

            <h2>🔹 Foglalási link megtalálása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>A főoldalon (Dashboard) megtalálod a <strong>foglalási linked</strong></li>
                <li>A link formátuma: <code>foglaljvelem.hu/foglalas/a-te-slug-od</code></li>
                <li>Kattints a <strong>„Másolás"</strong> gombra a link vágólapra másolásához</li>
            </ol>

            <h2>🔹 Hol oszd meg a linked?</h2>
            <p>A foglalási linked bárhol megoszthatod, ahol az ügyfeleid megtalálnak:</p>

            <h3>📱 Közösségi média</h3>
            <ul>
                <li><strong>Instagram bio</strong> — Tedd be a profilod linkjébe</li>
                <li><strong>Facebook oldal</strong> — Add hozzá a „Foglalás" gombhoz</li>
                <li><strong>Instagram story</strong> — Oszd meg link sticker-rel</li>
                <li><strong>TikTok bio</strong> — Linkelj a foglalási oldaladra</li>
            </ul>

            <h3>💬 Üzenetküldők</h3>
            <ul>
                <li><strong>WhatsApp / Messenger</strong> — Küldd el közvetlenül az ügyfeleknek</li>
                <li><strong>SMS</strong> — Rövid üzenetben is megoszthatod</li>
            </ul>

            <h3>🌐 Weboldal</h3>
            <ul>
                <li><strong>Saját weboldal</strong> — Helyezz el egy „Foglalj időpontot" gombot</li>
                <li><strong>Google My Business</strong> — Add hozzá weboldal linkként</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A foglalási oldal mobilbarát, így az ügyfeleid telefonról is könnyedén foglalhatnak!
            </div>

            <h2>🔹 Foglalási oldal előnézete</h2>
            <p>Mielőtt megosztanád, nézd meg, hogyan látják az ügyfeleid:</p>
            <ol>
                <li>Kattints a foglalási linked melletti <strong>„Megtekintés"</strong> gombra</li>
                <li>Ellenőrizd, hogy minden szolgáltatás és időpont helyesen jelenik meg</li>
                <li>Próbáld ki egy tesztfoglalással is</li>
            </ol>
        `,
    },

    'elso-foglalas-kezelese': {
        title: 'Első foglalás kezelése',
        category: 'Kezdő lépések',
        categoryId: 'kezdo',
        icon: '🚀',
        desc: 'Amikor megérkezik az első foglalás — értesítések és kezelés.',
        seoTitle: 'Első foglalás kezelése – FoglaljVelem Tudásbázis',
        seoDesc: 'Mi történik, amikor megérkezik az első foglalásod? Értesítések, jóváhagyás, naptárkezelés lépésről lépésre.',
        readTime: '3 perc',
        content: `
            <p>Gratulálunk az első foglalásodhoz! 🎉 Így kezeld egyszerűen.</p>

            <h2>🔹 Hogyan értesülsz az új foglalásról?</h2>
            <p>Amikor egy ügyfél időpontot foglal nálad:</p>
            <ul>
                <li><strong>E-mail értesítést kapsz</strong> a regisztrált e-mail címedre (Alap és Profi csomag)</li>
                <li>A foglalás megjelenik a <strong>naptáradban</strong> a Vezérlőpulton</li>
                <li>Az ügyfél is kap egy visszaigazoló e-mailt (Alap és Profi csomag)</li>
            </ul>

            <h2>🔹 Foglalás megtekintése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>A <strong>Naptár</strong> nézetben megjelenik az új foglalás</li>
                <li>Kattints a foglalásra a részletek megtekintéséhez:
                    <ul>
                        <li>Ügyfél neve és elérhetőségei</li>
                        <li>Foglalt szolgáltatás</li>
                        <li>Dátum és időpont</li>
                        <li>Megjegyzések (ha az ügyfél írt)</li>
                    </ul>
                </li>
            </ol>

            <h2>🔹 Foglalás kezelése</h2>
            <p>A foglalás részleteinél a következő lehetőségeid vannak:</p>
            <ul>
                <li><strong>Lemondás</strong> — Ha nem tudsz fogadni az ügyfelet, lemondhatod a foglalást</li>
                <li><strong>Átütemezés</strong> — Új időpontot ajánlhatsz az ügyfélnek</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Reagálj minél gyorsabban az új foglalásokra — ez növeli az ügyfelek bizalmát és elégedettségét!
            </div>

            <h2>🔹 Emlékeztetők</h2>
            <p>Az Alap és Profi csomagban az ügyfeleid automatikus emlékeztető e-mailt kapnak a foglalás előtt, így csökken a no-show (meg nem jelenés) aránya.</p>

            <div class="kb-info">
                <strong>ℹ️ Tudtad?</strong> Az automatikus emlékeztetők akár 40%-kal csökkenthetik a lemondások és no-show-k számát!
            </div>
        `,
    },

    // ═══════════════════════════════════════════
    // BEÁLLÍTÁSOK
    // ═══════════════════════════════════════════
    'profil-es-vallalkozas-beallitasa': {
        title: 'Profil és vállalkozás beállítása',
        category: 'Beállítások',
        categoryId: 'beallitasok',
        icon: '⚙️',
        desc: 'Név, leírás, cím, logó és egyéb vállalkozási adatok megadása.',
        seoTitle: 'Profil és vállalkozás beállítása – FoglaljVelem Tudásbázis',
        seoDesc: 'Állítsd be a vállalkozásod profilját: név, leírás, cím, logó. Így jelenik meg a foglalási oldaladon.',
        readTime: '4 perc',
        content: `
            <p>A profilod az, amit az ügyfeleid látnak a foglalási oldaladon. Tedd teljessé és profivá!</p>

            <h2>🔹 Profil szerkesztése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Kattints a bal oldali menüben a <strong>„Beállítások"</strong> menüpontra</li>
                <li>A <strong>„Profil"</strong> fülön szerkesztheted az adataidat</li>
            </ol>

            <h2>🔹 Kitöltendő mezők</h2>
            <ul>
                <li><strong>Vállalkozás neve</strong> — Ez jelenik meg a foglalási oldalad tetején</li>
                <li><strong>Leírás</strong> — Rövid bemutatkozás (ajánlott: 2-3 mondat)</li>
                <li><strong>Cím</strong> — A vállalkozásod címe, ahol fogadod az ügyfeleket</li>
                <li><strong>Telefonszám</strong> — Elérhetőséged</li>
                <li><strong>Logó / Profilkép</strong> — Tölts fel egy professzionális képet</li>
            </ul>

            <h2>🔹 Tippek a tökéletes profilhoz</h2>
            <div class="kb-tip">
                <strong>💡 Profi tippek:</strong>
                <ul>
                    <li><strong>Leírás:</strong> Írd le, miben vagy különleges! Mi különböztet meg a versenytársaidtól?</li>
                    <li><strong>Profilkép:</strong> Használj éles, jó minőségű képet — lehet a logód vagy egy fotó a szalonodról</li>
                    <li><strong>Cím:</strong> Pontos cím segíti az ügyfeleket megtalálni téged</li>
                </ul>
            </div>

            <h2>🔹 Slug (egyedi link) beállítása</h2>
            <p>A slug határozza meg a foglalási oldalad URL-jét:</p>
            <ul>
                <li>Formátum: <code>foglaljvelem.hu/foglalas/<strong>a-te-slug-od</strong></code></li>
                <li>Automatikusan generálódik regisztrációkor</li>
                <li>Később módosítható a Beállításokban</li>
            </ul>

            <div class="kb-warning">
                <strong>⚠️ Figyelem:</strong> Ha megváltoztatod a slug-ot, a régi link nem fog működni. Ha már megosztottad valahol, frissítsd ott is!
            </div>
        `,
    },

    'email-ertesitesek-beallitasa': {
        title: 'Email értesítések beállítása',
        category: 'Beállítások',
        categoryId: 'beallitasok',
        icon: '⚙️',
        desc: 'Automatikus visszaigazolás, emlékeztető és lemondási emailek.',
        seoTitle: 'Email értesítések beállítása – FoglaljVelem Tudásbázis',
        seoDesc: 'Konfigurláld az automatikus email értesítéseket: visszaigazolás, emlékeztető, lemondás. Alap és Profi csomagban elérhető.',
        readTime: '3 perc',
        content: `
            <p>Az automatikus e-mail értesítések professzionálissá teszik a foglalási rendszeredet és csökkentik a no-show-k számát.</p>

            <div class="kb-info">
                <strong>ℹ️ Megjegyzés:</strong> Az e-mail értesítések az <strong>Alap</strong> és <strong>Profi</strong> csomagban érhetők el.
            </div>

            <h2>🔹 Elérhető értesítéstípusok</h2>

            <h3>📧 Foglalás visszaigazolás</h3>
            <p>Automatikusan kiküldésre kerül, amikor egy ügyfél időpontot foglal:</p>
            <ul>
                <li>Az ügyfélnek: visszaigazolás a foglalás részleteivel</li>
                <li>Neked: értesítés az új foglalásról</li>
            </ul>

            <h3>⏰ Emlékeztető</h3>
            <p>A foglalás előtt küldött emlékeztető segít, hogy az ügyfél ne felejtse el az időpontot:</p>
            <ul>
                <li>Általában 24 órával a foglalás előtt küldésre kerül</li>
                <li>Tartalmazza a foglalás minden fontos részletét</li>
            </ul>

            <h3>❌ Lemondás</h3>
            <p>Ha egy foglalás lemondásra kerül, az ügyfél automatikus értesítést kap.</p>

            <h2>🔹 Értesítések bekapcsolása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások → Email értesítések</strong> részhez</li>
                <li>Kapcsold be/ki az egyes értesítéstípusokat</li>
                <li>Mentsd el a beállításokat</li>
            </ol>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Az emlékeztetőket erősen ajánlott bekapcsolni — akár 40%-kal csökkenthetik a meg nem jelenések számát!
            </div>
        `,
    },

    'meta-pixel-beallitasa': {
        title: 'Meta Pixel beállítása',
        category: 'Beállítások',
        categoryId: 'beallitasok',
        icon: '⚙️',
        desc: 'Facebook/Instagram hirdetések mérése a foglalási oldalon.',
        seoTitle: 'Meta Pixel beállítása – FoglaljVelem Tudásbázis',
        seoDesc: 'Mérd a Facebook és Instagram hirdetéseid hatékonyságát a foglalási oldaladon Meta Pixel integrációval.',
        readTime: '5 perc',
        content: `
            <p>A Meta Pixel (korábban Facebook Pixel) segítségével mérheted a Facebook és Instagram hirdetéseid hatékonyságát a foglalási oldaladon.</p>

            <h2>🔹 Miért fontos a Meta Pixel?</h2>
            <ul>
                <li><strong>Konverzió mérés</strong> — Megmutatja, hány foglalás jött a hirdetéseidből</li>
                <li><strong>Remarketing</strong> — Újra elérheted azokat, akik meglátogatták az oldaladat</li>
                <li><strong>Hirdetés optimalizálás</strong> — A Meta algoritmus jobban optimalizál a konverziós adatokkal</li>
            </ul>

            <h2>🔹 Meta Pixel ID megtalálása</h2>
            <ol>
                <li>Lépj be a <strong>Meta Business Suite</strong>-ba (business.facebook.com)</li>
                <li>Menj az <strong>Események kezelője</strong> (Events Manager) részhez</li>
                <li>Másold ki a <strong>Pixel ID</strong>-t (egy 15-16 számjegyű szám)</li>
            </ol>

            <h2>🔹 Pixel hozzáadása a FoglaljVelem-hez</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások</strong> oldalra</li>
                <li>Keresd meg a <strong>„Meta Pixel ID"</strong> mezőt</li>
                <li>Illeszd be a Pixel ID-t</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Milyen eseményeket mér a rendszer?</h2>
            <p>A FoglaljVelem automatikusan elküldi a következő eseményeket a Meta-nak:</p>
            <ul>
                <li><strong>PageView</strong> — Amikor valaki megnyitja a foglalási oldaladat</li>
                <li><strong>Schedule</strong> — Amikor valaki sikeresen foglal időpontot</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A FoglaljVelem a Conversions API-t is használja, ami pontosabb mérést biztosít, mivel nem blokkolják a reklámblokkolók.
            </div>

            <div class="kb-info">
                <strong>ℹ️ Haladó:</strong> Ha a saját Meta Pixel-ed mellett a Conversions API token-t is be szeretnéd állítani, lépj kapcsolatba velünk az info@foglaljvelem.hu címen.
            </div>
        `,
    },

    'koszonjuk-oldal-testreszabasa': {
        title: 'Köszönjük oldal testreszabása',
        category: 'Beállítások',
        categoryId: 'beallitasok',
        icon: '⚙️',
        desc: 'Foglalás utáni köszönő oldal szövegének és megjelenésének szerkesztése.',
        seoTitle: 'Köszönjük oldal testreszabása – FoglaljVelem Tudásbázis',
        seoDesc: 'Szabd testre a foglalás utáni köszönő oldalt: egyedi szöveg, megjelenés, további lépések.',
        readTime: '2 perc',
        content: `
            <p>A köszönjük oldal az, amit az ügyfeled lát a sikeres foglalás után. Szabd testre, hogy profivá tedd az élményt!</p>

            <h2>🔹 Köszönjük oldal szerkesztése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások</strong> oldalra</li>
                <li>Keresd meg a <strong>„Köszönjük oldal"</strong> részt</li>
                <li>Írd be az egyedi üzeneted</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Milyen információkat jeleníts meg?</h2>
            <ul>
                <li><strong>Köszönő szöveg</strong> — pl. „Köszönjük a foglalást! Várunk szeretettel!"</li>
                <li><strong>Fontos tudnivalók</strong> — pl. parkolási lehetőségek, megközelítés</li>
                <li><strong>Lemondási feltételek</strong> — pl. „24 órával előtte ingyenesen lemondható"</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Egy személyes, meleg hangvételű üzenet nagyban növeli az ügyfélélményt! Kerüld a sablonos szövegeket.
            </div>
        `,
    },

    'jelszo-valtoztatas': {
        title: 'Jelszó változtatás',
        category: 'Beállítások',
        categoryId: 'beallitasok',
        icon: '⚙️',
        desc: 'Hogyan változtasd meg a jelszavad biztonságosan.',
        seoTitle: 'Jelszó változtatás – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan változtasd meg a jelszavad a FoglaljVelem rendszerben. Biztonsági tippek és lépések.',
        readTime: '2 perc',
        content: `
            <p>A jelszavad megváltoztatása egyszerű és fontos biztonsági lépés.</p>

            <h2>🔹 Jelszó megváltoztatása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások</strong> oldalra</li>
                <li>Keresd meg a <strong>„Jelszó változtatás"</strong> részt</li>
                <li>Add meg az <strong>új jelszavad</strong> (minimum 6 karakter)</li>
                <li>Erősítsd meg az új jelszót</li>
                <li>Kattints a <strong>„Jelszó mentése"</strong> gombra</li>
            </ol>

            <h2>🔹 Elfelejtett jelszó</h2>
            <p>Ha elfelejtetted a jelszavad:</p>
            <ol>
                <li>Menj a <strong>bejelentkezési oldalra</strong></li>
                <li>Kattints az <strong>„Elfelejtett jelszó"</strong> linkre</li>
                <li>Add meg a regisztrált <strong>e-mail címed</strong></li>
                <li>Kapsz egy e-mailt egy jelszó-visszaállító linkkel</li>
                <li>Kattints a linkre és adj meg egy új jelszót</li>
            </ol>

            <div class="kb-tip">
                <strong>💡 Biztonsági tippek:</strong>
                <ul>
                    <li>Használj legalább 8 karakteres jelszót</li>
                    <li>Kombinálj kis- és nagybetűket, számokat</li>
                    <li>Ne használd ugyanazt a jelszót más oldalakon</li>
                    <li>Fontold meg a Google bejelentkezés használatát — biztonságosabb és kényelmesebb</li>
                </ul>
            </div>

            <div class="kb-info">
                <strong>ℹ️ Megjegyzés:</strong> Ha Google fiókkal regisztráltál, nincs szükség jelszóra — mindig a Google fiókod használatával lépsz be.
            </div>
        `,
    },

    // ═══════════════════════════════════════════
    // FUNKCIÓK
    // ═══════════════════════════════════════════
    'naptar-hasznalata': {
        title: 'Naptár használata',
        category: 'Funkciók',
        categoryId: 'funkciok',
        icon: '✨',
        desc: 'Heti és havi nézet, foglalások áttekintése egy helyen.',
        seoTitle: 'Naptár használata – FoglaljVelem Tudásbázis',
        seoDesc: 'Ismerd meg a FoglaljVelem naptár funkcióit: heti és havi nézet, foglalások kezelése, áttekintés egy helyen.',
        readTime: '3 perc',
        content: `
            <p>A naptár a mindennapi munkád központja — itt látod az összes foglalást, kezeled az időbeosztásodat és tartod kézben a napodat.</p>

            <h2>🔹 Naptár nézetek</h2>
            <p>Két nézet közül választhatsz:</p>

            <h3>📅 Heti nézet</h3>
            <ul>
                <li>Az aktuális hét napjait mutatja óránkénti bontásban</li>
                <li>Ideális a napi munkához és foglalások kezeléséhez</li>
                <li>Egy kattintással navigálhatsz az előző/következő hétre</li>
            </ul>

            <h3>📆 Havi nézet</h3>
            <ul>
                <li>Az egész hónapot mutatja egy pillantásra</li>
                <li>A foglalások számát jelzi az egyes napokon</li>
                <li>Ideális a havi áttekintéshez és tervezéshez</li>
            </ul>

            <h2>🔹 Foglalás részleteinek megtekintése</h2>
            <ol>
                <li>Kattints bármelyik foglalásra a naptárban</li>
                <li>Megjelenik az ügyfél neve, a szolgáltatás és az időpont</li>
                <li>Innen tudod lemondani vagy módosítani a foglalást</li>
            </ol>

            <h2>🔹 Navigáció a naptárban</h2>
            <ul>
                <li><strong>Előre/Hátra nyilak</strong> — Hét vagy hónap váltása</li>
                <li><strong>„Ma" gomb</strong> — Visszaugrás az aktuális naphoz</li>
                <li><strong>Nézet váltó</strong> — Heti/havi nézet közötti váltás</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A naptárat rendszeresen ellenőrizd, hogy mindig naprakész legyél a foglalásaidkal kapcsolatban!
            </div>
        `,
    },

    'manualis-foglalas-rogzitese': {
        title: 'Manuális foglalás rögzítése',
        category: 'Funkciók',
        categoryId: 'funkciok',
        icon: '✨',
        desc: 'Telefonos vagy személyes foglalások kézi rögzítése a rendszerben.',
        seoTitle: 'Manuális foglalás rögzítése – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan rögzítheted a telefonos vagy személyes foglalásokat kézzel a FoglaljVelem rendszerben.',
        readTime: '3 perc',
        content: `
            <p>Nem minden foglalás érkezik online — ha telefonon vagy személyesen egyeztetsz időpontot egy ügyféllel, kézzel is rögzítheted a rendszerben.</p>

            <h2>🔹 Manuális foglalás létrehozása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Naptár</strong> oldalra</li>
                <li>Kattints a kívánt időpontra, vagy használd az <strong>„Új foglalás"</strong> gombot</li>
                <li>Töltsd ki a foglalás adatait:
                    <ul>
                        <li><strong>Ügyfél neve</strong></li>
                        <li><strong>E-mail cím</strong> (opcionális)</li>
                        <li><strong>Telefonszám</strong> (opcionális)</li>
                        <li><strong>Szolgáltatás</strong> — válassz a listából</li>
                        <li><strong>Dátum és idő</strong></li>
                        <li><strong>Megjegyzés</strong> (opcionális)</li>
                    </ul>
                </li>
                <li>Kattints a <strong>„Foglalás mentése"</strong> gombra</li>
            </ol>

            <h2>🔹 Miért hasznos a kézi rögzítés?</h2>
            <ul>
                <li><strong>Teljes kép</strong> — Minden foglalásod egy helyen van, nem csak az online-ok</li>
                <li><strong>Nincs dupla foglalás</strong> — A rendszer blokkolja az elfoglalt időpontokat</li>
                <li><strong>Pontosabb statisztikák</strong> — Valós képet kapsz a bevételeidről</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Szokd meg, hogy minden telefonos foglalást azonnal rögzítesz — így elkerülheted a dupla foglalásokat!
            </div>
        `,
    },

    'csoportos-foglalasok': {
        title: 'Csoportos foglalások',
        category: 'Funkciók',
        categoryId: 'funkciok',
        icon: '✨',
        desc: 'Több résztvevős szolgáltatások kezelése (pl. csoportos edzés).',
        seoTitle: 'Csoportos foglalások – FoglaljVelem Tudásbázis',
        seoDesc: 'Állíts be csoportos szolgáltatásokat a FoglaljVelem rendszerben. Ideális csoportos edzésekhez, workshopokhoz.',
        readTime: '3 perc',
        content: `
            <p>A csoportos foglalások lehetővé teszik, hogy egy időpontra több résztvevőt is fogadj — ideális csoportos edzésekhez, workshopokhoz vagy más csoportos tevékenységekhez.</p>

            <h2>🔹 Csoportos szolgáltatás létrehozása</h2>
            <ol>
                <li>Menj a <strong>Szolgáltatások</strong> oldalra</li>
                <li>Hozz létre egy új szolgáltatást vagy szerkessz egy meglévőt</li>
                <li>Kapcsold be a <strong>„Csoportos foglalás"</strong> opciót</li>
                <li>Állítsd be a <strong>maximális résztvevők számát</strong> (pl. 10 fő)</li>
                <li>Mentsd el a szolgáltatást</li>
            </ol>

            <h2>🔹 Hogyan működik?</h2>
            <ul>
                <li>Amikor egy ügyfél foglal, a rendszer egy helyet foglal le a csoportban</li>
                <li>Amíg van szabad hely, az időpont fogadja a további foglalásokat</li>
                <li>Ha betelt a csoport, az időpont automatikusan nem választható</li>
                <li>Az ügyfelek látják, hogy csoportos foglalásról van szó</li>
            </ul>

            <h2>🔹 Példák csoportos szolgáltatásokra</h2>
            <ul>
                <li>💪 <strong>Csoportos edzés</strong> — max. 12 fő</li>
                <li>🧘 <strong>Jóga óra</strong> — max. 15 fő</li>
                <li>📚 <strong>Workshop</strong> — max. 8 fő</li>
                <li>🎨 <strong>Kreatív foglalkozás</strong> — max. 6 fő</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Állítsd be a helyes maximális létszámot, hogy ne legyen túlzsúfolt az óra, de ne is maradjon ki bevétel üres helyekkel!
            </div>
        `,
    },

    'ertekelesi-rendszer': {
        title: 'Értékelési rendszer',
        category: 'Funkciók',
        categoryId: 'funkciok',
        icon: '✨',
        desc: 'Ügyfélvélemények gyűjtése és megjelenítése a foglalási oldalon.',
        seoTitle: 'Értékelési rendszer – FoglaljVelem Tudásbázis',
        seoDesc: 'Gyűjts ügyfélvéleményeket és jelenítsd meg a foglalási oldaladon. Növeld a bizalmat és a konverziókat.',
        readTime: '3 perc',
        content: `
            <p>Az értékelési rendszer segít ügyfélvéleményeket gyűjteni és megjeleníteni a foglalási oldaladon — ezzel növelve a bizalmat és a foglalások számát.</p>

            <h2>🔹 Hogyan működik?</h2>
            <ol>
                <li>A foglalás teljesítése után az ügyfél automatikusan kap egy értékelési felkérést</li>
                <li>Az ügyfél 1-5 csillagos értékelést adhat és szöveges véleményt írhat</li>
                <li>A jóváhagyott vélemények megjelennek a foglalási oldaladon</li>
            </ol>

            <h2>🔹 Értékelések kezelése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>„Vélemények"</strong> menüpontra</li>
                <li>Itt látod az összes beérkezett értékelést</li>
                <li>Eldöntheted, hogy melyiket jelenítsd meg publikusan</li>
            </ol>

            <h2>🔹 Miért fontosak a vélemények?</h2>
            <ul>
                <li><strong>Bizalomépítés</strong> — Az új ügyfelek a vélemények alapján döntenek</li>
                <li><strong>SEO előny</strong> — A vélemények javítják a keresőoptimalizálást</li>
                <li><strong>Visszajelzés</strong> — Megmutatják, mit csinálsz jól és min fejlődhetsz</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Kérd meg a legjobb ügyfeleidet személyesen is, hogy hagyjanak értékelést — a személyes kérésre sokkal többen reagálnak!
            </div>

            <div class="kb-info">
                <strong>ℹ️ Tudtad?</strong> A pozitív véleményekkel rendelkező foglalási oldalak átlagosan 35%-kal több foglalást kapnak!
            </div>
        `,
    },

    'statisztikak-es-riportok': {
        title: 'Statisztikák és riportok',
        category: 'Funkciók',
        categoryId: 'funkciok',
        icon: '✨',
        desc: 'Foglalások, bevételek és népszerű szolgáltatások elemzése.',
        seoTitle: 'Statisztikák és riportok – FoglaljVelem Tudásbázis',
        seoDesc: 'Elemezd a foglalásaidat, bevételeidet és a legnépszerűbb szolgáltatásaidat a FoglaljVelem statisztikai felületén.',
        readTime: '3 perc',
        content: `
            <p>A statisztikák segítenek megérteni a vállalkozásod teljesítményét — hány foglalásod volt, melyik szolgáltatás a legnépszerűbb és hogyan változik a bevételed.</p>

            <h2>🔹 Statisztikák megtekintése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>A Dashboard főoldalon látod az összefoglaló statisztikákat</li>
                <li>Részletesebb adatokért kattints a <strong>„Statisztikák"</strong> menüpontra</li>
            </ol>

            <h2>🔹 Elérhető mutatók</h2>
            <ul>
                <li><strong>Foglalások száma</strong> — Heti, havi, éves bontásban</li>
                <li><strong>Bevétel</strong> — A szolgáltatások árai alapján kalkulált összesítés</li>
                <li><strong>Legnépszerűbb szolgáltatások</strong> — Melyiket foglalják a legtöbben</li>
                <li><strong>Csúcsidőszakok</strong> — Mikor foglalnak a legtöbben</li>
                <li><strong>Lemondási arány</strong> — Hány százaléka mondta le a foglalásokat</li>
            </ul>

            <h2>🔹 Hogyan használd a statisztikákat?</h2>
            <div class="kb-tip">
                <strong>💡 Gyakorlati tippek:</strong>
                <ul>
                    <li><strong>Népszerű időpontok:</strong> Ha délután 2-4 a csúcs, nyújtsd meg az elérhetőségedet ebben a sávban</li>
                    <li><strong>Népszerű szolgáltatások:</strong> Hirdesd ezeket kiemeltebben a közösségi médiában</li>
                    <li><strong>Lemondások:</strong> Ha magas a lemondási arány, fontold meg az emlékeztetők bekapcsolását</li>
                    <li><strong>Bevétel:</strong> Kövesd a havi bevételed trendjét az üzleti döntésekhez</li>
                </ul>
            </div>

            <div class="kb-info">
                <strong>ℹ️ Megjegyzés:</strong> A részletes statisztikák az <strong>Alap</strong> és <strong>Profi</strong> csomagban érhetők el. Az Ingyenes csomagban alap mutatók láthatók.
            </div>
        `,
    },

    // ═══════════════════════════════════════════
    // CSAPATKEZELÉS
    // ═══════════════════════════════════════════
    'csapattag-hozzaadasa': {
        title: 'Csapattag hozzáadása',
        category: 'Csapatkezelés',
        categoryId: 'csapat',
        icon: '👥',
        desc: 'Munkatársak meghívása és jogosultságaik beállítása.',
        seoTitle: 'Csapattag hozzáadása – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan adj hozzá munkatársakat a FoglaljVelem rendszerhez. Meghívás, jogosultságok beállítása lépésről lépésre.',
        readTime: '4 perc',
        content: `
            <p>A Profi csomagban több munkatársat is hozzáadhatsz a rendszeredhez, akik saját naptárral és szolgáltatásokkal rendelkezhetnek.</p>

            <div class="kb-info">
                <strong>ℹ️ Megjegyzés:</strong> A csapatkezelés a <strong>Profi csomagban</strong> érhető el (6-10 fő).
            </div>

            <h2>🔹 Csapattag meghívása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>„Csapat"</strong> menüpontra</li>
                <li>Kattints az <strong>„Új csapattag hozzáadása"</strong> gombra</li>
                <li>Add meg a munkatárs adatait:
                    <ul>
                        <li><strong>Név</strong> — Ahogy az ügyfelek ismerjék</li>
                        <li><strong>E-mail cím</strong> — Ide kap meghívót</li>
                        <li><strong>Szakterület / Pozíció</strong></li>
                        <li><strong>Jogosultság szint</strong></li>
                    </ul>
                </li>
                <li>Kattints a <strong>„Meghívás küldése"</strong> gombra</li>
            </ol>

            <h2>🔹 Mi történik a meghívás után?</h2>
            <ol>
                <li>A munkatárs kap egy meghívó e-mailt</li>
                <li>A linkre kattintva elfogadja a meghívást</li>
                <li>Beállíthatja a saját elérhetőségét és szolgáltatásait</li>
                <li>Megjelenik a foglalási oldalon, mint választható szakember</li>
            </ol>

            <h2>🔹 Csapattag eltávolítása</h2>
            <p>Ha egy munkatárs már nem dolgozik nálad:</p>
            <ol>
                <li>Menj a <strong>Csapat</strong> oldalra</li>
                <li>Kattints a munkatárs melletti <strong>„Eltávolítás"</strong> gombra</li>
                <li>Erősítsd meg a törlést</li>
            </ol>

            <div class="kb-warning">
                <strong>⚠️ Figyelem:</strong> Az eltávolított csapattag meglévő foglalásai megmaradnak, de új foglalásokat már nem kaphat.
            </div>
        `,
    },

    'csapat-naptar-kezelese': {
        title: 'Csapat naptár kezelése',
        category: 'Csapatkezelés',
        categoryId: 'csapat',
        icon: '👥',
        desc: 'Közös naptárnézet és foglalások elosztása munkatársak között.',
        seoTitle: 'Csapat naptár kezelése – FoglaljVelem Tudásbázis',
        seoDesc: 'Kezelj közös naptárat a csapatod számára. Foglalások elosztása munkatársak között, naptárnézet.',
        readTime: '3 perc',
        content: `
            <p>A csapat naptár lehetővé teszi, hogy egy helyen lásd az összes munkatárs foglalásait és elérhetőségét.</p>

            <h2>🔹 Csapat naptár megtekintése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Naptár</strong> oldalra</li>
                <li>Válts <strong>„Csapat nézet"</strong>-re a nézet váltóval</li>
                <li>Minden munkatárs foglalásait egymás mellett látod</li>
            </ol>

            <h2>🔹 Foglalások elosztása</h2>
            <p>Amikor egy ügyfél foglal, a rendszer a következőket veszi figyelembe:</p>
            <ul>
                <li>Melyik munkatárs elérhető az adott időpontban</li>
                <li>Melyik munkatárs nyújtja a választott szolgáltatást</li>
                <li>Az ügyfél kiválaszthatja a preferált szakembert (ha több is elérhető)</li>
            </ul>

            <h2>🔹 Munkatárs-specifikus nézet</h2>
            <p>Szűrhetsz egyetlen munkatárs naptárára is:</p>
            <ol>
                <li>A csapat nézetben kattints a munkatárs nevére</li>
                <li>Csak az ő foglalásai jelennek meg</li>
                <li>Visszaváltáshoz kattints a <strong>„Mindenki"</strong> szűrőre</li>
            </ol>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Rendszeresen ellenőrizd a csapat naptárat, hogy biztosítsd az egyenletes terhelést a munkatársak között!
            </div>
        `,
    },

    'jogosultsagok-beallitasa': {
        title: 'Jogosultságok beállítása',
        category: 'Csapatkezelés',
        categoryId: 'csapat',
        icon: '👥',
        desc: 'Ki mit láthat és szerkeszthet a rendszerben.',
        seoTitle: 'Jogosultságok beállítása – FoglaljVelem Tudásbázis',
        seoDesc: 'Állítsd be a csapattagok jogosultságait: ki mit láthat és szerkeszthet a FoglaljVelem rendszerben.',
        readTime: '3 perc',
        content: `
            <p>A jogosultságok beállításával meghatározod, hogy a csapattagjaid mit láthatnak és szerkeszthetnek a rendszerben.</p>

            <h2>🔹 Jogosultsági szintek</h2>

            <h3>👑 Tulajdonos (Admin)</h3>
            <ul>
                <li>Teljes hozzáférés mindenhez</li>
                <li>Csapattagok hozzáadása/eltávolítása</li>
                <li>Beállítások módosítása</li>
                <li>Előfizetés kezelése</li>
                <li>Statisztikák megtekintése</li>
            </ul>

            <h3>👤 Munkatárs</h3>
            <ul>
                <li>Saját naptár és foglalások kezelése</li>
                <li>Saját elérhetőség beállítása</li>
                <li>Saját foglalások megtekintése</li>
                <li>Manuális foglalás rögzítése (saját naptárba)</li>
            </ul>

            <h2>🔹 Jogosultság módosítása</h2>
            <ol>
                <li>Menj a <strong>Csapat</strong> oldalra</li>
                <li>Kattints a csapattag melletti <strong>„Szerkesztés"</strong> gombra</li>
                <li>Módosítsd a jogosultsági szintet</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A legkevesebb szükséges jogosultságot add — ha egy munkatársnak nem kell látnia a statisztikákat vagy az előfizetési adatokat, ne adj neki admin jogot.
            </div>
        `,
    },

    // ═══════════════════════════════════════════
    // INTEGRÁCIÓK
    // ═══════════════════════════════════════════
    'beagyazas-weboldalba': {
        title: 'Beágyazás weboldalba',
        category: 'Integrációk',
        categoryId: 'integraciok',
        icon: '🔗',
        desc: 'Foglalási rendszer beágyazása iframe-mel vagy widgettel a saját weboldaladba.',
        seoTitle: 'Beágyazás weboldalba – FoglaljVelem Tudásbázis',
        seoDesc: 'Ágyazd be a FoglaljVelem foglalási rendszert a saját weboldaladba iframe-mel vagy foglalási gombbal.',
        readTime: '4 perc',
        content: `
            <p>Ha saját weboldalad van, beágyazhatod a foglalási rendszert közvetlenül az oldaladba — így az ügyfeleidnek nem kell elhagyniuk a weboldaladat a foglaláshoz.</p>

            <h2>🔹 1. módszer: Foglalási gomb (ajánlott)</h2>
            <p>A legegyszerűbb módszer — egy „Foglalj időpontot" gomb, ami a foglalási oldaladra mutat:</p>
            <div class="kb-code">
                <code>&lt;a href="https://foglaljvelem.hu/foglalas/a-te-slug-od" target="_blank" style="display:inline-block; background:#2563eb; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600;"&gt;📅 Foglalj időpontot&lt;/a&gt;</code>
            </div>
            <p>Illeszd be a kódot a weboldalad kívánt helyére (pl. fejléc, szolgáltatások szekció).</p>

            <h2>🔹 2. módszer: Iframe beágyazás</h2>
            <p>Ha a teljes foglalási felületet be szeretnéd ágyazni az oldaladba:</p>
            <div class="kb-code">
                <code>&lt;iframe src="https://foglaljvelem.hu/foglalas/a-te-slug-od" width="100%" height="800" frameborder="0" style="border:none; border-radius:12px;"&gt;&lt;/iframe&gt;</code>
            </div>

            <h2>🔹 Beágyazás WordPress-be</h2>
            <ol>
                <li>Nyisd meg az oldalt/bejegyzést szerkesztésre</li>
                <li>Adj hozzá egy <strong>„Egyéni HTML"</strong> blokkot</li>
                <li>Illeszd be az iframe vagy gomb kódot</li>
                <li>Mentsd el és nézd meg az előnézetet</li>
            </ol>

            <h2>🔹 Beágyazás egyéb rendszerekbe</h2>
            <ul>
                <li><strong>Wix:</strong> HTML Embed elem használata</li>
                <li><strong>Squarespace:</strong> Code Block elem használata</li>
                <li><strong>Shopify:</strong> Custom HTML szekció</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A foglalási gomb módszert ajánljuk legtöbb esetben — egyszerűbb, gyorsabb és mobilbarát. Az iframe beágyazás inkább nagyobb képernyőkön működik jól.
            </div>
        `,
    },

    'google-naptar-szinkron': {
        title: 'Google Naptár szinkronizáció',
        category: 'Integrációk',
        categoryId: 'integraciok',
        icon: '🔗',
        desc: 'Foglalásaid automatikus megjelenítése a Google Naptárban.',
        seoTitle: 'Google Naptár szinkronizáció – FoglaljVelem Tudásbázis',
        seoDesc: 'Szinkronizáld a FoglaljVelem foglalásaidat a Google Naptárral. Automatikus megjelenítés, kétirányú szinkron.',
        readTime: '3 perc',
        content: `
            <p>A Google Naptár szinkronizációval a FoglaljVelem foglalásaid automatikusan megjelennek a Google Naptáradban is.</p>

            <h2>🔹 Szinkronizáció bekapcsolása</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások → Integrációk</strong> részhez</li>
                <li>Kattints a <strong>„Google Naptár összekapcsolása"</strong> gombra</li>
                <li>Jelentkezz be a Google fiókodba</li>
                <li>Engedélyezd a hozzáférést a naptárhoz</li>
                <li>Válaszd ki, melyik naptárat szeretnéd használni</li>
            </ol>

            <h2>🔹 Mit szinkronizál?</h2>
            <ul>
                <li><strong>Új foglalások</strong> — Automatikusan megjelennek a Google Naptárban</li>
                <li><strong>Lemondások</strong> — Eltávolításra kerülnek a naptárból</li>
                <li><strong>Foglalás részletek</strong> — Ügyfél neve, szolgáltatás, időpont</li>
            </ul>

            <h2>🔹 Kétirányú szinkron</h2>
            <p>A rendszer figyeli a Google Naptárad is:</p>
            <ul>
                <li>Ha a Google Naptáradban van egy esemény, a rendszer blokkolja azt az időpontot</li>
                <li>Így nem kaphatnak foglalást olyan időpontra, ami már foglalt a személyes naptáradban</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> A kétirányú szinkron különösen hasznos, ha más forrásból is kapsz időpontokat (pl. telefonhívás), és nem akarod, hogy ütközzenek a foglalásokkal.
            </div>

            <div class="kb-info">
                <strong>ℹ️ Hamarosan:</strong> Az Apple Calendar (iCal) és Outlook naptár szinkronizáció is hamarosan elérhető lesz!
            </div>
        `,
    },

    'meta-pixel-es-konverziomeres': {
        title: 'Meta Pixel és konverziómérés',
        category: 'Integrációk',
        categoryId: 'integraciok',
        icon: '🔗',
        desc: 'Facebook/Instagram hirdetések pontos mérése a Conversions API-val.',
        seoTitle: 'Meta Pixel és konverziómérés – FoglaljVelem Tudásbázis',
        seoDesc: 'Mérd pontosan a Facebook és Instagram hirdetéseid konverzióit a Conversions API és Meta Pixel kombinációval.',
        readTime: '5 perc',
        content: `
            <p>A FoglaljVelem beépített Meta Pixel és Conversions API támogatással rendelkezik, ami a legpontosabb mérést biztosítja a hirdetéseidnek.</p>

            <h2>🔹 Meta Pixel vs. Conversions API</h2>
            <table class="kb-table">
                <thead>
                    <tr><th>Tulajdonság</th><th>Meta Pixel (böngésző)</th><th>Conversions API (szerver)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Működési mód</td><td>JavaScript a böngészőben</td><td>Szerver oldali HTTP kérés</td></tr>
                    <tr><td>Reklámblokkoló</td><td>Blokkolhatja ❌</td><td>Nem blokkolható ✅</td></tr>
                    <tr><td>Pontosság</td><td>~60-70%</td><td>~95%+ ✅</td></tr>
                </tbody>
            </table>
            <p>A FoglaljVelem <strong>mindkettőt használja egyszerre</strong> a deduplikálással, így a lehető legpontosabb mérést kapod!</p>

            <h2>🔹 Beállítás</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások</strong> oldalra</li>
                <li>Add meg a <strong>Meta Pixel ID</strong>-t</li>
                <li>Kattints a <strong>„Mentés"</strong> gombra</li>
            </ol>

            <h2>🔹 Mért események</h2>
            <ul>
                <li><strong>PageView</strong> — Foglalási oldal megtekintése</li>
                <li><strong>Schedule</strong> — Sikeres időpontfoglalás</li>
                <li><strong>CompleteRegistration</strong> — Új regisztráció a platformon</li>
            </ul>

            <h2>🔹 Hirdetés optimalizálás</h2>
            <p>A konverziós adatokkal a Meta algoritmus sokkal jobban optimalizálja a hirdetéseidet:</p>
            <ul>
                <li>Célozd az „Schedule" konverziós eseményt a hirdetéseidben</li>
                <li>A Meta megkeresi azokat, akik hasonlóak a már foglalt ügyfeleidhez</li>
                <li>Alacsonyabb költséget érhetsz el foglaláskonként</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Pro tipp:</strong> Ha Facebook/Instagram hirdetéseket futtatsz, a Meta Pixel beállítása a legjobb befektetés, amit tehetsz. Pontos adatok nélkül a hirdetéseid vakon futnak!
            </div>
        `,
    },

    // ═══════════════════════════════════════════
    // FIZETÉS ÉS CSOMAGOK
    // ═══════════════════════════════════════════
    'csomagok-es-arak': {
        title: 'Csomagok és árak',
        category: 'Fizetés és csomagok',
        categoryId: 'fizetes',
        icon: '💳',
        desc: 'Az Ingyenes, Alap és Profi csomagok összehasonlítása.',
        seoTitle: 'Csomagok és árak – FoglaljVelem Tudásbázis',
        seoDesc: 'Hasonlítsd össze a FoglaljVelem csomagjait: Ingyenes, Alap és Profi. Árak, funkciók, próbaidőszak.',
        readTime: '3 perc',
        content: `
            <p>A FoglaljVelem három csomagot kínál, hogy minden vállalkozás megtalálja a számára megfelelőt.</p>

            <h2>🔹 Csomagok összehasonlítása</h2>
            <table class="kb-table">
                <thead>
                    <tr><th>Funkció</th><th>🆓 Ingyenes</th><th>⭐ Alap</th><th>🏢 Profi</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Ár</strong></td><td>0 Ft/hó</td><td>4 997 Ft/hó</td><td>19 997 Ft/hó</td></tr>
                    <tr><td>Foglalási oldal</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Naptárkezelés</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Manuális foglalás</td><td>✅</td><td>✅</td><td>✅</td></tr>
                    <tr><td>E-mail értesítések</td><td>❌</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Emlékeztetők</td><td>❌</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Statisztikák</td><td>Alap</td><td>✅ Részletes</td><td>✅ Részletes</td></tr>
                    <tr><td>Meta Pixel</td><td>❌</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Csapatkezelés</td><td>❌</td><td>❌</td><td>✅ (6-10 fő)</td></tr>
                    <tr><td>Prioritásos támogatás</td><td>❌</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Próbaidőszak</td><td>—</td><td>14 nap</td><td>14 nap</td></tr>
                </tbody>
            </table>

            <h2>🔹 Melyik csomagot válasszam?</h2>

            <h3>🆓 Ingyenes — Ha most kezded</h3>
            <p>Tökéletes a rendszer kipróbálására. Foglalási oldal és naptár, e-mail értesítők nélkül.</p>

            <h3>⭐ Alap — Egyéni szolgáltatóknak (ajánlott)</h3>
            <p>Ha egyedül dolgozol és szeretnéd a teljes funkciókészletet: e-mail értesítők, emlékeztetők, statisztikák, Meta Pixel.</p>

            <h3>🏢 Profi — Csapatoknak</h3>
            <p>Ha több munkatárssal dolgozol és közös naptárat, csapatkezelést szeretnél.</p>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Kezdd az Ingyenes csomaggal, majd ha látod, hogy bevált, válts az Alap csomagra — az első 14 nap ingyenes!
            </div>
        `,
    },

    'elofizetes-es-csomagvaltas': {
        title: 'Előfizetés és csomagváltás',
        category: 'Fizetés és csomagok',
        categoryId: 'fizetes',
        icon: '💳',
        desc: 'Hogyan frissíts magasabb csomagra vagy mondj le.',
        seoTitle: 'Előfizetés és csomagváltás – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan válts csomagot, frissíts magasabb csomagra vagy mondj le az előfizetésről a FoglaljVelem rendszerben.',
        readTime: '3 perc',
        content: `
            <p>Az előfizetésed bármikor módosíthatod — frissíthetsz magasabb csomagra, visszaválthatsz vagy lemondhatod.</p>

            <h2>🔹 Csomag frissítése (upgrade)</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások → Előfizetés</strong> részhez</li>
                <li>Kattints a <strong>„Csomag módosítása"</strong> gombra</li>
                <li>Válaszd ki az új csomagot</li>
                <li>Erősítsd meg a váltást</li>
            </ol>
            <p>A magasabb csomag funkciói <strong>azonnal elérhetővé</strong> válnak!</p>

            <h2>🔹 Csomag visszaváltása (downgrade)</h2>
            <p>Ha alacsonyabb csomagra szeretnél váltani:</p>
            <ol>
                <li>Menj a <strong>Beállítások → Előfizetés</strong> részhez</li>
                <li>Válaszd ki az alacsonyabb csomagot</li>
                <li>A váltás a <strong>számlázási időszak végén</strong> lép érvénybe</li>
            </ol>

            <h2>🔹 Előfizetés lemondása</h2>
            <ol>
                <li>Menj a <strong>Beállítások → Előfizetés</strong> részhez</li>
                <li>Kattints a <strong>„Lemondás"</strong> gombra</li>
                <li>Erősítsd meg a lemondást</li>
            </ol>

            <div class="kb-info">
                <strong>ℹ️ Fontos:</strong> Lemondás után a fizetős funkciók a <strong>számlázási időszak végéig</strong> használhatók maradnak. Ezután az Ingyenes csomagra kerülsz.
            </div>

            <h2>🔹 Próbaidőszak</h2>
            <ul>
                <li>Az Alap és Profi csomag <strong>14 napos ingyenes próbaidőszakkal</strong> kezdődik</li>
                <li>Az első 14 napban <strong>nem vonódik le semmi</strong></li>
                <li>Ha a próbaidőszak alatt lemondod, semmit nem fizetsz</li>
                <li>Ha nem mondod le, a próbaidőszak után indul az előfizetés</li>
            </ul>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Használd ki a teljes 14 napos próbaidőszakot — próbáld ki az összes funkciót, mielőtt döntesz!
            </div>
        `,
    },

    'szamlazas': {
        title: 'Számlázás',
        category: 'Fizetés és csomagok',
        categoryId: 'fizetes',
        icon: '💳',
        desc: 'Számlák kezelése és a számlázási beállítások.',
        seoTitle: 'Számlázás – FoglaljVelem Tudásbázis',
        seoDesc: 'Hogyan kezeld a számláidat és számlázási beállításaidat a FoglaljVelem rendszerben.',
        readTime: '3 perc',
        content: `
            <p>A FoglaljVelem automatikusan kezeli a számlázást az előfizetésedhez kapcsolódóan.</p>

            <h2>🔹 Számlák megtekintése</h2>
            <ol>
                <li>Lépj be a <strong>Vezérlőpultra</strong></li>
                <li>Menj a <strong>Beállítások → Előfizetés</strong> részhez</li>
                <li>A <strong>„Számlák"</strong> szekcióban látod az összes korábbi számládat</li>
                <li>Kattints a <strong>„Letöltés"</strong> gombra a számla PDF letöltéséhez</li>
            </ol>

            <h2>🔹 Számlázási adatok</h2>
            <p>A számlához szükséges adatok:</p>
            <ul>
                <li><strong>Vállalkozás neve</strong></li>
                <li><strong>Cím</strong></li>
                <li><strong>Adószám</strong> (ha vállalkozás)</li>
            </ul>
            <p>Ezeket a Beállítások oldalon tudod megadni vagy módosítani.</p>

            <h2>🔹 Fizetési módok</h2>
            <ul>
                <li><strong>Bankkártya</strong> — Automatikus havi levonás (Visa, Mastercard)</li>
            </ul>

            <h2>🔹 Számlázó program összekapcsolás</h2>
            <p>Ha saját számlázó programot használsz (pl. Számlázz.hu, Billingo), hamarosan lehetőség lesz automatikus integrációra is.</p>

            <div class="kb-info">
                <strong>ℹ️ Hamarosan:</strong> A Számlázz.hu és Billingo integráció fejlesztés alatt áll. Ha igényled, írj nekünk az <a href="mailto:info@foglaljvelem.hu">info@foglaljvelem.hu</a> címre!
            </div>

            <h2>🔹 Fizetési probléma</h2>
            <p>Ha sikertelen a kártyás fizetés:</p>
            <ol>
                <li>Ellenőrizd, hogy van-e elegendő egyenleg a kártyádon</li>
                <li>Próbálj meg egy másik kártyát megadni</li>
                <li>Ha továbbra is problémás, írj az <strong>info@foglaljvelem.hu</strong> címre</li>
            </ol>

            <div class="kb-tip">
                <strong>💡 Tipp:</strong> Ha a kártya lejárt vagy megváltozott, frissítsd a fizetési adataidat a Beállítások oldalon, hogy ne szakadjon meg az előfizetésed!
            </div>
        `,
    },
};

// Helper to get all articles as array
export function getAllArticles() {
    return Object.entries(articles).map(([slug, article]) => ({
        slug,
        ...article,
    }));
}

// Helper to get article by slug
export function getArticleBySlug(slug) {
    const article = articles[slug];
    if (!article) return null;
    return { slug, ...article };
}

// Helper to get all slugs (for generateStaticParams)
export function getAllSlugs() {
    return Object.keys(articles);
}

// Helper to get related articles (same category, excluding current)
export function getRelatedArticles(slug, categoryId) {
    return Object.entries(articles)
        .filter(([s, a]) => a.categoryId === categoryId && s !== slug)
        .map(([s, a]) => ({ slug: s, title: a.title, desc: a.desc }));
}

// Helper to get next/prev articles
export function getAdjacentArticles(slug) {
    const slugs = Object.keys(articles);
    const idx = slugs.indexOf(slug);
    return {
        prev: idx > 0 ? { slug: slugs[idx - 1], title: articles[slugs[idx - 1]].title } : null,
        next: idx < slugs.length - 1 ? { slug: slugs[idx + 1], title: articles[slugs[idx + 1]].title } : null,
    };
}

export default articles;
