import { FILM_CATALOG } from "@/constants/films";
import type { Film } from "@/types";

export const filmName = (film: Film): string => {
	if (film.brand && film.model) return `${film.brand} ${film.model}`;
	if (film.model) return film.model;
	const cat = FILM_CATALOG.find((c) => c.id === film.catalogId);
	return cat?.name || film.customName || "Pellicule";
};

export const filmBrand = (film: Film): string =>
	film.brand || FILM_CATALOG.find((c) => c.id === film.catalogId)?.brand || "?";

export const filmType = (film: Film): string =>
	film.type || FILM_CATALOG.find((c) => c.id === film.catalogId)?.type || "?";

export const filmIso = (film: Film): number | string =>
	film.iso || FILM_CATALOG.find((c) => c.id === film.catalogId)?.iso || "?";
