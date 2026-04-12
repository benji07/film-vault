import type { AppData } from "@/types";
import { applyMigrations, CURRENT_VERSION, validateAppData } from "@/utils/migrations";
import { clearUrlCache, extractAndUploadPhotos, hasBase64Photos } from "@/utils/photo-sync";
import { isSupabaseConfigured, supabase } from "@/utils/supabase";

const RECOVERY_CODE_KEY = "filmvault-recovery-code";
const LAST_SYNC_KEY = "filmvault-last-sync";
const LAST_MODIFIED_KEY = "filmvault-last-modified";

// --- Recovery code management ---

export function generateRecoveryCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
	const bytes = crypto.getRandomValues(new Uint8Array(8));
	const code = Array.from(bytes, (b) => chars[b % chars.length]).join("");
	return `FILM-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function getRecoveryCode(): string | null {
	try {
		return localStorage.getItem(RECOVERY_CODE_KEY);
	} catch {
		return null;
	}
}

export function setRecoveryCode(code: string): void {
	localStorage.setItem(RECOVERY_CODE_KEY, code);
}

export function clearRecoveryCode(): void {
	localStorage.removeItem(RECOVERY_CODE_KEY);
	localStorage.removeItem(LAST_SYNC_KEY);
	clearUrlCache();
}

// --- Last modified / last sync ---

export function getLastModified(): string | null {
	try {
		return localStorage.getItem(LAST_MODIFIED_KEY);
	} catch {
		return null;
	}
}

export function setLastModified(): void {
	localStorage.setItem(LAST_MODIFIED_KEY, new Date().toISOString());
}

export function getLastSync(): string | null {
	try {
		return localStorage.getItem(LAST_SYNC_KEY);
	} catch {
		return null;
	}
}

function setLastSync(): void {
	localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

// --- Cloud activation / restore ---

/**
 * Activate cloud sync: creates a user profile linked to the current anonymous session.
 * Returns the profile UUID on success, or null on failure.
 */
export async function activateCloud(recoveryCode: string): Promise<string | null> {
	if (!supabase) return null;
	try {
		const { data, error } = await supabase.rpc("activate_cloud", {
			p_recovery_code: recoveryCode,
		});
		if (error) {
			console.error("activate_cloud failed:", error.message);
			return null;
		}
		// Reset caches so subsequent operations use the new profile
		clearUrlCache();
		return data as string;
	} catch (e) {
		console.error("activate_cloud failed:", e);
		return null;
	}
}

/**
 * Link an existing recovery code to the current anonymous session (for restore).
 * Returns the profile UUID on success, or null on failure.
 */
export async function linkRecoveryCode(recoveryCode: string): Promise<string | null> {
	if (!supabase) return null;
	try {
		const { data, error } = await supabase.rpc("link_recovery_code", {
			p_recovery_code: recoveryCode,
		});
		if (error) {
			console.error("link_recovery_code failed:", error.message);
			return null;
		}
		// Reset caches so subsequent operations use the new profile
		clearUrlCache();
		return data as string;
	} catch (e) {
		console.error("link_recovery_code failed:", e);
		return null;
	}
}

// --- Cloud operations (v3: auth.uid() based) ---

export async function pushToCloud(_code: string, data: AppData): Promise<boolean> {
	if (!supabase) return false;
	try {
		// Upload photos to Storage, replace base64 with paths in the cloud copy
		const cloudData = await extractAndUploadPhotos(data);

		const { error } = await supabase.rpc("upsert_user_data_v3", {
			p_data: cloudData,
			p_version: cloudData.version,
			p_updated_at: new Date().toISOString(),
		});
		if (error) {
			console.error("Push to cloud failed:", error.message);
			return false;
		}
		setLastSync();
		return true;
	} catch (e) {
		console.error("Push to cloud failed:", e);
		return false;
	}
}

export type PullError = "supabase_not_configured" | "not_found" | "network_error" | "invalid_data";
export type PullResult = { data: AppData } | { error: PullError };

export async function pullFromCloud(_code: string): Promise<PullResult> {
	if (!supabase) return { error: "supabase_not_configured" };
	try {
		const { data: rows, error } = await supabase.rpc("get_user_data_v3");

		if (error) {
			console.error("Pull from cloud failed:", error.message);
			return { error: "network_error" };
		}

		const row = rows?.[0];
		if (!row) return { error: "not_found" };

		const cloudData = row.data as unknown;
		if (!validateAppData(cloudData)) {
			console.error("Cloud data validation failed:", JSON.stringify(row.data).slice(0, 200));
			return { error: "invalid_data" };
		}

		// Apply migrations if the cloud data is from an older version
		if ((cloudData.version ?? 1) < CURRENT_VERSION) {
			return { data: applyMigrations(cloudData as unknown as Record<string, unknown>) };
		}

		return { data: cloudData };
	} catch (e) {
		console.error("Pull from cloud failed:", e);
		return { error: "network_error" };
	}
}

/**
 * Sync local data with cloud. Returns the most recent version.
 * - If cloud is newer → returns cloud data
 * - If local is newer → pushes to cloud, returns local data
 * - If no cloud data → pushes local to cloud, returns local data
 */
export async function syncData(
	code: string,
	localData: AppData,
): Promise<{ data: AppData; source: "local" | "cloud" }> {
	if (!isSupabaseConfigured || !supabase) {
		return { data: localData, source: "local" };
	}

	try {
		let { data: rows, error } = await supabase.rpc("get_user_data_v3");

		// If no data found, the profile may exist but auth_uid is not linked yet
		// (existing user upgrading from v2). Try to link automatically.
		if (!error && (!rows || rows.length === 0)) {
			const linked = await linkRecoveryCode(code);
			if (linked) {
				const retry = await supabase.rpc("get_user_data_v3");
				rows = retry.data;
				error = retry.error;
			}
		}

		// No cloud data yet or error → push local
		if (error) {
			console.error("Sync check failed:", error.message);
			await pushToCloud(code, localData);
			return { data: localData, source: "local" };
		}

		const row = rows?.[0];
		if (!row) {
			await pushToCloud(code, localData);
			return { data: localData, source: "local" };
		}

		const cloudUpdatedAt = row.updated_at as string;
		const localModified = getLastModified();

		// Compare timestamps: if cloud is more recent, use cloud data
		if (localModified && cloudUpdatedAt > localModified) {
			const cloudData = row.data as unknown;
			if (validateAppData(cloudData)) {
				const migrated =
					(cloudData.version ?? 1) < CURRENT_VERSION
						? applyMigrations(cloudData as unknown as Record<string, unknown>)
						: cloudData;
				setLastSync();
				// If cloud data has base64 photos, push to migrate them to Storage
				if (hasBase64Photos(migrated)) {
					void pushToCloud(code, migrated);
				}
				return { data: migrated, source: "cloud" };
			}
		}

		// Local is newer or same → push to cloud
		await pushToCloud(code, localData);
		return { data: localData, source: "local" };
	} catch (e) {
		console.error("Sync failed:", e);
		return { data: localData, source: "local" };
	}
}
