export const T = {
	bg: "var(--color-bg)",
	surface: "var(--color-surface)",
	surfaceAlt: "var(--color-surface-alt)",
	card: "var(--color-card)",
	cardHover: "var(--color-card-hover)",
	border: "var(--color-border)",
	borderLight: "var(--color-border-light)",
	text: "var(--color-text-primary)",
	textSec: "var(--color-text-sec)",
	textMuted: "var(--color-text-muted)",
	accent: "var(--color-accent)",
	accentHover: "var(--color-accent-hover)",
	accentSoft: "var(--color-accent-soft)",
	orange: "var(--color-orange)",
	orangeSoft: "var(--color-orange-soft)",
	amber: "var(--color-amber)",
	amberSoft: "var(--color-amber-soft)",
	green: "var(--color-green)",
	greenSoft: "var(--color-green-soft)",
	blue: "var(--color-blue)",
	blueSoft: "var(--color-blue-soft)",
} as const;

/** Returns a CSS color-mix() expression for a CSS variable with the given opacity (0–1). */
export function alpha(cssVar: string, opacity: number): string {
	return `color-mix(in srgb, ${cssVar} ${Math.round(opacity * 100)}%, transparent)`;
}

export const FILM_TYPE_COLORS: Record<string, string> = {
	Couleur: T.amber,
	"N&B": T.textSec,
	Diapo: T.blue,
	"ECN-2": T.accent,
	Instant: T.green,
};

export const FONT = {
	display: "'Instrument Serif', serif",
	body: "'DM Sans', sans-serif",
	mono: "'DM Mono', monospace",
} as const;
