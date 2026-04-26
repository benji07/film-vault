import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { StockFilterDialog } from "@/components/StockFilterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, Film, FilmState } from "@/types";
import type { HierarchyPath } from "@/utils/stock-hierarchy";
import { usePersistedState } from "@/utils/use-persisted-state";
import { type SortOption, useStockFilters } from "@/utils/use-stock-filters";
import { ActiveTab } from "./ActiveTab";
import { ArchiveTab } from "./ArchiveTab";
import { StockTab } from "./StockTab";
import { StockTabBar, type StockTab as StockTabKey } from "./StockTabBar";

const TAB_STORAGE_KEY = "filmvault-stock-tab";
const PATH_STORAGE_KEY = "filmvault-stock-path";

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

const ACTIVE_STATES: FilmState[] = ["loaded", "partial", "exposed", "developed"];

interface StockScreenProps {
	data: AppData;
	onOpenFilm: (id: string) => void;
	initialStateFilter?: string | null;
}

function mapStateToTab(state: string | null | undefined): StockTabKey | null {
	if (!state) return null;
	if (state === "stock") return "stock";
	if (state === "scanned") return "archive";
	if (ACTIVE_STATES.includes(state as FilmState)) return "active";
	return null;
}

export function StockScreen({ data, onOpenFilm, initialStateFilter }: StockScreenProps) {
	const { t } = useTranslation();
	const { films, cameras, backs } = data;

	const [tab, setTab] = usePersistedState<StockTabKey>(TAB_STORAGE_KEY, "stock");
	const [path, setPath] = usePersistedState<HierarchyPath>(PATH_STORAGE_KEY, {});
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [activeStateFilter, setActiveStateFilter] = useState<FilmState | null>(null);

	useEffect(() => {
		if (!initialStateFilter) return;
		const target = mapStateToTab(initialStateFilter);
		if (!target) return;
		setTab(target);
		if (target === "stock") setPath({});
		if (target === "active" && ACTIVE_STATES.includes(initialStateFilter as FilmState)) {
			setActiveStateFilter(initialStateFilter as FilmState);
		} else {
			setActiveStateFilter(null);
		}
	}, [initialStateFilter, setTab, setPath]);

	const handleTabChange = useCallback(
		(next: StockTabKey) => {
			setTab(next);
			// Manually changing tabs clears the per-tab single-state filter coming from navigation intent.
			setActiveStateFilter(null);
		},
		[setTab],
	);

	const stockFilters = useStockFilters(films);

	// Buckets per tab, preserving the sort order produced by useStockFilters.
	const filteredByTab = useMemo(() => {
		const active: Film[] = [];
		const stock: Film[] = [];
		const archive: Film[] = [];
		for (const f of stockFilters.filteredFilms) {
			if (f.state === "stock") stock.push(f);
			else if (f.state === "scanned") archive.push(f);
			else if (ACTIVE_STATES.includes(f.state)) active.push(f);
		}
		return { active, stock, archive };
	}, [stockFilters.filteredFilms]);

	// Raw stock films (unfiltered) — needed to build the hierarchy categories regardless of search/filter.
	const rawStockFilms = useMemo(() => films.filter((f) => f.state === "stock"), [films]);

	const activeForRender = useMemo(() => {
		if (!activeStateFilter) return filteredByTab.active;
		return filteredByTab.active.filter((f) => f.state === activeStateFilter);
	}, [filteredByTab.active, activeStateFilter]);

	const tabCounts = {
		active: filteredByTab.active.length,
		stock: filteredByTab.stock.length,
		archive: filteredByTab.archive.length,
	};

	const searchActive = stockFilters.search.trim() !== "" || stockFilters.hasActiveFilters;

	const currentResultCount =
		tab === "active" ? activeForRender.length : tab === "stock" ? tabCounts.stock : tabCounts.archive;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("stock.title")}</h2>

			<StockTabBar tab={tab} onChange={handleTabChange} counts={tabCounts} />

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
					aria-label={t("stock.filters")}
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
				<span className="text-sm text-text-muted">{t("stock.resultCount", { count: currentResultCount })}</span>
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

			{tab === "active" && (
				<ActiveTab
					films={activeForRender}
					cameras={cameras}
					backs={backs}
					onOpenFilm={onOpenFilm}
					stateFilter={activeStateFilter}
					onClearStateFilter={() => setActiveStateFilter(null)}
				/>
			)}

			{tab === "stock" && (
				<StockTab
					films={rawStockFilms}
					filteredFilms={filteredByTab.stock}
					cameras={cameras}
					backs={backs}
					path={path}
					onPathChange={setPath}
					onOpenFilm={onOpenFilm}
					searchActive={searchActive}
				/>
			)}

			{tab === "archive" && (
				<ArchiveTab films={filteredByTab.archive} cameras={cameras} backs={backs} onOpenFilm={onOpenFilm} />
			)}

			<StockFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				filters={stockFilters.filters}
				availableFormats={stockFilters.availableFormats}
				availableTypes={stockFilters.availableTypes}
				availableBrands={stockFilters.availableBrands}
				availableIsoValues={stockFilters.availableIsoValues}
				availableTags={stockFilters.availableTags}
				onSetFormat={stockFilters.setFormat}
				onSetType={stockFilters.setType}
				onToggleBrand={stockFilters.toggleBrand}
				onToggleIso={stockFilters.toggleIso}
				onToggleTag={stockFilters.toggleTag}
				onReset={stockFilters.resetFilters}
			/>
		</div>
	);
}
