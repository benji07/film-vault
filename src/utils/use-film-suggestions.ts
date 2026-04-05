import { useMemo } from "react";
import { FILM_CATALOG } from "@/constants/film-catalog";
import type { Film } from "@/types";

interface FilmData {
	iso: number;
	type: string;
	format: string;
}

export function useFilmSuggestions(films: Film[]) {
	const brands = useMemo(() => {
		const set = new Set<string>();
		for (const f of films) {
			if (f.brand) set.add(f.brand.trim());
		}
		for (const c of FILM_CATALOG) {
			set.add(c.brand);
		}
		return [...set].sort((a, b) => a.localeCompare(b));
	}, [films]);

	const modelsForBrand = useMemo(() => {
		return (brand: string): string[] => {
			const lowerBrand = brand.trim().toLowerCase();
			const set = new Set<string>();
			for (const f of films) {
				if (f.brand?.trim().toLowerCase() === lowerBrand && f.model) {
					set.add(f.model.trim());
				}
			}
			for (const c of FILM_CATALOG) {
				if (c.brand.toLowerCase() === lowerBrand) {
					set.add(c.model);
				}
			}
			return [...set].sort((a, b) => a.localeCompare(b));
		};
	}, [films]);

	const filmDataFor = useMemo(() => {
		return (brand: string, model: string): FilmData | undefined => {
			const lowerBrand = brand.trim().toLowerCase();
			const lowerModel = model.trim().toLowerCase();

			// Search user stock first (priority)
			const fromStock = films.find(
				(f) => f.brand?.toLowerCase() === lowerBrand && f.model?.toLowerCase() === lowerModel,
			);
			if (fromStock?.iso) {
				return {
					iso: fromStock.iso,
					type: fromStock.type || "Couleur",
					format: fromStock.format || "35mm",
				};
			}

			// Fallback to catalog
			const fromCatalog = FILM_CATALOG.find(
				(c) => c.brand.toLowerCase() === lowerBrand && c.model.toLowerCase() === lowerModel,
			);
			if (fromCatalog) {
				return {
					iso: fromCatalog.iso,
					type: fromCatalog.type,
					format: fromCatalog.format,
				};
			}

			return undefined;
		};
	}, [films]);

	return { brands, modelsForBrand, filmDataFor };
}
