import type { Camera, Lens } from "@/types";

/**
 * Keep only lenses whose mount matches the camera's mount. If the camera has no
 * mount defined, no filtering is applied (returns the original list).
 *
 * `preserveId` lets callers ensure the currently-selected lens stays in the
 * result even if its mount doesn't match (or is unset), so that the Select
 * value never points to a lens that's been filtered out of the options.
 */
export function filterLensesByMount(
	lenses: Lens[],
	camera: Camera | null | undefined,
	preserveId?: string | null,
): Lens[] {
	const mount = camera?.mount?.trim();
	if (!mount) return lenses;
	return lenses.filter((l) => (l.mount?.trim() ?? "") === mount || (preserveId != null && l.id === preserveId));
}

/**
 * Returns the camera's sole compatible (non-sold) lens, or null if there are
 * zero or multiple options. Used to auto-fill lens pickers when the choice is
 * unambiguous.
 */
export function pickSoleCompatibleLens(lenses: Lens[], camera: Camera | null | undefined): Lens | null {
	if (!camera?.mount?.trim()) return null;
	const compatible = filterLensesByMount(lenses, camera).filter((l) => !l.soldAt);
	return compatible.length === 1 ? (compatible[0] ?? null) : null;
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
