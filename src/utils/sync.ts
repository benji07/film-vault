import type { AppData } from "@/types";
import { applyMigrations, CURRENT_VERSION, validateAppData } from "@/utils/migrations";
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

// --- Cloud operations ---

export async function pushToCloud(code: string, data: AppData): Promise<boolean> {
	if (!supabase) return false;
	try {
		const { error } = await supabase.from("user_data").upsert(
			{
				recovery_code: code,
				data,
				version: data.version,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "recovery_code" },
		);
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

export async function pullFromCloud(code: string): Promise<AppData | null> {
	if (!supabase) return null;
	try {
		const { data: row, error } = await supabase
			.from("user_data")
			.select("data, version, updated_at")
			.eq("recovery_code", code)
			.single();

		if (error || !row) return null;

		const cloudData = row.data as unknown;
		if (!validateAppData(cloudData)) return null;

		// Apply migrations if the cloud data is from an older version
		if ((cloudData.version ?? 1) < CURRENT_VERSION) {
			return applyMigrations(cloudData as unknown as Record<string, unknown>);
		}

		return cloudData;
	} catch (e) {
		console.error("Pull from cloud failed:", e);
		return null;
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
		const { data: row, error } = await supabase
			.from("user_data")
			.select("data, updated_at")
			.eq("recovery_code", code)
			.single();

		// No cloud data yet → push local
		if (error || !row) {
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
