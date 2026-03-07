import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import s from './page.module.css';

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroBg}>
          <div className={s.blob1}></div>
          <div className={s.blob2}></div>
          <div className={s.blob3}></div>
        </div>
        <div className={s.heroContent}>
          <div className={s.heroText}>
            <span className={`${s.heroBadge} animate-fade-in`}>🚀 Már több mint 500+ vállalkozás használja</span>
            <h1 className={`${s.heroTitle} animate-fade-in-up`}>
              Online időpontfoglalás<br /><span className={s.highlight}>egyszerűen</span>
            </h1>
            <p className={`${s.heroDesc} animate-fade-in-up delay-1`}>
              Engedd, hogy ügyfeleid bármikor foglalhassanak időpontot – automatikusan, 0-24-ben.
              Tökéletes szalonok, tanácsadók és edzők számára.
            </p>
            <div className={`${s.heroButtons} animate-fade-in-up delay-2`}>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Ingyenes regisztráció →
              </Link>
              <a href="#hogyan" className="btn btn-secondary btn-lg">
                Hogyan működik?
              </a>
            </div>
            <div className={`${s.heroStats} animate-fade-in-up delay-3`}>
              <div className={s.stat}>
                <span className={s.statNum}>500+</span>
                <span className={s.statLabel}>Aktív vállalkozás</span>
              </div>
              <div className={s.stat}>
                <span className={s.statNum}>15k+</span>
                <span className={s.statLabel}>Foglalás havonta</span>
              </div>
              <div className={s.stat}>
                <span className={s.statNum}>4.9★</span>
                <span className={s.statLabel}>Értékelés</span>
              </div>
            </div>
          </div>
          <div className={`${s.heroVisual} animate-fade-in-up delay-2`}>
            <div className={s.mockup}>
              <div className={s.mockupHeader}>
                <div className={s.mockupAvatar}>💇</div>
                <div className={s.mockupInfo}>
                  <h4>Szépség Szalon Kati</h4>
                  <p>Válassz időpontot</p>
                </div>
              </div>
              <div className={s.mockupSlots}>
                <div className={s.slot}><span className={s.slotTime}>09:00</span><button className={s.slotBook}>Foglalás</button></div>
                <div className={s.slot}><span className={s.slotTime}>10:00</span><button className={s.slotBook}>Foglalás</button></div>
                <div className={s.slot}><span className={s.slotTime}>11:00</span><span className={s.slotBooked}>Foglalt</span></div>
                <div className={s.slot}><span className={s.slotTime}>12:00</span><button className={s.slotBook}>Foglalás</button></div>
                <div className={s.slot}><span className={s.slotTime}>14:00</span><button className={s.slotBook}>Foglalás</button></div>
              </div>
            </div>
            <div className={`${s.floatingCard} ${s.floatingCard1}`}>
              <div className={`${s.floatingCardIcon} ${s.green}`}>✅</div>
              <div className={s.floatingCardText}>
                <strong>Foglalás megerősítve!</strong>
                <span>10:00 - Hajvágás</span>
              </div>
            </div>
            <div className={`${s.floatingCard} ${s.floatingCard2}`}>
              <div className={`${s.floatingCardIcon} ${s.yellow}`}>⭐</div>
              <div className={s.floatingCardText}>
                <strong>Új értékelés</strong>
                <span>5.0 ★ - Szuper!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={s.features} id="funkcio">
        <div className={s.sectionHeader}>
          <span className={s.sectionBadge}>✨ Funkciók</span>
          <h2 className={s.sectionTitle}>Minden, amire szükséged van</h2>
          <p className={s.sectionDesc}>Professzionális időpontfoglaló rendszer, amit percek alatt beállíthatsz.</p>
        </div>
        <div className={s.featuresGrid}>
          {[
            { icon: '📅', title: 'Online foglalás', desc: 'Ügyfeleid a publikus oldaladról bármikor foglalhatnak – akár éjjel is.', color: 'blue' },
            { icon: '🔔', title: 'E-mail értesítések', desc: 'Automatikus visszaigazolás és emlékeztető e-mailek küldése.', color: 'yellow' },
            { icon: '📊', title: 'Statisztikák', desc: 'Részletes kimutatások a foglalásaidról, bevételedről.', color: 'green' },
            { icon: '🔗', title: 'Beágyazás', desc: 'Egyszerűen beágyazható a meglévő weboldaladba iframe-mel vagy widget-tel.', color: 'purple' },
            { icon: '⭐', title: 'Ügyfél értékelések', desc: 'Gyűjts véleményeket és építsd a reputációd.', color: 'orange' },
            { icon: '👥', title: 'Csapatkezelés', desc: 'Több munkatárs, közös naptár – ideális szalonok számára.', color: 'pink' },
          ].map((f, i) => (
            <div key={i} className={s.featureCard}>
              <div className={`${s.featureIcon} ${s[f.color]}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s.howItWorks} id="hogyan">
        <div className={s.sectionHeader}>
          <span className={s.sectionBadge}>🎯 Hogyan működik?</span>
          <h2 className={s.sectionTitle}>3 egyszerű lépés</h2>
          <p className={s.sectionDesc}>Percek alatt elindíthatod az online foglalási rendszered.</p>
        </div>
        <div className={s.stepsGrid}>
          {[
            { num: '1', icon: '📝', title: 'Regisztrálj', desc: 'Hozd létre a fiókodat és add meg a szolgáltatásaidat és az elérhetőséged.', cls: 's1' },
            { num: '2', icon: '🔗', title: 'Oszd meg a linked', desc: 'Küldd el a foglalási oldalad linkjét vagy ágyazd be a weboldaladba.', cls: 's2' },
            { num: '3', icon: '🎉', title: 'Fogadd a foglalásokat', desc: 'Az ügyfelek online foglalnak, te pedig értesítést kapsz és kezeled őket.', cls: 's3' },
          ].map((step, i) => (
            <div key={i} className={s.step}>
              <div className={`${s.stepNum} ${s[step.cls]}`}>{step.num}</div>
              <div className={s.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className={s.pricing} id="arak">
        <div className={s.sectionHeader}>
          <span className={s.sectionBadge}>💰 Árazás</span>
          <h2 className={s.sectionTitle}>Egyszerű, átlátható árak</h2>
          <p className={s.sectionDesc}>Kezdd ingyen, frissíts amikor szükséged van rá. Nincs rejtett költség.</p>
        </div>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <h3>🆓 Ingyenes</h3>
            <div className={s.pricingPrice}><span className={s.priceAmount}>0 Ft</span><span className={s.pricePeriod}>/hó</span></div>
            <p className={s.pricingDesc}>Ideális az induláshoz</p>
            <ul className={s.pricingFeatures}>
              <li><span className={s.checkIcon}>✓</span> Online foglalási oldal</li>
              <li><span className={s.checkIcon}>✓</span> Szolgáltatások kezelése</li>
              <li><span className={s.checkIcon}>✓</span> Naptár nézet</li>
              <li><span className={s.checkIcon}>✓</span> Beágyazható widget</li>
              <li><span className={s.crossIcon}>✗</span> E-mail értesítések</li>
              <li><span className={s.crossIcon}>✗</span> QR kód</li>
              <li><span className={s.crossIcon}>✗</span> Csapatkezelés</li>
            </ul>
            <Link href="/auth/register" className={`btn btn-secondary btn-lg ${s.pricingBtn}`}>Ingyenes regisztráció</Link>
          </div>

          <div className={`${s.pricingCard} ${s.pricingPopular}`}>
            <span className={s.popularBadge}>⭐ Legnépszerűbb</span>
            <h3>⭐ Alap</h3>
            <div className={s.pricingPrice}><span className={s.priceAmount}>4 997 Ft</span><span className={s.pricePeriod}>/hó</span></div>
            <p className={s.pricingDesc}>Minden funkció, 1 felhasználónak</p>
            <ul className={s.pricingFeatures}>
              <li><span className={s.checkIcon}>✓</span> Minden ingyenes funkció</li>
              <li><span className={s.checkIcon}>✓</span> E-mail értesítések</li>
              <li><span className={s.checkIcon}>✓</span> QR kód generálás</li>
              <li><span className={s.checkIcon}>✓</span> Ügyfél értékelések</li>
              <li><span className={s.checkIcon}>✓</span> Google Naptár szinkron</li>
              <li><span className={s.checkIcon}>✓</span> Várólistás rendszer</li>
              <li><span className={s.checkIcon}>✓</span> Egyedi URL</li>
              <li><span className={s.checkIcon}>✓</span> Részletes statisztikák</li>
              <li><span className={s.crossIcon}>✗</span> Csapatkezelés (1 fő)</li>
            </ul>
            <Link href="/auth/register" className={`btn btn-primary btn-lg ${s.pricingBtn}`}>Próbáld ki ingyen →</Link>
          </div>

          <div className={s.pricingCard}>
            <h3>🏢 Profi</h3>
            <div className={s.pricingPrice}><span className={s.priceAmount}>19 997 Ft</span><span className={s.pricePeriod}>/hó</span></div>
            <p className={s.pricingDesc}>Csapatok számára, 6-10 alfiókok</p>
            <ul className={s.pricingFeatures}>
              <li><span className={s.checkIcon}>✓</span> Minden Alap funkció</li>
              <li><span className={s.checkIcon}>✓</span> 6-10 alfiók</li>
              <li><span className={s.checkIcon}>✓</span> Csapat naptár</li>
              <li><span className={s.checkIcon}>✓</span> Jogosultság kezelés</li>
              <li><span className={s.checkIcon}>✓</span> Prioritásos támogatás</li>
            </ul>
            <Link href="/auth/register" className={`btn btn-accent btn-lg ${s.pricingBtn}`}>Csatlakozz →</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={s.testimonials} id="velemenyek">
        <div className={s.sectionHeader}>
          <span className={s.sectionBadge}>💬 Vélemények</span>
          <h2 className={s.sectionTitle}>Mások mit mondanak rólunk</h2>
        </div>
        <div className={s.testimonialsGrid}>
          {[
            { text: 'Végre nem kell telefonon egyeztetni minden egyes időpontot. Az ügyfeleim imádják, hogy bármikor foglalhatnak!', name: 'Kovács Kati', role: 'Fodrász szalon tulajdonos', avatar: '💇‍♀️', bg: 'var(--primary-100)' },
            { text: 'A beágyazás a weboldalamba 5 perc volt. Azóta 40%-al több foglalást kapok. Szuper rendszer!', name: 'Nagy Péter', role: 'Személyi edző', avatar: '💪', bg: 'var(--accent-100)' },
            { text: 'A csapatkezelés funkció nélkülözhetetlen a szalonunk számára. 8 kolléga, egy közös naptár – tökéletes áttekintés.', name: 'Szabó Anna', role: 'Kozmetikai szalon vezető', avatar: '✨', bg: 'var(--success-light)' },
          ].map((t, i) => (
            <div key={i} className={s.testimonialCard}>
              <div className={s.testimonialStars}>★★★★★</div>
              <p>&ldquo;{t.text}&rdquo;</p>
              <div className={s.testimonialAuthor}>
                <div className={s.testimonialAvatar} style={{ background: t.bg }}>{t.avatar}</div>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={s.cta}>
        <div className={s.ctaBox}>
          <h2>Kezdd el még ma – teljesen ingyen!</h2>
          <p>Regisztrálj most és állítsd be az időpontfoglaló rendszered percek alatt.</p>
          <Link href="/auth/register" className={s.ctaBtn}>
            Ingyenes regisztráció →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
