-- ============================================
-- Supabase Database Webhook: Új regisztráció értesítés
-- Ez a trigger automatikusan meghívja a webhook-ot amikor
-- valaki befejezi a regisztrációt (business_name kitöltésre kerül)
-- ============================================

-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that fires webhook when a new registration completes
CREATE OR REPLACE FUNCTION notify_new_registration_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire when business_name is set for the first time
  -- INSERT: new profile with business_name already set (email registration)
  -- UPDATE: business_name was NULL, now has value (Google OAuth → complete-profile)
  IF (TG_OP = 'INSERT' AND NEW.business_name IS NOT NULL AND NEW.business_name != '')
     OR (TG_OP = 'UPDATE' AND (OLD.business_name IS NULL OR OLD.business_name = '') AND NEW.business_name IS NOT NULL AND NEW.business_name != '')
  THEN
    PERFORM net.http_post(
      url := 'https://foglaljvelem.hu/api/webhook/new-registration',
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'name', COALESCE(NEW.name, ''),
          'email', COALESCE(NEW.email, ''),
          'phone', COALESCE(NEW.phone, ''),
          'business_name', COALESCE(NEW.business_name, ''),
          'business_type', COALESCE(NEW.business_type, ''),
          'created_at', NEW.created_at
        )
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running)
DROP TRIGGER IF EXISTS on_profile_registration_webhook ON profiles;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_registration_webhook
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_registration_webhook();
