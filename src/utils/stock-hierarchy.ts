import type { Film } from "@/types";
import { fmtExpDate } from "@/utils/expiration";
import { filmName, normalizeBrand } from "@/utils/film-helpers";

export type HierarchyLevel = "format" | "type" | "brand" | "model";

export const HIERARCHY_ORDER: HierarchyLevel[] = ["format", "type", "brand", "model"];

// Below this number of stock films, the stock view collapses to a flat list grouped by expiration
// instead of the multi-level navigation — fewer clicks for small inventories.
export const STOCK_FLAT_THRESHOLD = 20;

export interface HierarchyPath {
	format?: string;
	type?: string;
	brand?: string;
	model?: string;
}

export interface HierarchyNode {
	key: string;
	level: HierarchyLevel;
	value: string;
	label: string;
	count: number;
	childCount: number;
}

export interface FilmGroup {
	key: string;
	label: string;
	expLabel: string;
	films: Film[];
}

const UNKNOWN = "?";

function getValueAtLevel(film: Film, level: HierarchyLevel): string {
	switch (level) {
		case "format":
			return film.format || UNKNOWN;
		case "type":
			return film.type || UNKNOWN;
		case "brand":
			return film.brand ? normalizeBrand(film.brand) : UNKNOWN;
		case "model":
			return film.model || film.customName || UNKNOWN;
	}
}

export function nextLevel(level: HierarchyLevel | null): HierarchyLevel | null {
	if (level === null) return "format";
	const idx = HIERARCHY_ORDER.indexOf(level);
	if (idx === -1 || idx >= HIERARCHY_ORDER.length - 1) return null;
	return HIERARCHY_ORDER[idx + 1] ?? null;
}

export function pathDepth(path: HierarchyPath): number {
	let d = 0;
	for (const lvl of HIERARCHY_ORDER) {
		if (path[lvl]) d++;
	}
	return d;
}

/**
 * Result of resolving the next hierarchy level worth showing for a path.
 * `filtered` is always returned so callers don't have to recompute it.
 */
export interface DisplayResolution {
	/** Next level to display, or null when there is no further navigation. */
	level: HierarchyLevel | null;
	/** Films matching the current path. Empty means the path is stale. */
	filtered: Film[];
}

/**
 * Find the next hierarchy level worth showing for the current path, considering auto-skip:
 * a level that yields a single group is silently skipped (its only value is implicit) so the
 * user goes straight to the next meaningful choice.
 *
 * `level` is null when there's no further navigation. Combined with `filtered.length` callers
 * can distinguish three cases:
 *  - `level !== null` → render the hierarchy nodes for that level
 *  - `level === null && filtered.length > 0` → leaf reached
 *  - `level === null && filtered.length === 0` → stale path (e.g. films were deleted)
 */
export function resolveDisplayLevel(films: Film[], path: HierarchyPath): DisplayResolution {
	const filtered = filterByPath(films, path);
	if (filtered.length === 0) return { level: null, filtered };

	for (const level of HIERARCHY_ORDER) {
		if (path[level] != null) continue;
		const distinct = new Set<string>();
		for (const f of filtered) {
			distinct.add(getValueAtLevel(f, level));
			if (distinct.size > 1) break;
		}
		if (distinct.size > 1) return { level, filtered };
	}
	return { level: null, filtered };
}

export function isLeaf(films: Film[], path: HierarchyPath): boolean {
	const { level, filtered } = resolveDisplayLevel(films, path);
	return level === null && filtered.length > 0;
}

export function setPathLevel(path: HierarchyPath, level: HierarchyLevel, value: string): HierarchyPath {
	const next: HierarchyPath = { ...path, [level]: value };
	const idx = HIERARCHY_ORDER.indexOf(level);
	for (let i = idx + 1; i < HIERARCHY_ORDER.length; i++) {
		const lvl = HIERARCHY_ORDER[i];
		if (lvl) delete next[lvl];
	}
	return next;
}

export function truncatePath(path: HierarchyPath, level: HierarchyLevel | null): HierarchyPath {
	if (level === null) return {};
	const idx = HIERARCHY_ORDER.indexOf(level);
	const next: HierarchyPath = {};
	for (let i = 0; i <= idx; i++) {
		const lvl = HIERARCHY_ORDER[i];
		if (lvl && path[lvl] != null) next[lvl] = path[lvl];
	}
	return next;
}

export function filterByPath(films: Film[], path: HierarchyPath): Film[] {
	return films.filter((f) => {
		if (path.format && getValueAtLevel(f, "format") !== path.format) return false;
		if (path.type && getValueAtLevel(f, "type") !== path.type) return false;
		if (path.brand && getValueAtLevel(f, "brand") !== path.brand) return false;
		if (path.model && getValueAtLevel(f, "model") !== path.model) return false;
		return true;
	});
}

interface ChildAggregate {
	count: number;
	grandChildren: Set<string>;
}

export function buildHierarchyNodes(level: HierarchyLevel, filtered: Film[]): HierarchyNode[] {
	const grandLevel = nextLevel(level);
	const map = new Map<string, ChildAggregate>();

	for (const f of filtered) {
		const value = getValueAtLevel(f, level);
		let entry = map.get(value);
		if (!entry) {
			entry = { count: 0, grandChildren: new Set<string>() };
			map.set(value, entry);
		}
		entry.count++;
		if (grandLevel) {
			entry.grandChildren.add(getValueAtLevel(f, grandLevel));
		}
	}

	const nodes: HierarchyNode[] = [];
	for (const [value, agg] of map.entries()) {
		nodes.push({
			key: `${level}:${value}`,
			level,
			value,
			label: value,
			count: agg.count,
			childCount: agg.grandChildren.size,
		});
	}

	nodes.sort((a, b) => {
		if (a.value === UNKNOWN && b.value !== UNKNOWN) return 1;
		if (b.value === UNKNOWN && a.value !== UNKNOWN) return -1;
		if (a.count !== b.count) return b.count - a.count;
		return a.label.localeCompare(b.label);
	});
	return nodes;
}

export function buildHierarchy(films: Film[], path: HierarchyPath): HierarchyNode[] {
	const { level, filtered } = resolveDisplayLevel(films, path);
	if (level === null) return [];
	return buildHierarchyNodes(level, filtered);
}

/**
 * Group a leaf-level film list (same model) by expiration date.
 * Mirrors the original groupFilms logic from StockScreen, applied to stock films.
 */
export function groupByExpiration(films: Film[], locale: string): FilmGroup[] {
	const map = new Map<string, Film[]>();
	const ungrouped: FilmGroup[] = [];

	for (const f of films) {
		if (f.state !== "stock") {
			ungrouped.push({
				key: f.id,
				label: filmName(f),
				expLabel: f.expDate ? fmtExpDate(f.expDate, locale) : "",
				films: [f],
			});
			continue;
		}
		const exp = f.expDate || "";
		const key = `${filmName(f)}||${exp}`;
		const group = map.get(key);
		if (group) group.push(f);
		else map.set(key, [f]);
	}

	const grouped: FilmGroup[] = [];
	for (const [key, list] of map.entries()) {
		const first = list[0];
		if (!first) continue;
		grouped.push({
			key,
			label: filmName(first),
			expLabel: first.expDate ? fmtExpDate(first.expDate, locale) : "",
			films: list,
		});
	}

	return [...grouped, ...ungrouped];
}
