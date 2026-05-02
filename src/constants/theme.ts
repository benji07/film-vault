export const T = {
	// Surfaces — papier ivoire chaud
	paper: "var(--color-paper)",
	paperCard: "var(--color-paper-card)",
	paperDark: "var(--color-paper-dark)",

	// Encres — brun chocolat
	ink: "var(--color-ink)",
	inkSoft: "var(--color-ink-soft)",
	inkFaded: "var(--color-ink-faded)",

	// Couleurs Kodak Gold vintage 80s
	yellow: "var(--color-kodak-yellow)",
	yellowDeep: "var(--color-kodak-yellow-deep)",
	gold: "var(--color-kodak-gold)",
	red: "var(--color-kodak-red)",
	teal: "var(--color-kodak-teal)",
	black: "var(--color-ink)",

	// Washi tapes (rubans décoratifs)
	w1: "var(--color-washi-1)",
	w2: "var(--color-washi-2)",
	w3: "var(--color-washi-3)",
	w4: "var(--color-washi-4)",

	// Legacy aliases still used by a handful of CSS-in-JS spots
	// (CameraDetail/ActiveRoll/StockHierarchy badges, EditModal warnings,
	// expiration helpers). Kept until those callers migrate to Tailwind.
	textSec: "var(--color-ink-soft)",
	textMuted: "var(--color-ink-faded)",
	accent: "var(--color-kodak-red)",
	orange: "var(--color-washi-1)",
	amber: "var(--color-kodak-yellow)",
	green: "var(--color-kodak-teal)",
	blue: "var(--color-washi-4)",
} as const;

/** Returns a CSS color-mix() expression for a CSS variable with the given opacity (0–1). */
export function alpha(cssVar: string, opacity: number): string {
	return `color-mix(in srgb, ${cssVar} ${Math.round(opacity * 100)}%, transparent)`;
}

export const FILM_TYPE_COLORS: Record<string, string> = {
	Couleur: T.yellow,
	"N&B": T.paperDark,
	Diapo: T.teal,
	"ECN-2": T.red,
};

/** Maps a Film.type onto one of the four FilmLabel packaging variants. */
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
	caveat: "var(--font-caveat)",
	cormorant: "var(--font-cormorant)",
	typewriter: "var(--font-typewriter)",
	archivo: "var(--font-archivo)",
	archivoBlack: "var(--font-archivo-black)",
} as const;
