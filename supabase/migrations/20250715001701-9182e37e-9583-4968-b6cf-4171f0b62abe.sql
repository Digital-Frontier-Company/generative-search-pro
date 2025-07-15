-- Fix function search path security warnings only
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

-- Remove foreign tables from API exposure by updating supabase config
-- Foreign tables (contacts, company) cannot have RLS and should be removed or moved
-- These appear to be unused legacy tables that can be safely dropped

-- Comment these tables to document security concern:
COMMENT ON TABLE public.contacts IS 'WARNING: Foreign table exposed to API without RLS protection. Consider removing if unused.';
COMMENT ON TABLE public.company IS 'WARNING: Foreign table exposed to API without RLS protection. Consider removing if unused.';