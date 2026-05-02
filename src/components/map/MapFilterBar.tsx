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
	filterTag: string | null;
	availableTags: string[];
	onFilterFilm: (id: string | null) => void;
	onFilterType: (type: FilmType | null) => void;
	onFilterTag: (tag: string | null) => void;
	onClearFilter: () => void;
}

const FILM_TYPES: FilmType[] = ["Couleur", "N&B", "Diapo", "ECN-2"];

export function MapFilterBar({
	films,
	filterFilmId,
	filterType,
	filterTag,
	availableTags,
	onFilterFilm,
	onFilterType,
	onFilterTag,
	onClearFilter,
}: MapFilterBarProps) {
	const { t } = useTranslation();

	const filmsWithGeo = useMemo(
		() => films.filter((f) => f.shotNotes?.some((n) => n.latitude != null && n.longitude != null)),
		[films],
	);

	return (
		<div className="flex flex-col gap-1.5 px-[18px] pb-2.5">
			{/* Film type filter */}
			<div className="flex gap-1.5 overflow-x-auto fv-noscroll">
				<Chip active={filterType == null} onClick={() => onFilterType(null)} className="flex-none">
					{t("map.allTypes")}
				</Chip>
				{FILM_TYPES.map((type) => {
					const active = filterType === type;
					return (
						<Chip key={type} active={active} onClick={() => onFilterType(active ? null : type)} className="flex-none">
							<div className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKER_COLORS[type] }} />
							{t(`filmTypes.${type}`, type)}
						</Chip>
					);
				})}
			</div>

			{/* Tag filter */}
			{availableTags.length > 0 && (
				<div className="flex gap-1.5 overflow-x-auto fv-noscroll">
					<Chip active={filterTag == null} onClick={() => onFilterTag(null)} className="flex-none">
						{t("map.allTags")}
					</Chip>
					{availableTags.map((tag) => {
						const active = filterTag === tag;
						return (
							<Chip key={tag} active={active} onClick={() => onFilterTag(active ? null : tag)} className="flex-none">
								{tag}
							</Chip>
						);
					})}
				</div>
			)}

			{/* Film filter */}
			{filmsWithGeo.length > 1 && (
				<div className="flex gap-1.5 overflow-x-auto fv-noscroll">
					<Chip
						active={filterFilmId == null}
						onClick={() => {
							onFilterFilm(null);
							onClearFilter();
						}}
						className="flex-none"
					>
						{t("map.allFilms")}
					</Chip>
					{filmsWithGeo.map((film) => {
						const active = filterFilmId === film.id;
						return (
							<Chip
								key={film.id}
								active={active}
								onClick={() => {
									onFilterFilm(active ? null : film.id);
									onClearFilter();
								}}
								className="flex-none max-w-[160px] truncate"
							>
								{filmName(film)}
							</Chip>
						);
					})}
				</div>
			)}

			{filterFilmId && (
				<button
					type="button"
					onClick={() => {
						onFilterFilm(null);
						onClearFilter();
					}}
					className="self-start flex items-center gap-1 font-archivo font-extrabold text-[10px] uppercase tracking-[0.12em] text-kodak-red bg-paper-card border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] px-2.5 py-1.5 mt-1"
				>
					<X size={12} />
					{t("map.allFilms")}
				</button>
			)}
		</div>
	);
}
