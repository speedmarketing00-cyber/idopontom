-- =============================================
-- SERVICE ICONS + GROUP SESSIONS (Csoportos órák)
-- =============================================
-- Futtasd a Supabase SQL Editorban.
-- =============================================

-- 1. Service icons + group session fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_group_session BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_capacity BOOLEAN DEFAULT false;

-- 2. Group session schedule table
-- Each group service can have fixed time slots on specific days
CREATE TABLE IF NOT EXISTS group_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_group_schedule_service ON group_schedule(service_id);
CREATE INDEX IF NOT EXISTS idx_group_schedule_day ON group_schedule(service_id, day_of_week);

-- RLS for group_schedule
ALTER TABLE group_schedule ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read (needed for booking page)
CREATE POLICY "group_schedule_read" ON group_schedule FOR SELECT USING (true);

-- Policy: owner can manage (insert/update/delete) via service ownership
CREATE POLICY "group_schedule_manage" ON group_schedule FOR ALL USING (
    EXISTS (
        SELECT 1 FROM services s
        JOIN profiles p ON s.profile_id = p.id
        WHERE s.id = group_schedule.service_id
        AND p.user_id = auth.uid()
    )
);
