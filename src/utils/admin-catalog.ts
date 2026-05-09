import type { FilmDevelopmentProcess } from "@/constants/film-catalog";
import type { FilmFormat, FilmType } from "@/types";
import { invalidateFilmCatalogCache, refreshCatalogs } from "@/utils/catalog";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

const CATALOG_BUCKET = "catalog-images";

export interface AdminFilmStock {
	id: number;
	brand: string;
	model: string;
	iso: number;
	type: FilmType;
	format: FilmFormat;
	development_process: FilmDevelopmentProcess | null;
	image_url: string | null;
	image_path: string | null;
	active: boolean;
	updated_at: string;
}

export interface AdminFilmStockInput {
	id: number | null;
	brand: string;
	model: string;
	iso: number;
	type: FilmType;
	format: FilmFormat;
	development_process: FilmDevelopmentProcess | null;
	image_url: string | null;
	image_path: string | null;
	active: boolean;
}

let cachedAdminFlag: boolean | null = null;

/**
 * Returns true if the current authenticated user has the admin flag.
 * Cached per session; call invalidateAdminCache() on sign-out.
 */
export async function isAdminUser(): Promise<boolean> {
	if (!supabase || !isSupabaseConfigured) return false;
	if (cachedAdminFlag !== null) return cachedAdminFlag;

	const { data, error } = await supabase.rpc("is_admin");
	if (error) {
		console.error("is_admin check failed:", error.message);
		cachedAdminFlag = false;
		return false;
	}
	cachedAdminFlag = Boolean(data);
	return cachedAdminFlag;
}

export function invalidateAdminCache(): void {
	cachedAdminFlag = null;
}

/**
 * Fetch the full catalog (active + archived) for admin editing.
 * Throws if the current user is not admin.
 */
export async function fetchAdminCatalog(): Promise<AdminFilmStock[]> {
	if (!supabase || !isSupabaseConfigured) return [];

	const { data, error } = await supabase.rpc("get_film_catalog_admin");
	if (error) throw new Error(error.message);
	return (data ?? []) as AdminFilmStock[];
}

/**
 * Insert (when input.id is null) or update an existing catalog entry.
 * Refreshes the public catalog cache so other screens see the change.
 */
export async function upsertFilmStock(input: AdminFilmStockInput): Promise<number> {
	if (!supabase || !isSupabaseConfigured) throw new Error("supabase_not_configured");

	const { data, error } = await supabase.rpc("admin_upsert_film_stock", {
		p_id: input.id,
		p_brand: input.brand.trim(),
		p_model: input.model.trim(),
		p_iso: input.iso,
		p_type: input.type,
		p_format: input.format,
		p_development_process: input.development_process,
		p_image_url: input.image_url,
		p_image_path: input.image_path,
		p_active: input.active,
	});
	if (error) throw new Error(error.message);

	invalidateFilmCatalogCache();
	await refreshCatalogs();
	return data as number;
}

/**
 * Archive (soft-delete) a catalog entry.
 */
export async function archiveFilmStock(id: number): Promise<void> {
	if (!supabase || !isSupabaseConfigured) throw new Error("supabase_not_configured");

	const { error } = await supabase.rpc("admin_archive_film_stock", { p_id: id });
	if (error) throw new Error(error.message);

	invalidateFilmCatalogCache();
	await refreshCatalogs();
}

/**
 * Build a deterministic, filesystem-safe key for a stock's image.
 * Including a random suffix to avoid CDN caching when replacing.
 */
export function buildCatalogImagePath(brand: string, model: string, format: string, file: File): string {
	const slug = (s: string) =>
		s
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[̀-ͯ]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	const ext = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "jpg";
	const stamp = Date.now().toString(36);
	return `${slug(brand)}/${slug(model)}-${slug(format)}-${stamp}.${ext}`;
}

/**
 * Upload a file to the catalog-images bucket. Returns { path, publicUrl }.
 * Storage RLS rejects writes from non-admin users.
 */
export async function uploadCatalogImage(file: File, path: string): Promise<{ path: string; publicUrl: string }> {
	if (!supabase || !isSupabaseConfigured) throw new Error("supabase_not_configured");

	const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, file, {
		upsert: true,
		contentType: file.type || undefined,
	});
	if (error) throw new Error(error.message);

	const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
	return { path, publicUrl: data.publicUrl };
}

/**
 * Delete an object from the catalog-images bucket. Best-effort.
 */
export async function deleteCatalogImage(path: string): Promise<void> {
	if (!supabase || !isSupabaseConfigured) return;
	const { error } = await supabase.storage.from(CATALOG_BUCKET).remove([path]);
	if (error) console.error("Failed to delete catalog image:", error.message);
}
