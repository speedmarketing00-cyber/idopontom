-- Fix days_off table: ensure start_date and end_date columns exist, handle old 'date' column
-- Run this in Supabase SQL Editor

-- If the table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS days_off (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the table exists but has 'date' column instead of start_date/end_date, add them
DO $$ BEGIN
    -- Add start_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'start_date') THEN
        ALTER TABLE days_off ADD COLUMN start_date DATE;
        -- Copy from 'date' column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'date') THEN
            UPDATE days_off SET start_date = date WHERE start_date IS NULL;
        END IF;
    END IF;

    -- Add end_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'end_date') THEN
        ALTER TABLE days_off ADD COLUMN end_date DATE;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'date') THEN
            UPDATE days_off SET end_date = date WHERE end_date IS NULL;
        END IF;
    END IF;

    -- Add reason if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'reason') THEN
        ALTER TABLE days_off ADD COLUMN reason TEXT;
    END IF;

    -- Make old 'date' column nullable if it exists (to prevent NOT NULL errors)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days_off' AND column_name = 'date') THEN
        ALTER TABLE days_off ALTER COLUMN date DROP NOT NULL;
    END IF;
END $$;

-- Add reminder tracking columns to bookings (if not exist)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false;

-- Ensure RLS
ALTER TABLE days_off ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Days off viewable by everyone" ON days_off;
CREATE POLICY "Days off viewable by everyone" ON days_off FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own days off" ON days_off;
CREATE POLICY "Users can manage own days off" ON days_off FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create index if missing
CREATE INDEX IF NOT EXISTS idx_days_off_profile_date ON days_off(profile_id, start_date, end_date);
