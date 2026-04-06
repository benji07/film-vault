import { Film, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { Button } from "@/components/ui/button";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { fmtExpDate } from "@/utils/expiration";
import { filmName } from "@/utils/film-helpers";

interface FilmGroup {
	key: string;
	label: string;
	expLabel: string;
	films: FilmType[];
}

function lastModifiedDate(film: FilmType): string {
	if (film.history.length > 0) {
		return film.history[film.history.length - 1]!.date;
	}
	return film.addedDate;
}

function compareAlphabetic(a: FilmType, b: FilmType): number {
	const brandA = (a.brand || "").toLowerCase();
	const brandB = (b.brand || "").toLowerCase();
	if (brandA !== brandB) return brandA.localeCompare(brandB);

	const modelA = (a.model || a.customName || "").toLowerCase();
	const modelB = (b.model || b.customName || "").toLowerCase();
	if (modelA !== modelB) return modelA.localeCompare(modelB);

	const expA = a.expDate || "";
	const expB = b.expDate || "";
	return expA.localeCompare(expB);
}

function groupFilms(films: FilmType[], locale: string, sortByDate: boolean): FilmGroup[] {
	if (sortByDate) {
		const sorted = [...films].sort((a, b) => lastModifiedDate(b).localeCompare(lastModifiedDate(a)));
		return sorted.map((f) => ({
			key: f.id,
			label: filmName(f),
			expLabel: f.expDate ? fmtExpDate(f.expDate, locale) : "",
			films: [f],
		}));
	}

	const map = new Map<string, FilmType[]>();
	const ungrouped: FilmGroup[] = [];

	const sorted = [...films].sort(compareAlphabetic);

	for (const f of sorted) {
		if (f.state !== "stock") {
			ungrouped.push({
				key: f.id,
				label: filmName(f),
				expLabel: f.expDate ? fmtExpDate(f.expDate, locale) : "",
				films: [f],
			});
			continue;
		}
		const name = filmName(f);
		const exp = f.expDate || "";
		const key = `${name}||${exp}`;
		const group = map.get(key);
		if (group) {
			group.push(f);
		} else {
			map.set(key, [f]);
		}
	}

	const grouped = Array.from(map.entries()).map(([key, groupFilms]) => {
		const first = groupFilms[0]!;
		return {
			key,
			label: filmName(first),
			expLabel: first.expDate ? fmtExpDate(first.expDate, locale) : "",
			films: groupFilms,
		};
	});

	return [...grouped, ...ungrouped];
}

interface StockScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	onAddFilm: () => void;
}

export function StockScreen({ data, setScreen, setSelectedFilm, onAddFilm }: StockScreenProps) {
	const { t } = useTranslation();
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const { films, cameras } = data;

	const filtered = films.filter((f) => {
		if (filter !== "all" && f.state !== filter) return false;
		if (search) {
			const name = filmName(f);
			return name.toLowerCase().includes(search.toLowerCase());
		}
		return true;
	});

	const sortByDate = filter !== "all" && filter !== "stock";
	const groups = groupFilms(filtered, t("dateLocale"), sortByDate);

	const stateCounts: Record<string, number> = {};
	for (const f of films) {
		stateCounts[f.state] = (stateCounts[f.state] || 0) + 1;
	}

	const tabs = [
		{ key: "all", label: t("stock.all"), count: films.length },
		{ key: "stock", label: t("stock.stockTab"), count: stateCounts.stock || 0 },
		{ key: "loaded", label: t("stock.loadedTab"), count: stateCounts.loaded || 0 },
		{ key: "partial", label: t("stock.partialTab"), count: stateCounts.partial || 0 },
		{ key: "exposed", label: t("stock.exposedTab"), count: stateCounts.exposed || 0 },
		{ key: "developed", label: t("stock.developedTab"), count: stateCounts.developed || 0 },
		{ key: "scanned", label: t("stock.scannedTab"), count: stateCounts.scanned || 0 },
	];

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("stock.title")}</h2>
				<Button size="sm" onClick={onAddFilm}>
					<Plus size={14} /> {t("stock.add")}
				</Button>
			</div>

			<div className="relative">
				<Search size={16} className="text-text-muted absolute left-3 top-3" />
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t("stock.search")}
					className="w-full bg-surface-alt border border-border rounded-xl py-2.5 pr-3.5 pl-9 text-text-primary text-sm font-body outline-none"
				/>
			</div>

			<div className="flex gap-1.5 overflow-x-auto pb-1">
				{tabs.map((tab) => (
					<button
						type="button"
						key={tab.key}
						onClick={() => setFilter(tab.key)}
						className={`py-2.5 px-4 rounded-full border-none cursor-pointer text-xs font-semibold font-body whitespace-nowrap transition-all min-h-[44px] ${
							filter === tab.key ? "bg-accent text-white" : "bg-surface-alt text-text-sec"
						}`}
					>
						{tab.label} <span className="opacity-70">({tab.count})</span>
					</button>
				))}
			</div>

			<div className="flex flex-col gap-2">
				{groups.map((group) => {
					const representative = group.films[0]!;
					return (
						<FilmRow
							key={group.key}
							film={representative}
							cameras={cameras}
							groupCount={group.films.length}
							onClick={() => {
								setSelectedFilm(representative.id);
								setScreen("filmDetail");
							}}
						/>
					);
				})}
				{filtered.length === 0 && (
					<EmptyState icon={Film} title={t("stock.nothingFound")} subtitle={t("stock.noMatch")} />
				)}
			</div>
		</div>
	);
}
