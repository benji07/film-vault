import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createDemoData } from "@/tour/demo-data";
import { TOUR_STEPS } from "@/tour/tour-steps";
import type { TourContextValue, TourState } from "@/tour/tour-types";
import type { AppData, ScreenName } from "@/types";

const STORAGE_KEY = "filmvault-guide-done";

const TourContext = createContext<TourContextValue | null>(null);

export function hasCompletedTour(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

function markTourComplete(): void {
	try {
		localStorage.setItem(STORAGE_KEY, "1");
	} catch {
		// localStorage not available
	}
}

interface TourProviderProps {
	children: React.ReactNode;
	goTo: (target: { screen: ScreenName; selectedFilm: string | null }) => void;
}

export function TourProvider({ children, goTo }: TourProviderProps) {
	const [tourState, setTourState] = useState<TourState>({
		active: false,
		currentStep: 0,
		totalSteps: TOUR_STEPS.length,
	});
	const [tourData, setTourData] = useState<AppData | null>(null);
	const stateRef = useRef(tourState);
	stateRef.current = tourState;

	const navigateToStep = useCallback(
		(stepIndex: number) => {
			const step = TOUR_STEPS[stepIndex];
			if (!step) return;
			goTo({ screen: step.screen, selectedFilm: step.selectedFilmId ?? null });
		},
		[goTo],
	);

	const startTour = useCallback(() => {
		const data = createDemoData();
		setTourData(data);
		const newState: TourState = { active: true, currentStep: 0, totalSteps: TOUR_STEPS.length };
		setTourState(newState);
		stateRef.current = newState;
		navigateToStep(0);
	}, [navigateToStep]);

	const endTour = useCallback(
		(completed: boolean) => {
			if (completed) markTourComplete();
			setTourState({ active: false, currentStep: 0, totalSteps: TOUR_STEPS.length });
			setTourData(null);
			goTo({ screen: "home", selectedFilm: null });
		},
		[goTo],
	);

	const nextStep = useCallback(() => {
		const current = stateRef.current;
		if (current.currentStep >= current.totalSteps - 1) {
			endTour(true);
			return;
		}
		const next = current.currentStep + 1;
		const newState = { ...current, currentStep: next };
		setTourState(newState);
		stateRef.current = newState;
		navigateToStep(next);
	}, [endTour, navigateToStep]);

	const prevStep = useCallback(() => {
		const current = stateRef.current;
		if (current.currentStep <= 0) return;
		const prev = current.currentStep - 1;
		const newState = { ...current, currentStep: prev };
		setTourState(newState);
		stateRef.current = newState;
		navigateToStep(prev);
	}, [navigateToStep]);

	const skipTour = useCallback(() => {
		endTour(true);
	}, [endTour]);

	const value = useMemo<TourContextValue>(
		() => ({
			tourState,
			startTour,
			endTour,
			nextStep,
			prevStep,
			skipTour,
			tourData,
			isTourActive: tourState.active,
		}),
		[tourState, startTour, endTour, nextStep, prevStep, skipTour, tourData],
	);

	return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
	const ctx = useContext(TourContext);
	if (!ctx) throw new Error("useTour must be used within TourProvider");
	return ctx;
}
