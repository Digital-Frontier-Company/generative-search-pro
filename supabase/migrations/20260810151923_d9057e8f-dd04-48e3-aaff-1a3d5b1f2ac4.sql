CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_analytics_events_user_created ON public.analytics_events (user_id, created_at DESC);