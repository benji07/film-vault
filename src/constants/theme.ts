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

	// Legacy aliases — kept so non-refonted screens keep compiling.
	// These map onto the closest vintage equivalent.
	bg: "var(--color-paper)",
	surface: "var(--color-paper-card)",
	surfaceAlt: "var(--color-paper-dark)",
	card: "var(--color-paper-card)",
	cardHover: "var(--color-paper-dark)",
	border: "var(--color-ink-faded)",
	borderLight: "var(--color-paper-dark)",
	text: "var(--color-ink)",
	textSec: "var(--color-ink-soft)",
	textMuted: "var(--color-ink-faded)",
	accent: "var(--color-kodak-red)",
	accentHover: "#a02e23",
	accentSoft: "rgba(184, 54, 42, 0.12)",
	orange: "var(--color-washi-1)",
	orangeSoft: "rgba(212, 165, 116, 0.18)",
	amber: "var(--color-kodak-yellow)",
	amberSoft: "rgba(232, 168, 24, 0.14)",
	green: "var(--color-kodak-teal)",
	greenSoft: "rgba(45, 74, 50, 0.14)",
	blue: "var(--color-washi-4)",
	blueSoft: "rgba(155, 181, 200, 0.18)",
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
	// Legacy aliases
	display: "var(--font-caveat)",
	body: "var(--font-cormorant)",
	mono: "var(--font-typewriter)",
} as const;
