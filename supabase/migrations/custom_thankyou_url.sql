-- =============================================
-- CUSTOM THANK YOU URL – Profile mező
-- =============================================
-- Lehetővé teszi, hogy a szolgáltató saját köszönjük oldalt állítson be.
-- Foglalás után a kliens ide lesz átirányítva a beépített köszönjük oldal helyett.
-- Futtasd a Supabase SQL Editorban.
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_thankyou_url TEXT DEFAULT NULL;
