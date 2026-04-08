import type { StopIncrement } from "@/types";

type StopType = "full" | "half" | "third";

// Full stops + half stops + third stops, fast to slow
export const SHUTTER_SPEEDS = [
	// 1/8000
	"1/8000",
	"1/6400",
	"1/6000",
	// 1/4000
	"1/4000",
	"1/3200",
	"1/3000",
	// 1/2000
	"1/2000",
	"1/1600",
	"1/1500",
	// 1/1000
	"1/1000",
	"1/800",
	"1/750",
	// 1/500
	"1/500",
	"1/400",
	"1/350",
	// 1/250
	"1/250",
	"1/200",
	"1/180",
	// 1/125
	"1/125",
	"1/100",
	"1/90",
	// 1/60
	"1/60",
	"1/50",
	"1/45",
	// 1/30
	"1/30",
	"1/25",
	"1/20",
	// 1/15
	"1/15",
	"1/13",
	"1/10",
	// 1/8
	"1/8",
	"1/6",
	"1/5",
	// 1/4
	"1/4",
	"1/3",
	"1/2.5",
	// 1/2
	"1/2",
	"1/1.5",
	"1/1.3",
	// 1s and longer
	"1s",
	"1.5s",
	"2s",
	"3s",
	"4s",
	"6s",
	"8s",
	"10s",
	"15s",
	"20s",
	"30s",
	"B",
];

// Full stops + half stops + third stops, wide to narrow
export const APERTURES = [
	"f/0.95",
	"f/1",
	"f/1.1",
	"f/1.2",
	"f/1.4",
	"f/1.6",
	"f/1.8",
	"f/2",
	"f/2.2",
	"f/2.5",
	"f/2.8",
	"f/3.2",
	"f/3.5",
	"f/4",
	"f/4.5",
	"f/5",
	"f/5.6",
	"f/6.3",
	"f/7.1",
	"f/8",
	"f/9",
	"f/10",
	"f/11",
	"f/13",
	"f/14",
	"f/16",
	"f/18",
	"f/20",
	"f/22",
	"f/25",
	"f/29",
	"f/32",
	"f/36",
	"f/40",
	"f/45",
	"f/64",
];

// Stop type for each shutter speed — pattern: [full, half, third] repeating per group
const SPEED_STOP_TYPES: StopType[] = SHUTTER_SPEEDS.map((_, i) => {
	if (i >= SHUTTER_SPEEDS.length - 12) {
		// "1s" and longer: simplified — treat as full/half/third in groups of 3
		const longIdx = i - (SHUTTER_SPEEDS.length - 12);
		return longIdx % 3 === 0 ? "full" : longIdx % 3 === 1 ? "half" : "third";
	}
	const mod = i % 3;
	return mod === 0 ? "full" : mod === 1 ? "half" : "third";
});

// Stop type for each aperture — pattern: [full, half, third] repeating
// Exception: f/0.95 is a third stop, then normal pattern from f/1
const APERTURE_STOP_TYPES: StopType[] = APERTURES.map((_, i) => {
	if (i === 0) return "third"; // f/0.95
	const mod = (i - 1) % 3;
	return mod === 0 ? "full" : mod === 1 ? "half" : "third";
});

function matchesStops(stopType: StopType, stops: StopIncrement): boolean {
	if (stops === "1") return stopType === "full";
	if (stops === "1/2") return stopType === "full" || stopType === "half";
	return true; // "1/3" includes all
}

export interface ExposureConfig {
	min?: string | null;
	max?: string | null;
	stops?: StopIncrement | null;
}

export function filterSpeeds(config?: ExposureConfig | null): string[] {
	if (!config) return SHUTTER_SPEEDS;
	let result = SHUTTER_SPEEDS.map((s, i) => ({ value: s, stopType: SPEED_STOP_TYPES[i] as StopType }));
	if (config.stops) {
		result = result.filter((s) => matchesStops(s.stopType, config.stops!));
	}
	if (config.min || config.max) {
		const minIdx = config.min ? SHUTTER_SPEEDS.indexOf(config.min) : 0;
		const maxIdx = config.max ? SHUTTER_SPEEDS.indexOf(config.max) : SHUTTER_SPEEDS.length - 1;
		if (minIdx >= 0 && maxIdx >= 0) {
			const lo = Math.min(minIdx, maxIdx);
			const hi = Math.max(minIdx, maxIdx);
			result = result.filter((s) => {
				const idx = SHUTTER_SPEEDS.indexOf(s.value);
				return idx >= lo && idx <= hi;
			});
		}
	}
	return result.map((s) => s.value);
}

export function filterApertures(config?: ExposureConfig | null): string[] {
	if (!config) return APERTURES;
	let result = APERTURES.map((a, i) => ({ value: a, stopType: APERTURE_STOP_TYPES[i] as StopType }));
	if (config.stops) {
		result = result.filter((a) => matchesStops(a.stopType, config.stops!));
	}
	if (config.min || config.max) {
		const minIdx = config.min ? APERTURES.indexOf(config.min) : 0;
		const maxIdx = config.max ? APERTURES.indexOf(config.max) : APERTURES.length - 1;
		if (minIdx >= 0 && maxIdx >= 0) {
			const lo = Math.min(minIdx, maxIdx);
			const hi = Math.max(minIdx, maxIdx);
			result = result.filter((a) => {
				const idx = APERTURES.indexOf(a.value);
				return idx >= lo && idx <= hi;
			});
		}
	}
	return result.map((a) => a.value);
}
