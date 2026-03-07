# 🚀 Domain Aktiválás Checklist – Időpontom

> Amikor saját domainre (pl. `idopontom.hu`) váltasz, ezt a listát kövesd végig!

---

## 1️⃣ Vercel – Domain hozzáadása
- [ ] Vercel Dashboard → idopontom projekt → **Settings → Domains**
- [ ] **Add Domain** → írd be: `idopontom.hu` (és `www.idopontom.hu`)
- [ ] Állítsd be a DNS-t a domain szolgáltatónál (Vercel megmutatja milyen A/CNAME rekordok kellenek)
- [ ] Várd meg amíg a domain zöld pipát kap (SSL tanúsítvány automatikus)

## 2️⃣ Supabase – Site URL frissítés
- [ ] Supabase → **Authentication → URL Configuration**
- [ ] **Site URL** átírása: `https://idopontom.hu`
- [ ] **Redirect URLs** – add hozzá: `https://idopontom.hu/**`

## 3️⃣ Supabase – SMTP beállítás (megerősítő emailek)
- [ ] Supabase → **Project Settings → Authentication → SMTP Settings**
- [ ] **Enable Custom SMTP** bekapcsolása
- [ ] Host: `smtp.resend.com`
- [ ] Port: `465`
- [ ] Username: `resend`
- [ ] Password: Resend API kulcs (`re_...`)
- [ ] Sender email: `noreply@idopontom.hu`
- [ ] **"Confirm email"** visszakapcsolása: Authentication → Providers → Email → Confirm email → **BE**

## 4️⃣ Google OAuth – Domain frissítés
- [ ] Google Cloud Console → **OAuth consent screen**
- [ ] **Authorized domains** → add hozzá: `idopontom.hu`
- [ ] **Submit for verification** (ha nem tetted meg korábban) → Privacy Policy + ToS URL megadása
- [ ] Credentials → OAuth client → **Authorized JavaScript origins** → add hozzá: `https://idopontom.hu`
- [ ] (A redirect URI NEM változik, mert Supabase kezeli: `https://jccmidzgdibxcjtvufbf.supabase.co/auth/v1/callback`)

## 5️⃣ Stripe – Webhook frissítés
- [ ] Stripe Dashboard → **Developers → Webhooks**
- [ ] **Add new endpoint**: `https://idopontom.hu/api/stripe/webhook`
- [ ] Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Régi Vercel webhook endpoint → törlés (vagy meghagyás backup-nak)
- [ ] Új **Signing secret** (`whsec_...`) → Vercel env vars-ba frissítés
- [ ] Stripe fiók aktiválás befejezése (éles fizetésekhez!)

## 6️⃣ Vercel – Environment Variables ellenőrzés
- [ ] `STRIPE_WEBHOOK_SECRET` → frissítsd az új webhook signing secret-re
- [ ] Minden más env var marad változatlan ✅

## 7️⃣ SEO & Jogi oldalak
- [ ] Privacy Policy oldal létrehozása (`/privacy`)
- [ ] Általános Szerződési Feltételek oldal (`/terms`)
- [ ] Google Search Console → domain hozzáadása + sitemap beküldés
- [ ] Favicon és OG image véglegesítés

## 8️⃣ Végső tesztelés
- [ ] Google bejelentkezés tesztelés az új domainen
- [ ] Email + jelszó regisztráció + megerősítő email megérkezésének ellenőrzése
- [ ] Stripe fizetés tesztelése (teszt kártyával: `4242 4242 4242 4242`)
- [ ] Foglalási oldal tesztelés (`/book/slug`)
- [ ] Dashboard összes oldal ellenőrzése
- [ ] Mobil nézet ellenőrzése

---

**⏱️ Becsült idő:** ~30-60 perc az egész átállás

**💡 Fontos:** A régi `idopontom-sigma.vercel.app` link automatikusan működik továbbra is, ha a Vercel domain beállításnál redirect-et állítasz be az új domainre!
