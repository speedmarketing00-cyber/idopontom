-- ============================================
-- Supabase Database Webhook: Új regisztráció értesítés (SAFE version)
-- Ha a webhook hívás sikertelen, a regisztráció AKKOR IS végbemegy!
-- ============================================

-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop old versions
DROP TRIGGER IF EXISTS on_profile_registration_webhook ON profiles;
DROP FUNCTION IF EXISTS notify_new_registration_webhook();

-- Safe function: EXCEPTION handler ensures registration never blocked
CREATE OR REPLACE FUNCTION notify_new_registration_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire when business_name is set for the first time
  IF (TG_OP = 'INSERT' AND NEW.business_name IS NOT NULL AND NEW.business_name != '')
     OR (TG_OP = 'UPDATE' AND (OLD.business_name IS NULL OR OLD.business_name = '') AND NEW.business_name IS NOT NULL AND NEW.business_name != '')
  THEN
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      -- Webhook failed but registration continues normally
      RAISE WARNING 'Registration webhook failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_registration_webhook
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_registration_webhook();
