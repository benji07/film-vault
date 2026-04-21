import { FILM_CATALOG } from "@/constants/film-catalog";
import type { Film } from "@/types";

const canonicalBrands: Map<string, string> = new Map();
for (const entry of FILM_CATALOG) {
	canonicalBrands.set(entry.brand.toLowerCase(), entry.brand);
}

export const normalizeBrand = (brand: string): string => {
	const trimmed = brand.trim();
	const key = trimmed.toLowerCase();
	const canonical = canonicalBrands.get(key);
	if (canonical) return canonical;
	// For non-catalog brands, remember the first spelling seen as canonical
	canonicalBrands.set(key, trimmed);
	return trimmed;
};

export const filmName = (film: Film): string => {
	if (film.brand && film.model) return `${normalizeBrand(film.brand)} ${film.model}`;
	if (film.model) return film.model;
	return film.customName || "Pellicule";
};

export const filmBrand = (film: Film): string => (film.brand ? normalizeBrand(film.brand) : "?");

export const filmType = (film: Film): string => film.type || "?";

export const filmIso = (film: Film): number | string => film.iso || "?";

export const collectAllTags = (films: Film[]): string[] => {
	const canonical = new Map<string, string>();
	for (const f of films) {
		if (!f.tags) continue;
		for (const tag of f.tags) {
			const key = tag.toLowerCase();
			if (!canonical.has(key)) canonical.set(key, tag);
		}
	}
	return Array.from(canonical.values()).sort((a, b) => a.localeCompare(b));
};
