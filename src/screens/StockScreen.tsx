import { Film, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { StockFilterDialog } from "@/components/StockFilterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { fmtExpDate } from "@/utils/expiration";
import { filmName } from "@/utils/film-helpers";
import { type SortOption, useStockFilters } from "@/utils/use-stock-filters";

interface FilmGroup {
	key: string;
	label: string;
	expLabel: string;
	films: FilmType[];
}

function groupFilms(films: FilmType[], locale: string): FilmGroup[] {
	const map = new Map<string, FilmType[]>();
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

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
	{ value: "name-asc", labelKey: "stock.nameAsc" },
	{ value: "name-desc", labelKey: "stock.nameDesc" },
	{ value: "added-desc", labelKey: "stock.addedDate" },
	{ value: "added-asc", labelKey: "stock.addedDateAsc" },
	{ value: "exp-asc", labelKey: "stock.expirationDate" },
	{ value: "exp-desc", labelKey: "stock.expirationDateDesc" },
	{ value: "price-asc", labelKey: "stock.price" },
	{ value: "price-desc", labelKey: "stock.priceDesc" },
	{ value: "iso-asc", labelKey: "stock.isoAsc" },
	{ value: "iso-desc", labelKey: "stock.isoDesc" },
];

interface StockScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	onAddFilm: () => void;
}

export function StockScreen({ data, setScreen, setSelectedFilm, onAddFilm }: StockScreenProps) {
	const { t } = useTranslation();
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const { films, cameras, backs } = data;

	const stockFilters = useStockFilters(films);
	const groups = groupFilms(stockFilters.filteredFilms, t("dateLocale"));

	const stateCounts: Record<string, number> = {};
	for (const f of films) {
		stateCounts[f.state] = (stateCounts[f.state] || 0) + 1;
	}

	const stateTabs = [
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

			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search size={16} className="text-text-muted absolute left-3 top-3" />
					<Input
						value={stockFilters.search}
						onChange={(e) => stockFilters.setSearch(e.target.value)}
						placeholder={t("stock.search")}
						className="w-full rounded-xl pl-9"
					/>
				</div>
				<Button
					variant={stockFilters.hasActiveFilters ? "default" : "outline"}
					size="icon"
					onClick={() => setFilterDialogOpen(true)}
				>
					<SlidersHorizontal size={16} />
				</Button>
			</div>

			<ActiveFilterChips
				filters={stockFilters.activeFilterDescriptions}
				onRemove={stockFilters.removeFilter}
				onReset={stockFilters.resetFilters}
			/>

			<div className="flex justify-between items-center">
				<span className="text-sm text-text-muted">{t("stock.resultCount", { count: stockFilters.resultCount })}</span>
				<Select value={stockFilters.sortOption} onValueChange={(v) => stockFilters.setSortOption(v as SortOption)}>
					<SelectTrigger className="w-auto min-w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SORT_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{t(opt.labelKey)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-2">
				{groups.map((group) => {
					const representative = group.films[0]!;
					return (
						<FilmRow
							key={group.key}
							film={representative}
							cameras={cameras}
							backs={backs}
							groupCount={group.films.length}
							onClick={() => {
								setSelectedFilm(representative.id);
								setScreen("filmDetail");
							}}
						/>
					);
				})}
				{stockFilters.filteredFilms.length === 0 && (
					<EmptyState icon={Film} title={t("stock.nothingFound")} subtitle={t("stock.noMatch")} />
				)}
			</div>

			<StockFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				filters={stockFilters.filters}
				stateFilter={stockFilters.stateFilter}
				stateTabs={stateTabs}
				availableBrands={stockFilters.availableBrands}
				availableIsoValues={stockFilters.availableIsoValues}
				onSetStateFilter={stockFilters.setStateFilter}
				onSetFormat={stockFilters.setFormat}
				onSetType={stockFilters.setType}
				onToggleBrand={stockFilters.toggleBrand}
				onToggleIso={stockFilters.toggleIso}
				onReset={stockFilters.resetFilters}
			/>
		</div>
	);
}
