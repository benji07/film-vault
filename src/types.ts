import type { ComponentType } from "react";

export type FilmFormat =
	| "35mm"
	| "120"
	| "Instax Mini"
	| "Instax Square"
	| "Instax Wide"
	| "Polaroid SX-70"
	| "Polaroid 600"
	| "Polaroid I-Type"
	| "Polaroid Go";
export type FilmType = "Couleur" | "N&B" | "Diapo" | "ECN-2";

export const INSTANT_FORMATS: FilmFormat[] = [
	"Instax Mini",
	"Instax Square",
	"Instax Wide",
	"Polaroid SX-70",
	"Polaroid 600",
	"Polaroid I-Type",
	"Polaroid Go",
];

export function isInstantFormat(format: string | undefined): boolean {
	return INSTANT_FORMATS.includes(format as FilmFormat);
}
export type FilmState = "stock" | "loaded" | "partial" | "exposed" | "developed" | "scanned";

export type HistoryAction =
	| "added"
	| "loaded"
	| "reloaded"
	| "removed_partial"
	| "exposed"
	| "sent_dev"
	| "developed"
	| "scanned"
	| "modified"
	| "duplicated";

export interface HistoryEntry {
	date: string;
	action: string;
	/** Structured action code (preferred over free-text action) */
	actionCode?: HistoryAction;
	/** Parameters for actionCode interpolation (camera name, lab, etc.) */
	params?: Record<string, string | number | null | undefined>;
	photos?: string[];
}

export interface ShotNote {
	id: string;
	frameNumber?: number | null;
	aperture?: string | null;
	shutterSpeed?: string | null;
	lens?: string | null;
	lensId?: string | null;
	location?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	notes?: string | null;
	date?: string | null;
	photo?: string | null;
}

export interface Film {
	id: string;
	brand?: string;
	model?: string;
	customName?: string;
	iso?: number;
	type?: string;
	format?: string;
	state: FilmState;
	expDate?: string | null;
	comment?: string | null;
	price?: number | null;
	devCost?: number | null;
	scanCost?: number | null;
	devScanPackage?: boolean;
	addedDate: string;
	quantity?: number;
	shootIso?: number | null;
	cameraId?: string | null;
	backId?: string | null;
	lens?: string | null;
	lensId?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	posesShot?: number | null;
	posesTotal?: number | null;
	lab?: string | null;
	labRef?: string | null;
	devDate?: string | null;
	scanRef?: string | null;
	storageLocation?: string | null;
	history: HistoryEntry[];
	shotNotes?: ShotNote[];
}

export interface Back {
	id: string;
	name: string;
	nickname?: string;
	ref?: string;
	serial?: string;
	photo?: string;
	format: string;
	compatibleCameraIds: string[];
}

export type StopIncrement = "1" | "1/2" | "1/3";

export interface Camera {
	id: string;
	brand: string;
	model: string;
	nickname: string;
	serial: string;
	format: string;
	hasInterchangeableBack: boolean;
	photo?: string;
	mount?: string | null;
	shutterSpeedMin?: string | null;
	shutterSpeedMax?: string | null;
	shutterSpeedStops?: StopIncrement | null;
	apertureStops?: StopIncrement | null;
}

export interface Lens {
	id: string;
	brand: string;
	model: string;
	nickname?: string;
	serial?: string;
	photo?: string;
	mount?: string;
	isZoom?: boolean;
	focalLengthMin?: number | null;
	focalLengthMax?: number | null;
	maxApertureAtMin?: string | null;
	maxApertureAtMax?: string | null;
	apertureMin?: string | null;
	apertureMax?: string | null;
	apertureStops?: StopIncrement | null;
	shutterSpeedMin?: string | null;
	shutterSpeedMax?: string | null;
	shutterSpeedStops?: StopIncrement | null;
}

export interface AppData {
	films: Film[];
	cameras: Camera[];
	backs: Back[];
	lenses: Lens[];
	version: number;
}

export type ScreenName = "home" | "stock" | "filmDetail" | "cameras" | "stats" | "settings" | "legal" | "map";

export interface StateConfig {
	label: string;
	color: string;
	icon: ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
}

export type LucideIcon = ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
