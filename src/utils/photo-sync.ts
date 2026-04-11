import { isSupabaseConfigured, supabase } from "@/utils/supabase";
import { getRecoveryCode } from "@/utils/sync";

// --- Signed URL cache ---

interface CachedUrl {
	url: string;
	expiresAt: number;
}

const urlCache = new Map<string, CachedUrl>();
const CACHE_TTL_MS = 50 * 60 * 1000; // 50 minutes (URLs valid for 60 min)

/**
 * Resolve a photo reference to a displayable src.
 * - base64 data URLs are returned as-is
 * - Storage paths are resolved to signed download URLs
 * - Returns null if the reference is empty
 */
export function resolvePhotoSrc(photoRef: string | null | undefined): string | null {
	if (!photoRef) return null;
	if (photoRef.startsWith("data:")) return photoRef;

	// It's a storage path — check cache
	const cached = urlCache.get(photoRef);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}

	// Return null for now; the caller should use usePhotoUrl() hook for async resolution
	return null;
}

/**
 * Check if a photo reference is a base64 data URL (local) vs a storage path (cloud).
 */
export function isBase64Photo(photoRef: string | null | undefined): boolean {
	return !!photoRef && photoRef.startsWith("data:");
}

/**
 * Check if a photo reference is a storage path.
 */
export function isStoragePath(photoRef: string | null | undefined): boolean {
	return !!photoRef && !photoRef.startsWith("data:");
}

/**
 * Fetch a signed download URL for a storage path.
 * Caches the result for subsequent calls.
 */
export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
	if (!supabase || !isSupabaseConfigured) return null;

	const cached = urlCache.get(storagePath);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}

	const code = getRecoveryCode();
	if (!code) return null;

	try {
		const { data, error } = await supabase.rpc("create_download_url", {
			p_recovery_code: code,
			p_relative_path: storagePath,
		});

		if (error || !data) {
			console.error("Failed to get download URL:", error?.message);
			return null;
		}

		const url = data as string;
		urlCache.set(storagePath, { url, expiresAt: Date.now() + CACHE_TTL_MS });
		return url;
	} catch (e) {
		console.error("Failed to get download URL:", e);
		return null;
	}
}

/**
 * Upload a base64 photo to Supabase Storage.
 * Returns the relative storage path on success, or null on failure.
 */
export async function uploadPhoto(base64DataUrl: string, relativePath: string): Promise<string | null> {
	if (!supabase || !isSupabaseConfigured) return null;

	const code = getRecoveryCode();
	if (!code) return null;

	try {
		// Get signed upload URL
		const { data: uploadUrl, error: urlError } = await supabase.rpc("create_upload_url", {
			p_recovery_code: code,
			p_relative_path: relativePath,
		});

		if (urlError || !uploadUrl) {
			console.error("Failed to get upload URL:", urlError?.message);
			return null;
		}

		// Convert base64 to blob
		const blob = base64ToBlob(base64DataUrl);

		// Upload via signed URL
		const response = await fetch(uploadUrl as string, {
			method: "PUT",
			headers: { "Content-Type": blob.type },
			body: blob,
		});

		if (!response.ok) {
			console.error("Upload failed:", response.status, response.statusText);
			return null;
		}

		return relativePath;
	} catch (e) {
		console.error("Upload failed:", e);
		return null;
	}
}

/**
 * Convert a base64 data URL to a Blob.
 */
function base64ToBlob(dataUrl: string): Blob {
	const parts = dataUrl.split(",");
	const header = parts[0] ?? "";
	const data = parts[1] ?? "";
	const mimeMatch = header.match(/:(.*?);/);
	const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
	const binary = atob(data);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new Blob([bytes], { type: mime });
}

/**
 * Clear the signed URL cache (e.g. on recovery code change).
 */
export function clearUrlCache(): void {
	urlCache.clear();
}
