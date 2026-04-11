-- ============================================================================
-- Migrate existing user_data JSONB rows into normalized tables
-- This is idempotent: ON CONFLICT DO NOTHING prevents duplicates
-- ============================================================================

DO $$
DECLARE
    r RECORD;
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
    FOR r IN SELECT * FROM user_data
    LOOP
        -- Create user profile
        INSERT INTO user_profiles (recovery_code, schema_version, updated_at)
        VALUES (r.recovery_code, COALESCE(r.version, 1), COALESCE(r.updated_at, now()))
        ON CONFLICT (recovery_code) DO NOTHING;

        SELECT id INTO v_user_id FROM user_profiles WHERE recovery_code = r.recovery_code;

        -- Skip if already migrated (check if this user already has data)
        IF EXISTS (SELECT 1 FROM films WHERE user_id = v_user_id LIMIT 1)
           OR EXISTS (SELECT 1 FROM cameras WHERE user_id = v_user_id LIMIT 1) THEN
            CONTINUE;
        END IF;

        -- Cameras
        FOR v_cam IN SELECT * FROM jsonb_array_elements(COALESCE(r.data->'cameras', '[]'::jsonb))
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
            ) ON CONFLICT DO NOTHING;
        END LOOP;

        -- Lenses
        FOR v_lens IN SELECT * FROM jsonb_array_elements(COALESCE(r.data->'lenses', '[]'::jsonb))
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
            ) ON CONFLICT DO NOTHING;
        END LOOP;

        -- Backs
        FOR v_back IN SELECT * FROM jsonb_array_elements(COALESCE(r.data->'backs', '[]'::jsonb))
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
            ) ON CONFLICT DO NOTHING;
        END LOOP;

        -- Films
        FOR v_film IN SELECT * FROM jsonb_array_elements(COALESCE(r.data->'films', '[]'::jsonb))
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
            ) ON CONFLICT DO NOTHING;

            -- Film history
            v_sort := 0;
            FOR v_hist IN SELECT * FROM jsonb_array_elements(COALESCE(v_film->'history', '[]'::jsonb))
            LOOP
                INSERT INTO film_history (user_id, film_id, date, action, action_code, params, sort_order)
                VALUES (
                    v_user_id, v_film->>'id',
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
                ) ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;
