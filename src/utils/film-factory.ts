import type { Camera, Film, FilmState, HistoryEntry } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { today, uid } from "@/utils/helpers";

const DEFAULT_POSES: Record<string, number> = {
	"35mm": 36,
	"120": 12,
	"Instax Mini": 10,
	"Instax Square": 10,
	"Instax Wide": 10,
	"Polaroid SX-70": 8,
	"Polaroid 600": 8,
	"Polaroid I-Type": 8,
	"Polaroid Go": 8,
};

interface NewFilmParams {
	brand: string;
	model: string;
	iso: number;
	type: string;
	format: string;
	expDate: string | null;
	comment: string | null;
	price?: number | null;
	posesTotal?: number;
	storageLocation?: string | null;
	tags?: string[];
	state?: FilmState;
	cameraId?: string | null;
	backId?: string | null;
	lens?: string | null;
	lensId?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	shootIso?: number | null;
	posesShot?: number | null;
	lab?: string | null;
	labRef?: string | null;
	devDate?: string | null;
	devCost?: number | null;
	scanRef?: string | null;
	scanCost?: number | null;
	devScanPackage?: boolean;
	camera?: Camera | null;
}

const STATE_RANK: Record<FilmState, number> = {
	stock: 0,
	loaded: 1,
	partial: 2,
	exposed: 3,
	developed: 4,
	scanned: 5,
};

function reachedStock(target: FilmState, threshold: FilmState): boolean {
	return STATE_RANK[target] >= STATE_RANK[threshold];
}

function derivePosesShot(state: FilmState, posesShot: number | null | undefined, posesTotal: number): number | null {
	if (state === "partial") return posesShot ?? 0;
	if (reachedStock(state, "exposed")) return posesTotal;
	return null;
}

function buildHistory(params: NewFilmParams, addedDate: string, posesTotal: number): HistoryEntry[] {
	const state = params.state ?? "stock";
	const history: HistoryEntry[] = [{ date: addedDate, action: "", actionCode: "added" }];

	if (state === "stock") return history;

	const loadDate = params.startDate || addedDate;
	const cameraLabel = params.camera ? cameraDisplayName(params.camera) : "?";
	history.push({
		date: loadDate,
		action: "",
		actionCode: "loaded",
		params: { camera: cameraLabel },
	});

	if (state === "partial") {
		history.push({
			date: loadDate,
			action: "",
			actionCode: "removed_partial",
			params: {
				posesShot: params.posesShot ?? 0,
				posesTotal,
			},
		});
		return history;
	}

	if (reachedStock(state, "exposed")) {
		const exposedDate = params.endDate || loadDate;
		history.push({ date: exposedDate, action: "", actionCode: "exposed" });
	}

	if (reachedStock(state, "developed")) {
		const devDate = params.devDate || params.endDate || loadDate;
		history.push({
			date: devDate,
			action: "",
			actionCode: "developed",
			params: { lab: params.lab ?? null },
		});
	}

	if (reachedStock(state, "scanned")) {
		history.push({
			date: params.devDate || params.endDate || loadDate,
			action: "",
			actionCode: "scanned",
			params: { ref: params.scanRef ?? null },
		});
	}

	return history;
}

export function createNewFilm(params: NewFilmParams): Film {
	const state = params.state ?? "stock";
	const addedDate = today();
	const posesTotal = params.posesTotal ?? DEFAULT_POSES[params.format] ?? 36;
	const isAfterStock = state !== "stock";

	return {
		id: uid(),
		brand: params.brand,
		model: params.model,
		iso: params.iso,
		type: params.type,
		format: params.format,
		state,
		expDate: params.expDate,
		comment: params.comment,
		price: params.price ?? null,
		addedDate,
		shootIso: params.shootIso ?? (isAfterStock ? params.iso : null),
		cameraId: params.cameraId ?? null,
		backId: params.backId ?? null,
		lens: params.lens ?? null,
		lensId: params.lensId ?? null,
		startDate: isAfterStock ? (params.startDate ?? addedDate) : null,
		endDate: reachedStock(state, "exposed") ? (params.endDate ?? params.startDate ?? addedDate) : null,
		posesShot: derivePosesShot(state, params.posesShot, posesTotal),
		posesTotal,
		lab: params.lab ?? null,
		labRef: params.labRef ?? null,
		devDate: reachedStock(state, "developed") ? (params.devDate ?? params.endDate ?? addedDate) : null,
		devCost: params.devCost ?? null,
		scanRef: params.scanRef ?? null,
		scanCost: params.scanCost ?? null,
		devScanPackage: params.devScanPackage,
		storageLocation: params.storageLocation ?? null,
		history: buildHistory(params, addedDate, posesTotal),
		tags: params.tags && params.tags.length > 0 ? [...params.tags] : undefined,
	};
}
