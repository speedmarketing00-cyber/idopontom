-- Foglalási oldal testreszabás (Profi csomag funkció)
-- Futtasd le a Supabase SQL Editorban!

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_theme text DEFAULT 'light';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_accent_color text DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_custom_bg text DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_custom_card_bg text DEFAULT NULL;

-- Komment: booking_theme = 'light' | 'dark' | 'custom'
-- booking_accent_color = hex szín pl '#3b82f6'
-- booking_custom_bg = egyedi háttérszín (csak 'custom' téma esetén)
-- booking_custom_card_bg = egyedi kártya háttérszín (csak 'custom' téma esetén)
