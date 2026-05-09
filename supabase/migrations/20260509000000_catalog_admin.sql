-- ============================================================================
-- Catalog admin: editable film stock catalog with images + dev process
-- - Adds image_url, image_path, development_process columns to catalog_film_stocks
-- - Adds is_admin flag on user_profiles (granted manually in SQL)
-- - Exposes get_film_catalog with new columns
-- - Adds get_film_catalog_admin / admin_upsert_film_stock / admin_archive_film_stock
-- - Creates public 'catalog-images' Storage bucket (admin-only writes)
-- - Backfills development_process from previous JSON sidecar
-- ============================================================================

-- 1. Schema extensions ------------------------------------------------------

ALTER TABLE public.catalog_film_stocks
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS image_path TEXT,
    ADD COLUMN IF NOT EXISTS development_process TEXT;

ALTER TABLE public.catalog_film_stocks
    DROP CONSTRAINT IF EXISTS catalog_film_stocks_development_process_check;
ALTER TABLE public.catalog_film_stocks
    ADD CONSTRAINT catalog_film_stocks_development_process_check
    CHECK (development_process IS NULL
        OR development_process IN ('C-41', 'E-6', 'B&W', 'ECN-2', 'K-14'));

ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Admin helper -----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT is_admin FROM public.user_profiles WHERE auth_uid = auth.uid() LIMIT 1),
        false
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 3. Public catalog RPC (extended with new columns) -------------------------

