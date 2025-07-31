-- Create trigger to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (
    id,
    user_id, 
    email,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    now(),
    now()
  );

  -- Create user subscription record
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_type,
    monthly_credits,
    credits_used,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'free',
    3,
    0,
    now(),
    now()
  );

  -- Call the send-signup-emails edge function
  PERFORM
    net.http_post(
      url := 'https://yyrjtiuvxhdwsjjrlxtm.supabase.co/functions/v1/send-signup-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
      )::jsonb
    );
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new comprehensive trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();