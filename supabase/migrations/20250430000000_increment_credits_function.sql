
-- Create a function to increment the credits_used field
CREATE OR REPLACE FUNCTION increment_credits()
RETURNS integer AS $$
DECLARE
  current_credits integer;
BEGIN
  SELECT credits_used INTO current_credits FROM user_subscriptions 
  WHERE user_id = auth.uid();
  
  UPDATE user_subscriptions 
  SET credits_used = current_credits + 1
  WHERE user_id = auth.uid();
  
  RETURN current_credits + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
