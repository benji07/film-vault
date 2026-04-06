import type { ComponentType } from "react";

export type FilmFormat = "35mm" | "120" | "Instant";
export type FilmType = "Couleur" | "N&B" | "Diapo" | "ECN-2" | "Instant";
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
	location?: string | null;
	notes?: string | null;
	date?: string | null;
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
	addedDate: string;
	quantity?: number;
	shootIso?: number | null;
	cameraId?: string | null;
	backId?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	posesShot?: number | null;
	posesTotal?: number | null;
	lab?: string | null;
	devDate?: string | null;
	scanRef?: string | null;
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
}

export interface Camera {
	id: string;
	brand: string;
	model: string;
	nickname: string;
	serial: string;
	format: string;
	hasInterchangeableBack: boolean;
	backs: Back[];
	photo?: string;
}

export interface AppData {
	films: Film[];
	cameras: Camera[];
	version: number;
}

export type ScreenName = "home" | "stock" | "filmDetail" | "cameras" | "stats" | "settings";

export interface StateConfig {
	label: string;
	color: string;
	icon: ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
}

export type LucideIcon = ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
