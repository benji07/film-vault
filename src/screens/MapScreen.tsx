import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Map as MapGL } from "react-map-gl/maplibre";
import { EmptyState } from "@/components/EmptyState";
import { ClusterSheet } from "@/components/map/ClusterSheet";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { NoteMarker } from "@/components/map/NoteMarker";
import { NoteSheet } from "@/components/map/NoteSheet";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import type { AppData, FilmType, ScreenName } from "@/types";
import { collectAllTags } from "@/utils/film-helpers";
import type { Cluster, GeoNote } from "@/utils/map-helpers";
import { clusterNotes, collectGeoNotes, DARK_STYLE, fitMapToBounds, LIGHT_STYLE } from "@/utils/map-helpers";

interface MapScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	filterFilmId: string | null;
	onClearFilter: () => void;
}

export function MapScreen({ data, setScreen, setSelectedFilm, filterFilmId, onClearFilter }: MapScreenProps) {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const mapRef = useRef<maplibregl.Map | null>(null);

	const [zoom, setZoom] = useState(3);
	const [localFilterFilmId, setLocalFilterFilmId] = useState<string | null>(filterFilmId);
	const [filterType, setFilterType] = useState<FilmType | null>(null);
	const [filterTag, setFilterTag] = useState<string | null>(null);
	const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
	const [selectedNote, setSelectedNote] = useState<GeoNote | null>(null);
	const [locating, setLocating] = useState(false);

	useEffect(() => {
		setLocalFilterFilmId(filterFilmId);
	}, [filterFilmId]);

	const allGeoNotes = useMemo(() => collectGeoNotes(data.films), [data.films]);
	const availableTags = useMemo(() => {
		const filmIds = new Set(allGeoNotes.map((n) => n.film.id));
		return collectAllTags(data.films.filter((f) => filmIds.has(f.id)));
	}, [data.films, allGeoNotes]);

	const filteredNotes = useMemo(() => {
		let notes = allGeoNotes;
		if (localFilterFilmId) {
			notes = notes.filter((n) => n.film.id === localFilterFilmId);
		}
		if (filterType) {
			notes = notes.filter((n) => n.film.type === filterType);
		}
		if (filterTag) {
			const target = filterTag.toLowerCase();
			notes = notes.filter((n) => n.film.tags?.some((t) => t.toLowerCase() === target));
		}
		return notes;
	}, [allGeoNotes, localFilterFilmId, filterType, filterTag]);

	const clusters = useMemo(() => clusterNotes(filteredNotes, zoom), [filteredNotes, zoom]);

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

	const handleLocateMe = useCallback(() => {
		const map = mapRef.current;
		if (!map || !navigator.geolocation) return;
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				map.flyTo({
					center: [position.coords.longitude, position.coords.latitude],
					zoom: 14,
				});
				setLocating(false);
			},
			() => {
				setLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 10000 },
		);
	}, []);

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
				onMoveEnd={(e) => setZoom(Math.floor(e.viewState.zoom))}
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

			<MapFilterBar
				films={data.films}
				filterFilmId={localFilterFilmId}
				filterType={filterType}
				filterTag={filterTag}
				availableTags={availableTags}
				onFilterFilm={setLocalFilterFilmId}
				onFilterType={setFilterType}
				onFilterTag={setFilterTag}
				onClearFilter={onClearFilter}
			/>

			<Button
				variant="outline"
				size="icon"
				onClick={handleLocateMe}
				disabled={locating}
				className="absolute bottom-16 right-3 z-10 shadow-lg bg-card/90 backdrop-blur"
				aria-label={t("map.locateMe")}
			>
				{locating ? (
					<Loader2 size={18} className="text-accent animate-spin" />
				) : (
					<LocateFixed size={18} className="text-text-sec" />
				)}
			</Button>

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
