-- ============================================================================
-- Supabase Storage: bucket setup
-- Signed URL operations are handled by Edge Functions (not SQL RPCs)
-- because storage.create_signed_url() is not accessible from PL/pgSQL.
-- ============================================================================

-- 1. Create private bucket for user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Helper: validate that a relative path is safe (used by Edge Functions indirectly,
--    kept here for potential future use in DB triggers/constraints)
CREATE OR REPLACE FUNCTION public._validate_relative_path(p_path TEXT)
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_path IS NULL OR p_path = '' THEN
        RAISE EXCEPTION 'path must not be empty';
    END IF;
    IF p_path LIKE '/%' THEN
        RAISE EXCEPTION 'path must be relative (no leading /)';
    END IF;
    IF p_path LIKE '%..%' THEN
        RAISE EXCEPTION 'path must not contain .. segments';
    END IF;
END;
$$;

-- Internal only
REVOKE EXECUTE ON FUNCTION public._validate_relative_path(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public._validate_relative_path(text) FROM anon;

-- 3. Helper: resolve recovery code to user_id (used by Edge Functions via DB query)
CREATE OR REPLACE FUNCTION public.resolve_user_id(p_recovery_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM user_profiles WHERE recovery_code = p_recovery_code;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_user_id(text) TO anon;
