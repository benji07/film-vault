import { useMemo } from "react";
import type { Film } from "@/types";
import { getFilmCatalog } from "@/utils/catalog";
import { normalizeBrand } from "@/utils/film-helpers";

interface FilmData {
	iso: number;
	type: string;
	format: string | null;
}

export function useFilmSuggestions(films: Film[]) {
	const brands = useMemo(() => {
		const set = new Set<string>();
		for (const f of films) {
			if (f.brand) set.add(normalizeBrand(f.brand));
		}
		for (const c of getFilmCatalog()) {
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
			for (const c of getFilmCatalog()) {
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

			const stockMatches = films.filter(
				(f) => f.brand?.toLowerCase() === lowerBrand && f.model?.toLowerCase() === lowerModel,
			);
			const catalogMatches = getFilmCatalog().filter(
				(c) => c.brand.toLowerCase() === lowerBrand && c.model.toLowerCase() === lowerModel,
			);

			const formats = new Set<string>();
			for (const f of stockMatches) {
				if (f.format) formats.add(f.format);
			}
			for (const c of catalogMatches) {
				formats.add(c.format);
			}

			// Prefer stock data for iso/type (user's recorded values), fallback to catalog
			const fromStock = stockMatches.find((f) => f.iso);
			if (fromStock?.iso) {
				return {
					iso: fromStock.iso,
					type: fromStock.type || "Couleur",
					format: formats.size === 1 ? fromStock.format || [...formats][0] || null : null,
				};
			}

			const fromCatalog = catalogMatches[0];
			if (fromCatalog) {
				return {
					iso: fromCatalog.iso,
					type: fromCatalog.type,
					format: formats.size === 1 ? fromCatalog.format : null,
				};
			}

			return undefined;
		};
	}, [films]);

	return { brands, modelsForBrand, filmDataFor };
}
