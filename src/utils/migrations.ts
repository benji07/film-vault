import type { AppData } from "@/types";

export const CURRENT_VERSION = 3;

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

const migrations: Record<number, MigrationFn> = {
	1: migrateV1toV2,
	2: migrateV2toV3,
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
	if (typeof d.version !== "number" && d.version !== undefined) return false;
	return true;
}
