-- Fix: move ORDER BY inside jsonb_agg() for cameras, lenses, and backs queries.
-- The ORDER BY at the outer SELECT level caused:
--   "column c.created_at must appear in the GROUP BY clause or be used in an aggregate function"

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
        ORDER BY c.created_at, c.id
    ), '[]'::jsonb)
    INTO v_cameras
    FROM cameras c WHERE c.user_id = v_user_id;

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
        ORDER BY l.created_at, l.id
    ), '[]'::jsonb)
    INTO v_lenses
    FROM lenses l WHERE l.user_id = v_user_id;

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
        ORDER BY b.created_at, b.id
    ), '[]'::jsonb)
    INTO v_backs
    FROM backs b WHERE b.user_id = v_user_id;

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
