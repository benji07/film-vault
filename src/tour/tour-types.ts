import type { AppData, ScreenName } from "@/types";

export interface TourStep {
	id: string;
	/** Which screen must be active for this step */
	screen: ScreenName;
	/** Navigate to a specific film (for filmDetail step) */
	selectedFilmId?: string;
	/** CSS selector to highlight. null = no highlight (full overlay) */
	target: string | null;
	/** i18n key prefix — resolves to tour.<id>.title and tour.<id>.description */
	i18nKey: string;
	/** Tooltip placement relative to target */
	placement: "top" | "bottom" | "center";
	/** Extra padding around the highlight cutout (px) */
	padding?: number;
	/** Delay (ms) before showing tooltip — allows screen transitions to settle */
	delay?: number;
}

export interface TourState {
	active: boolean;
	currentStep: number;
	totalSteps: number;
}

export interface TourContextValue {
	tourState: TourState;
	startTour: () => void;
	endTour: (completed: boolean) => void;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	tourData: AppData | null;
	isTourActive: boolean;
}
