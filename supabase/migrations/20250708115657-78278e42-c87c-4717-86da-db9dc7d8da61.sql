-- Update David Thompson's subscription status to the highest tier (team) in subscribers table
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'team',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = now()
WHERE email = 'david@memphisearthmovers.com';

-- Insert/Update David Thompson's subscription in user_subscriptions table
INSERT INTO public.user_subscriptions (
  user_id,
  subscription_type,
  subscription_tier,
  monthly_credits,
  credits_used,
  is_trial,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at
) VALUES (
  '7531546a-e12d-403d-bccc-a25b19f60a0f',
  'premium',
  'team',
  1000,
  0,
  false,
  now(),
  '2025-12-31 23:59:59+00',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_type = 'premium',
  subscription_tier = 'team',
  monthly_credits = 1000,
  credits_used = 0,
  is_trial = false,
  subscription_start_date = now(),
  subscription_end_date = '2025-12-31 23:59:59+00',
  updated_at = now();