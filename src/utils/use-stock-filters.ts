import { useEffect, useMemo, useState } from "react";
import type { Film } from "@/types";
import { collectAllTags, filmName, normalizeBrand } from "@/utils/film-helpers";

export type SortOption =
	| "name-asc"
	| "name-desc"
	| "added-desc"
	| "added-asc"
	| "exp-asc"
	| "exp-desc"
	| "price-asc"
	| "price-desc"
	| "iso-asc"
	| "iso-desc";

export interface StockFilters {
	format: string;
	type: string;
	brands: string[];
	isoValues: number[];
	tags: string[];
}

interface ActiveFilter {
	key: string;
	label: string;
}

function lastModifiedDate(film: Film): string {
	if (film.history.length > 0) {
		return film.history[film.history.length - 1]!.date;
	}
	return film.addedDate;
}

function compareAlphabetic(a: Film, b: Film): number {
	const brandA = (a.brand || "").toLowerCase();
	const brandB = (b.brand || "").toLowerCase();
	if (brandA !== brandB) return brandA.localeCompare(brandB);

	const modelA = (a.model || a.customName || "").toLowerCase();
	const modelB = (b.model || b.customName || "").toLowerCase();
	if (modelA !== modelB) return modelA.localeCompare(modelB);

	const expA = a.expDate || "";
	const expB = b.expDate || "";
	return expA.localeCompare(expB);
}

function nullsLast<T extends string | number>(extract: (f: Film) => T | null | undefined, asc: boolean) {
	return (a: Film, b: Film): number => {
		const va = extract(a);
		const vb = extract(b);
		if (va == null && vb == null) return 0;
		if (va == null) return 1;
		if (vb == null) return -1;
		const cmp = va < vb ? -1 : va > vb ? 1 : 0;
		return asc ? cmp : -cmp;
	};
}

function getSortComparator(option: SortOption): (a: Film, b: Film) => number {
	switch (option) {
		case "name-asc":
			return compareAlphabetic;
		case "name-desc":
			return (a, b) => compareAlphabetic(b, a);
		case "added-desc":
			return (a, b) => lastModifiedDate(b).localeCompare(lastModifiedDate(a));
		case "added-asc":
			return (a, b) => lastModifiedDate(a).localeCompare(lastModifiedDate(b));
		case "exp-asc":
			return nullsLast((f) => f.expDate, true);
		case "exp-desc":
			return nullsLast((f) => f.expDate, false);
		case "price-asc":
			return nullsLast((f) => f.price, true);
		case "price-desc":
			return nullsLast((f) => f.price, false);
		case "iso-asc":
			return nullsLast((f) => f.iso, true);
		case "iso-desc":
			return nullsLast((f) => f.iso, false);
	}
}

