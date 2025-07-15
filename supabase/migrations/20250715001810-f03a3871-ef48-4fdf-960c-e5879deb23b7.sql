-- Remove unused foreign tables that are causing security warnings
-- These tables appear to be legacy/unused and are exposing API endpoints without RLS protection

DROP FOREIGN TABLE IF EXISTS public.contacts;
DROP FOREIGN TABLE IF EXISTS public.company;

-- Note: Remaining warnings require manual Supabase dashboard configuration:
-- 1. next_auth.uid function - cannot be modified (external extension)
-- 2. Extensions in public schema - move vector and postgres_fdw to extensions schema via dashboard
-- 3. MFA options - enable additional MFA methods in Auth settings