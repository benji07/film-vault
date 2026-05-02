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

// On the map, chips need maximum readability over the tiles. Inactive
// chips sit on opaque paper-card, active chips are inverted (ink bg +
// yellow text) for a strong active/inactive distinction. tailwind-merge
// inside Chip lets the classes here override the defaults.
function mapChipCls(active: boolean, extra = ""): string {
	const base = active
		? "shrink-0 text-xs bg-ink text-kodak-yellow border-ink"
		: "shrink-0 text-xs bg-paper-card text-ink";
	return extra ? `${base} ${extra}` : base;
}

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
		<div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2">
			{/* Film type filter */}
			<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
				<Chip active={filterType == null} onClick={() => onFilterType(null)} className={mapChipCls(filterType == null)}>
					{t("map.allTypes")}
				</Chip>
				{FILM_TYPES.map((type) => {
					const active = filterType === type;
					return (
						<Chip
							key={type}
							active={active}
							onClick={() => onFilterType(active ? null : type)}
							className={mapChipCls(active)}
						>
							<div className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKER_COLORS[type] }} />
							{t(`filmTypes.${type}`, type)}
						</Chip>
					);
				})}
			</div>

			{/* Tag filter */}
			{availableTags.length > 0 && (
				<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
					<Chip active={filterTag == null} onClick={() => onFilterTag(null)} className={mapChipCls(filterTag == null)}>
						{t("map.allTags")}
					</Chip>
					{availableTags.map((tag) => {
						const active = filterTag === tag;
						return (
							<Chip
								key={tag}
								active={active}
								onClick={() => onFilterTag(active ? null : tag)}
								className={mapChipCls(active)}
							>
								{tag}
							</Chip>
						);
					})}
				</div>
			)}

			{/* Film filter */}
			{filmsWithGeo.length > 1 && (
				<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
					<Chip
						active={filterFilmId == null}
						onClick={() => {
							onFilterFilm(null);
							onClearFilter();
						}}
						className={mapChipCls(filterFilmId == null)}
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
								className={mapChipCls(active, "max-w-[160px] truncate")}
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
					className="self-start flex items-center gap-1 font-archivo font-extrabold text-[10px] uppercase tracking-[0.12em] text-kodak-red bg-paper-card border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] px-2.5 py-1.5"
				>
					<X size={12} />
					{t("map.allFilms")}
				</button>
			)}
		</div>
	);
}
