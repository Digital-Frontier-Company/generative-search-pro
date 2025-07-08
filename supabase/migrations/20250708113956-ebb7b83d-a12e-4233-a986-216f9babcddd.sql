-- Create a function to handle new user signups and trigger email notifications
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the send-signup-emails edge function
  PERFORM
    net.http_post(
      url := 'https://yyrjtiuvxhdwsjjrlxtm.supabase.co/functions/v1/send-signup-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'full_name', NEW.raw_user_meta_data->>'full_name'
      )::jsonb
    );
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();