import type { AppData } from "@/types";

export const CURRENT_VERSION = 8;

type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>;

interface V1Camera {
	name: string;
	id: string;
	format: string;
	hasInterchangeableBack: boolean;
	backs: unknown[];
}

function migrateV1toV2(data: Record<string, unknown>): Record<string, unknown> {
	const cameras = (data.cameras as V1Camera[]) || [];
	const migratedCameras = cameras.map((cam) => {
		if ("name" in cam && !("brand" in cam)) {
			const name = cam.name || "";
			const spaceIndex = name.indexOf(" ");
			const brand = spaceIndex > 0 ? name.slice(0, spaceIndex) : "";
			const model = spaceIndex > 0 ? name.slice(spaceIndex + 1) : name;
			const { name: _, ...rest } = cam;
			return { ...rest, brand, model, nickname: "", serial: "" };
		}
		return cam;
	});
	return { ...data, cameras: migratedCameras, version: 2 };
}

function migrateV2toV3(data: Record<string, unknown>): Record<string, unknown> {
	return { ...data, version: 3 };
}

interface V3Film {
	expDate?: string | null;
}

function migrateV3toV4(data: Record<string, unknown>): Record<string, unknown> {
	const films = (data.films as V3Film[]) || [];
	const migratedFilms = films.map((film) => ({
		...film,
		expDate: film.expDate?.slice(0, 7) || null,
	}));
	return { ...data, films: migratedFilms, version: 4 };
}

function migrateV4toV5(data: Record<string, unknown>): Record<string, unknown> {
	const films = (data.films as Record<string, unknown>[]) || [];
	const migratedFilms = films.map((film) => ({
		...film,
		scanRef: (film.scanRef as string) ?? null,
	}));
	return { ...data, films: migratedFilms, version: 5 };
}

function migrateV5toV6(data: Record<string, unknown>): Record<string, unknown> {
	const cameras = (data.cameras as Record<string, unknown>[]) || [];
	const migratedCameras = cameras.map((cam) => {
		const backs = (cam.backs as Record<string, unknown>[]) || [];
		return {
			...cam,
			backs: backs.map((b) => ({
				...b,
				nickname: (b.nickname as string) ?? "",
				serial: (b.serial as string) ?? "",
			})),
		};
	});
	return { ...data, cameras: migratedCameras, version: 6 };
}

interface LegacyHistoryEntry {
	date: string;
	action: string;
	actionCode?: string;
	params?: Record<string, string | number | null>;
	photos?: string[];
}

function parseHistoryAction(
	action: string,
): { actionCode: string; params?: Record<string, string | number | null | undefined> } | null {
	// "Ajoutée au stock" / "Added to stock"
	if (/Ajoutée au stock|Added to stock/i.test(action)) {
		return { actionCode: "added" };
	}
	// "Chargée dans X" / "Loaded in X"
	let m = action.match(/^(?:Chargée dans|Loaded in)\s+(.+)$/i);
	if (m) return { actionCode: "loaded", params: { camera: m[1] } };
	// "Rechargée dans X" / "Reloaded in X"
	m = action.match(/^(?:Rechargée dans|Reloaded in)\s+(.+)$/i);
	if (m) return { actionCode: "reloaded", params: { camera: m[1] } };
	// "Retirée partiellement (X/Y poses)" / "Partially removed (X/Y frames)"
	m = action.match(/partiellement \((\d+)\/(\d+)/i) || action.match(/Partially removed \((\d+)\/(\d+)/i);
	if (m) return { actionCode: "removed_partial", params: { posesShot: Number(m[1]), posesTotal: Number(m[2]) } };
	// "Exposée" / "Exposed"
	if (/^Exposée|^Exposed/i.test(action)) {
		return { actionCode: "exposed" };
	}
	// "Envoyée au développement" / "Sent to development"
	if (/Envoyée au développement|Sent to development/i.test(action)) {
		return { actionCode: "sent_dev" };
	}
	// "Développée chez X" / "Developed at X"
	m = action.match(/^(?:Développée chez|Developed at)\s+(.+)$/i);
	if (m) return { actionCode: "developed", params: { lab: m[1] } };
	// "Développée" / "Developed"
	if (/^Développée$|^Developed$/i.test(action)) {
		return { actionCode: "developed", params: { lab: null } };
	}
	// "Scannée (réf: X)" / "Scanned (ref: X)"
	m = action.match(/^(?:Scannée|Scanned)\s*\((?:réf|ref):\s*(.+)\)$/i);
	if (m) return { actionCode: "scanned", params: { ref: m[1] } };
	// "Scannée" / "Scanned"
	if (/^Scannée$|^Scanned$/i.test(action)) {
		return { actionCode: "scanned", params: { ref: null } };
	}
	// "Informations modifiées" / "Information updated"
	if (/Informations modifiées|Information updated/i.test(action)) {
		return { actionCode: "modified" };
	}
	// "Dupliquée depuis X" / "Duplicated from X"
	m = action.match(/^(?:Dupliquée depuis|Duplicated from)\s+(.+)$/i);
	if (m) return { actionCode: "duplicated", params: { name: m[1] } };
	return null;
}

function migrateV6toV7(data: Record<string, unknown>): Record<string, unknown> {
	const films = (data.films as Record<string, unknown>[]) || [];
	const migratedFilms = films.map((film) => {
		const history = (film.history as LegacyHistoryEntry[]) || [];
		const migratedHistory = history.map((entry) => {
			if (entry.actionCode) return entry;
			const parsed = parseHistoryAction(entry.action);
			if (parsed) {
				return { ...entry, actionCode: parsed.actionCode, params: parsed.params };
			}
			return entry;
		});
		return { ...film, history: migratedHistory };
	});
	return { ...data, films: migratedFilms, version: 7 };
}

function migrateV7toV8(data: Record<string, unknown>): Record<string, unknown> {
	return { ...data, version: 8 };
}

const migrations: Record<number, MigrationFn> = {
	1: migrateV1toV2,
	2: migrateV2toV3,
	3: migrateV3toV4,
	4: migrateV4toV5,
	5: migrateV5toV6,
	6: migrateV6toV7,
	7: migrateV7toV8,
};

export function applyMigrations(data: Record<string, unknown>): AppData {
	let current = data;
	let version = typeof current.version === "number" ? current.version : 1;

	while (version < CURRENT_VERSION) {
		const fn = migrations[version];
		if (!fn) {
			throw new Error(`No migration found for version ${version}`);
		}
		current = fn(current);
		version++;
	}

	current.version = CURRENT_VERSION;
	return current as unknown as AppData;
}

export function validateAppData(data: unknown): data is AppData {
	if (!data || typeof data !== "object") return false;
	const d = data as Record<string, unknown>;
	if (!Array.isArray(d.films)) return false;
	if (!Array.isArray(d.cameras)) return false;
	if (d.version !== undefined && d.version !== null && typeof d.version !== "number") return false;
	return true;
}
