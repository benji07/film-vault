-- ============================================================================
-- Catalog tables: shared reference data for film stocks and cameras
-- Read-only for clients, enriched automatically from user data
-- ============================================================================

-- 1. Film stock catalog
CREATE TABLE public.catalog_film_stocks (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    iso INTEGER NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(brand, model, format)
);

-- 2. Camera catalog
CREATE TABLE public.catalog_cameras (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT '35mm',
    mount TEXT,
    type TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(brand, model)
);

-- Enable RLS
ALTER TABLE public.catalog_film_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_cameras ENABLE ROW LEVEL SECURITY;

-- Allow anon SELECT on catalogs (read-only public data)
CREATE POLICY "Allow anon select on catalog_film_stocks"
    ON public.catalog_film_stocks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on catalog_cameras"
    ON public.catalog_cameras FOR SELECT TO anon USING (true);

-- Grant SELECT to anon
GRANT SELECT ON public.catalog_film_stocks TO anon;
GRANT SELECT ON public.catalog_cameras TO anon;

-- ============================================================================
-- Seed film stock catalog (from src/constants/film-catalog.ts)
-- ============================================================================
INSERT INTO catalog_film_stocks (brand, model, iso, type, format) VALUES
-- Kodak — Couleur
('Kodak', 'Portra 160', 160, 'Couleur', '35mm'),
('Kodak', 'Portra 160', 160, 'Couleur', '120'),
('Kodak', 'Portra 400', 400, 'Couleur', '35mm'),
('Kodak', 'Portra 400', 400, 'Couleur', '120'),
('Kodak', 'Portra 800', 800, 'Couleur', '35mm'),
('Kodak', 'Portra 800', 800, 'Couleur', '120'),
('Kodak', 'Gold 200', 200, 'Couleur', '35mm'),
('Kodak', 'ColorPlus 200', 200, 'Couleur', '35mm'),
('Kodak', 'Ultramax 400', 400, 'Couleur', '35mm'),
('Kodak', 'Ektar 100', 100, 'Couleur', '35mm'),
('Kodak', 'Ektar 100', 100, 'Couleur', '120'),
-- Kodak — N&B
('Kodak', 'Tri-X 400', 400, 'N&B', '35mm'),
('Kodak', 'Tri-X 400', 400, 'N&B', '120'),
('Kodak', 'T-Max 100', 100, 'N&B', '35mm'),
('Kodak', 'T-Max 100', 100, 'N&B', '120'),
('Kodak', 'T-Max 400', 400, 'N&B', '35mm'),
('Kodak', 'T-Max 400', 400, 'N&B', '120'),
-- Kodak — ECN-2
('Kodak', 'Vision3 50D', 50, 'ECN-2', '35mm'),
('Kodak', 'Vision3 250D', 250, 'ECN-2', '35mm'),
('Kodak', 'Vision3 500T', 500, 'ECN-2', '35mm'),
-- Ilford — N&B
('Ilford', 'HP5 Plus', 400, 'N&B', '35mm'),
('Ilford', 'HP5 Plus', 400, 'N&B', '120'),
('Ilford', 'FP4 Plus', 125, 'N&B', '35mm'),
('Ilford', 'FP4 Plus', 125, 'N&B', '120'),
('Ilford', 'Delta 100', 100, 'N&B', '35mm'),
('Ilford', 'Delta 100', 100, 'N&B', '120'),
('Ilford', 'Delta 400', 400, 'N&B', '35mm'),
('Ilford', 'Delta 400', 400, 'N&B', '120'),
('Ilford', 'Delta 3200', 3200, 'N&B', '35mm'),
('Ilford', 'Delta 3200', 3200, 'N&B', '120'),
('Ilford', 'Pan F Plus 50', 50, 'N&B', '35mm'),
('Ilford', 'Pan F Plus 50', 50, 'N&B', '120'),
('Ilford', 'XP2 Super', 400, 'N&B', '35mm'),
('Ilford', 'XP2 Super', 400, 'N&B', '120'),
-- Fujifilm — Couleur
('Fujifilm', 'Superia 400', 400, 'Couleur', '35mm'),
('Fujifilm', 'C200', 200, 'Couleur', '35mm'),
-- Fujifilm — Diapo
('Fujifilm', 'Velvia 50', 50, 'Diapo', '35mm'),
('Fujifilm', 'Velvia 50', 50, 'Diapo', '120'),
('Fujifilm', 'Velvia 100', 100, 'Diapo', '35mm'),
('Fujifilm', 'Velvia 100', 100, 'Diapo', '120'),
('Fujifilm', 'Provia 100F', 100, 'Diapo', '35mm'),
('Fujifilm', 'Provia 100F', 100, 'Diapo', '120'),
-- Fujifilm — N&B
('Fujifilm', 'Acros II 100', 100, 'N&B', '35mm'),
('Fujifilm', 'Acros II 100', 100, 'N&B', '120'),
-- Fujifilm — Instant
('Fujifilm', 'Instax Mini', 800, 'Couleur', 'Instax Mini'),
('Fujifilm', 'Instax Mini Monochrome', 800, 'N&B', 'Instax Mini'),
('Fujifilm', 'Instax Square', 800, 'Couleur', 'Instax Square'),
('Fujifilm', 'Instax Square Monochrome', 800, 'N&B', 'Instax Square'),
('Fujifilm', 'Instax Wide', 800, 'Couleur', 'Instax Wide'),
-- Polaroid
('Polaroid', 'Color SX-70', 160, 'Couleur', 'Polaroid SX-70'),
('Polaroid', 'B&W SX-70', 160, 'N&B', 'Polaroid SX-70'),
('Polaroid', 'Color 600', 640, 'Couleur', 'Polaroid 600'),
('Polaroid', 'B&W 600', 640, 'N&B', 'Polaroid 600'),
('Polaroid', 'Color I-Type', 640, 'Couleur', 'Polaroid I-Type'),
('Polaroid', 'B&W I-Type', 640, 'N&B', 'Polaroid I-Type'),
('Polaroid', 'Color Go', 640, 'Couleur', 'Polaroid Go'),
('Polaroid', 'B&W Go', 640, 'N&B', 'Polaroid Go'),
-- CineStill
('CineStill', '800T', 800, 'Couleur', '35mm'),
('CineStill', '800T', 800, 'Couleur', '120'),
('CineStill', '50D', 50, 'Couleur', '35mm'),
('CineStill', '50D', 50, 'Couleur', '120'),
('CineStill', 'BwXX', 250, 'N&B', '35mm'),
-- Lomography
('Lomography', 'Color Negative 100', 100, 'Couleur', '35mm'),
('Lomography', 'Color Negative 400', 400, 'Couleur', '35mm'),
('Lomography', 'Color Negative 800', 800, 'Couleur', '35mm'),
('Lomography', 'Lady Grey', 400, 'N&B', '35mm'),
('Lomography', 'Redscale XR 50-200', 100, 'Couleur', '35mm'),
-- Foma
('Foma', 'Fomapan 100', 100, 'N&B', '35mm'),
('Foma', 'Fomapan 100', 100, 'N&B', '120'),
('Foma', 'Fomapan 200', 200, 'N&B', '35mm'),
('Foma', 'Fomapan 200', 200, 'N&B', '120'),
('Foma', 'Fomapan 400', 400, 'N&B', '35mm'),
('Foma', 'Fomapan 400', 400, 'N&B', '120'),
-- Rollei
('Rollei', 'RPX 25', 25, 'N&B', '35mm'),
('Rollei', 'RPX 100', 100, 'N&B', '35mm'),
('Rollei', 'RPX 400', 400, 'N&B', '35mm')
ON CONFLICT (brand, model, format) DO NOTHING;

