import type { FilmFormat, FilmType } from "@/types";

export interface FilmCatalogEntry {
	brand: string;
	model: string;
	iso: number;
	type: FilmType;
	format: FilmFormat;
}

export const FILM_CATALOG: FilmCatalogEntry[] = [
	// Kodak — Couleur
	{ brand: "Kodak", model: "Portra 160", iso: 160, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Portra 160", iso: 160, type: "Couleur", format: "120" },
	{ brand: "Kodak", model: "Portra 400", iso: 400, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Portra 400", iso: 400, type: "Couleur", format: "120" },
	{ brand: "Kodak", model: "Portra 800", iso: 800, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Portra 800", iso: 800, type: "Couleur", format: "120" },
	{ brand: "Kodak", model: "Gold 200", iso: 200, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "ColorPlus 200", iso: 200, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Ultramax 400", iso: 400, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Ektar 100", iso: 100, type: "Couleur", format: "35mm" },
	{ brand: "Kodak", model: "Ektar 100", iso: 100, type: "Couleur", format: "120" },
	// Kodak — N&B
	{ brand: "Kodak", model: "Tri-X 400", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Kodak", model: "Tri-X 400", iso: 400, type: "N&B", format: "120" },
	{ brand: "Kodak", model: "T-Max 100", iso: 100, type: "N&B", format: "35mm" },
	{ brand: "Kodak", model: "T-Max 100", iso: 100, type: "N&B", format: "120" },
	{ brand: "Kodak", model: "T-Max 400", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Kodak", model: "T-Max 400", iso: 400, type: "N&B", format: "120" },
	// Kodak — ECN-2
	{ brand: "Kodak", model: "Vision3 50D", iso: 50, type: "ECN-2", format: "35mm" },
	{ brand: "Kodak", model: "Vision3 250D", iso: 250, type: "ECN-2", format: "35mm" },
	{ brand: "Kodak", model: "Vision3 500T", iso: 500, type: "ECN-2", format: "35mm" },

	// Ilford — N&B
	{ brand: "Ilford", model: "HP5 Plus", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "HP5 Plus", iso: 400, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "FP4 Plus", iso: 125, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "FP4 Plus", iso: 125, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "Delta 100", iso: 100, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "Delta 100", iso: 100, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "Delta 400", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "Delta 400", iso: 400, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "Delta 3200", iso: 3200, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "Delta 3200", iso: 3200, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "Pan F Plus 50", iso: 50, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "Pan F Plus 50", iso: 50, type: "N&B", format: "120" },
	{ brand: "Ilford", model: "XP2 Super", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Ilford", model: "XP2 Super", iso: 400, type: "N&B", format: "120" },

	// Fujifilm — Couleur
	{ brand: "Fujifilm", model: "Superia 400", iso: 400, type: "Couleur", format: "35mm" },
	{ brand: "Fujifilm", model: "C200", iso: 200, type: "Couleur", format: "35mm" },
	// Fujifilm — Diapo
	{ brand: "Fujifilm", model: "Velvia 50", iso: 50, type: "Diapo", format: "35mm" },
	{ brand: "Fujifilm", model: "Velvia 50", iso: 50, type: "Diapo", format: "120" },
	{ brand: "Fujifilm", model: "Velvia 100", iso: 100, type: "Diapo", format: "35mm" },
	{ brand: "Fujifilm", model: "Velvia 100", iso: 100, type: "Diapo", format: "120" },
	{ brand: "Fujifilm", model: "Provia 100F", iso: 100, type: "Diapo", format: "35mm" },
	{ brand: "Fujifilm", model: "Provia 100F", iso: 100, type: "Diapo", format: "120" },
	// Fujifilm — N&B
	{ brand: "Fujifilm", model: "Acros II 100", iso: 100, type: "N&B", format: "35mm" },
	{ brand: "Fujifilm", model: "Acros II 100", iso: 100, type: "N&B", format: "120" },
	// Fujifilm — Instant
	{ brand: "Fujifilm", model: "Instax Mini", iso: 800, type: "Couleur", format: "Instax Mini" },
	{ brand: "Fujifilm", model: "Instax Mini Monochrome", iso: 800, type: "N&B", format: "Instax Mini" },
	{ brand: "Fujifilm", model: "Instax Square", iso: 800, type: "Couleur", format: "Instax Square" },
	{ brand: "Fujifilm", model: "Instax Square Monochrome", iso: 800, type: "N&B", format: "Instax Square" },
	{ brand: "Fujifilm", model: "Instax Wide", iso: 800, type: "Couleur", format: "Instax Wide" },

	// Polaroid
	{ brand: "Polaroid", model: "Color SX-70", iso: 160, type: "Couleur", format: "Polaroid SX-70" },
	{ brand: "Polaroid", model: "B&W SX-70", iso: 160, type: "N&B", format: "Polaroid SX-70" },
	{ brand: "Polaroid", model: "Color 600", iso: 640, type: "Couleur", format: "Polaroid 600" },
	{ brand: "Polaroid", model: "B&W 600", iso: 640, type: "N&B", format: "Polaroid 600" },
	{ brand: "Polaroid", model: "Color I-Type", iso: 640, type: "Couleur", format: "Polaroid I-Type" },
	{ brand: "Polaroid", model: "B&W I-Type", iso: 640, type: "N&B", format: "Polaroid I-Type" },
	{ brand: "Polaroid", model: "Color Go", iso: 640, type: "Couleur", format: "Polaroid Go" },
	{ brand: "Polaroid", model: "B&W Go", iso: 640, type: "N&B", format: "Polaroid Go" },

	// CineStill
	{ brand: "CineStill", model: "800T", iso: 800, type: "Couleur", format: "35mm" },
	{ brand: "CineStill", model: "800T", iso: 800, type: "Couleur", format: "120" },
	{ brand: "CineStill", model: "50D", iso: 50, type: "Couleur", format: "35mm" },
	{ brand: "CineStill", model: "50D", iso: 50, type: "Couleur", format: "120" },
	{ brand: "CineStill", model: "BwXX", iso: 250, type: "N&B", format: "35mm" },

	// Lomography
	{ brand: "Lomography", model: "Color Negative 100", iso: 100, type: "Couleur", format: "35mm" },
	{ brand: "Lomography", model: "Color Negative 400", iso: 400, type: "Couleur", format: "35mm" },
	{ brand: "Lomography", model: "Color Negative 800", iso: 800, type: "Couleur", format: "35mm" },
	{ brand: "Lomography", model: "Lady Grey", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Lomography", model: "Redscale XR 50-200", iso: 100, type: "Couleur", format: "35mm" },

	// Foma
	{ brand: "Foma", model: "Fomapan 100", iso: 100, type: "N&B", format: "35mm" },
	{ brand: "Foma", model: "Fomapan 100", iso: 100, type: "N&B", format: "120" },
	{ brand: "Foma", model: "Fomapan 200", iso: 200, type: "N&B", format: "35mm" },
	{ brand: "Foma", model: "Fomapan 200", iso: 200, type: "N&B", format: "120" },
	{ brand: "Foma", model: "Fomapan 400", iso: 400, type: "N&B", format: "35mm" },
	{ brand: "Foma", model: "Fomapan 400", iso: 400, type: "N&B", format: "120" },

	// Rollei
	{ brand: "Rollei", model: "RPX 25", iso: 25, type: "N&B", format: "35mm" },
	{ brand: "Rollei", model: "RPX 100", iso: 100, type: "N&B", format: "35mm" },
	{ brand: "Rollei", model: "RPX 400", iso: 400, type: "N&B", format: "35mm" },
];
