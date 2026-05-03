export type WashiColor = "w1" | "w2" | "w3" | "w4";

const ROTATIONS_LIVELY = [
	"-rotate-[0.3deg]",
	"rotate-[0.25deg]",
	"rotate-[0.5deg]",
	"-rotate-[0.4deg]",
	"rotate-[0.3deg]",
];

const ROTATIONS_SUBTLE = ["-rotate-[0.2deg]", "rotate-[0.15deg]", "rotate-[0.3deg]", "-rotate-[0.25deg]"];

const WASHI_POSITIONS: Array<{ left: string; rotate: number }> = [
	{ left: "left-[30px]", rotate: -2 },
	{ left: "right-[30px]", rotate: 2 },
	{ left: "left-[60%]", rotate: -1 },
	{ left: "left-6", rotate: 3 },
];

const WASHI_COLORS: WashiColor[] = ["w1", "w2", "w3", "w4"];

export function pickRotation(index: number, intensity: "lively" | "subtle" = "lively"): string {
	const set = intensity === "subtle" ? ROTATIONS_SUBTLE : ROTATIONS_LIVELY;
	return set[index % set.length] ?? "";
}

export function pickWashiPosition(index: number): { left: string; rotate: number } {
	return WASHI_POSITIONS[index % WASHI_POSITIONS.length] ?? WASHI_POSITIONS[0]!;
}

export function pickWashiColor(index: number, offset = 0): WashiColor {
	return WASHI_COLORS[(index + offset) % WASHI_COLORS.length] ?? "w1";
}