-- ============================================================================
-- Seed camera catalog (~150+ popular film cameras)
-- ============================================================================
INSERT INTO catalog_cameras (brand, model, format, mount, type) VALUES
-- Canon — SLR
('Canon', 'AE-1', '35mm', 'Canon FD', 'SLR'),
('Canon', 'AE-1 Program', '35mm', 'Canon FD', 'SLR'),
('Canon', 'A-1', '35mm', 'Canon FD', 'SLR'),
('Canon', 'F-1', '35mm', 'Canon FD', 'SLR'),
('Canon', 'New F-1', '35mm', 'Canon FD', 'SLR'),
('Canon', 'FTb', '35mm', 'Canon FD', 'SLR'),
('Canon', 'EOS 1V', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 3', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 5', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 30', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 50E', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 100', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 300', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 500N', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 620', '35mm', 'Canon EF', 'SLR'),
('Canon', 'EOS 650', '35mm', 'Canon EF', 'SLR'),
-- Canon — Rangefinder / Compact
('Canon', 'Canonet QL17 GIII', '35mm', NULL, 'Rangefinder'),
('Canon', 'Sure Shot AF35M', '35mm', NULL, 'Point-and-shoot'),
('Canon', 'Prima Super 105', '35mm', NULL, 'Point-and-shoot'),
-- Nikon — SLR
('Nikon', 'FM2', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'FM3A', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'FM', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'FE2', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'FE', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'FA', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F3', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F4', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F5', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F6', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F100', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'F80', '35mm', 'Nikon F', 'SLR'),
('Nikon', 'Nikkormat FT2', '35mm', 'Nikon F', 'SLR'),
-- Nikon — Rangefinder / Compact
('Nikon', '35Ti', '35mm', NULL, 'Point-and-shoot'),
('Nikon', '28Ti', '35mm', NULL, 'Point-and-shoot'),
('Nikon', 'L35AF', '35mm', NULL, 'Point-and-shoot'),
-- Pentax — SLR
('Pentax', 'K1000', '35mm', 'Pentax K', 'SLR'),
('Pentax', 'MX', '35mm', 'Pentax K', 'SLR'),
('Pentax', 'ME Super', '35mm', 'Pentax K', 'SLR'),
('Pentax', 'LX', '35mm', 'Pentax K', 'SLR'),
('Pentax', 'Spotmatic', '35mm', 'M42', 'SLR'),
('Pentax', 'Spotmatic F', '35mm', 'M42', 'SLR'),
('Pentax', 'MZ-5', '35mm', 'Pentax KAF', 'SLR'),
('Pentax', '67', '120', NULL, 'SLR'),
('Pentax', '67 II', '120', NULL, 'SLR'),
('Pentax', '645', '120', 'Pentax 645', 'SLR'),
('Pentax', '645N', '120', 'Pentax 645', 'SLR'),
('Pentax', '645NII', '120', 'Pentax 645', 'SLR'),
-- Olympus — SLR
('Olympus', 'OM-1', '35mm', 'Olympus OM', 'SLR'),
('Olympus', 'OM-2', '35mm', 'Olympus OM', 'SLR'),
('Olympus', 'OM-2n', '35mm', 'Olympus OM', 'SLR'),
('Olympus', 'OM-3', '35mm', 'Olympus OM', 'SLR'),
('Olympus', 'OM-4', '35mm', 'Olympus OM', 'SLR'),
('Olympus', 'OM-10', '35mm', 'Olympus OM', 'SLR'),
-- Olympus — Compact
('Olympus', 'XA', '35mm', NULL, 'Rangefinder'),
('Olympus', 'XA2', '35mm', NULL, 'Point-and-shoot'),
('Olympus', 'Mju II', '35mm', NULL, 'Point-and-shoot'),
('Olympus', 'Mju I', '35mm', NULL, 'Point-and-shoot'),
('Olympus', 'Trip 35', '35mm', NULL, 'Point-and-shoot'),
-- Minolta — SLR
('Minolta', 'X-700', '35mm', 'Minolta MD', 'SLR'),
('Minolta', 'X-500', '35mm', 'Minolta MD', 'SLR'),
('Minolta', 'X-300', '35mm', 'Minolta MD', 'SLR'),
('Minolta', 'XD7', '35mm', 'Minolta MD', 'SLR'),
('Minolta', 'SRT 101', '35mm', 'Minolta MC/MD', 'SLR'),
('Minolta', 'XG-M', '35mm', 'Minolta MD', 'SLR'),
('Minolta', 'Maxxum 7', '35mm', 'Minolta A', 'SLR'),
('Minolta', 'Maxxum 9', '35mm', 'Minolta A', 'SLR'),
-- Minolta — Compact
('Minolta', 'Hi-Matic 7sII', '35mm', NULL, 'Rangefinder'),
('Minolta', 'TC-1', '35mm', NULL, 'Point-and-shoot'),
-- Leica — Rangefinder
('Leica', 'M6', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M6 TTL', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M3', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M4', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M4-P', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M7', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'MP', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'M-A', '35mm', 'Leica M', 'Rangefinder'),
('Leica', 'CL', '35mm', 'Leica M', 'Rangefinder'),
-- Leica — SLR
('Leica', 'R6.2', '35mm', 'Leica R', 'SLR'),
('Leica', 'R8', '35mm', 'Leica R', 'SLR'),
-- Contax — SLR / Rangefinder
('Contax', 'RTS III', '35mm', 'Contax/Yashica', 'SLR'),
('Contax', '167MT', '35mm', 'Contax/Yashica', 'SLR'),
('Contax', 'Aria', '35mm', 'Contax/Yashica', 'SLR'),
('Contax', 'S2', '35mm', 'Contax/Yashica', 'SLR'),
('Contax', 'G1', '35mm', 'Contax G', 'Rangefinder'),
('Contax', 'G2', '35mm', 'Contax G', 'Rangefinder'),
('Contax', 'T2', '35mm', NULL, 'Point-and-shoot'),
('Contax', 'T3', '35mm', NULL, 'Point-and-shoot'),
('Contax', '645', '120', 'Contax 645', 'SLR'),
-- Hasselblad — Medium format
('Hasselblad', '500C/M', '120', 'Hasselblad V', 'SLR'),
('Hasselblad', '500C', '120', 'Hasselblad V', 'SLR'),
('Hasselblad', '501C/M', '120', 'Hasselblad V', 'SLR'),
('Hasselblad', '503CW', '120', 'Hasselblad V', 'SLR'),
('Hasselblad', 'SWC', '120', 'Hasselblad V', 'SLR'),
('Hasselblad', 'XPan', '35mm', NULL, 'Rangefinder'),
('Hasselblad', 'XPan II', '35mm', NULL, 'Rangefinder'),
-- Mamiya — Medium format
('Mamiya', 'RB67', '120', NULL, 'SLR'),
('Mamiya', 'RZ67', '120', 'Mamiya RZ', 'SLR'),
('Mamiya', 'RZ67 Pro II', '120', 'Mamiya RZ', 'SLR'),
('Mamiya', '645', '120', 'Mamiya 645', 'SLR'),
('Mamiya', '645 Pro', '120', 'Mamiya 645', 'SLR'),
('Mamiya', '645 Pro TL', '120', 'Mamiya 645', 'SLR'),
('Mamiya', '7', '120', NULL, 'Rangefinder'),
('Mamiya', '7 II', '120', NULL, 'Rangefinder'),
('Mamiya', '6', '120', NULL, 'Rangefinder'),
-- Rollei — Medium format / TLR
('Rolleiflex', '2.8F', '120', NULL, 'TLR'),
('Rolleiflex', '3.5F', '120', NULL, 'TLR'),
('Rolleiflex', '2.8GX', '120', NULL, 'TLR'),
('Rolleicord', 'V', '120', NULL, 'TLR'),
('Rollei', '35', '35mm', NULL, 'Point-and-shoot'),
('Rollei', '35 S', '35mm', NULL, 'Point-and-shoot'),
-- Yashica — SLR / TLR
('Yashica', 'Mat-124G', '120', NULL, 'TLR'),
('Yashica', 'FX-3 Super 2000', '35mm', 'Contax/Yashica', 'SLR'),
('Yashica', 'FR-I', '35mm', 'Contax/Yashica', 'SLR'),
('Yashica', 'Electro 35 GSN', '35mm', NULL, 'Rangefinder'),
('Yashica', 'T4', '35mm', NULL, 'Point-and-shoot'),
-- Ricoh
('Ricoh', 'GR1', '35mm', NULL, 'Point-and-shoot'),
('Ricoh', 'GR1v', '35mm', NULL, 'Point-and-shoot'),
('Ricoh', 'GR1s', '35mm', NULL, 'Point-and-shoot'),
('Ricoh', 'GR21', '35mm', NULL, 'Point-and-shoot'),
('Ricoh', 'XR500 Auto', '35mm', 'Pentax K', 'SLR'),
-- Fujifilm — Compact / Medium format
('Fujifilm', 'Klasse W', '35mm', NULL, 'Point-and-shoot'),
('Fujifilm', 'Klasse S', '35mm', NULL, 'Point-and-shoot'),
('Fujifilm', 'GA645', '120', NULL, 'Rangefinder'),
('Fujifilm', 'GW690III', '120', NULL, 'Rangefinder'),
('Fujifilm', 'GF670', '120', NULL, 'Rangefinder'),
('Fujifilm', 'Natura Classica', '35mm', NULL, 'Point-and-shoot'),
-- Fujifilm — Instax
('Fujifilm', 'Instax Mini 90', '35mm', NULL, 'Instant'),
('Fujifilm', 'Instax Mini 11', '35mm', NULL, 'Instant'),
('Fujifilm', 'Instax Mini Evo', '35mm', NULL, 'Instant'),
('Fujifilm', 'Instax Square SQ6', '35mm', NULL, 'Instant'),
('Fujifilm', 'Instax Wide 300', '35mm', NULL, 'Instant'),
-- Polaroid
('Polaroid', 'SX-70', '35mm', NULL, 'Instant'),
('Polaroid', 'SLR 680', '35mm', NULL, 'Instant'),
('Polaroid', 'Now', '35mm', NULL, 'Instant'),
('Polaroid', 'Now+', '35mm', NULL, 'Instant'),
('Polaroid', 'Go', '35mm', NULL, 'Instant'),
-- Voigtlander
('Voigtlander', 'Bessa R', '35mm', 'Leica M', 'Rangefinder'),
('Voigtlander', 'Bessa R2', '35mm', 'Leica M', 'Rangefinder'),
('Voigtlander', 'Bessa R3A', '35mm', 'Leica M', 'Rangefinder'),
('Voigtlander', 'Bessa R4A', '35mm', 'Leica M', 'Rangefinder'),
('Voigtlander', 'Bessa L', '35mm', 'Leica M', 'Rangefinder'),
('Voigtlander', 'Vitessa', '35mm', NULL, 'Rangefinder'),
-- Bronica — Medium format
('Bronica', 'SQ-A', '120', 'Bronica SQ', 'SLR'),
('Bronica', 'SQ-Ai', '120', 'Bronica SQ', 'SLR'),
('Bronica', 'ETR', '120', 'Bronica ETR', 'SLR'),
('Bronica', 'ETRSi', '120', 'Bronica ETR', 'SLR'),
('Bronica', 'GS-1', '120', 'Bronica GS', 'SLR'),
-- Konica
('Konica', 'Hexar AF', '35mm', NULL, 'Rangefinder'),
('Konica', 'Hexar', '35mm', NULL, 'Rangefinder'),
('Konica', 'Autoreflex T3', '35mm', 'Konica AR', 'SLR'),
('Konica', 'Big Mini', '35mm', NULL, 'Point-and-shoot'),
-- Misc
('Lomography', 'Diana F+', '120', NULL, 'Toy camera'),
('Lomography', 'Holga 120N', '120', NULL, 'Toy camera'),
('Lomography', 'LC-A', '35mm', NULL, 'Point-and-shoot'),
('Lomography', 'LC-A+', '35mm', NULL, 'Point-and-shoot'),
('Plaubel', 'Makina 67', '120', NULL, 'Rangefinder'),
('Graflex', 'Speed Graphic', '120', NULL, 'Large format'),
('Linhof', 'Technika', '120', NULL, 'Large format')
ON CONFLICT (brand, model) DO NOTHING;

-- ============================================================================
-- RPC: get catalogs (no auth required)
-- ============================================================================

-- Film catalog with optional since filter
CREATE OR REPLACE FUNCTION public.get_film_catalog(p_since TIMESTAMPTZ DEFAULT NULL)
RETURNS SETOF catalog_film_stocks
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM catalog_film_stocks
    WHERE active = true
      AND (p_since IS NULL OR updated_at > p_since)
    ORDER BY brand, model, format;
$$;

-- Camera catalog with optional since filter
CREATE OR REPLACE FUNCTION public.get_camera_catalog(p_since TIMESTAMPTZ DEFAULT NULL)
RETURNS SETOF catalog_cameras
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM catalog_cameras
    WHERE active = true
      AND (p_since IS NULL OR updated_at > p_since)
    ORDER BY brand, model;
$$;

GRANT EXECUTE ON FUNCTION public.get_film_catalog(timestamptz) TO anon;
GRANT EXECUTE ON FUNCTION public.get_camera_catalog(timestamptz) TO anon;

-- ============================================================================
-- Enrich catalogs from user data (called by upsert_user_data_v2)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enrich_catalogs_from_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add new film stocks from user's films
    INSERT INTO catalog_film_stocks (brand, model, iso, type, format)
    SELECT DISTINCT f.brand, f.model, f.iso, f.type, f.format
    FROM films f
    WHERE f.user_id = p_user_id
      AND f.brand IS NOT NULL AND f.brand != ''
      AND f.model IS NOT NULL AND f.model != ''
      AND f.iso IS NOT NULL
      AND f.type IS NOT NULL AND f.type != ''
      AND f.format IS NOT NULL AND f.format != ''
    ON CONFLICT (brand, model, format) DO NOTHING;

    -- Add new cameras from user's cameras
    INSERT INTO catalog_cameras (brand, model, format, mount)
    SELECT DISTINCT c.brand, c.model, c.format, c.mount
    FROM cameras c
    WHERE c.user_id = p_user_id
      AND c.brand IS NOT NULL AND c.brand != ''
      AND c.model IS NOT NULL AND c.model != ''
    ON CONFLICT (brand, model) DO NOTHING;
END;
$$;

-- Only callable internally from upsert_user_data_v2, not directly by clients
REVOKE EXECUTE ON FUNCTION public.enrich_catalogs_from_user_data(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enrich_catalogs_from_user_data(UUID) FROM anon;
