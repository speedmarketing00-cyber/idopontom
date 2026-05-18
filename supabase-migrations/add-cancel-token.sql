-- Foglalás lemondás funkció
-- Futtasd le a Supabase SQL Editorban!

-- Cancel token a foglalásokhoz (vendég lemondáshoz)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_token TEXT;

-- Index a gyors kereséshezb
CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings(cancel_token);
