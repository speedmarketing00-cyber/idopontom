-- Automatikus számlázás foglalás után
-- Értékek: 'off' (kikapcsolva), 'draft' (piszkozat), 'auto' (automatikus kiállítás)
ALTER TABLE invoice_settings ADD COLUMN IF NOT EXISTS auto_invoice TEXT NOT NULL DEFAULT 'off'
  CHECK (auto_invoice IN ('off', 'draft', 'auto'));

-- GRANT for future Supabase public schema policy (Oct 2026)
-- (invoice_settings table already has RLS and existing GRANTs from invoicing.sql)
