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

-- Collision-resistant recovery code generator using the same alphabet as the
-- client (no I/O/0/1 to avoid confusion). Returns a unique code in the form
-- FILM-XXXX-XXXX. Uses pgcrypto's CSPRNG (gen_random_bytes) since the code
-- doubles as a secret for account recovery / export. Internal helper, not
-- exposed to client roles.
CREATE OR REPLACE FUNCTION public.generate_recovery_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_alpha_len INTEGER := length(v_alphabet);
    v_code TEXT;
    v_bytes BYTEA;
    v_attempts INTEGER := 0;
BEGIN
    LOOP
        v_bytes := gen_random_bytes(8);
        v_code := 'FILM-';
        FOR i IN 0..3 LOOP
            v_code := v_code || substr(v_alphabet, 1 + (get_byte(v_bytes, i) % v_alpha_len), 1);
        END LOOP;
        v_code := v_code || '-';
        FOR i IN 4..7 LOOP
            v_code := v_code || substr(v_alphabet, 1 + (get_byte(v_bytes, i) % v_alpha_len), 1);
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

-- Lock down the helper: never callable by clients (PUBLIC, anon, authenticated).
REVOKE EXECUTE ON FUNCTION public.generate_recovery_code() FROM PUBLIC;

-- ensure_profile: returns the user_profiles.id for the current authenticated
-- session, creating the row on first call. Idempotent and safe under
-- concurrent calls thanks to the unique index on auth_uid: a race that loses
-- the INSERT falls back to a SELECT.
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
    v_attempts INTEGER := 0;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- Fast path: already linked to a profile.
    SELECT id INTO v_user_id
    FROM user_profiles
    WHERE auth_uid = v_uid
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    -- Insert with retry. unique_violation can come from either:
    --   - auth_uid: a concurrent ensure_profile() call won the race → re-select.
    --   - recovery_code: rare collision → retry with a freshly generated code.
    LOOP
        v_code := public.generate_recovery_code();

        BEGIN
            INSERT INTO user_profiles (recovery_code, auth_uid, schema_version, updated_at)
            VALUES (v_code, v_uid, 16, now())
            RETURNING id INTO v_user_id;

            RETURN v_user_id;
        EXCEPTION WHEN unique_violation THEN
            SELECT id INTO v_user_id
            FROM user_profiles
            WHERE auth_uid = v_uid
            LIMIT 1;

            IF v_user_id IS NOT NULL THEN
                RETURN v_user_id;
            END IF;

            v_attempts := v_attempts + 1;
            IF v_attempts > 5 THEN
                RAISE;
            END IF;
        END;
    END LOOP;
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
