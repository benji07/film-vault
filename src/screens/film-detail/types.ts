import type { AppData, Back, Camera, Film } from "@/types";

export type ActionType = "load" | "finish" | "partial" | "reload" | "sendDev" | "develop" | "edit" | "scan" | null;

export interface ActionData {
	cameraId?: string;
	backId?: string;
	lens?: string;
	lensId?: string;
	shootIso?: string;
	startDate?: string;
	endDate?: string;
	comment?: string;
	posesShot?: string;
	lab?: string;
	labRef?: string;
	devDate?: string;
	scanRef?: string;
	photos?: string[];
	devCost?: string;
	scanCost?: string;
	devScanPackage?: boolean;
}

export interface EditData {
	// General
	brand: string;
	model: string;
	iso: string;
	type: string;
	format: string;
	expDate: string;
	storageLocation: string;
	comment: string;
	price: string;
	// Loading
	shootIso: string;
	cameraId: string;
	backId: string;
	lensId: string;
	lens: string;
	startDate: string;
	posesTotal: string;
	// Exposure
	endDate: string;
	posesShot: string;
	// Development
	lab: string;
	labRef: string;
	devDate: string;
	devCost: string;
	devScanPackage: boolean;
	// Scanning
	scanRef: string;
	scanCost: string;
}

/** Shared props for modal components */
export interface ModalBaseProps {
	film: Film;
	data: AppData;
	showAction: ActionType;
	closeAction: () => void;
	actionData: ActionData;
	setActionData: (data: ActionData) => void;
	updateFilm: (updates: Partial<Film>, toastMessage?: string) => void;
	availableCameras: Camera[];
	compatibleBacks: Back[];
	fIso: string | number;
}
