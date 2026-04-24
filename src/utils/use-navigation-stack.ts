import { useCallback, useState } from "react";
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

export interface NavigationStack {
	current: NavigationEntry;
	history: NavigationEntry[];
	navigate: (entry: NavigationEntry) => void;
	goBack: () => void;
	resetTo: (entry: NavigationEntry) => void;
	replace: (entry: NavigationEntry) => void;
}

export function useNavigationStack(initial: NavigationEntry): NavigationStack {
	const [current, setCurrent] = useState<NavigationEntry>(initial);
	const [history, setHistory] = useState<NavigationEntry[]>([]);

	const navigate = useCallback((entry: NavigationEntry) => {
		setCurrent((prev) => {
			if (entriesEqual(prev, entry)) return prev;
			setHistory((h) => {
				// Drop a duplicate top to avoid A/B/A/B ping-pong growth
				const top = h[h.length - 1];
				if (top && entriesEqual(top, entry)) {
					return [...h.slice(0, -1), prev];
				}
				return [...h, prev];
			});
			return entry;
		});
	}, []);

	const goBack = useCallback(() => {
		setHistory((h) => {
			if (h.length === 0) {
				setCurrent((prev) => {
					const fallback = DETAIL_BACK_FALLBACK[prev.screen];
					return fallback ? { screen: fallback } : prev;
				});
				return h;
			}
			const next = h[h.length - 1];
			if (next) setCurrent(next);
			return h.slice(0, -1);
		});
	}, []);

	const resetTo = useCallback((entry: NavigationEntry) => {
		setHistory([]);
		setCurrent(entry);
	}, []);

	const replace = useCallback((entry: NavigationEntry) => {
		setCurrent(entry);
	}, []);

	return { current, history, navigate, goBack, resetTo, replace };
}
