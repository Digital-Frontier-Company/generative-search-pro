-- Fix function search path security warnings
-- Update functions to have immutable search_path

ALTER FUNCTION public.handle_new_user_signup() SET search_path = 'public';
ALTER FUNCTION public.match_documents(vector, integer, jsonb) SET search_path = 'public';
ALTER FUNCTION public.set_openai_key(text) SET search_path = 'public';
ALTER FUNCTION public.match_content_by_query(text, double precision, integer) SET search_path = 'public';
ALTER FUNCTION public.match_page_sections(vector, double precision, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.get_page_parents(bigint) SET search_path = 'public';
ALTER FUNCTION public.analyze_content_quality(text) SET search_path = 'public';
ALTER FUNCTION public.check_ai_friendliness(text) SET search_path = 'public';
ALTER FUNCTION public.analyze_keywords(text, text) SET search_path = 'public';
ALTER FUNCTION public.get_openai_embedding(text) SET search_path = 'public';

-- Add RLS policies to foreign tables to secure API access
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for foreign tables (deny all access by default)
CREATE POLICY "Restrict access to contacts" ON public.contacts FOR ALL USING (false);
CREATE POLICY "Restrict access to company" ON public.company FOR ALL USING (false);

-- Note: Extensions (vector, postgres_fdw) should be moved from public schema
-- This requires manual intervention as it may affect existing functionality
-- Consider moving to 'extensions' schema: 
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER EXTENSION vector SET SCHEMA extensions;
-- ALTER EXTENSION postgres_fdw SET SCHEMA extensions;