-- =============================================
-- PREVENT DOUBLE BOOKING – Exclusion Constraint
-- =============================================
-- Hozzáad egy adatbázis-szintű kényszert, ami garantálja, hogy
-- ugyanannak a szolgáltatónak (és team tagnak) nem lehet
-- két átfedő, 'confirmed' státuszú foglalása.
--
-- Ez akkor is véd, ha az alkalmazás oldali ellenőrzés elbukik
-- (race condition, bug, vagy direkt SQL insert miatt).
--
-- Futtasd a Supabase SQL Editorban.
-- =============================================

-- 1. Engedélyezzük a btree_gist extensiont (kell a = operátorhoz GIST indexen)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Dobjuk el a régit, ha létezik (biztonságos újrafuttatáshoz)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;

-- 3. Exclusion constraint:
--    - Azonos profile_id (szolgáltató)
--    - Azonos team_member_id (NULL = "owner sáv", COALESCE-al kezelve)
--    - Átfedő időintervallum [start, end)
--    - Csak a 'confirmed' státuszú foglalásokra
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
    profile_id WITH =,
    (COALESCE(team_member_id::text, 'OWNER')) WITH =,
    tsrange(
        (booking_date + start_time)::timestamp,
        (booking_date + end_time)::timestamp,
        '[)'
    ) WITH &&
) WHERE (status = 'confirmed');

-- Megjegyzés: ha a constraint létrehozása sikertelen, az valószínűleg
-- azért van, mert már léteznek átfedő foglalások a táblában.
-- Ebben az esetben először kézzel rendezd a duplikátumokat:
--
-- SELECT profile_id, team_member_id, booking_date, start_time, end_time, status, id
-- FROM bookings
-- WHERE status = 'confirmed'
-- ORDER BY profile_id, booking_date, start_time;
