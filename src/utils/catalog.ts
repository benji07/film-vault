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
	updated_at?: string;
}

interface FilmCatalogRow extends FilmCatalogEntry {
	updated_at?: string;
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
 *
 * Uses server-side updated_at timestamps (not client clock) to avoid
 * clock-skew issues with incremental fetches.
 */
export async function refreshCatalogs(): Promise<void> {
	if (!supabase || !isSupabaseConfigured) return;

	try {
		const lastUpdate = localStorage.getItem(CATALOG_TIMESTAMP_KEY) ?? undefined;
		const existingFilms = getFilmCatalog();
		const existingCameras = getCameraCatalog();

		// Only do incremental fetch if we have cached data; otherwise full fetch
		const filmSince = lastUpdate && existingFilms.length > 0 ? lastUpdate : null;
		const cameraSince = lastUpdate && existingCameras.length > 0 ? lastUpdate : null;

		let maxServerTimestamp = lastUpdate ?? "";

		// Fetch film catalog
		const { data: films, error: filmError } = await supabase.rpc("get_film_catalog", {
			p_since: filmSince,
		});

		if (filmError || !Array.isArray(films)) {
			console.error("Failed to refresh film catalog:", filmError);
			return;
		}

		if (filmSince) {
			const newEntries = films as FilmCatalogRow[];
			filmCatalogCache = newEntries.length > 0 ? mergeFilmCatalogs(existingFilms, newEntries) : existingFilms;
		} else {
			filmCatalogCache = films as FilmCatalogEntry[];
		}
		localStorage.setItem(FILM_CATALOG_KEY, JSON.stringify(filmCatalogCache));

		// Track max server timestamp from film rows
		for (const row of films as FilmCatalogRow[]) {
			if (row.updated_at && row.updated_at > maxServerTimestamp) {
				maxServerTimestamp = row.updated_at;
			}
		}

		// Fetch camera catalog
		const { data: cameras, error: camError } = await supabase.rpc("get_camera_catalog", {
			p_since: cameraSince,
		});

		if (camError || !Array.isArray(cameras)) {
			console.error("Failed to refresh camera catalog:", camError);
			return;
		}

		if (cameraSince) {
			const newEntries = cameras as CatalogCamera[];
			cameraCatalogCache = newEntries.length > 0 ? mergeCameraCatalogs(existingCameras, newEntries) : existingCameras;
		} else {
			cameraCatalogCache = cameras as CatalogCamera[];
		}
		localStorage.setItem(CAMERA_CATALOG_KEY, JSON.stringify(cameraCatalogCache));

		// Track max server timestamp from camera rows
		for (const row of cameras as CatalogCamera[]) {
			if (row.updated_at && row.updated_at > maxServerTimestamp) {
				maxServerTimestamp = row.updated_at;
			}
		}

		// Only update timestamp after both catalogs succeeded, using server time
		if (maxServerTimestamp) {
			localStorage.setItem(CATALOG_TIMESTAMP_KEY, maxServerTimestamp);
		}
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
