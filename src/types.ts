import type { ComponentType } from "react";

export type FilmFormat = "35mm" | "120" | "Instant";
export type FilmType = "Couleur" | "N&B" | "Diapo" | "ECN-2" | "Instant";
export type FilmState = "stock" | "loaded" | "partial" | "exposed" | "developed";

export interface HistoryEntry {
	date: string;
	action: string;
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
	history: HistoryEntry[];
}

export interface Back {
	id: string;
	name: string;
	ref?: string;
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
}

export interface AppData {
	films: Film[];
	cameras: Camera[];
	version: number;
}

export type ScreenName = "home" | "stock" | "addFilm" | "filmDetail" | "cameras" | "stats" | "settings";

export interface StateConfig {
	label: string;
	color: string;
	icon: ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
}

export type LucideIcon = ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>;
