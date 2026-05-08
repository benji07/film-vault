export type WashiColor = "w1" | "w2" | "w3" | "w4";

const WASHI_POSITIONS: Array<{ left: string; rotate: number }> = [
	{ left: "left-[30px]", rotate: 0 },
	{ left: "right-[30px]", rotate: 0 },
	{ left: "left-[60%]", rotate: 0 },
	{ left: "left-6", rotate: 0 },
];

const WASHI_COLORS: WashiColor[] = ["w1", "w2", "w3", "w4"];

// Rotations désactivées dans le thème monochrome moderne — l'API est conservée
// pour ne pas casser les callers existants pendant la migration incrémentale.
export function pickRotation(_index: number, _intensity: "lively" | "subtle" = "lively"): string {
	return "";
}

export function pickWashiPosition(index: number): { left: string; rotate: number } {
	return WASHI_POSITIONS[index % WASHI_POSITIONS.length] ?? WASHI_POSITIONS[0]!;
}

export function pickWashiColor(index: number, offset = 0): WashiColor {
	return WASHI_COLORS[(index + offset) % WASHI_COLORS.length] ?? "w1";
}
