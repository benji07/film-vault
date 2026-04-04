import type { Film } from "@/types";

export const filmName = (film: Film): string => {
	if (film.brand && film.model) return `${film.brand} ${film.model}`;
	if (film.model) return film.model;
	return film.customName || "Pellicule";
};

export const filmBrand = (film: Film): string => film.brand || "?";

export const filmType = (film: Film): string => film.type || "?";

export const filmIso = (film: Film): number | string => film.iso || "?";
