-- Replace permissive RLS policies with SECURITY DEFINER RPC functions.
-- This prevents anyone with the anon key from listing all rows via SELECT *.
-- Data is only accessible by knowing the exact recovery_code, via RPC calls.

-- 1. Drop the permissive policies created in the initial migration
DROP POLICY IF EXISTS "Allow select for anon" ON public.user_data;
DROP POLICY IF EXISTS "Allow insert for anon" ON public.user_data;
DROP POLICY IF EXISTS "Allow update for anon" ON public.user_data;

-- 2. Revoke direct table permissions from anon (belt-and-suspenders with RLS)
REVOKE ALL ON public.user_data FROM anon;

-- 3. Read function: returns a single row matching the recovery code
CREATE OR REPLACE FUNCTION public.get_user_data(p_recovery_code text)
RETURNS TABLE(data jsonb, version integer, updated_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT data, version, updated_at
  FROM user_data
  WHERE recovery_code = p_recovery_code;
$$;

-- 4. Write function: insert or update a row by recovery code
CREATE OR REPLACE FUNCTION public.upsert_user_data(
  p_recovery_code text,
  p_data jsonb,
  p_version integer,
  p_updated_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO user_data (recovery_code, data, version, updated_at)
  VALUES (p_recovery_code, p_data, p_version, p_updated_at)
  ON CONFLICT (recovery_code)
  DO UPDATE SET data = EXCLUDED.data, version = EXCLUDED.version, updated_at = EXCLUDED.updated_at;
$$;

-- 5. Grant execute on RPC functions to anon role
GRANT EXECUTE ON FUNCTION public.get_user_data(text) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_data(text, jsonb, integer, timestamptz) TO anon;
