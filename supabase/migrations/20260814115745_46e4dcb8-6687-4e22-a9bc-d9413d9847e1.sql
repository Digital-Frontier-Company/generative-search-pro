CREATE OR REPLACE FUNCTION public.ensure_account(p_name text DEFAULT 'My workspace')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_account_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT account_id INTO v_account_id
  FROM public.account_members
  WHERE user_id = v_uid
  ORDER BY created_at
  LIMIT 1;

  IF v_account_id IS NOT NULL THEN
    RETURN v_account_id;
  END IF;

  INSERT INTO public.accounts (name)
  VALUES (COALESCE(NULLIF(btrim(p_name), ''), 'My workspace'))
  RETURNING id INTO v_account_id;

  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES (v_account_id, v_uid, 'owner');

  RETURN v_account_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_account(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_account(text) TO authenticated;