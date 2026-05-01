-- ============================================================================
-- Migration: fix link_recovery_code conflict with orphan empty profile
--
-- Scenario: a user who was previously signed in anonymously (auth_uid = anon_X
-- on their legacy profile A) signs in with Magic Link. They now have a new
-- email-bound auth.uid() = email_Y. ensure_profile() creates a brand-new
-- profile B with auth_uid = email_Y. Calling link_recovery_code(legacy)
-- then tries to set profile A.auth_uid = email_Y and trips the unique index
-- idx_user_profiles_auth_uid → 409.
--
-- Fix: when link_recovery_code finds an *other* profile already owned by the
-- current auth.uid(), re-parent any child rows from that orphan profile to
-- the target legacy profile, then delete only the orphan user_profiles row.
-- We never delete data rows (cameras, lenses, backs, films, history, shot
-- notes) — if the orphan had data, it merges into the legacy profile. On a
-- composite-PK conflict (same client-generated id present on both profiles)
-- the legacy/target profile wins, since it's the one the user is restoring.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.link_recovery_code(p_recovery_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_id UUID;
    v_uid UUID := auth.uid();
    v_existing_profile_id UUID;
    v_existing_recovery_code TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- Find the profile owning the recovery code
    SELECT id INTO v_target_id
    FROM user_profiles
    WHERE recovery_code = p_recovery_code
    LIMIT 1;

    IF v_target_id IS NULL THEN
        RAISE EXCEPTION 'invalid_recovery_code';
    END IF;

    -- Idempotent fast-path: already linked to this profile.
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = v_target_id AND auth_uid = v_uid) THEN
        RETURN v_target_id;
    END IF;

    -- Is there another profile already owned by the current auth.uid()?
    SELECT id, recovery_code
    INTO v_existing_profile_id, v_existing_recovery_code
    FROM user_profiles
    WHERE auth_uid = v_uid AND id <> v_target_id
    LIMIT 1;

    IF v_existing_profile_id IS NOT NULL THEN
        -- Re-parent child rows from orphan → target. For tables with the
        -- composite PK (user_id, id), drop orphan rows whose id already
        -- exists on the target before the UPDATE to avoid PK violations
        -- (the legacy/target row wins).

        DELETE FROM cameras
            WHERE user_id = v_existing_profile_id
              AND id IN (SELECT id FROM cameras WHERE user_id = v_target_id);
        UPDATE cameras SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        DELETE FROM lenses
            WHERE user_id = v_existing_profile_id
              AND id IN (SELECT id FROM lenses WHERE user_id = v_target_id);
        UPDATE lenses SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        DELETE FROM backs
            WHERE user_id = v_existing_profile_id
              AND id IN (SELECT id FROM backs WHERE user_id = v_target_id);
        UPDATE backs SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        DELETE FROM films
            WHERE user_id = v_existing_profile_id
              AND id IN (SELECT id FROM films WHERE user_id = v_target_id);
        UPDATE films SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        DELETE FROM shot_notes
            WHERE user_id = v_existing_profile_id
              AND id IN (SELECT id FROM shot_notes WHERE user_id = v_target_id);
        UPDATE shot_notes SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        -- film_history has a BIGINT identity PK — no conflicts possible.
        UPDATE film_history SET user_id = v_target_id WHERE user_id = v_existing_profile_id;

        -- Drop the orphan's legacy user_data row (PK is recovery_code, no FK
        -- to user_profiles so cascade wouldn't help). The target profile keeps
        -- its own user_data row untouched.
        IF v_existing_recovery_code IS NOT NULL THEN
            DELETE FROM user_data WHERE recovery_code = v_existing_recovery_code;
        END IF;

        -- Finally drop just the orphan profile row. By now it owns no child
        -- rows, so the ON DELETE CASCADE has nothing to cascade.
        DELETE FROM user_profiles WHERE id = v_existing_profile_id;
    END IF;

    UPDATE user_profiles
    SET auth_uid = v_uid, updated_at = now()
    WHERE id = v_target_id;

    RETURN v_target_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_recovery_code(text) TO authenticated;
