-- =============================================
-- GOOGLE CALENDAR SYNC – Profile mezők
-- =============================================
-- Futtasd a Supabase SQL Editorban.
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT DEFAULT NULL;
