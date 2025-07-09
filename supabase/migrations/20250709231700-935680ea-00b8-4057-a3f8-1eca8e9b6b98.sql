-- Add default_domain field to profiles table for universal domain configuration
ALTER TABLE public.profiles 
ADD COLUMN default_domain TEXT;

-- Add an index for better performance
CREATE INDEX idx_profiles_default_domain ON public.profiles(default_domain);