-- =============================================
-- COMMUNITY SERVICE TEMPLATES
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS service_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  business_type TEXT NOT NULL DEFAULT 'other',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON service_templates(business_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_unique ON service_templates(name, business_type);

ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates are viewable by everyone" ON service_templates;
CREATE POLICY "Templates are viewable by everyone" ON service_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create templates" ON service_templates;
CREATE POLICY "Anyone can create templates" ON service_templates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Templates usage can be updated" ON service_templates;
CREATE POLICY "Templates usage can be updated" ON service_templates FOR UPDATE USING (true);
