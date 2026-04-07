import type { Film } from "@/types";
import { today, uid } from "@/utils/helpers";

const DEFAULT_POSES: Record<string, number> = {
	"35mm": 36,
	"120": 12,
	Instant: 10,
};

interface NewFilmParams {
	brand: string;
	model: string;
	iso: number;
	type: string;
	format: string;
	expDate: string | null;
	comment: string | null;
	posesTotal?: number;
	storageLocation?: string | null;
}

export function createNewFilm(params: NewFilmParams): Film {
	return {
		id: uid(),
		brand: params.brand,
		model: params.model,
		iso: params.iso,
		type: params.type,
		format: params.format,
		state: "stock",
		expDate: params.expDate,
		comment: params.comment,
		addedDate: today(),
		shootIso: null,
		cameraId: null,
		backId: null,
		lens: null,
		startDate: null,
		endDate: null,
		posesShot: null,
		posesTotal: params.posesTotal ?? DEFAULT_POSES[params.format] ?? 36,
		lab: null,
		labRef: null,
		devDate: null,
		storageLocation: params.storageLocation ?? null,
		history: [{ date: today(), action: "", actionCode: "added" }],
	};
}
