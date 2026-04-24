import { useCallback, useMemo, useReducer } from "react";
import type { NavigationEntry, ScreenName } from "@/types";

const DETAIL_BACK_FALLBACK: Partial<Record<ScreenName, ScreenName>> = {
	filmDetail: "stock",
	cameraDetail: "cameras",
	settings: "home",
	legal: "settings",
};

function entriesEqual(a: NavigationEntry, b: NavigationEntry): boolean {
	return (
		a.screen === b.screen &&
		(a.selectedFilm ?? null) === (b.selectedFilm ?? null) &&
		(a.selectedCamera ?? null) === (b.selectedCamera ?? null) &&
		(a.mapFilterFilmId ?? null) === (b.mapFilterFilmId ?? null) &&
		(a.stockStateFilter ?? null) === (b.stockStateFilter ?? null)
	);
}

interface NavState {
	current: NavigationEntry;
	history: NavigationEntry[];
}

type NavAction =
	| { type: "navigate"; entry: NavigationEntry }
	| { type: "goBack" }
	| { type: "resetTo"; entry: NavigationEntry }
	| { type: "replace"; entry: NavigationEntry };

function reducer(state: NavState, action: NavAction): NavState {
	switch (action.type) {
		case "navigate": {
			if (entriesEqual(state.current, action.entry)) return state;
			const top = state.history[state.history.length - 1];
			// If the new entry matches the previous history top, drop that duplicate
			// to avoid A/B/A/B ping-pong growth on symmetric round-trips.
			if (top && entriesEqual(top, action.entry)) {
				return {
					current: action.entry,
					history: [...state.history.slice(0, -1), state.current],
				};
			}
			return {
				current: action.entry,
				history: [...state.history, state.current],
			};
		}
		case "goBack": {
			if (state.history.length === 0) {
				const fallback = DETAIL_BACK_FALLBACK[state.current.screen];
				return fallback ? { current: { screen: fallback }, history: [] } : state;
			}
			const next = state.history[state.history.length - 1];
			if (!next) return state;
			return { current: next, history: state.history.slice(0, -1) };
		}
		case "resetTo":
			return { current: action.entry, history: [] };
		case "replace":
			return { ...state, current: action.entry };
	}
}

export interface NavigationStack {
	current: NavigationEntry;
	history: NavigationEntry[];
	navigate: (entry: NavigationEntry) => void;
	goBack: () => void;
	resetTo: (entry: NavigationEntry) => void;
	replace: (entry: NavigationEntry) => void;
}

export function useNavigationStack(initial: NavigationEntry): NavigationStack {
	const [state, dispatch] = useReducer(reducer, { current: initial, history: [] });

	const navigate = useCallback((entry: NavigationEntry) => dispatch({ type: "navigate", entry }), []);
	const goBack = useCallback(() => dispatch({ type: "goBack" }), []);
	const resetTo = useCallback((entry: NavigationEntry) => dispatch({ type: "resetTo", entry }), []);
	const replace = useCallback((entry: NavigationEntry) => dispatch({ type: "replace", entry }), []);

	return useMemo(
		() => ({ current: state.current, history: state.history, navigate, goBack, resetTo, replace }),
		[state.current, state.history, navigate, goBack, resetTo, replace],
	);
}
