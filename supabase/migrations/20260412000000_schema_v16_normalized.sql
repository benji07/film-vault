-- ============================================================================
-- Migration: Normalize user_data JSONB into separate tables
-- Keeps user_data intact as backup. New RPC v2 functions decompose/recompose.
-- ============================================================================

-- 1. User profiles: anchor table linking recovery_code to internal UUID
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_code TEXT UNIQUE NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 16,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_profiles_recovery_code ON public.user_profiles(recovery_code);

-- 2. Cameras
CREATE TABLE public.cameras (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT '',
    nickname TEXT NOT NULL DEFAULT '',
    serial TEXT NOT NULL DEFAULT '',
    format TEXT NOT NULL DEFAULT '35mm',
    mount TEXT,
    has_interchangeable_back BOOLEAN NOT NULL DEFAULT false,
    photo_path TEXT,
    shutter_speed_min TEXT,
    shutter_speed_max TEXT,
    shutter_speed_stops TEXT,
    aperture_stops TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);

-- 3. Lenses
CREATE TABLE public.lenses (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT '',
    nickname TEXT,
    serial TEXT,
    photo_path TEXT,
    mount TEXT,
    is_zoom BOOLEAN DEFAULT false,
    focal_length_min NUMERIC,
    focal_length_max NUMERIC,
    max_aperture_at_min TEXT,
    max_aperture_at_max TEXT,
    aperture_min TEXT,
    aperture_max TEXT,
    aperture_stops TEXT,
    shutter_speed_min TEXT,
    shutter_speed_max TEXT,
    shutter_speed_stops TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);

-- 4. Backs
CREATE TABLE public.backs (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    nickname TEXT,
    ref TEXT,
    serial TEXT,
    photo_path TEXT,
    format TEXT NOT NULL DEFAULT '35mm',
    compatible_camera_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);

-- 5. Films (flat fields only, no history/shotNotes)
CREATE TABLE public.films (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    custom_name TEXT,
    iso INTEGER,
    type TEXT,
    format TEXT,
    state TEXT NOT NULL DEFAULT 'stock',
    exp_date TEXT,
    comment TEXT,
    price NUMERIC,
    dev_cost NUMERIC,
    scan_cost NUMERIC,
    dev_scan_package BOOLEAN DEFAULT false,
    added_date TEXT NOT NULL DEFAULT '',
    quantity INTEGER,
    shoot_iso INTEGER,
    camera_id TEXT,
    back_id TEXT,
    lens TEXT,
    lens_id TEXT,
    start_date TEXT,
    end_date TEXT,
    poses_shot INTEGER,
    poses_total INTEGER,
    lab TEXT,
    lab_ref TEXT,
    dev_date TEXT,
    scan_ref TEXT,
    storage_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);

-- 6. Film history entries
CREATE TABLE public.film_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    film_id TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL DEFAULT '',
    action_code TEXT,
    params JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_film_history_user_film ON public.film_history(user_id, film_id);

-- 7. Film history photos
CREATE TABLE public.film_history_photos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    history_id BIGINT NOT NULL REFERENCES public.film_history(id) ON DELETE CASCADE,
    photo_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_film_history_photos_history_sort
    ON public.film_history_photos(history_id, sort_order);

