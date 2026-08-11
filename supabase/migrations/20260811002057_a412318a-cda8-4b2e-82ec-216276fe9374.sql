DROP POLICY IF EXISTS "Policy to implement Time To Live (TTL)" ON public.ai_sitemaps;
DROP POLICY IF EXISTS "Policy to implement Time To Live (TTL)" ON public.citation_checks;
DROP POLICY IF EXISTS "Policy with table joins" ON public.citation_checks;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.ai_sitemaps;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.citation_checks;

CREATE POLICY "Users can update their own ai sitemaps"
ON public.ai_sitemaps FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own citation checks"
ON public.citation_checks FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);