// Service catalog organized by business type
// Used for suggesting services during onboarding and in the services page

export const SERVICE_CATALOG = {
    salon: {
        label: '💇 Fodrász szalon',
        categories: {
            'Hajvágás': [
                { name: 'Női hajvágás + szárítás', duration_minutes: 45, price: 5500 },
                { name: 'Férfi hajvágás', duration_minutes: 30, price: 3500 },
                { name: 'Gyerek hajvágás', duration_minutes: 25, price: 2500 },
                { name: 'Frufru igazítás', duration_minutes: 15, price: 1500 },
                { name: 'Hajvágás mosás nélkül', duration_minutes: 30, price: 4000 },
            ],
            'Színezés': [
                { name: 'Festés (rövid haj)', duration_minutes: 60, price: 8000 },
                { name: 'Festés (hosszú haj)', duration_minutes: 90, price: 12000 },
                { name: 'Melírozás', duration_minutes: 90, price: 15000 },
                { name: 'Balayage', duration_minutes: 120, price: 20000 },
                { name: 'Szőkítés + tonizálás', duration_minutes: 120, price: 18000 },
                { name: 'Ombre', duration_minutes: 150, price: 25000 },
                { name: 'Tőfestés', duration_minutes: 45, price: 6000 },
            ],
            'Kezelések': [
                { name: 'Hajpakolás', duration_minutes: 30, price: 3000 },
                { name: 'Olaplex kezelés', duration_minutes: 45, price: 8000 },
                { name: 'Keratinos hajegyenesítés', duration_minutes: 120, price: 25000 },
                { name: 'Fejbőr kezelés', duration_minutes: 30, price: 4000 },
            ],
            'Styling': [
                { name: 'Alkalmi frizura', duration_minutes: 60, price: 10000 },
                { name: 'Menyasszonyi frizura', duration_minutes: 90, price: 25000 },
                { name: 'Hajvasalás / göndörítés', duration_minutes: 30, price: 4000 },
                { name: 'Hajfonás', duration_minutes: 45, price: 5000 },
            ],
            'Szakáll': [
                { name: 'Szakáll igazítás', duration_minutes: 20, price: 2000 },
                { name: 'Borotválás', duration_minutes: 30, price: 3000 },
                { name: 'Hajvágás + szakáll', duration_minutes: 50, price: 5500 },
            ],
        }
    },
    beauty: {
        label: '💅 Kozmetika',
        categories: {
            'Arc': [
                { name: 'Arctisztítás', duration_minutes: 60, price: 8000 },
                { name: 'Hidratáló arckezelés', duration_minutes: 45, price: 7000 },
                { name: 'Anti-aging kezelés', duration_minutes: 60, price: 12000 },
                { name: 'Mikrodermabráció', duration_minutes: 45, price: 10000 },
                { name: 'Kémiai hámlasztás', duration_minutes: 30, price: 8000 },
                { name: 'LED fényterápia', duration_minutes: 30, price: 6000 },
                { name: 'Mezoterápia', duration_minutes: 45, price: 15000 },
            ],
            'Köröm': [
                { name: 'Manikűr', duration_minutes: 45, price: 4000 },
                { name: 'Gél lakk', duration_minutes: 60, price: 6000 },
                { name: 'Műköröm építés', duration_minutes: 90, price: 10000 },
                { name: 'Pedikűr', duration_minutes: 60, price: 5000 },
                { name: 'Gél lakk pedikűr', duration_minutes: 75, price: 7000 },
                { name: 'Köröm díszítés', duration_minutes: 30, price: 2000 },
                { name: 'Köröm eltávolítás', duration_minutes: 30, price: 3000 },
            ],
            'Szőrtelenítés': [
                { name: 'Gyantázás (láb)', duration_minutes: 45, price: 5000 },
                { name: 'Gyantázás (hónalj)', duration_minutes: 20, price: 2500 },
                { name: 'Gyantázás (bikini)', duration_minutes: 30, price: 4000 },
                { name: 'Gyantázás (arc)', duration_minutes: 20, price: 2000 },
                { name: 'Lézer szőrtelenítés', duration_minutes: 30, price: 12000 },
                { name: 'IPL kezelés', duration_minutes: 45, price: 15000 },
            ],
            'Smink': [
                { name: 'Alkalmi smink', duration_minutes: 45, price: 8000 },
                { name: 'Menyasszonyi smink', duration_minutes: 60, price: 20000 },
                { name: 'Smink tanácsadás', duration_minutes: 60, price: 10000 },
                { name: 'Szempilla lifting', duration_minutes: 60, price: 7000 },
                { name: 'Szempilla hosszabbítás', duration_minutes: 90, price: 12000 },
                { name: 'Szemöldök formázás', duration_minutes: 20, price: 2500 },
            ],
            'Test': [
                { name: 'Testmasszázs (60 perc)', duration_minutes: 60, price: 9000 },
                { name: 'Testpakolás', duration_minutes: 45, price: 6000 },
                { name: 'Cellulit kezelés', duration_minutes: 45, price: 8000 },
                { name: 'Testradír', duration_minutes: 30, price: 4000 },
            ],
        }
    },
    fitness: {
        label: '💪 Edző / Fitness',
        categories: {
            'Személyi edzés': [
                { name: 'Személyi edzés (60 perc)', duration_minutes: 60, price: 8000 },
                { name: 'Személyi edzés (90 perc)', duration_minutes: 90, price: 11000 },
                { name: 'Páros edzés', duration_minutes: 60, price: 12000 },
                { name: 'Kis csoportos edzés (3-5 fő)', duration_minutes: 60, price: 5000 },
                { name: 'Online edzés', duration_minutes: 60, price: 5000 },
            ],
            'Speciális edzés': [
                { name: 'Funkcionális edzés', duration_minutes: 60, price: 8000 },
                { name: 'HIIT edzés', duration_minutes: 45, price: 6000 },
                { name: 'Erőnléti edzés', duration_minutes: 60, price: 8000 },
                { name: 'Crossfit edzés', duration_minutes: 60, price: 7000 },
                { name: 'Nyújtás / stretching', duration_minutes: 45, price: 5000 },
                { name: 'Pilates', duration_minutes: 60, price: 6000 },
                { name: 'Jóga óra', duration_minutes: 60, price: 5000 },
                { name: 'TRX edzés', duration_minutes: 45, price: 7000 },
            ],
            'Felmérés': [
                { name: 'Állapotfelmérés', duration_minutes: 60, price: 10000 },
                { name: 'Testösszetétel mérés', duration_minutes: 30, price: 5000 },
                { name: 'Edzésterv készítés', duration_minutes: 45, price: 12000 },
                { name: 'Étrend konzultáció', duration_minutes: 60, price: 10000 },
            ],
            'Csoportos': [
                { name: 'Spinning', duration_minutes: 45, price: 3000 },
                { name: 'Zumba', duration_minutes: 60, price: 3000 },
                { name: 'Body balance', duration_minutes: 60, price: 3000 },
                { name: 'Kickbox aerobik', duration_minutes: 60, price: 3500 },
            ],
        }
    },
    consulting: {
        label: '💼 Tanácsadó',
        categories: {
            'Üzleti tanácsadás': [
                { name: 'Üzleti konzultáció (60 perc)', duration_minutes: 60, price: 15000 },
                { name: 'Stratégiai workshop', duration_minutes: 120, price: 30000 },
                { name: 'Üzleti terv készítés', duration_minutes: 90, price: 25000 },
                { name: 'Marketing konzultáció', duration_minutes: 60, price: 15000 },
                { name: 'Pénzügyi tanácsadás', duration_minutes: 60, price: 20000 },
            ],
            'Coaching': [
                { name: 'Life coaching', duration_minutes: 60, price: 12000 },
                { name: 'Karriertanácsadás', duration_minutes: 60, price: 15000 },
                { name: 'Executive coaching', duration_minutes: 90, price: 25000 },
                { name: 'Csapat coaching', duration_minutes: 120, price: 40000 },
            ],
            'Jogi tanácsadás': [
                { name: 'Jogi konzultáció', duration_minutes: 60, price: 20000 },
                { name: 'Szerződés átvizsgálás', duration_minutes: 45, price: 15000 },
                { name: 'Cégalapítás tanácsadás', duration_minutes: 60, price: 25000 },
            ],
            'IT / Digitális': [
                { name: 'IT konzultáció', duration_minutes: 60, price: 20000 },
                { name: 'Weboldal audit', duration_minutes: 90, price: 30000 },
                { name: 'SEO tanácsadás', duration_minutes: 60, price: 15000 },
                { name: 'Social media stratégia', duration_minutes: 60, price: 15000 },
            ],
        }
    },
    health: {
        label: '🏥 Egészségügy',
        categories: {
            'Masszázs': [
                { name: 'Svéd masszázs (60 perc)', duration_minutes: 60, price: 9000 },
                { name: 'Svéd masszázs (90 perc)', duration_minutes: 90, price: 12000 },
                { name: 'Sportmasszázs', duration_minutes: 60, price: 10000 },
                { name: 'Frissítő hátmasszázs', duration_minutes: 30, price: 5000 },
                { name: 'Aromaterápiás masszázs', duration_minutes: 60, price: 10000 },
                { name: 'Talpmasszázs', duration_minutes: 30, price: 4000 },
                { name: 'Hot stone masszázs', duration_minutes: 75, price: 12000 },
                { name: 'Nyirokmasszázs', duration_minutes: 60, price: 9000 },
            ],
            'Fizioterápia': [
                { name: 'Állapotfelmérés', duration_minutes: 45, price: 12000 },
                { name: 'Fizioterápiás kezelés', duration_minutes: 45, price: 10000 },
                { name: 'Manuálterápia', duration_minutes: 45, price: 12000 },
                { name: 'Rehabilitáció', duration_minutes: 60, price: 12000 },
            ],
            'Pszichológia': [
                { name: 'Pszichológiai konzultáció', duration_minutes: 50, price: 15000 },
                { name: 'Párterápia', duration_minutes: 90, price: 20000 },
                { name: 'Családterápia', duration_minutes: 90, price: 20000 },
                { name: 'Gyermekpszichológia', duration_minutes: 50, price: 15000 },
            ],
            'Orvosi': [
                { name: 'Konzultáció', duration_minutes: 30, price: 15000 },
                { name: 'Kontroll vizsgálat', duration_minutes: 20, price: 10000 },
                { name: 'Ultrahang vizsgálat', duration_minutes: 30, price: 12000 },
                { name: 'Bőrgyógyászati vizsgálat', duration_minutes: 30, price: 15000 },
            ],
            'Alternatív': [
                { name: 'Akupunktúra', duration_minutes: 45, price: 10000 },
                { name: 'Homeopátia', duration_minutes: 60, price: 12000 },
                { name: 'Reflexológia', duration_minutes: 45, price: 8000 },
                { name: 'Natúrgyógyászat', duration_minutes: 60, price: 10000 },
            ],
        }
    },
    other: {
        label: '📋 Egyéb',
        categories: {
            'Általános': [
                { name: 'Konzultáció (30 perc)', duration_minutes: 30, price: 5000 },
                { name: 'Konzultáció (60 perc)', duration_minutes: 60, price: 10000 },
                { name: 'Workshop', duration_minutes: 120, price: 15000 },
                { name: 'Oktatás / kurzus', duration_minutes: 90, price: 12000 },
                { name: 'Próbaalkalom', duration_minutes: 30, price: 0 },
            ],
            'Oktatás': [
                { name: 'Magánóra', duration_minutes: 60, price: 6000 },
                { name: 'Nyelvóra', duration_minutes: 60, price: 5000 },
                { name: 'Korrepetálás', duration_minutes: 90, price: 7000 },
                { name: 'Vizsgafelkészítő', duration_minutes: 60, price: 8000 },
            ],
            'Kreatív': [
                { name: 'Fotózás', duration_minutes: 60, price: 15000 },
                { name: 'Videó konzultáció', duration_minutes: 45, price: 10000 },
                { name: 'Design konzultáció', duration_minutes: 60, price: 12000 },
            ],
        }
    }
};

