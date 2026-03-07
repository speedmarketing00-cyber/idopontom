-- email_settings table for per-provider email customization
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    booking_confirmation BOOLEAN DEFAULT true,
    reminder_24h BOOLEAN DEFAULT true,
    reminder_1h BOOLEAN DEFAULT true,
    provider_notification BOOLEAN DEFAULT true,
    custom_greeting TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_settings_profile ON email_settings(profile_id);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Email settings viewable by owner" ON email_settings;
CREATE POLICY "Email settings viewable by owner" ON email_settings FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Owner can manage email settings" ON email_settings;
CREATE POLICY "Owner can manage email settings" ON email_settings FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Add reminder tracking columns to bookings (if not exist)
DO $$ BEGIN
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
