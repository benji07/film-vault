import { FILM_CATALOG } from "@/constants/films";

export const filmName = (film) => {
  if (film.brand && film.model) return `${film.brand} ${film.model}`;
  if (film.model) return film.model;
  const cat = FILM_CATALOG.find(c => c.id === film.catalogId);
  return cat?.name || film.customName || "Pellicule";
};

export const filmBrand = (film) =>
  film.brand || FILM_CATALOG.find(c => c.id === film.catalogId)?.brand || "?";

export const filmType = (film) =>
  film.type || FILM_CATALOG.find(c => c.id === film.catalogId)?.type || "?";

export const filmIso = (film) =>
  film.iso || FILM_CATALOG.find(c => c.id === film.catalogId)?.iso || "?";