CREATE OR REPLACE FUNCTION public.get_film_catalog(p_since TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    brand TEXT,
    model TEXT,
    iso INTEGER,
    type TEXT,
    format TEXT,
    development_process TEXT,
    image_url TEXT,
    active BOOLEAN,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, brand, model, iso, type, format, development_process, image_url, active, updated_at
    FROM catalog_film_stocks
    WHERE active = true
      AND (p_since IS NULL OR updated_at > p_since)
    ORDER BY brand, model, format;
$$;

GRANT EXECUTE ON FUNCTION public.get_film_catalog(timestamptz) TO anon;
GRANT EXECUTE ON FUNCTION public.get_film_catalog(timestamptz) TO authenticated;

-- 4. Admin RPCs -------------------------------------------------------------

-- Returns all rows (active + archived) for admin users only.
CREATE OR REPLACE FUNCTION public.get_film_catalog_admin()
RETURNS SETOF catalog_film_stocks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN QUERY SELECT * FROM catalog_film_stocks ORDER BY brand, model, format;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_film_catalog_admin() TO authenticated;

-- Insert when p_id IS NULL, update otherwise. Returns the row id.
CREATE OR REPLACE FUNCTION public.admin_upsert_film_stock(
    p_id INTEGER,
    p_brand TEXT,
    p_model TEXT,
    p_iso INTEGER,
    p_type TEXT,
    p_format TEXT,
    p_development_process TEXT,
    p_image_url TEXT,
    p_image_path TEXT,
    p_active BOOLEAN
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    IF p_id IS NULL THEN
        INSERT INTO catalog_film_stocks (
            brand, model, iso, type, format,
            development_process, image_url, image_path, active, updated_at
        )
        VALUES (
            p_brand, p_model, p_iso, p_type, p_format,
            NULLIF(p_development_process, ''), NULLIF(p_image_url, ''), NULLIF(p_image_path, ''),
            COALESCE(p_active, true), now()
        )
        RETURNING id INTO v_id;
    ELSE
        UPDATE catalog_film_stocks
        SET brand = p_brand,
            model = p_model,
            iso = p_iso,
            type = p_type,
            format = p_format,
            development_process = NULLIF(p_development_process, ''),
            image_url = NULLIF(p_image_url, ''),
            image_path = NULLIF(p_image_path, ''),
            active = COALESCE(p_active, active),
            updated_at = now()
        WHERE id = p_id
        RETURNING id INTO v_id;

        IF v_id IS NULL THEN
            RAISE EXCEPTION 'not_found';
        END IF;
    END IF;

    RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_film_stock(
    INTEGER, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_archive_film_stock(p_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    UPDATE catalog_film_stocks
    SET active = false, updated_at = now()
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found';
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_archive_film_stock(INTEGER) TO authenticated;

-- 5. Storage bucket: catalog-images (public read, admin write) --------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "catalog_images_public_read" ON storage.objects;
CREATE POLICY "catalog_images_public_read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "catalog_images_admin_insert" ON storage.objects;
CREATE POLICY "catalog_images_admin_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'catalog-images' AND public.is_admin());

DROP POLICY IF EXISTS "catalog_images_admin_update" ON storage.objects;
CREATE POLICY "catalog_images_admin_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'catalog-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'catalog-images' AND public.is_admin());

DROP POLICY IF EXISTS "catalog_images_admin_delete" ON storage.objects;
CREATE POLICY "catalog_images_admin_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'catalog-images' AND public.is_admin());

-- 6. Backfill development_process from prior enrichment sidecar -------------

WITH dev_process(brand, model, format, development_process) AS (
    VALUES
        ('CineStill', '50D', '120', 'C-41'),
        ('CineStill', '50D', '35mm', 'C-41'),
        ('CineStill', '800T', '120', 'C-41'),
        ('CineStill', '800T', '35mm', 'C-41'),
        ('CineStill', 'BwXX', '35mm', 'B&W'),
        ('Foma', 'Fomapan 100', '120', 'B&W'),
        ('Foma', 'Fomapan 100', '35mm', 'B&W'),
        ('Foma', 'Fomapan 200', '120', 'B&W'),
        ('Foma', 'Fomapan 200', '35mm', 'B&W'),
        ('Foma', 'Fomapan 400', '120', 'B&W'),
        ('Foma', 'Fomapan 400', '35mm', 'B&W'),
        ('Fujifilm', 'Acros II 100', '120', 'B&W'),
        ('Fujifilm', 'Acros II 100', '35mm', 'B&W'),
        ('Fujifilm', 'C200', '35mm', 'C-41'),
        ('Fujifilm', 'Instax Mini Monochrome', 'Instax Mini', 'B&W'),
        ('Fujifilm', 'Instax Mini', 'Instax Mini', 'C-41'),
        ('Fujifilm', 'Instax Square Monochrome', 'Instax Square', 'B&W'),
        ('Fujifilm', 'Instax Square', 'Instax Square', 'C-41'),
        ('Fujifilm', 'Instax Wide', 'Instax Wide', 'C-41'),
        ('Fujifilm', 'Provia 100F', '120', 'E-6'),
        ('Fujifilm', 'Provia 100F', '35mm', 'E-6'),
        ('Fujifilm', 'Superia 400', '35mm', 'C-41'),
        ('Fujifilm', 'Velvia 100', '120', 'E-6'),
        ('Fujifilm', 'Velvia 100', '35mm', 'E-6'),
        ('Fujifilm', 'Velvia 50', '120', 'E-6'),
        ('Fujifilm', 'Velvia 50', '35mm', 'E-6'),
        ('Ilford', 'Delta 100', '120', 'B&W'),
        ('Ilford', 'Delta 100', '35mm', 'B&W'),
        ('Ilford', 'Delta 3200', '120', 'B&W'),
        ('Ilford', 'Delta 3200', '35mm', 'B&W'),
        ('Ilford', 'Delta 400', '120', 'B&W'),
        ('Ilford', 'Delta 400', '35mm', 'B&W'),
        ('Ilford', 'FP4 Plus', '120', 'B&W'),
        ('Ilford', 'FP4 Plus', '35mm', 'B&W'),
        ('Ilford', 'HP5 Plus', '120', 'B&W'),
        ('Ilford', 'HP5 Plus', '35mm', 'B&W'),
        ('Ilford', 'Pan F Plus 50', '120', 'B&W'),
        ('Ilford', 'Pan F Plus 50', '35mm', 'B&W'),
        ('Ilford', 'XP2 Super', '120', 'C-41'),
        ('Ilford', 'XP2 Super', '35mm', 'C-41'),
        ('Kodak', 'ColorPlus 200', '35mm', 'C-41'),
        ('Kodak', 'Ektar 100', '120', 'C-41'),
        ('Kodak', 'Ektar 100', '35mm', 'C-41'),
        ('Kodak', 'Gold 200', '35mm', 'C-41'),
        ('Kodak', 'Portra 160', '120', 'C-41'),
        ('Kodak', 'Portra 160', '35mm', 'C-41'),
        ('Kodak', 'Portra 400', '120', 'C-41'),
        ('Kodak', 'Portra 400', '35mm', 'C-41'),
        ('Kodak', 'Portra 800', '120', 'C-41'),
        ('Kodak', 'Portra 800', '35mm', 'C-41'),
        ('Kodak', 'T-Max 100', '120', 'B&W'),
        ('Kodak', 'T-Max 100', '35mm', 'B&W'),
        ('Kodak', 'T-Max 400', '120', 'B&W'),
        ('Kodak', 'T-Max 400', '35mm', 'B&W'),
        ('Kodak', 'Tri-X 400', '120', 'B&W'),
        ('Kodak', 'Tri-X 400', '35mm', 'B&W'),
        ('Kodak', 'Ultramax 400', '35mm', 'C-41'),
        ('Kodak', 'Vision3 250D', '35mm', 'ECN-2'),
        ('Kodak', 'Vision3 500T', '35mm', 'ECN-2'),
        ('Kodak', 'Vision3 50D', '35mm', 'ECN-2'),
        ('Lomography', 'Color Negative 100', '35mm', 'C-41'),
        ('Lomography', 'Color Negative 400', '35mm', 'C-41'),
        ('Lomography', 'Color Negative 800', '35mm', 'C-41'),
        ('Lomography', 'Lady Grey', '35mm', 'B&W'),
        ('Lomography', 'Redscale XR 50-200', '35mm', 'C-41'),
        ('Polaroid', 'B&W 600', 'Polaroid 600', 'B&W'),
        ('Polaroid', 'B&W Go', 'Polaroid Go', 'B&W'),
        ('Polaroid', 'B&W I-Type', 'Polaroid I-Type', 'B&W'),
        ('Polaroid', 'B&W SX-70', 'Polaroid SX-70', 'B&W'),
        ('Polaroid', 'Color 600', 'Polaroid 600', 'C-41'),
        ('Polaroid', 'Color Go', 'Polaroid Go', 'C-41'),
        ('Polaroid', 'Color I-Type', 'Polaroid I-Type', 'C-41'),
        ('Polaroid', 'Color SX-70', 'Polaroid SX-70', 'C-41'),
        ('Rollei', 'RPX 100', '35mm', 'B&W'),
        ('Rollei', 'RPX 25', '35mm', 'B&W'),
        ('Rollei', 'RPX 400', '35mm', 'B&W')
)
UPDATE catalog_film_stocks AS c
SET development_process = d.development_process
FROM dev_process AS d
WHERE c.brand = d.brand
  AND c.model = d.model
  AND c.format = d.format
  AND c.development_process IS NULL;
