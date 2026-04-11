-- ============================================================================
-- Supabase Storage: bucket + signed URL RPC functions
-- ============================================================================

-- 1. Create private bucket for user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Helper: validate that a relative path is safe
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

-- 2. RPC to create a signed upload URL
-- The client sends a relative path (e.g. "cameras/abc123.jpg")
-- The function prefixes it with the user's UUID for isolation
CREATE OR REPLACE FUNCTION public.create_upload_url(
    p_recovery_code TEXT,
    p_relative_path TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    v_user_id UUID;
    v_full_path TEXT;
    v_result RECORD;
BEGIN
    PERFORM _validate_relative_path(p_relative_path);

    SELECT id INTO v_user_id
    FROM user_profiles
    WHERE recovery_code = p_recovery_code;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'invalid_recovery_code';
    END IF;

    v_full_path := v_user_id::TEXT || '/' || p_relative_path;

    -- Use Supabase storage admin function to create signed upload URL (5 min TTL)
    SELECT * INTO v_result
    FROM storage.create_signed_upload_url('user-photos', v_full_path);

    RETURN v_result.url;
END;
$$;

-- 3. RPC to create a signed download URL
CREATE OR REPLACE FUNCTION public.create_download_url(
    p_recovery_code TEXT,
    p_relative_path TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    v_user_id UUID;
    v_full_path TEXT;
    v_result RECORD;
BEGIN
    PERFORM _validate_relative_path(p_relative_path);

    SELECT id INTO v_user_id
    FROM user_profiles
    WHERE recovery_code = p_recovery_code;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'invalid_recovery_code';
    END IF;

    v_full_path := v_user_id::TEXT || '/' || p_relative_path;

    -- Create signed download URL (1 hour TTL = 3600 seconds)
    SELECT * INTO v_result
    FROM storage.create_signed_url('user-photos', v_full_path, 3600);

    RETURN v_result.signed_url;
END;
$$;

-- 4. RPC to delete a file from storage
CREATE OR REPLACE FUNCTION public.delete_storage_file(
    p_recovery_code TEXT,
    p_relative_path TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    v_user_id UUID;
    v_full_path TEXT;
BEGIN
    PERFORM _validate_relative_path(p_relative_path);

    SELECT id INTO v_user_id
    FROM user_profiles
    WHERE recovery_code = p_recovery_code;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'invalid_recovery_code';
    END IF;

    v_full_path := v_user_id::TEXT || '/' || p_relative_path;

    DELETE FROM storage.objects
    WHERE bucket_id = 'user-photos' AND name = v_full_path;

    RETURN true;
END;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION public.create_upload_url(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_download_url(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_storage_file(text, text) TO anon;
