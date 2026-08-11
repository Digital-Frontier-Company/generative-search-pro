
-- documents: remove public read + email-based update
DROP POLICY IF EXISTS "Enable read access for all users" ON public.documents;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.documents;
CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.documents FROM anon;

-- nods_page: remove public read, email update, subscriber-join update
DROP POLICY IF EXISTS "Enable read access for all users" ON public.nods_page;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.nods_page;
DROP POLICY IF EXISTS "Policy with table joins" ON public.nods_page;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.nods_page;
CREATE POLICY "Users can insert their own pages" ON public.nods_page
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON public.nods_page
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.nods_page FROM anon;

-- ai_sitemaps: drop email-based update policy if present
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.ai_sitemaps;

-- subscribers: owner-scoped insert/update
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own subscription" ON public.subscribers
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.subscribers FROM anon;
GRANT ALL ON public.subscribers TO service_role;

-- SECURITY DEFINER functions should not be callable from the API
REVOKE ALL ON FUNCTION public.set_openai_key(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_user_credits(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_complete() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.match_content_by_query(text, double precision, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_content_by_query(text, double precision, integer) TO authenticated;

-- foreign table is not RLS-capable: remove API access
REVOKE ALL ON private.customers FROM anon, authenticated;
REVOKE USAGE ON SCHEMA private FROM anon, authenticated;
