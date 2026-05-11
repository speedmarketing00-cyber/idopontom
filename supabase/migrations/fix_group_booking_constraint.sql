-- =============================================
-- FIX: Allow group session bookings to overlap
-- =============================================
-- A bookings_no_overlap constraint minden átfedő foglalást blokkol,
-- de a csoportos óráknál (group sessions) több ember is foglalhat
-- ugyanarra az időpontra. Ehhez:
-- 1. Hozzáadunk egy is_group_booking oszlopot
-- 2. Újradefiniáljuk a constraintet úgy, hogy csak NEM-csoportos
--    foglalásoknál érvényesüljön
-- =============================================

-- 1. Add is_group_booking flag to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_group_booking BOOLEAN DEFAULT false;

-- 2. Drop old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;

-- 3. Recreate constraint — only for NON-group bookings
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
    profile_id WITH =,
    (COALESCE(team_member_id::text, 'OWNER')) WITH =,
    tsrange(
        (booking_date + start_time)::timestamp,
        (booking_date + end_time)::timestamp,
        '[)'
    ) WITH &&
) WHERE (status = 'confirmed' AND is_group_booking = false);