export function useStockFilters(films: Film[], initialStateFilter?: string | null) {
	const [search, setSearch] = useState("");
	const [stateFilter, setStateFilter] = useState(initialStateFilter || "all");
	const [filters, setFilters] = useState<StockFilters>({
		format: "all",
		type: "all",
		brands: [],
		isoValues: [],
		tags: [],
	});
	const [sortOption, setSortOption] = useState<SortOption>("name-asc");

	useEffect(() => {
		if (initialStateFilter) {
			setStateFilter(initialStateFilter);
		}
	}, [initialStateFilter]);

	const availableFormats = useMemo(() => {
		const formats = new Set<string>();
		for (const f of films) {
			if (f.format) formats.add(f.format);
		}
		return Array.from(formats).sort((a, b) => a.localeCompare(b));
	}, [films]);

	const availableTypes = useMemo(() => {
		const types = new Set<string>();
		for (const f of films) {
			if (f.type) types.add(f.type);
		}
		return Array.from(types).sort((a, b) => a.localeCompare(b));
	}, [films]);

	const availableBrands = useMemo(() => {
		const brands = new Set<string>();
		for (const f of films) {
			if (f.brand) brands.add(normalizeBrand(f.brand));
		}
		return Array.from(brands).sort((a, b) => a.localeCompare(b));
	}, [films]);

	const availableIsoValues = useMemo(() => {
		const isos = new Set<number>();
		for (const f of films) {
			if (f.iso) isos.add(f.iso);
		}
		return Array.from(isos).sort((a, b) => a - b);
	}, [films]);

	const availableTags = useMemo(() => collectAllTags(films), [films]);

	const filteredFilms = useMemo(() => {
		const result = films.filter((f) => {
			if (stateFilter !== "all" && f.state !== stateFilter) return false;
			if (filters.format !== "all" && f.format !== filters.format) return false;
			if (filters.type !== "all" && f.type !== filters.type) return false;
			if (filters.brands.length > 0) {
				const brand = f.brand ? normalizeBrand(f.brand) : "";
				if (!filters.brands.includes(brand)) return false;
			}
			if (filters.isoValues.length > 0) {
				if (!f.iso || !filters.isoValues.includes(f.iso)) return false;
			}
			if (filters.tags.length > 0) {
				const filmTags = f.tags ?? [];
				if (!filmTags.some((t) => filters.tags.includes(t))) return false;
			}
			if (search) {
				const name = filmName(f);
				if (!name.toLowerCase().includes(search.toLowerCase())) return false;
			}
			return true;
		});

		const comparator = getSortComparator(sortOption);
		result.sort(comparator);
		return result;
	}, [films, stateFilter, filters, search, sortOption]);

	const hasActiveFilters = useMemo(
		() =>
			filters.format !== "all" ||
			filters.type !== "all" ||
			filters.brands.length > 0 ||
			filters.isoValues.length > 0 ||
			filters.tags.length > 0,
		[filters],
	);

	const activeFilterDescriptions = useMemo(() => {
		const descriptions: ActiveFilter[] = [];
		if (filters.format !== "all") {
			descriptions.push({ key: "format", label: filters.format });
		}
		if (filters.type !== "all") {
			descriptions.push({ key: "type", label: filters.type });
		}
		for (const brand of filters.brands) {
			descriptions.push({ key: `brand:${brand}`, label: brand });
		}
		for (const iso of filters.isoValues) {
			descriptions.push({ key: `iso:${iso}`, label: `ISO ${iso}` });
		}
		for (const tag of filters.tags) {
			descriptions.push({ key: `tag:${tag}`, label: tag });
		}
		return descriptions;
	}, [filters]);

	const setFormat = (v: string) => setFilters((prev) => ({ ...prev, format: v }));
	const setType = (v: string) => setFilters((prev) => ({ ...prev, type: v }));

	const toggleBrand = (brand: string) =>
		setFilters((prev) => ({
			...prev,
			brands: prev.brands.includes(brand) ? prev.brands.filter((b) => b !== brand) : [...prev.brands, brand],
		}));

	const toggleIso = (iso: number) =>
		setFilters((prev) => ({
			...prev,
			isoValues: prev.isoValues.includes(iso) ? prev.isoValues.filter((i) => i !== iso) : [...prev.isoValues, iso],
		}));

	const toggleTag = (tag: string) =>
		setFilters((prev) => ({
			...prev,
			tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
		}));

	const removeFilter = (key: string) => {
		if (key === "format") {
			setFormat("all");
		} else if (key === "type") {
			setType("all");
		} else if (key.startsWith("brand:")) {
			const brand = key.slice(6);
			setFilters((prev) => ({ ...prev, brands: prev.brands.filter((b) => b !== brand) }));
		} else if (key.startsWith("iso:")) {
			const iso = Number(key.slice(4));
			setFilters((prev) => ({ ...prev, isoValues: prev.isoValues.filter((i) => i !== iso) }));
		} else if (key.startsWith("tag:")) {
			const tag = key.slice(4);
			setFilters((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
		}
	};

	const resetFilters = () => {
		setStateFilter("all");
		setFilters({ format: "all", type: "all", brands: [], isoValues: [], tags: [] });
	};

	return {
		search,
		setSearch,
		stateFilter,
		setStateFilter,
		filters,
		sortOption,
		setSortOption,
		filteredFilms,
		resultCount: filteredFilms.length,
		availableFormats,
		availableTypes,
		availableBrands,
		availableIsoValues,
		availableTags,
		hasActiveFilters,
		activeFilterDescriptions,
		setFormat,
		setType,
		toggleBrand,
		toggleIso,
		toggleTag,
		removeFilter,
		resetFilters,
	};
}

export { lastModifiedDate };
