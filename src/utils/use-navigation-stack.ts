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

export type NavSource = "navigate" | "goBack" | "resetTo" | "replace" | "pop";

interface NavState {
	current: NavigationEntry;
	history: NavigationEntry[];
	lastSource: NavSource | null;
}

type NavAction =
	| { type: "navigate"; entry: NavigationEntry }
	| { type: "goBack" }
	| { type: "resetTo"; entry: NavigationEntry }
	| { type: "replace"; entry: NavigationEntry }
	| { type: "pop"; entry: NavigationEntry };

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
					lastSource: "navigate",
				};
			}
			return {
				current: action.entry,
				history: [...state.history, state.current],
				lastSource: "navigate",
			};
		}
		case "goBack": {
			if (state.history.length === 0) {
				const fallback = DETAIL_BACK_FALLBACK[state.current.screen];
				return fallback
					? { current: { screen: fallback }, history: [], lastSource: "goBack" }
					: { ...state, lastSource: "goBack" };
			}
			const next = state.history[state.history.length - 1];
			if (!next) return state;
			return { current: next, history: state.history.slice(0, -1), lastSource: "goBack" };
		}
		case "pop": {
			// Browser back/forward: try to match the new entry against the top
			// of the in-app history so the back stack survives the round-trip.
			// Falls back to a clean reset when the URL doesn't match (manual
			// hash edit, deep-link forward, ...).
			const top = state.history[state.history.length - 1];
			if (top && entriesEqual(top, action.entry)) {
				return { current: action.entry, history: state.history.slice(0, -1), lastSource: "pop" };
			}
			return { current: action.entry, history: [], lastSource: "pop" };
		}
		case "resetTo":
			return { current: action.entry, history: [], lastSource: "resetTo" };
		case "replace":
			return { ...state, current: action.entry, lastSource: "replace" };
	}
}

export interface NavigationStack {
	current: NavigationEntry;
	history: NavigationEntry[];
	lastSource: NavSource | null;
	navigate: (entry: NavigationEntry) => void;
	goBack: () => void;
	resetTo: (entry: NavigationEntry) => void;
	replace: (entry: NavigationEntry) => void;
	pop: (entry: NavigationEntry) => void;
}

export function useNavigationStack(initial: NavigationEntry): NavigationStack {
	const [state, dispatch] = useReducer(reducer, { current: initial, history: [], lastSource: null });

	const navigate = useCallback((entry: NavigationEntry) => dispatch({ type: "navigate", entry }), []);
	const goBack = useCallback(() => dispatch({ type: "goBack" }), []);
	const resetTo = useCallback((entry: NavigationEntry) => dispatch({ type: "resetTo", entry }), []);
	const replace = useCallback((entry: NavigationEntry) => dispatch({ type: "replace", entry }), []);
	const pop = useCallback((entry: NavigationEntry) => dispatch({ type: "pop", entry }), []);

	return useMemo(
		() => ({
			current: state.current,
			history: state.history,
			lastSource: state.lastSource,
			navigate,
			goBack,
			resetTo,
			replace,
			pop,
		}),
		[state.current, state.history, state.lastSource, navigate, goBack, resetTo, replace, pop],
	);
}
