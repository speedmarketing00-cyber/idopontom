-- Add team_member_id to services and availability for sub-account support
-- Run this in Supabase SQL Editor

-- 1. Add team_member_id to services (NULL = owner's service)
ALTER TABLE services ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_services_team_member ON services(team_member_id);

-- 2. Add team_member_id to availability (NULL = owner's availability)  
ALTER TABLE availability ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS idx_availability_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_unique ON availability(profile_id, day_of_week, COALESCE(team_member_id, '00000000-0000-0000-0000-000000000000'));

-- 3. Make bookings.team_member_id reference team_members instead of profiles
-- First drop the existing FK if it exists, then recreate
DO $$ BEGIN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_team_member_id_fkey;
    ALTER TABLE bookings ADD CONSTRAINT bookings_team_member_id_fkey 
        FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE SET NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 4. Update team_members RLS to allow public SELECT (so booking page can load them)
DROP POLICY IF EXISTS "Team members viewable by owner" ON team_members;
CREATE POLICY "Team members viewable by everyone" ON team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can manage team members" ON team_members;
CREATE POLICY "Owner can manage team" ON team_members FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 5. Make availability unique index work with team_member_id
-- (already handled in step 2 above)
