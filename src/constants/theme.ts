export const T = {
	bg: "#0D0D0D",
	surface: "#1A1A1A",
	surfaceAlt: "#242424",
	card: "#1E1E1E",
	cardHover: "#252525",
	border: "#2A2A2A",
	borderLight: "#333",
	text: "#E8E4DF",
	textSec: "#A09A92",
	textMuted: "#827D75",
	accent: "#C4392D",
	accentHover: "#D44435",
	accentSoft: "rgba(196,57,45,0.12)",
	orange: "#E07940",
	orangeSoft: "rgba(224,121,64,0.12)",
	amber: "#D4A858",
	amberSoft: "rgba(212,168,88,0.10)",
	green: "#4A8C5C",
	greenSoft: "rgba(74,140,92,0.12)",
	blue: "#5B7FA5",
	blueSoft: "rgba(91,127,165,0.10)",
} as const;

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
