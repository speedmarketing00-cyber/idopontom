-- days_off table for custom unavailable date ranges
CREATE TABLE IF NOT EXISTS days_off (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_days_off_profile_date ON days_off(profile_id, start_date, end_date);

ALTER TABLE days_off ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Days off viewable by everyone" ON days_off;
CREATE POLICY "Days off viewable by everyone" ON days_off FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own days off" ON days_off;
CREATE POLICY "Users can manage own days off" ON days_off FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