-- 8. Shot notes
CREATE TABLE public.shot_notes (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    film_id TEXT NOT NULL,
    frame_number INTEGER,
    aperture TEXT,
    shutter_speed TEXT,
    lens TEXT,
    lens_id TEXT,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    date TEXT,
    photo_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX idx_shot_notes_film ON public.shot_notes(user_id, film_id);

-- ============================================================================
-- Enable RLS on all new tables
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_history_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shot_notes ENABLE ROW LEVEL SECURITY;

-- Revoke direct access from anon (all access via SECURITY DEFINER RPCs)
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.cameras FROM anon;
REVOKE ALL ON public.lenses FROM anon;
REVOKE ALL ON public.backs FROM anon;
REVOKE ALL ON public.films FROM anon;
REVOKE ALL ON public.film_history FROM anon;
REVOKE ALL ON public.film_history_photos FROM anon;
REVOKE ALL ON public.shot_notes FROM anon;

-- ============================================================================
-- RPC v2: upsert_user_data_v2
-- Accepts the same AppData JSONB as before, decomposes into normalized tables
-- ============================================================================
CREATE OR REPLACE FUNCTION public.upsert_user_data_v2(
    p_recovery_code TEXT,
    p_data JSONB,
    p_version INTEGER,
    p_updated_at TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_cam JSONB;
    v_lens JSONB;
    v_back JSONB;
    v_film JSONB;
    v_hist JSONB;
    v_note JSONB;
    v_photo TEXT;
    v_sort INTEGER;
    v_hist_id BIGINT;
    v_photo_sort INTEGER;
BEGIN
    -- Get or create user profile
    INSERT INTO user_profiles (recovery_code, schema_version, updated_at)
    VALUES (p_recovery_code, p_version, p_updated_at)
    ON CONFLICT (recovery_code) DO UPDATE
        SET schema_version = EXCLUDED.schema_version,
            updated_at = EXCLUDED.updated_at
    RETURNING id INTO v_user_id;

    -- ---- CAMERAS ----
    DELETE FROM cameras WHERE user_id = v_user_id;
    FOR v_cam IN SELECT * FROM jsonb_array_elements(COALESCE(p_data->'cameras', '[]'::jsonb))
    LOOP
        INSERT INTO cameras (id, user_id, brand, model, nickname, serial, format, mount,
            has_interchangeable_back, photo_path, shutter_speed_min, shutter_speed_max,
            shutter_speed_stops, aperture_stops)
        VALUES (
            v_cam->>'id', v_user_id,
            COALESCE(v_cam->>'brand', ''),
            COALESCE(v_cam->>'model', ''),
            COALESCE(v_cam->>'nickname', ''),
            COALESCE(v_cam->>'serial', ''),
            COALESCE(v_cam->>'format', '35mm'),
            v_cam->>'mount',
            COALESCE((v_cam->>'hasInterchangeableBack')::boolean, false),
            v_cam->>'photo',
            v_cam->>'shutterSpeedMin',
            v_cam->>'shutterSpeedMax',
            v_cam->>'shutterSpeedStops',
            v_cam->>'apertureStops'
        );
    END LOOP;

    -- ---- LENSES ----
    DELETE FROM lenses WHERE user_id = v_user_id;
    FOR v_lens IN SELECT * FROM jsonb_array_elements(COALESCE(p_data->'lenses', '[]'::jsonb))
    LOOP
        INSERT INTO lenses (id, user_id, brand, model, nickname, serial, photo_path, mount,
            is_zoom, focal_length_min, focal_length_max, max_aperture_at_min, max_aperture_at_max,
            aperture_min, aperture_max, aperture_stops,
            shutter_speed_min, shutter_speed_max, shutter_speed_stops)
        VALUES (
            v_lens->>'id', v_user_id,
            COALESCE(v_lens->>'brand', ''),
            COALESCE(v_lens->>'model', ''),
            v_lens->>'nickname',
            v_lens->>'serial',
            v_lens->>'photo',
            v_lens->>'mount',
            COALESCE((v_lens->>'isZoom')::boolean, false),
            (v_lens->>'focalLengthMin')::numeric,
            (v_lens->>'focalLengthMax')::numeric,
            v_lens->>'maxApertureAtMin',
            v_lens->>'maxApertureAtMax',
            v_lens->>'apertureMin',
            v_lens->>'apertureMax',
            v_lens->>'apertureStops',
            v_lens->>'shutterSpeedMin',
            v_lens->>'shutterSpeedMax',
            v_lens->>'shutterSpeedStops'
        );
    END LOOP;

    -- ---- BACKS ----
    DELETE FROM backs WHERE user_id = v_user_id;
    FOR v_back IN SELECT * FROM jsonb_array_elements(COALESCE(p_data->'backs', '[]'::jsonb))
    LOOP
        INSERT INTO backs (id, user_id, name, nickname, ref, serial, photo_path, format, compatible_camera_ids)
        VALUES (
            v_back->>'id', v_user_id,
            COALESCE(v_back->>'name', ''),
            v_back->>'nickname',
            v_back->>'ref',
            v_back->>'serial',
            v_back->>'photo',
            COALESCE(v_back->>'format', '35mm'),
            COALESCE(
                ARRAY(SELECT jsonb_array_elements_text(v_back->'compatibleCameraIds')),
                '{}'::text[]
            )
        );
    END LOOP;

    -- ---- FILMS + HISTORY + SHOT NOTES ----
    -- First, delete existing film data (cascades to history via user_id)
    DELETE FROM shot_notes WHERE user_id = v_user_id;
    DELETE FROM film_history WHERE user_id = v_user_id;
    DELETE FROM films WHERE user_id = v_user_id;

    FOR v_film IN SELECT * FROM jsonb_array_elements(COALESCE(p_data->'films', '[]'::jsonb))
    LOOP
        INSERT INTO films (id, user_id, brand, model, custom_name, iso, type, format,
            state, exp_date, comment, price, dev_cost, scan_cost, dev_scan_package,
            added_date, quantity, shoot_iso, camera_id, back_id, lens, lens_id,
            start_date, end_date, poses_shot, poses_total,
            lab, lab_ref, dev_date, scan_ref, storage_location)
        VALUES (
            v_film->>'id', v_user_id,
            v_film->>'brand', v_film->>'model', v_film->>'customName',
            (v_film->>'iso')::integer,
            v_film->>'type', v_film->>'format',
            COALESCE(v_film->>'state', 'stock'),
            v_film->>'expDate', v_film->>'comment',
            (v_film->>'price')::numeric,
            (v_film->>'devCost')::numeric,
            (v_film->>'scanCost')::numeric,
            COALESCE((v_film->>'devScanPackage')::boolean, false),
            COALESCE(v_film->>'addedDate', ''),
            (v_film->>'quantity')::integer,
            (v_film->>'shootIso')::integer,
            v_film->>'cameraId', v_film->>'backId',
            v_film->>'lens', v_film->>'lensId',
            v_film->>'startDate', v_film->>'endDate',
            (v_film->>'posesShot')::integer, (v_film->>'posesTotal')::integer,
            v_film->>'lab', v_film->>'labRef', v_film->>'devDate',
            v_film->>'scanRef', v_film->>'storageLocation'
        );

        -- Film history
        v_sort := 0;
        FOR v_hist IN SELECT * FROM jsonb_array_elements(COALESCE(v_film->'history', '[]'::jsonb))
        LOOP
            INSERT INTO film_history (user_id, film_id, date, action, action_code, params, sort_order)
            VALUES (
                v_user_id,
                v_film->>'id',
                COALESCE(v_hist->>'date', ''),
                COALESCE(v_hist->>'action', ''),
                v_hist->>'actionCode',
                v_hist->'params',
                v_sort
            )
            RETURNING id INTO v_hist_id;

            -- History photos
            v_photo_sort := 0;
            IF v_hist->'photos' IS NOT NULL AND jsonb_typeof(v_hist->'photos') = 'array' THEN
                FOR v_photo IN SELECT jsonb_array_elements_text(v_hist->'photos')
                LOOP
                    INSERT INTO film_history_photos (history_id, photo_path, sort_order)
                    VALUES (v_hist_id, v_photo, v_photo_sort);
                    v_photo_sort := v_photo_sort + 1;
                END LOOP;
            END IF;

            v_sort := v_sort + 1;
        END LOOP;

        -- Shot notes
        FOR v_note IN SELECT * FROM jsonb_array_elements(COALESCE(v_film->'shotNotes', '[]'::jsonb))
        LOOP
            INSERT INTO shot_notes (id, user_id, film_id, frame_number, aperture, shutter_speed,
                lens, lens_id, location, latitude, longitude, notes, date, photo_path)
            VALUES (
                v_note->>'id', v_user_id, v_film->>'id',
                (v_note->>'frameNumber')::integer,
                v_note->>'aperture', v_note->>'shutterSpeed',
                v_note->>'lens', v_note->>'lensId',
                v_note->>'location',
                (v_note->>'latitude')::double precision,
                (v_note->>'longitude')::double precision,
                v_note->>'notes', v_note->>'date',
                v_note->>'photo'
            );
        END LOOP;
    END LOOP;

    -- Also maintain the old user_data table for backward compatibility
    INSERT INTO user_data (recovery_code, data, version, updated_at)
    VALUES (p_recovery_code, p_data, p_version, p_updated_at)
    ON CONFLICT (recovery_code)
    DO UPDATE SET data = EXCLUDED.data, version = EXCLUDED.version, updated_at = EXCLUDED.updated_at;

    -- Enrich shared catalogs with user's equipment data (if the function exists)
    BEGIN
        PERFORM enrich_catalogs_from_user_data(v_user_id);
    EXCEPTION WHEN undefined_function THEN
        -- Catalog tables not yet created (migration order), skip silently
        NULL;
    END;
END;
$$;

-- ============================================================================
-- RPC v2: get_user_data_v2
-- Reassembles normalized tables back into the AppData JSON shape
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_data_v2(p_recovery_code TEXT)
RETURNS TABLE(data JSONB, version INTEGER, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_version INTEGER;
    v_updated TIMESTAMPTZ;
    v_cameras JSONB;
    v_lenses JSONB;
    v_backs JSONB;
    v_films JSONB;
BEGIN
    -- Look up user
    SELECT up.id, up.schema_version, up.updated_at
    INTO v_user_id, v_version, v_updated
    FROM user_profiles up
    WHERE up.recovery_code = p_recovery_code;

    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    -- Cameras
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', c.id,
            'brand', c.brand,
            'model', c.model,
            'nickname', c.nickname,
            'serial', c.serial,
            'format', c.format,
            'mount', c.mount,
            'hasInterchangeableBack', c.has_interchangeable_back,
            'photo', c.photo_path,
            'shutterSpeedMin', c.shutter_speed_min,
            'shutterSpeedMax', c.shutter_speed_max,
            'shutterSpeedStops', c.shutter_speed_stops,
            'apertureStops', c.aperture_stops
        )
    ), '[]'::jsonb)
    INTO v_cameras
    FROM cameras c WHERE c.user_id = v_user_id
    ORDER BY c.created_at, c.id;

    -- Lenses
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', l.id,
            'brand', l.brand,
            'model', l.model,
            'nickname', l.nickname,
            'serial', l.serial,
            'photo', l.photo_path,
            'mount', l.mount,
            'isZoom', l.is_zoom,
            'focalLengthMin', l.focal_length_min,
            'focalLengthMax', l.focal_length_max,
            'maxApertureAtMin', l.max_aperture_at_min,
            'maxApertureAtMax', l.max_aperture_at_max,
            'apertureMin', l.aperture_min,
            'apertureMax', l.aperture_max,
            'apertureStops', l.aperture_stops,
            'shutterSpeedMin', l.shutter_speed_min,
            'shutterSpeedMax', l.shutter_speed_max,
            'shutterSpeedStops', l.shutter_speed_stops
        )
    ), '[]'::jsonb)
    INTO v_lenses
    FROM lenses l WHERE l.user_id = v_user_id
    ORDER BY l.created_at, l.id;

    -- Backs
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'nickname', b.nickname,
            'ref', b.ref,
            'serial', b.serial,
            'photo', b.photo_path,
            'format', b.format,
            'compatibleCameraIds', to_jsonb(b.compatible_camera_ids)
        )
    ), '[]'::jsonb)
    INTO v_backs
    FROM backs b WHERE b.user_id = v_user_id
    ORDER BY b.created_at, b.id;

    -- Films with nested history and shotNotes
    SELECT COALESCE(jsonb_agg(film_obj), '[]'::jsonb)
    INTO v_films
    FROM (
        SELECT jsonb_build_object(
            'id', f.id,
            'brand', f.brand,
            'model', f.model,
            'customName', f.custom_name,
            'iso', f.iso,
            'type', f.type,
            'format', f.format,
            'state', f.state,
            'expDate', f.exp_date,
            'comment', f.comment,
            'price', f.price,
            'devCost', f.dev_cost,
            'scanCost', f.scan_cost,
            'devScanPackage', f.dev_scan_package,
            'addedDate', f.added_date,
            'quantity', f.quantity,
            'shootIso', f.shoot_iso,
            'cameraId', f.camera_id,
            'backId', f.back_id,
            'lens', f.lens,
            'lensId', f.lens_id,
            'startDate', f.start_date,
            'endDate', f.end_date,
            'posesShot', f.poses_shot,
            'posesTotal', f.poses_total,
            'lab', f.lab,
            'labRef', f.lab_ref,
            'devDate', f.dev_date,
            'scanRef', f.scan_ref,
            'storageLocation', f.storage_location,
            'history', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'date', fh.date,
                        'action', fh.action,
                        'actionCode', fh.action_code,
                        'params', fh.params,
                        'photos', COALESCE((
                            SELECT jsonb_agg(fhp.photo_path ORDER BY fhp.sort_order)
                            FROM film_history_photos fhp
                            WHERE fhp.history_id = fh.id
                        ), '[]'::jsonb)
                    )
                    ORDER BY fh.sort_order
                )
                FROM film_history fh
                WHERE fh.user_id = v_user_id AND fh.film_id = f.id
            ), '[]'::jsonb),
            'shotNotes', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', sn.id,
                        'frameNumber', sn.frame_number,
                        'aperture', sn.aperture,
                        'shutterSpeed', sn.shutter_speed,
                        'lens', sn.lens,
                        'lensId', sn.lens_id,
                        'location', sn.location,
                        'latitude', sn.latitude,
                        'longitude', sn.longitude,
                        'notes', sn.notes,
                        'date', sn.date,
                        'photo', sn.photo_path
                    )
                )
                FROM shot_notes sn
                WHERE sn.user_id = v_user_id AND sn.film_id = f.id
            ), '[]'::jsonb)
        ) AS film_obj
        FROM films f
        WHERE f.user_id = v_user_id
        ORDER BY f.created_at, f.id
    ) sub;

    RETURN QUERY SELECT
        jsonb_build_object(
            'films', v_films,
            'cameras', v_cameras,
            'backs', v_backs,
            'lenses', v_lenses,
            'version', v_version
        ),
        v_version,
        v_updated;
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION public.upsert_user_data_v2(text, jsonb, integer, timestamptz) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_data_v2(text) TO anon;
