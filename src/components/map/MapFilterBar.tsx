import { X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/chip";
import type { Film, FilmType } from "@/types";
import { filmName } from "@/utils/film-helpers";
import { MARKER_COLORS } from "@/utils/map-helpers";

interface MapFilterBarProps {
	films: Film[];
	filterFilmId: string | null;
	filterType: FilmType | null;
	onFilterFilm: (id: string | null) => void;
	onFilterType: (type: FilmType | null) => void;
	onClearFilter: () => void;
}

const FILM_TYPES: FilmType[] = ["Couleur", "N&B", "Diapo", "ECN-2"];

export function MapFilterBar({
	films,
	filterFilmId,
	filterType,
	onFilterFilm,
	onFilterType,
	onClearFilter,
}: MapFilterBarProps) {
	const { t } = useTranslation();

	const filmsWithGeo = useMemo(
		() => films.filter((f) => f.shotNotes?.some((n) => n.latitude != null && n.longitude != null)),
		[films],
	);

	return (
		<div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 right-3 z-10 flex flex-col gap-2">
			{/* Film type filter */}
			<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
				<Chip active={filterType == null} onClick={() => onFilterType(null)} className="shrink-0 text-xs shadow-md">
					{t("map.allTypes")}
				</Chip>
				{FILM_TYPES.map((type) => (
					<Chip
						key={type}
						active={filterType === type}
						onClick={() => onFilterType(filterType === type ? null : type)}
						className="shrink-0 text-xs shadow-md"
					>
						<div className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKER_COLORS[type] }} />
						{t(`filmTypes.${type}`, type)}
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
							onClick={() => {
								onFilterFilm(filterFilmId === film.id ? null : film.id);
								onClearFilter();
							}}
							className="shrink-0 text-xs shadow-md max-w-[160px] truncate"
						>
							{filmName(film)}
						</Chip>
					))}
				</div>
			)}

			{filterFilmId && (
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
