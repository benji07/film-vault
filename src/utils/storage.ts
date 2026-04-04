import { DEFAULT_CAMERAS } from "@/constants/cameras";
import type { AppData } from "@/types";

const STORAGE_KEY = "filmvault-data";
let storageAvailable = false;

export async function checkStorage(): Promise<boolean> {
	try {
		localStorage.setItem("filmvault-test", "1");
		localStorage.removeItem("filmvault-test");
		storageAvailable = true;
		return true;
	} catch {
		storageAvailable = false;
		return false;
	}
}

export function isStorageAvailable(): boolean {
	return storageAvailable;
}

export async function loadData(): Promise<AppData | null> {
	if (!storageAvailable) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as AppData;
			if (parsed && Array.isArray(parsed.films)) return parsed;
		}
	} catch (e) {
		console.log("Load error:", e instanceof Error ? e.message : e);
	}
	return null;
}

export async function saveData(data: AppData): Promise<boolean> {
	if (!storageAvailable) return false;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		return true;
	} catch {
		return false;
	}
}

export function getInitialData(): AppData {
	return {
		films: [],
		cameras: DEFAULT_CAMERAS,
		version: 1,
	};
}
