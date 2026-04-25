import type { Camera, Lens } from "@/types";

/**
 * Keep only lenses whose mount matches the camera's mount. If the camera has no
 * mount defined, no filtering is applied (returns the original list).
 */
export function filterLensesByMount(lenses: Lens[], camera: Camera | null | undefined): Lens[] {
	const mount = camera?.mount?.trim();
	if (!mount) return lenses;
	return lenses.filter((l) => (l.mount?.trim() ?? "") === mount);
}

export function lensDisplayName(lens: Lens | undefined): string {
	if (!lens) return "";
	const brandModel = [lens.brand, lens.model].filter(Boolean).join(" ");
	if (lens.nickname) return `${lens.nickname} (${brandModel})`;
	return brandModel;
}

export function lensFocalLabel(lens: Lens): string {
	if (!lens.focalLengthMin) return "";
	if (lens.isZoom && lens.focalLengthMax && lens.focalLengthMax > lens.focalLengthMin) {
		return `${lens.focalLengthMin}-${lens.focalLengthMax}mm`;
	}
	return `${lens.focalLengthMin}mm`;
}

export function lensApertureLabel(lens: Lens): string {
	if (!lens.maxApertureAtMin) return "";
	if (lens.maxApertureAtMax && lens.maxApertureAtMax !== lens.maxApertureAtMin) {
		return `${lens.maxApertureAtMin}-${lens.maxApertureAtMax}`;
	}
	return lens.maxApertureAtMin;
}
