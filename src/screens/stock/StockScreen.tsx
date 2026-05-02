import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { StockFilterDialog } from "@/components/StockFilterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { AppData, Film } from "@/types";
import { usePersistedState } from "@/utils/use-persisted-state";
import { type SortOption, useStockFilters } from "@/utils/use-stock-filters";
import { ArchiveTab } from "./ArchiveTab";
import { StockTab } from "./StockTab";
import { StockTabBar, type StockTab as StockTabKey } from "./StockTabBar";

const TAB_STORAGE_KEY = "filmvault-stock-tab";

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
	onOpenFilm: (id: string) => void;
	initialStateFilter?: string | null;
}

function mapStateToTab(state: string | null | undefined): StockTabKey | null {
	if (!state) return null;
	if (state === "stock") return "stock";
	if (state === "scanned") return "archive";
	return null;
}

export function StockScreen({ data, onOpenFilm, initialStateFilter }: StockScreenProps) {
	const { t } = useTranslation();
	const { films, cameras, backs } = data;

	const [tab, setTab] = usePersistedState<StockTabKey>(TAB_STORAGE_KEY, "stock");
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);

	useEffect(() => {
		if (!initialStateFilter) return;
		const target = mapStateToTab(initialStateFilter);
		if (!target) return;
		setTab(target);
	}, [initialStateFilter, setTab]);

	const handleTabChange = useCallback((next: StockTabKey) => setTab(next), [setTab]);

	const stockFilters = useStockFilters(films);

	const filteredByTab = useMemo(() => {
		const stock: Film[] = [];
		const archive: Film[] = [];
		for (const f of stockFilters.filteredFilms) {
			if (f.state === "stock") stock.push(f);
			else if (f.state === "scanned") archive.push(f);
		}
		return { stock, archive };
	}, [stockFilters.filteredFilms]);

	const rawStockFilms = useMemo(() => films.filter((f) => f.state === "stock"), [films]);

	const tabCounts = {
		stock: filteredByTab.stock.length,
		archive: filteredByTab.archive.length,
	};

	const searchActive = stockFilters.search.trim() !== "" || stockFilters.hasActiveFilters;
	const totalCount = tab === "stock" ? rawStockFilms.length : films.filter((f) => f.state === "scanned").length;

	return (
		<div className="-mx-4 md:-mx-8 -mt-5 md:-mt-[max(1.25rem,env(safe-area-inset-top))]">
			<PageHeader
				title={t("stock.title")}
				count={totalCount}
				right={
					<>
						<div className="relative flex-1 min-w-0">
							<Search size={14} className="text-ink-faded absolute left-2.5 top-1/2 -translate-y-1/2" />
							<Input
								value={stockFilters.search}
								onChange={(e) => stockFilters.setSearch(e.target.value)}
								placeholder={t("stock.search")}
								className="w-full pl-8 py-1.5 text-[14px]"
							/>
						</div>
						<Button
							variant={stockFilters.hasActiveFilters ? "default" : "outline"}
							size="icon-sm"
							aria-label={t("stock.filters")}
							onClick={() => setFilterDialogOpen(true)}
						>
							<SlidersHorizontal size={14} />
						</Button>
					</>
				}
			>
				<div className="px-[18px] pb-2.5">
					<StockTabBar tab={tab} onChange={handleTabChange} counts={tabCounts} />
				</div>
			</PageHeader>

			<div className="px-[18px] pt-4 pb-32 flex flex-col gap-3">
				{stockFilters.activeFilterDescriptions.length > 0 && (
					<ActiveFilterChips
						filters={stockFilters.activeFilterDescriptions}
						onRemove={stockFilters.removeFilter}
						onReset={stockFilters.resetFilters}
					/>
				)}

				{tab === "stock" && (
					<StockTab
						films={rawStockFilms}
						filteredFilms={filteredByTab.stock}
						cameras={cameras}
						backs={backs}
						onOpenFilm={onOpenFilm}
						searchActive={searchActive}
					/>
				)}

				{tab === "archive" && (
					<ArchiveTab films={filteredByTab.archive} cameras={cameras} backs={backs} onOpenFilm={onOpenFilm} />
				)}
			</div>

			<StockFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				filters={stockFilters.filters}
				availableFormats={stockFilters.availableFormats}
				availableTypes={stockFilters.availableTypes}
				availableBrands={stockFilters.availableBrands}
				availableIsoValues={stockFilters.availableIsoValues}
				availableTags={stockFilters.availableTags}
				sortOption={stockFilters.sortOption}
				sortOptions={SORT_OPTIONS}
				onSortChange={(v) => stockFilters.setSortOption(v as SortOption)}
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
