import { useEffect, useRef } from "react";
import type { NavigationEntry, ScreenName } from "@/types";
import type { NavigationStack } from "./use-navigation-stack";

const ROOT_SCREENS: ReadonlySet<ScreenName> = new Set(["home", "stock", "cameras", "stats", "map", "settings", "legal"]);

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
 * - When the navigation entry changes, updates the hash without reloading.
 * - Listens to `hashchange` (browser back/forward, manual edits) and
 *   updates the navigation stack accordingly.
 */
export function useUrlSync(nav: NavigationStack): void {
	const lastSyncedHash = useRef<string | null>(null);
	const initialized = useRef(false);

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
			nav.resetTo(initial);
		}
	}, []);

	// Push hash updates whenever the current entry changes.
	useEffect(() => {
		if (!initialized.current) return;
		const next = entryToHash(nav.current);
		if (lastSyncedHash.current === next) return;
		lastSyncedHash.current = next;
		const url = next ? `#${next}` : window.location.pathname + window.location.search;
		window.history.pushState(null, "", url);
	}, [nav.current]);

	// Browser back/forward (or manual hash edit) → apply to navigation stack.
	useEffect(() => {
		const onHashChange = () => {
			const next = entryToHash(hashToEntry(window.location.hash));
			if (lastSyncedHash.current === next) return;
			lastSyncedHash.current = next;
			nav.resetTo(hashToEntry(window.location.hash));
		};
		window.addEventListener("popstate", onHashChange);
		window.addEventListener("hashchange", onHashChange);
		return () => {
			window.removeEventListener("popstate", onHashChange);
			window.removeEventListener("hashchange", onHashChange);
		};
	}, [nav]);
}
