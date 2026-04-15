-- =============================================
-- SZÁMLÁZÓ MODUL – Database Schema
-- =============================================
-- Számlák kezelése, NAV Online Számla integráció
-- Futtasd a Supabase SQL Editorban.
-- =============================================

-- 1. SZÁMLA BEÁLLÍTÁSOK (per szolgáltató)
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Cégadatok
  company_name TEXT NOT NULL DEFAULT '',
  tax_number TEXT NOT NULL DEFAULT '',          -- Adószám (12345678-1-23)
  eu_tax_number TEXT DEFAULT '',                -- EU adószám (HU12345678)
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  zip_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'HU',

  -- Bankszámla
  bank_name TEXT DEFAULT '',
  bank_account TEXT DEFAULT '',                 -- Bankszámlaszám

  -- Számla sorszámozás
  invoice_prefix TEXT NOT NULL DEFAULT 'FV',    -- Pl: FV-2026-001
  next_invoice_number INTEGER NOT NULL DEFAULT 1,

  -- NAV Online Számla API
  nav_login TEXT DEFAULT '',                    -- NAV technikai felhasználó login
  nav_password TEXT DEFAULT '',                 -- NAV technikai felhasználó jelszó
  nav_signing_key TEXT DEFAULT '',              -- NAV aláíró kulcs
  nav_replacement_key TEXT DEFAULT '',          -- NAV csere kulcs
  nav_tax_number TEXT DEFAULT '',               -- NAV technikai felhasználó adószám

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_settings_profile ON invoice_settings(profile_id);

-- 2. SZÁMLÁK
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Számla azonosítás
  invoice_number TEXT NOT NULL,                 -- Számla sorszám (FV-2026-001)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled', 'storno')),

  -- Ügyfél adatok
  client_name TEXT NOT NULL,
  client_tax_number TEXT DEFAULT '',
  client_address TEXT DEFAULT '',
  client_city TEXT DEFAULT '',
  client_zip TEXT DEFAULT '',
  client_country TEXT DEFAULT 'HU',
  client_email TEXT DEFAULT '',

  -- Dátumok
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,        -- Kiállítás dátuma
  fulfillment_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- Teljesítés dátuma
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + 8),    -- Fizetési határidő

  -- Összegek (számított, tételekből)
  net_amount INTEGER NOT NULL DEFAULT 0,        -- Nettó összeg (Ft)
  vat_amount INTEGER NOT NULL DEFAULT 0,        -- ÁFA összeg (Ft)
  gross_amount INTEGER NOT NULL DEFAULT 0,      -- Bruttó összeg (Ft)
  currency TEXT NOT NULL DEFAULT 'HUF',

  -- Fizetés
  payment_method TEXT NOT NULL DEFAULT 'transfer' CHECK (payment_method IN ('transfer', 'cash', 'card', 'other')),

  -- Megjegyzés
  notes TEXT DEFAULT '',

  -- NAV
  nav_transaction_id TEXT DEFAULT '',           -- NAV tranzakció ID (sikeres beküldés után)
  nav_status TEXT DEFAULT '',                   -- NAV feldolgozási státusz

  -- PDF
  pdf_url TEXT DEFAULT '',                      -- Generált PDF link

  -- Storno hivatkozás
  storno_of TEXT DEFAULT '',                    -- Ha storno, az eredeti számla ID-ja

  -- Kapcsolódó foglalás (opcionális)
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_profile ON invoices(profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_number ON invoices(profile_id, invoice_number);

-- 3. SZÁMLA TÉTELEK
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,

  description TEXT NOT NULL,                    -- Tétel megnevezés
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,   -- Mennyiség
  unit TEXT NOT NULL DEFAULT 'db',              -- Egység (db, óra, alkalom, stb.)
  unit_price INTEGER NOT NULL DEFAULT 0,        -- Egységár nettó (Ft)
  vat_rate INTEGER NOT NULL DEFAULT 27,         -- ÁFA kulcs (27, 18, 5, 0)

  net_amount INTEGER NOT NULL DEFAULT 0,        -- Nettó (quantity * unit_price)
  vat_amount INTEGER NOT NULL DEFAULT 0,        -- ÁFA összeg
  gross_amount INTEGER NOT NULL DEFAULT 0,      -- Bruttó összeg

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice Settings: owner only
CREATE POLICY "Users can view own invoice settings" ON invoice_settings
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own invoice settings" ON invoice_settings
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Invoices: owner only
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Invoice Items: via invoice ownership
CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT USING (invoice_id IN (SELECT id FROM invoices WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage own invoice items" ON invoice_items
  FOR ALL USING (invoice_id IN (SELECT id FROM invoices WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_invoice_settings_updated_at ON invoice_settings;
CREATE TRIGGER update_invoice_settings_updated_at BEFORE UPDATE ON invoice_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
