import maplibregl from "maplibre-gl";
import type { Film, ShotNote } from "@/types";

export interface GeoNote {
	note: ShotNote;
	film: Film;
	latitude: number;
	longitude: number;
}

export interface Cluster {
	id: string;
	latitude: number;
	longitude: number;
	notes: GeoNote[];
}

export const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
export const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export const MARKER_COLORS: Record<string, string> = {
	Couleur: "#d4a858",
	"N&B": "#a09a92",
	Diapo: "#5b7fa5",
	"ECN-2": "#c4392d",
};

const DEFAULT_MARKER_COLOR = "#a09a92";

export function getMarkerColor(filmType?: string): string {
	return filmType ? (MARKER_COLORS[filmType] ?? DEFAULT_MARKER_COLOR) : DEFAULT_MARKER_COLOR;
}

export function collectGeoNotes(films: Film[]): GeoNote[] {
	const result: GeoNote[] = [];
	for (const film of films) {
		for (const note of film.shotNotes ?? []) {
			if (note.latitude != null && note.longitude != null) {
				result.push({ note, film, latitude: note.latitude, longitude: note.longitude });
			}
		}
	}
	return result;
}

export function fitMapToBounds(map: maplibregl.Map, notes: GeoNote[]) {
	if (notes.length === 0) return;
	const first = notes[0];
	if (notes.length === 1 && first) {
		map.flyTo({ center: [first.longitude, first.latitude], zoom: 14 });
		return;
	}
	const bounds = new maplibregl.LngLatBounds();
	for (const n of notes) {
		bounds.extend([n.longitude, n.latitude]);
	}
	map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
}

export function clusterNotes(notes: GeoNote[], zoom: number): Cluster[] {
	if (zoom >= 14) {
		return notes.map((n) => ({
			id: `single-${n.note.id}`,
			latitude: n.latitude,
			longitude: n.longitude,
			notes: [n],
		}));
	}

	const cellSize = 360 / 2 ** (zoom + 2);
	const cells: Record<string, GeoNote[]> = {};

	for (const n of notes) {
		const cellX = Math.floor(n.longitude / cellSize);
		const cellY = Math.floor(n.latitude / cellSize);
		const key = `${cellX}:${cellY}`;
		if (cells[key]) {
			cells[key].push(n);
		} else {
			cells[key] = [n];
		}
	}

	const clusters: Cluster[] = [];
	for (const [key, cellNotes] of Object.entries(cells)) {
		const avgLat = cellNotes.reduce((s: number, n: GeoNote) => s + n.latitude, 0) / cellNotes.length;
		const avgLng = cellNotes.reduce((s: number, n: GeoNote) => s + n.longitude, 0) / cellNotes.length;
		clusters.push({ id: `cluster-${key}`, latitude: avgLat, longitude: avgLng, notes: cellNotes });
	}
	return clusters;
}
