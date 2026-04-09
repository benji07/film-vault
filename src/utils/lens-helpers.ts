import type { Lens } from "@/types";

export function lensDisplayName(lens: Lens | undefined): string {
	if (!lens) return "";
	const brandModel = [lens.brand, lens.model].filter(Boolean).join(" ");
	if (lens.nickname) return `${lens.nickname} (${brandModel})`;
	return brandModel;
}

export function lensFocalLabel(lens: Lens): string {
	if (!lens.focalLengthMin) return "";
	if (lens.isZoom && lens.focalLengthMax && lens.focalLengthMax !== lens.focalLengthMin) {
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
