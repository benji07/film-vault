import "maplibre-gl/dist/maplibre-gl.css";
import { Crosshair, MapPin, X } from "lucide-react";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Map as MapGL, Marker } from "react-map-gl/maplibre";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { AppData, Film, FilmType, ScreenName, ShotNote } from "@/types";
import { filmName } from "@/utils/film-helpers";

interface GeoNote {
	note: ShotNote;
	film: Film;
	latitude: number;
	longitude: number;
}

interface MapScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	filterFilmId: string | null;
	onClearFilter: () => void;
}

const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const MARKER_COLORS: Record<string, string> = {
	Couleur: "#d4a858",
	"N&B": "#a09a92",
	Diapo: "#5b7fa5",
	"ECN-2": "#c4392d",
};

const DEFAULT_MARKER_COLOR = "#a09a92";

function getMarkerColor(filmType?: string): string {
	return filmType ? (MARKER_COLORS[filmType] ?? DEFAULT_MARKER_COLOR) : DEFAULT_MARKER_COLOR;
}

function collectGeoNotes(films: Film[]): GeoNote[] {
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

function fitMapToBounds(map: maplibregl.Map, notes: GeoNote[]) {
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

// Group nearby markers into clusters
interface Cluster {
	id: string;
	latitude: number;
	longitude: number;
	notes: GeoNote[];
}

function clusterNotes(notes: GeoNote[], zoom: number): Cluster[] {
	// At high zoom, don't cluster
	if (zoom >= 14) {
		return notes.map((n) => ({
			id: `single-${n.note.id}`,
			latitude: n.latitude,
			longitude: n.longitude,
			notes: [n],
		}));
	}

	// Simple grid-based clustering
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

// Marker component
interface NoteMarkerProps {
	cluster: Cluster;
	onClick: (cluster: Cluster) => void;
}

function NoteMarker({ cluster, onClick }: NoteMarkerProps) {
	const isCluster = cluster.notes.length > 1;
	const geoNote = cluster.notes[0]!;
	const color = isCluster ? "#c4392d" : getMarkerColor(geoNote.film.type);
	const size = isCluster ? Math.min(20 + cluster.notes.length * 3, 44) : 28;

	return (
		<Marker latitude={cluster.latitude} longitude={cluster.longitude} anchor="center" onClick={() => onClick(cluster)}>
			<button
				type="button"
				className="flex items-center justify-center rounded-full border-2 border-white/80 shadow-lg cursor-pointer transition-transform hover:scale-110"
				style={{ width: size, height: size, backgroundColor: color }}
			>
				{isCluster ? (
					<span className="text-[11px] font-bold text-white font-body">{cluster.notes.length}</span>
				) : geoNote.note.frameNumber != null ? (
					<span className="text-[10px] font-bold text-white font-mono">{geoNote.note.frameNumber}</span>
				) : (
					<MapPin size={14} className="text-white" />
				)}
			</button>
		</Marker>
	);
}

// Bottom sheet for note detail
interface NoteSheetProps {
	geoNote: GeoNote;
	onClose: () => void;
	onViewFilm: () => void;
}

function NoteSheet({ geoNote, onClose, onViewFilm }: NoteSheetProps) {
	const { t } = useTranslation();
	const { note, film } = geoNote;
	const name = filmName(film);

	return (
		<div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
			<div className="bg-card border-t border-border rounded-t-2xl shadow-2xl mx-auto max-w-lg w-full">
				<div className="flex justify-center pt-2 pb-1">
					<div className="w-10 h-1 rounded-full bg-border" />
				</div>
				<div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
					<div className="flex items-start justify-between gap-3 mb-3">
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 mb-1">
								{note.frameNumber != null && (
									<Badge
										style={{
											color: "var(--color-text-primary)",
											background: "var(--color-accent-soft)",
											fontFamily: "var(--font-mono)",
										}}
									>
										#{note.frameNumber}
									</Badge>
								)}
								<span className="text-sm font-semibold text-text-primary truncate">{name}</span>
							</div>
							{(note.aperture || note.shutterSpeed) && (
								<p className="text-xs text-text-sec">
									{[note.aperture, note.shutterSpeed].filter(Boolean).join(" · ")}
								</p>
							)}
							{note.location && <p className="text-xs text-text-muted mt-0.5 truncate">{note.location}</p>}
							{note.lens && <p className="text-xs text-text-muted truncate">{note.lens}</p>}
						</div>
						<Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -mr-2">
							<X size={18} className="text-text-muted" />
						</Button>
					</div>

					{note.photo && (
						<div className="mb-3 rounded-lg overflow-hidden">
							<img src={note.photo} alt="" className="w-full h-32 object-cover" />
						</div>
					)}

					<Button variant="outline" className="w-full justify-center" onClick={onViewFilm}>
						{t("map.viewFilm")}
					</Button>
				</div>
			</div>
		</div>
	);
}

// Cluster sheet (multiple notes)
interface ClusterSheetProps {
	cluster: Cluster;
	onClose: () => void;
	onSelectNote: (geoNote: GeoNote) => void;
}

function ClusterSheet({ cluster, onClose, onSelectNote }: ClusterSheetProps) {
	const { t } = useTranslation();
	return (
		<div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
			<div className="bg-card border-t border-border rounded-t-2xl shadow-2xl mx-auto max-w-lg w-full">
				<div className="flex justify-center pt-2 pb-1">
					<div className="w-10 h-1 rounded-full bg-border" />
				</div>
				<div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-semibold text-text-primary">
							{t("map.noteCount", { count: cluster.notes.length })}
						</span>
						<Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
							<X size={18} className="text-text-muted" />
						</Button>
					</div>
					<div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
						{cluster.notes.map((geoNote) => {
							const name = filmName(geoNote.film);
							const color = getMarkerColor(geoNote.film.type);
							return (
								<button
									type="button"
									key={geoNote.note.id}
									onClick={() => onSelectNote(geoNote)}
									className="flex items-center gap-2 rounded-lg px-3 py-2 bg-surface hover:bg-surface-alt transition-colors text-left"
								>
									<div
										className="w-3 h-3 rounded-full shrink-0 border border-white/50"
										style={{ backgroundColor: color }}
									/>
									{geoNote.note.frameNumber != null && (
										<span className="text-xs font-mono text-text-sec">#{geoNote.note.frameNumber}</span>
									)}
									<span className="text-sm text-text-primary truncate flex-1">{name}</span>
									{geoNote.note.aperture && <span className="text-xs text-text-muted">{geoNote.note.aperture}</span>}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

// Filter bar
interface FilterBarProps {
	films: Film[];
	filterFilmId: string | null;
	filterType: FilmType | null;
	onFilterFilm: (id: string | null) => void;
	onFilterType: (type: FilmType | null) => void;
	onClearFilter: () => void;
}

function FilterBar({ films, filterFilmId, filterType, onFilterFilm, onFilterType, onClearFilter }: FilterBarProps) {
	const { t } = useTranslation();

	// Only films that have geolocated notes
	const filmsWithGeo = useMemo(
		() => films.filter((f) => f.shotNotes?.some((n) => n.latitude != null && n.longitude != null)),
		[films],
	);

	const filmTypes: FilmType[] = ["Couleur", "N&B", "Diapo", "ECN-2"];

	const hasActiveFilter = filterFilmId != null || filterType != null;

	return (
		<div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2">
			{/* Film type filter */}
			<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
				<Chip active={filterType == null} onClick={() => onFilterType(null)} className="shrink-0 text-xs shadow-md">
					{t("map.allTypes")}
				</Chip>
				{filmTypes.map((type) => (
					<Chip
						key={type}
						active={filterType === type}
						onClick={() => onFilterType(filterType === type ? null : type)}
						className="shrink-0 text-xs shadow-md"
					>
						<div className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKER_COLORS[type] }} />
						{type}
					</Chip>
				))}
			</div>

			{/* Film filter */}
			{filmsWithGeo.length > 1 && (
				<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
					<Chip
						active={filterFilmId == null}
						onClick={() => {
							onFilterFilm(null);
							onClearFilter();
						}}
						className="shrink-0 text-xs shadow-md"
					>
						{t("map.allFilms")}
					</Chip>
					{filmsWithGeo.map((film) => (
						<Chip
							key={film.id}
							active={filterFilmId === film.id}
							onClick={() => onFilterFilm(filterFilmId === film.id ? null : film.id)}
							className="shrink-0 text-xs shadow-md max-w-[160px] truncate"
						>
							{filmName(film)}
						</Chip>
					))}
				</div>
			)}

			{hasActiveFilter && filterFilmId && (
				<button
					type="button"
					onClick={() => {
						onFilterFilm(null);
						onClearFilter();
					}}
					className="self-start flex items-center gap-1 text-xs text-accent bg-card/90 backdrop-blur rounded-full px-2.5 py-1 shadow-md border border-border"
				>
					<X size={12} />
					{t("map.allFilms")}
				</button>
			)}
		</div>
	);
}

// Recenter button
function RecenterButton({ onClick }: { onClick: () => void }) {
	const { t } = useTranslation();
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={onClick}
			className="absolute bottom-20 right-3 z-10 shadow-lg bg-card/90 backdrop-blur"
			aria-label={t("map.recenter")}
		>
			<Crosshair size={18} className="text-text-sec" />
		</Button>
	);
}

export function MapScreen({ data, setScreen, setSelectedFilm, filterFilmId, onClearFilter }: MapScreenProps) {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const mapRef = useRef<maplibregl.Map | null>(null);

	const [zoom, setZoom] = useState(3);
	const [localFilterFilmId, setLocalFilterFilmId] = useState<string | null>(filterFilmId);
	const [filterType, setFilterType] = useState<FilmType | null>(null);
	const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
	const [selectedNote, setSelectedNote] = useState<GeoNote | null>(null);

	// Sync external filter
	useEffect(() => {
		setLocalFilterFilmId(filterFilmId);
	}, [filterFilmId]);

	// Collect all geolocated notes
	const allGeoNotes = useMemo(() => collectGeoNotes(data.films), [data.films]);

	// Apply filters
	const filteredNotes = useMemo(() => {
		let notes = allGeoNotes;
		if (localFilterFilmId) {
			notes = notes.filter((n) => n.film.id === localFilterFilmId);
		}
		if (filterType) {
			notes = notes.filter((n) => n.film.type === filterType);
		}
		return notes;
	}, [allGeoNotes, localFilterFilmId, filterType]);

	// Cluster notes
	const clusters = useMemo(() => clusterNotes(filteredNotes, zoom), [filteredNotes, zoom]);

	// Fit bounds on initial load and filter changes
	useEffect(() => {
		const map = mapRef.current;
		if (map && filteredNotes.length > 0) {
			fitMapToBounds(map, filteredNotes);
		}
	}, [filteredNotes]);

	const handleClusterClick = useCallback((cluster: Cluster) => {
		setSelectedNote(null);
		if (cluster.notes.length === 1 && cluster.notes[0]) {
			setSelectedNote(cluster.notes[0]);
			setSelectedCluster(null);
		} else {
			setSelectedCluster(cluster);
			// Zoom into cluster
			const map = mapRef.current;
			if (map) {
				fitMapToBounds(map, cluster.notes);
			}
		}
	}, []);

	const handleViewFilm = useCallback(() => {
		if (!selectedNote) return;
		setSelectedFilm(selectedNote.film.id);
		setScreen("filmDetail");
	}, [selectedNote, setSelectedFilm, setScreen]);

	const handleRecenter = useCallback(() => {
		const map = mapRef.current;
		if (map) {
			fitMapToBounds(map, filteredNotes);
		}
	}, [filteredNotes]);

	// Empty state
	if (allGeoNotes.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<EmptyState
					icon={MapPin}
					title={t("map.emptyTitle")}
					subtitle={t("map.emptySubtitle")}
					action={
						<Button variant="outline" onClick={() => setScreen("stock")}>
							{t("map.emptyAction")}
						</Button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full">
			<MapGL
				mapLib={maplibregl}
				mapStyle={theme === "dark" ? DARK_STYLE : LIGHT_STYLE}
				initialViewState={{ longitude: 2.35, latitude: 46.85, zoom: 5 }}
				style={{ width: "100%", height: "100%" }}
				onLoad={(e) => {
					mapRef.current = e.target;
					fitMapToBounds(e.target, filteredNotes);
				}}
				onZoom={(e) => setZoom(Math.floor(e.viewState.zoom))}
				onClick={() => {
					setSelectedNote(null);
					setSelectedCluster(null);
				}}
				attributionControl={false}
			>
				{clusters.map((cluster) => (
					<NoteMarker key={cluster.id} cluster={cluster} onClick={handleClusterClick} />
				))}
			</MapGL>

			<FilterBar
				films={data.films}
				filterFilmId={localFilterFilmId}
				filterType={filterType}
				onFilterFilm={setLocalFilterFilmId}
				onFilterType={setFilterType}
				onClearFilter={onClearFilter}
			/>

			<RecenterButton onClick={handleRecenter} />

			{selectedNote && (
				<NoteSheet geoNote={selectedNote} onClose={() => setSelectedNote(null)} onViewFilm={handleViewFilm} />
			)}

			{selectedCluster && !selectedNote && (
				<ClusterSheet
					cluster={selectedCluster}
					onClose={() => setSelectedCluster(null)}
					onSelectNote={(geoNote) => {
						setSelectedCluster(null);
						setSelectedNote(geoNote);
					}}
				/>
			)}
		</div>
	);
}
