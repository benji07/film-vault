-- ============================================================================
-- Migration: Account-based authentication (Magic Link / OAuth)
-- - Adds ensure_profile() RPC: creates a user_profiles row on first sign-in
--   for any authenticated session (Magic Link, OAuth, anonymous).
-- - Auto-generates a recovery_code that serves as a one-time export/secours
--   token (kept hidden by default; surfaceable from Settings).
-- - Other RPCs (link_recovery_code, upsert_user_data_v3, get_user_data_v3,
--   activate_cloud, get_profile_id) are reused unchanged: they all work off
--   auth.uid() regardless of provider.
-- ============================================================================

-- Idempotent recovery code generator using the same alphabet as the client
-- (no I/O/0/1 to avoid confusion). Returns a unique code in the form
-- FILM-XXXX-XXXX. Retries on (extremely unlikely) collision.
CREATE OR REPLACE FUNCTION public.generate_recovery_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_code TEXT;
    v_attempts INTEGER := 0;
BEGIN
    LOOP
        v_code := 'FILM-';
        FOR i IN 1..4 LOOP
            v_code := v_code || substr(v_alphabet, 1 + (random() * (length(v_alphabet) - 1))::int, 1);
        END LOOP;
        v_code := v_code || '-';
        FOR i IN 1..4 LOOP
            v_code := v_code || substr(v_alphabet, 1 + (random() * (length(v_alphabet) - 1))::int, 1);
        END LOOP;

        EXIT WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE recovery_code = v_code);

        v_attempts := v_attempts + 1;
        IF v_attempts > 10 THEN
            RAISE EXCEPTION 'recovery_code_generation_failed';
        END IF;
    END LOOP;

    RETURN v_code;
END;
$$;

-- ensure_profile: idempotently returns the user_profiles.id for the current
-- authenticated session, creating the row on first call. Used by clients
-- after Magic Link / OAuth sign-in to bootstrap the profile without exposing
-- a recovery code in the UI.
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_uid UUID := auth.uid();
    v_code TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- Already linked to a profile?
    SELECT id INTO v_user_id
    FROM user_profiles
    WHERE auth_uid = v_uid
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    -- Create a new profile with an auto-generated recovery code
    v_code := public.generate_recovery_code();

    INSERT INTO user_profiles (recovery_code, auth_uid, schema_version, updated_at)
    VALUES (v_code, v_uid, 16, now())
    RETURNING id INTO v_user_id;

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;

-- get_recovery_code: returns the recovery code of the current authenticated
-- user. Surfaced in Settings as an "export / secours" token. Returns NULL
-- if no profile is linked yet.
CREATE OR REPLACE FUNCTION public.get_recovery_code()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT recovery_code
    FROM public.user_profiles
    WHERE auth_uid = auth.uid()
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_recovery_code() TO authenticated;
