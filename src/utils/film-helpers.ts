import { FILM_CATALOG } from "@/constants/film-catalog";
import type { Film } from "@/types";

const canonicalBrands: Map<string, string> = new Map();
for (const entry of FILM_CATALOG) {
	canonicalBrands.set(entry.brand.toLowerCase(), entry.brand);
}

export const normalizeBrand = (brand: string): string => {
	return canonicalBrands.get(brand.trim().toLowerCase()) || brand.trim();
};

export const filmName = (film: Film): string => {
	if (film.brand && film.model) return `${normalizeBrand(film.brand)} ${film.model}`;
	if (film.model) return film.model;
	return film.customName || "Pellicule";
};

export const filmBrand = (film: Film): string => (film.brand ? normalizeBrand(film.brand) : "?");

export const filmType = (film: Film): string => film.type || "?";

export const filmIso = (film: Film): number | string => film.iso || "?";