// Flatten all services for search
export function getAllTemplates() {
    const all = [];
    for (const [type, data] of Object.entries(SERVICE_CATALOG)) {
        for (const [category, services] of Object.entries(data.categories)) {
            for (const svc of services) {
                all.push({ ...svc, category, businessType: type, businessLabel: data.label });
            }
        }
    }
    return all;
}

// Get ALL templates with user's business type FIRST, then others
export function getAllTemplatesPrioritized(userBusinessType) {
    const myType = userBusinessType || 'other';
    const types = Object.keys(SERVICE_CATALOG);
    // Put user's type first, then the rest in original order
    const sorted = [myType, ...types.filter(t => t !== myType)];
    const sections = [];
    for (const type of sorted) {
        const data = SERVICE_CATALOG[type];
        if (!data) continue;
        const svcs = [];
        for (const [category, services] of Object.entries(data.categories)) {
            for (const svc of services) {
                svcs.push({ ...svc, category, businessType: type, businessLabel: data.label });
            }
        }
        sections.push({ type, label: data.label, isUserType: type === myType, services: svcs, categories: Object.keys(data.categories) });
    }
    return sections;
}

// Search across ALL templates, prioritized by user's business type
export function searchTemplates(query, userBusinessType) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const all = getAllTemplates();
    const results = all.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.businessLabel.toLowerCase().includes(q)
    );
    // Sort: user's type first
    if (userBusinessType) {
        results.sort((a, b) => {
            if (a.businessType === userBusinessType && b.businessType !== userBusinessType) return -1;
            if (b.businessType === userBusinessType && a.businessType !== userBusinessType) return 1;
            return 0;
        });
    }
    return results;
}

// Get templates for a specific business type
export function getTemplatesForType(type) {
    return SERVICE_CATALOG[type] || SERVICE_CATALOG.other;
}
