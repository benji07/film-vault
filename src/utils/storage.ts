import type { TFunction } from "i18next";
import type { AppData } from "@/types";
import { setLastModified } from "@/utils/sync";
import { applyMigrations, CURRENT_VERSION, normalizeAppData, validateAppData } from "./migrations";

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
			const parsed = JSON.parse(raw);
			if (!validateAppData(parsed)) return null;

			if ((parsed.version ?? 1) < CURRENT_VERSION) {
				const migrated = applyMigrations(parsed as unknown as Record<string, unknown>);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
				return migrated;
			}

			return normalizeAppData(parsed);
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
		setLastModified();
		return true;
	} catch {
		return false;
	}
}

export function getInitialData(): AppData {
	return {
		films: [],
		cameras: [],
		backs: [],
		lenses: [],
		settings: { expirationMode: "date" },
		version: CURRENT_VERSION,
	};
}

export function exportData(data: AppData): void {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `filmvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export interface ImportResult {
	success: true;
	data: AppData;
	error?: never;
}

export interface ImportError {
	success: false;
	error: string;
	data?: never;
}

export async function parseImportFile(file: File, t?: TFunction): Promise<ImportResult | ImportError> {
	try {
		const text = await file.text();
		const parsed = JSON.parse(text);

		if (!validateAppData(parsed)) {
			return {
				success: false,
				error: t ? t("storage.invalidData") : "Le fichier ne contient pas de données FilmVault valides.",
			};
		}

		const version = parsed.version ?? 1;

		if (version > CURRENT_VERSION) {
			return {
				success: false,
				error: t ? t("storage.newerVersion") : "Ce fichier provient d'une version plus récente de FilmVault.",
			};
		}

		if (version < CURRENT_VERSION) {
			const migrated = applyMigrations(parsed as unknown as Record<string, unknown>);
			return { success: true, data: normalizeAppData(migrated) };
		}

		return { success: true, data: normalizeAppData(parsed) };
	} catch {
		return {
			success: false,
			error: t ? t("storage.invalidJson") : "Le fichier n'est pas un JSON valide.",
		};
	}
}
