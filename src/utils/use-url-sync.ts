import { useEffect, useRef } from "react";
import type { NavigationEntry, ScreenName } from "@/types";
import type { NavigationStack } from "./use-navigation-stack";

const ROOT_SCREENS: ReadonlySet<ScreenName> = new Set([
	"home",
	"stock",
	"cameras",
	"stats",
	"map",
	"settings",
	"legal",
]);

/**
 * Build a hash fragment (without the leading "#") from a navigation entry.
 * `home` returns an empty string so the homepage URL stays clean.
 */
export function entryToHash(entry: NavigationEntry): string {
	switch (entry.screen) {
		case "home":
		case "welcome":
			return "";
		case "filmDetail":
			return entry.selectedFilm ? `films/${entry.selectedFilm}` : "stock";
		case "cameraDetail":
			return entry.selectedCamera ? `cameras/${entry.selectedCamera}` : "cameras";
		case "map":
			return entry.mapFilterFilmId ? `map?film=${entry.mapFilterFilmId}` : "map";
		case "stock":
			return entry.stockStateFilter ? `stock?state=${entry.stockStateFilter}` : "stock";
		default:
			return entry.screen;
	}
}

/** Parse a hash fragment back into a navigation entry. */
export function hashToEntry(rawHash: string): NavigationEntry {
	const hash = rawHash.replace(/^#/, "").trim();
	if (!hash) return { screen: "home" };

	const [path, query = ""] = hash.split("?");
	const params = new URLSearchParams(query);
	const segments = (path ?? "").split("/").filter(Boolean);
	const head = segments[0];

	if (head === "films" && segments[1]) {
		return { screen: "filmDetail", selectedFilm: segments[1] };
	}
	if (head === "cameras" && segments[1]) {
		return { screen: "cameraDetail", selectedCamera: segments[1] };
	}
	if (head === "map") {
		return { screen: "map", mapFilterFilmId: params.get("film") };
	}
	if (head === "stock") {
		return { screen: "stock", stockStateFilter: params.get("state") };
	}
	if (head && ROOT_SCREENS.has(head as ScreenName)) {
		return { screen: head as ScreenName };
	}
	return { screen: "home" };
}

/**
 * Two-way sync between the navigation stack and `window.location.hash`.
 *
 * - On mount, reads the current hash and pushes the matching entry.
 * - When the navigation entry changes, updates the hash. Whether we
 *   push or replace depends on `nav.lastSource`:
 *     - `navigate` → `pushState` (grows the browser back stack)
 *     - everything else (`goBack`, `replace`, `resetTo`, `pop`) →
 *       `replaceState` so we don't pile a forward entry every time the
 *       user backs out of a screen.
 * - Listens to `hashchange` / `popstate` (browser back/forward, manual
 *   edits) and dispatches `pop`, which preserves the in-app history
 *   stack when the URL matches the previous entry — and falls back to
 *   a clean reset when it doesn't.
 *
 * Caveat: in-app `goBack` does **not** trigger a real `history.back()`,
 * so the browser back stack is monotone — back arrow will replay older
 * entries even after the user navigated away in-app. That trade-off
 * keeps the in-app reducer authoritative; if true symmetric history is
 * needed later, route `goBack()` through `window.history.back()` and
 * let `popstate` drive the reducer.
 */
export function useUrlSync(nav: NavigationStack): void {
	const lastSyncedHash = useRef<string | null>(null);
	const initialized = useRef(false);
	const { resetTo, pop } = nav;

	// Bootstrap: apply the URL hash on first render so a deep-link lands on
	// the right screen.
	// biome-ignore lint/correctness/useExhaustiveDependencies: run only once on mount
	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;
		const initial = hashToEntry(window.location.hash);
		const initialHash = entryToHash(initial);
		lastSyncedHash.current = initialHash;
		// Only override the in-memory state if the URL points somewhere
		// other than the default home screen.
		if (initial.screen !== "home" || initial.selectedFilm || initial.selectedCamera) {
			resetTo(initial);
		}
	}, []);

	// Push or replace the URL whenever the current entry changes.
	useEffect(() => {
		if (!initialized.current) return;
		const next = entryToHash(nav.current);
		if (lastSyncedHash.current === next) return;
		lastSyncedHash.current = next;
		const url = next ? `#${next}` : window.location.pathname + window.location.search;
		if (nav.lastSource === "navigate") {
			window.history.pushState(null, "", url);
		} else {
			window.history.replaceState(null, "", url);
		}
	}, [nav.current, nav.lastSource]);

	// Browser back/forward (or manual hash edit) → apply to navigation stack
	// via `pop`, which tries to match the new entry against the in-app
	// history top (preserves the back stack) and falls back to a clean
	// reset if the URL doesn't correspond to a known previous entry.
	useEffect(() => {
		const onHashChange = () => {
			const target = hashToEntry(window.location.hash);
			const next = entryToHash(target);
			if (lastSyncedHash.current === next) return;
			lastSyncedHash.current = next;
			pop(target);
		};
		window.addEventListener("popstate", onHashChange);
		window.addEventListener("hashchange", onHashChange);
		return () => {
			window.removeEventListener("popstate", onHashChange);
			window.removeEventListener("hashchange", onHashChange);
		};
	}, [pop]);
}
