import type { AppData } from "@/types";
import { applyMigrations, CURRENT_VERSION, validateAppData } from "@/utils/migrations";

const BACKUP_FILENAME = "filmvault-backup.json";
const GOOGLE_USER_KEY = "filmvault-google-user";
const GOOGLE_LAST_BACKUP_KEY = "filmvault-google-last-backup";
const DRIVE_SCOPES = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email";

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";

export const isGoogleDriveConfigured = Boolean(clientId);

// --- Google user info ---

export interface GoogleUser {
	email: string;
}

export function getGoogleUser(): GoogleUser | null {
	try {
		const raw = localStorage.getItem(GOOGLE_USER_KEY);
		return raw ? (JSON.parse(raw) as GoogleUser) : null;
	} catch {
		return null;
	}
}

export function setGoogleUser(user: GoogleUser): void {
	localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
}

export function clearGoogleUser(): void {
	localStorage.removeItem(GOOGLE_USER_KEY);
	localStorage.removeItem(GOOGLE_LAST_BACKUP_KEY);
}

export function getLastBackup(): string | null {
	try {
		return localStorage.getItem(GOOGLE_LAST_BACKUP_KEY);
	} catch {
		return null;
	}
}

function setLastBackup(): void {
	localStorage.setItem(GOOGLE_LAST_BACKUP_KEY, new Date().toISOString());
}

// --- GIS script loading ---

declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initTokenClient(config: {
						client_id: string;
						scope: string;
						callback: (response: { access_token?: string; error?: string }) => void;
					}): { requestAccessToken(): void };
					revoke(token: string, callback: () => void): void;
				};
			};
		};
	}
}

let gsiLoaded = false;

function loadGsiScript(): Promise<void> {
	if (gsiLoaded && window.google?.accounts) return Promise.resolve();
	return new Promise((resolve, reject) => {
		if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
			gsiLoaded = true;
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.onload = () => {
			gsiLoaded = true;
			resolve();
		};
		script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
		document.head.appendChild(script);
	});
}

// --- Token management ---

let currentAccessToken: string | null = null;

function requestAccessToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!window.google?.accounts) {
			reject(new Error("GIS not loaded"));
			return;
		}
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: DRIVE_SCOPES,
			callback: (response) => {
				if (response.error || !response.access_token) {
					reject(new Error(response.error ?? "No access token"));
					return;
				}
				currentAccessToken = response.access_token;
				resolve(response.access_token);
			},
		});
		client.requestAccessToken();
	});
}

async function getToken(): Promise<string> {
	await loadGsiScript();
	if (currentAccessToken) {
		// Verify token is still valid
		const res = await fetch("https://www.googleapis.com/oauth2/v3/tokeninfo", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `access_token=${currentAccessToken}`,
		});
		if (res.ok) return currentAccessToken;
		currentAccessToken = null;
	}
	return requestAccessToken();
}

// --- Google Drive operations ---

async function fetchUserEmail(token: string): Promise<string> {
	const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error("Failed to fetch user info");
	const info = (await res.json()) as { email?: string };
	return info.email ?? "";
}

async function findBackupFileId(token: string): Promise<string | null> {
	const params = new URLSearchParams({
		spaces: "appDataFolder",
		q: `name='${BACKUP_FILENAME}'`,
		fields: "files(id)",
		pageSize: "1",
	});
	const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error("Failed to list Drive files");
	const data = (await res.json()) as { files?: { id: string }[] };
	return data.files?.[0]?.id ?? null;
}

/**
 * Sign in with Google and return user info.
 */
export async function googleSignIn(): Promise<GoogleUser> {
	const token = await getToken();
	const email = await fetchUserEmail(token);
	const user: GoogleUser = { email };
	setGoogleUser(user);
	return user;
}

/**
 * Sign out: revoke token and clear stored user.
 */
export async function googleSignOut(): Promise<void> {
	if (currentAccessToken && window.google?.accounts) {
		window.google.accounts.oauth2.revoke(currentAccessToken, () => {});
	}
	currentAccessToken = null;
	clearGoogleUser();
}

/**
 * Save app data to Google Drive (appDataFolder).
 */
export async function saveToDrive(data: AppData): Promise<void> {
	const token = await getToken();
	const fileId = await findBackupFileId(token);
	const jsonContent = JSON.stringify(data);

	if (fileId) {
		// Update existing file
		const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: jsonContent,
		});
		if (!res.ok) throw new Error("Failed to update backup on Drive");
	} else {
		// Create new file
		const metadata = { name: BACKUP_FILENAME, parents: ["appDataFolder"] };
		const form = new FormData();
		form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
		form.append("file", new Blob([jsonContent], { type: "application/json" }));

		const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: form,
		});
		if (!res.ok) throw new Error("Failed to create backup on Drive");
	}

	setLastBackup();
}

/**
 * Load app data from Google Drive (appDataFolder).
 * Returns null if no backup found.
 */
export async function loadFromDrive(): Promise<AppData | null> {
	const token = await getToken();
	const fileId = await findBackupFileId(token);
	if (!fileId) return null;

	const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error("Failed to download backup from Drive");

	const raw: unknown = await res.json();
	if (!validateAppData(raw)) throw new Error("Invalid backup data");

	if ((raw.version ?? 1) < CURRENT_VERSION) {
		return applyMigrations(raw as unknown as Record<string, unknown>);
	}
	return raw;
}
