-- =============================================
-- KUPON & REFERRAL RENDSZER
-- =============================================

-- 1. KUPONOK TÁBLA
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,                      -- Kuponkód (pl. FODRASZ30)
  type TEXT NOT NULL DEFAULT 'trial_extension'     -- 'trial_extension' | 'referral' | 'discount'
    CHECK (type IN ('trial_extension', 'referral', 'discount')),

  -- Jutalmak
  trial_days INTEGER DEFAULT 30,                   -- Hány napos trial (default: 30)
  discount_percent INTEGER DEFAULT 0,              -- % kedvezmény (jövőbeli)
  discount_months INTEGER DEFAULT 0,               -- Hány hónapra szól a kedvezmény

  -- Referral: melyik felhasználó hozta létre
  created_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Korlátok
  max_uses INTEGER DEFAULT NULL,                   -- NULL = korlátlan
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Érvényesség
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT NULL,            -- NULL = nincs lejárat

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON coupons(created_by_profile_id);

-- 2. PROFILES KIEGÉSZÍTÉS — kupon és referral mezők
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coupon_used TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT '';

-- 3. REFERRAL HASZNÁLATOK nyilvántartása
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  used_by_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_coupon ON referral_uses(coupon_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer ON referral_uses(referrer_profile_id);

-- 4. RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

-- Kuponokat mindenki olvashatja (validáláshoz), de csak admin írhat
CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (true);

-- Referral uses: saját referral-ok láthatók
CREATE POLICY "Users can view own referrals" ON referral_uses
  FOR SELECT USING (
    referrer_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR used_by_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- 5. Updated_at trigger
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Kezdeti kuponok létrehozása (platform admin kuponok)
INSERT INTO coupons (code, type, trial_days, max_uses, is_active) VALUES
  ('FODRASZ30', 'trial_extension', 30, NULL, true),
  ('KOZMETIKA30', 'trial_extension', 30, NULL, true),
  ('BARATOMAJANLOTTA', 'trial_extension', 30, NULL, true),
  ('INGYENES30', 'trial_extension', 30, 100, true),
  ('ABIGEL30', 'trial_extension', 30, NULL, true)
ON CONFLICT (code) DO NOTHING;
