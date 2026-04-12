import type { AppData } from "@/types";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

// --- Signed URL cache ---

interface CachedUrl {
	url: string;
	expiresAt: number;
}

const urlCache = new Map<string, CachedUrl>();
const CACHE_TTL_MS = 50 * 60 * 1000; // 50 minutes (URLs valid for 60 min)

// --- Profile ID cache (stable UUID for storage paths) ---

let cachedProfileId: string | null = null;

/**
 * Get the user_profiles.id for the current auth session.
 * This UUID is used as the top-level folder in Storage paths.
 */
export async function getProfileId(): Promise<string | null> {
	if (cachedProfileId) return cachedProfileId;
	if (!supabase || !isSupabaseConfigured) return null;

	const { data, error } = await supabase.rpc("get_profile_id");
	if (error || !data) return null;

	cachedProfileId = data as string;
	return cachedProfileId;
}

/**
 * Resolve a photo reference to a displayable src.
 * - base64 data URLs are returned as-is
 * - Storage paths are resolved to signed download URLs
 * - Returns null if the reference is empty
 */
export function resolvePhotoSrc(photoRef: string | null | undefined): string | null {
	if (!photoRef) return null;
	if (photoRef.startsWith("data:")) return photoRef;

	const cached = urlCache.get(photoRef);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}

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
 * Check if AppData contains any base64 photos that should be migrated to Storage.
 */
export function hasBase64Photos(data: AppData): boolean {
	for (const cam of data.cameras) {
		if (isBase64Photo(cam.photo)) return true;
	}
	for (const lens of data.lenses) {
		if (isBase64Photo(lens.photo)) return true;
	}
	for (const back of data.backs) {
		if (isBase64Photo(back.photo)) return true;
	}
	for (const film of data.films) {
		for (const entry of film.history) {
			if (entry.photos?.some(isBase64Photo)) return true;
		}
		if (film.shotNotes?.some((n) => isBase64Photo(n.photo))) return true;
	}
	return false;
}

/**
 * Fetch a signed download URL for a storage path via Supabase Storage SDK.
 * Caches the result for subsequent calls.
 */
export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
	if (!supabase || !isSupabaseConfigured) return null;

	const cached = urlCache.get(storagePath);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}

	const profileId = await getProfileId();
	if (!profileId) return null;

	try {
		const fullPath = `${profileId}/${storagePath}`;
		const { data, error } = await supabase.storage.from("user-photos").createSignedUrl(fullPath, 3600);

		if (error || !data?.signedUrl) {
			console.error("Failed to get download URL:", error?.message);
			return null;
		}

		urlCache.set(storagePath, { url: data.signedUrl, expiresAt: Date.now() + CACHE_TTL_MS });
		return data.signedUrl;
	} catch (e) {
		console.error("Failed to get download URL:", e);
		return null;
	}
}

/**
 * Upload a base64 photo to Supabase Storage via direct SDK upload.
 * Returns the relative storage path on success, or null on failure.
 */
export async function uploadPhoto(base64DataUrl: string, relativePath: string): Promise<string | null> {
	if (!supabase || !isSupabaseConfigured) return null;

	const profileId = await getProfileId();
	if (!profileId) return null;

	try {
		const blob = base64ToBlob(base64DataUrl);
		const fullPath = `${profileId}/${relativePath}`;

		const { error } = await supabase.storage.from("user-photos").upload(fullPath, blob, {
			upsert: true,
			contentType: blob.type,
		});

		if (error) {
			console.error("Upload failed:", error.message);
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
 * Extract all base64 photos from AppData, upload them to Supabase Storage,
 * and return a deep copy of the data with base64 replaced by storage paths.
 * The original data is NOT mutated (offline-first: local keeps base64).
 */
export async function extractAndUploadPhotos(data: AppData): Promise<AppData> {
	if (!supabase || !isSupabaseConfigured) return data;

	const profileId = await getProfileId();
	if (!profileId) return data;

	// Deep clone to avoid mutating the original
	const clone: AppData = JSON.parse(JSON.stringify(data));

	const uploads: Promise<void>[] = [];

	// Cameras
	for (const camera of clone.cameras) {
		if (camera.photo && isBase64Photo(camera.photo)) {
			const path = `cameras/${camera.id}.jpg`;
			uploads.push(
				uploadPhoto(camera.photo, path).then((result) => {
					if (result) camera.photo = result;
				}),
			);
		}
	}

	// Lenses
	for (const lens of clone.lenses) {
		if (lens.photo && isBase64Photo(lens.photo)) {
			const path = `lenses/${lens.id}.jpg`;
			uploads.push(
				uploadPhoto(lens.photo, path).then((result) => {
					if (result) lens.photo = result;
				}),
			);
		}
	}

	// Backs
	for (const back of clone.backs) {
		if (back.photo && isBase64Photo(back.photo)) {
			const path = `backs/${back.id}.jpg`;
			uploads.push(
				uploadPhoto(back.photo, path).then((result) => {
					if (result) back.photo = result;
				}),
			);
		}
	}

	// Films: history photos + shot note photos
	for (const film of clone.films) {
		for (let hi = 0; hi < film.history.length; hi++) {
			const entry = film.history[hi];
			if (!entry?.photos) continue;
			for (let pi = 0; pi < entry.photos.length; pi++) {
				const photo = entry.photos[pi];
				if (!photo || !isBase64Photo(photo)) continue;
				const path = `history/${film.id}/${hi}_${pi}.jpg`;
				const photos = entry.photos;
				const capturedPi = pi;
				uploads.push(
					uploadPhoto(photo, path).then((result) => {
						if (result) photos[capturedPi] = result;
					}),
				);
			}
		}

		if (film.shotNotes) {
			for (const note of film.shotNotes) {
				if (note.photo && isBase64Photo(note.photo)) {
					const path = `shots/${film.id}/${note.id}.jpg`;
					uploads.push(
						uploadPhoto(note.photo, path).then((result) => {
							if (result) note.photo = result;
						}),
					);
				}
			}
		}
	}

	// Run all uploads in parallel
	await Promise.allSettled(uploads);

	return clone;
}

/**
 * Clear the signed URL cache and profile ID cache.
 */
export function clearUrlCache(): void {
	urlCache.clear();
	cachedProfileId = null;
}
