import type { FilmCatalogEntry } from "@/constants/film-catalog";
import { FILM_CATALOG } from "@/constants/film-catalog";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

// --- Types ---

export interface CatalogCamera {
	id: number;
	brand: string;
	model: string;
	format: string;
	mount: string | null;
	type: string | null;
}

// --- Cache keys ---

const FILM_CATALOG_KEY = "filmvault-catalog-films";
const CAMERA_CATALOG_KEY = "filmvault-catalog-cameras";
const CATALOG_TIMESTAMP_KEY = "filmvault-catalog-updated";

// --- In-memory cache ---

let filmCatalogCache: FilmCatalogEntry[] | null = null;
let cameraCatalogCache: CatalogCamera[] | null = null;

// --- Film catalog ---

/**
 * Get the film catalog, merging remote data with local fallback.
 * Returns cached data immediately if available.
 */
export function getFilmCatalog(): FilmCatalogEntry[] {
	if (filmCatalogCache) return filmCatalogCache;

	// Try localStorage cache
	try {
		const cached = localStorage.getItem(FILM_CATALOG_KEY);
		if (cached) {
			filmCatalogCache = JSON.parse(cached) as FilmCatalogEntry[];
			return filmCatalogCache;
		}
	} catch {
		// ignore
	}

	// Fallback to hardcoded catalog
	return FILM_CATALOG;
}

/**
 * Get the camera catalog from cache.
 */
export function getCameraCatalog(): CatalogCamera[] {
	if (cameraCatalogCache) return cameraCatalogCache;

	try {
		const cached = localStorage.getItem(CAMERA_CATALOG_KEY);
		if (cached) {
			cameraCatalogCache = JSON.parse(cached) as CatalogCamera[];
			return cameraCatalogCache;
		}
	} catch {
		// ignore
	}

	return [];
}

/**
 * Fetch catalogs from Supabase and update local cache.
 * Called on app startup when online.
 */
export async function refreshCatalogs(): Promise<void> {
	if (!supabase || !isSupabaseConfigured) return;

	try {
		const lastUpdate = localStorage.getItem(CATALOG_TIMESTAMP_KEY) ?? undefined;

		// Fetch film catalog
		const { data: films, error: filmError } = await supabase.rpc("get_film_catalog", {
			p_since: lastUpdate ?? null,
		});

		if (!filmError && films && Array.isArray(films) && films.length > 0) {
			// If this is an incremental update, merge with existing
			if (lastUpdate) {
				const existing = getFilmCatalog();
				const newEntries = films as FilmCatalogEntry[];
				const merged = mergeFilmCatalogs(existing, newEntries);
				filmCatalogCache = merged;
			} else {
				filmCatalogCache = films as FilmCatalogEntry[];
			}
			localStorage.setItem(FILM_CATALOG_KEY, JSON.stringify(filmCatalogCache));
		}

		// Fetch camera catalog
		const { data: cameras, error: camError } = await supabase.rpc("get_camera_catalog", {
			p_since: lastUpdate ?? null,
		});

		if (!camError && cameras && Array.isArray(cameras) && cameras.length > 0) {
			if (lastUpdate) {
				const existing = getCameraCatalog();
				const newEntries = cameras as CatalogCamera[];
				const merged = mergeCameraCatalogs(existing, newEntries);
				cameraCatalogCache = merged;
			} else {
				cameraCatalogCache = cameras as CatalogCamera[];
			}
			localStorage.setItem(CAMERA_CATALOG_KEY, JSON.stringify(cameraCatalogCache));
		}

		localStorage.setItem(CATALOG_TIMESTAMP_KEY, new Date().toISOString());
	} catch (e) {
		console.error("Failed to refresh catalogs:", e);
	}
}

// --- Merge helpers ---

function mergeFilmCatalogs(existing: FilmCatalogEntry[], newer: FilmCatalogEntry[]): FilmCatalogEntry[] {
	const key = (e: FilmCatalogEntry) => `${e.brand}|${e.model}|${e.format}`;
	const map = new Map(existing.map((e) => [key(e), e]));
	for (const entry of newer) {
		map.set(key(entry), entry);
	}
	return Array.from(map.values());
}

function mergeCameraCatalogs(existing: CatalogCamera[], newer: CatalogCamera[]): CatalogCamera[] {
	const key = (e: CatalogCamera) => `${e.brand}|${e.model}`;
	const map = new Map(existing.map((e) => [key(e), e]));
	for (const entry of newer) {
		map.set(key(entry), entry);
	}
	return Array.from(map.values());
}

// --- Suggestion helpers ---

/**
 * Get unique camera brands from the catalog.
 */
export function getCameraBrands(): string[] {
	const catalog = getCameraCatalog();
	return [...new Set(catalog.map((c) => c.brand))].sort();
}

/**
 * Get camera models for a given brand.
 */
export function getCameraModels(brand: string): CatalogCamera[] {
	const catalog = getCameraCatalog();
	return catalog.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
}
