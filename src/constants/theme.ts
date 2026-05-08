export const T = {
	// Surfaces — neutre clair
	bg: "var(--color-bg)",
	surface: "var(--color-surface)",
	surface2: "var(--color-surface-2)",
	line: "var(--color-line)",

	// Texte
	text: "var(--color-text)",
	text2: "var(--color-text-2)",
	text3: "var(--color-text-3)",

	// Accent rouge
	accent: "var(--color-accent)",
	accentHover: "var(--color-accent-hover)",
	accentSoft: "var(--color-accent-soft)",

	// Earth tones — palette sémantique désaturée
	sage: "var(--color-sage)",
	sageSoft: "var(--color-sage-soft)",
	amber: "var(--color-amber)",
	amberSoft: "var(--color-amber-soft)",
	smoke: "var(--color-smoke)",
	smokeSoft: "var(--color-smoke-soft)",
	terracotta: "var(--color-terracotta)",
	terracottaSoft: "var(--color-terracotta-soft)",

	// Ramp gris pour fills d'états
	fill1: "var(--color-fill-1)",
	fill2: "var(--color-fill-2)",

	// DEPRECATED — alias legacy maintenus pour migration incrémentale.
	// Tous re-aimés vers la palette monochrome.
	paper: "var(--color-bg)",
	paperCard: "var(--color-surface)",
	paperDark: "var(--color-surface-2)",
	ink: "var(--color-text)",
	inkSoft: "var(--color-text-2)",
	inkFaded: "var(--color-text-3)",
	yellow: "var(--color-amber)",
	yellowDeep: "var(--color-amber)",
	gold: "var(--color-amber)",
	red: "var(--color-accent)",
	teal: "var(--color-sage)",
	black: "var(--color-text)",
	w1: "var(--color-amber)",
	w2: "var(--color-sage)",
	w3: "var(--color-terracotta)",
	w4: "var(--color-smoke)",
	textSec: "var(--color-text-2)",
	textMuted: "var(--color-text-3)",
	orange: "var(--color-terracotta)",
	green: "var(--color-sage)",
	blue: "var(--color-smoke)",
} as const;

/** Returns a CSS color-mix() expression for a CSS variable with the given opacity (0–1). */
export function alpha(cssVar: string, opacity: number): string {
	return `color-mix(in srgb, ${cssVar} ${Math.round(opacity * 100)}%, transparent)`;
}

const TILE_RAMP = ["#3a3a38", "#52524f", "#6b6b67", "#83837e", "#9c9c97"] as const;
const TILE_FALLBACK = "#6b6b67";

/** Deterministic muted-gray tile color derived from a brand name. */
export function tileColor(brand?: string): string {
	if (!brand) return TILE_FALLBACK;
	let h = 0;
	for (let i = 0; i < brand.length; i++) h = ((h << 5) - h + brand.charCodeAt(i)) | 0;
	return TILE_RAMP[Math.abs(h) % TILE_RAMP.length] ?? TILE_FALLBACK;
}

/** Returns the earth-tone CSS variable for a film type (used for state badges,
 *  type chips, BrandTile background). Falls back to a neutral text-2 when the
 *  type is unknown so the result is always a valid CSS color. */
export function typeColor(type?: string): string {
	switch (type) {
		case "Couleur":
			return "var(--color-amber)";
		case "N&B":
			return "var(--color-text-2)";
		case "Diapo":
			return "var(--color-smoke)";
		case "ECN-2":
			return "var(--color-terracotta)";
		default:
			return "var(--color-text-2)";
	}
}

/** Soft variant of {@link typeColor} for fills/backgrounds that need to stay
 *  on a light surface without overwhelming the rest of the UI. */
export function typeColorSoft(type?: string): string {
	switch (type) {
		case "Couleur":
			return "var(--color-amber-soft)";
		case "N&B":
			return "var(--color-fill-2)";
		case "Diapo":
			return "var(--color-smoke-soft)";
		case "ECN-2":
			return "var(--color-terracotta-soft)";
		default:
			return "var(--color-fill-2)";
	}
}

/** 1-2 letter monogram extracted from a brand name (e.g., "Kodak" → "KO", "Cinestill" → "CI"). */
export function monogram(brand?: string): string {
	if (!brand) return "·";
	const cleaned = brand.trim();
	if (!cleaned) return "·";
	const words = cleaned.split(/\s+/).filter(Boolean);
	if (words.length >= 2) {
		const a = words[0]?.[0] ?? "";
		const b = words[1]?.[0] ?? "";
		return (a + b).toUpperCase();
	}
	return cleaned.slice(0, cleaned.length === 1 ? 1 : 2).toUpperCase();
}

/** Per-type color used for badges, chips and `ActiveRollCard` accents.
 *  Earth-tone palette aligned with {@link typeColor}. */
export const FILM_TYPE_COLORS: Record<string, string> = {
	Couleur: T.amber,
	"N&B": T.text2,
	Diapo: T.smoke,
	"ECN-2": T.terracotta,
};

/** DEPRECATED — variants no longer drive distinct visuals. Kept as a typed alias
 *  so existing callers compile during the migration. */
export type FilmLabelVariant = "color" | "bw" | "slide" | "tungsten";

export function filmTypeToVariant(type: string | undefined): FilmLabelVariant {
	switch (type) {
		case "N&B":
			return "bw";
		case "Diapo":
			return "slide";
		case "ECN-2":
			return "tungsten";
		default:
			return "color";
	}
}

export const FONT = {
	caveat: "var(--font-sans)",
	cormorant: "var(--font-sans)",
	typewriter: "var(--font-sans)",
	archivo: "var(--font-sans)",
	archivoBlack: "var(--font-sans)",
	sans: "var(--font-sans)",
} as const;
