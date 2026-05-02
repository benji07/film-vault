import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { StockFilterDialog, type StockScope } from "@/components/StockFilterDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { AppData } from "@/types";
import { usePersistedState } from "@/utils/use-persisted-state";
import { type SortOption, useStockFilters } from "@/utils/use-stock-filters";
import { ArchiveTab } from "./ArchiveTab";
import { StockTab } from "./StockTab";

const SCOPE_STORAGE_KEY = "filmvault-stock-scope";

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

function mapStateToScope(state: string | null | undefined): StockScope | null {
	if (state === "stock") return "stock";
	if (state === "scanned") return "scanned";
	return null;
}

export function StockScreen({ data, onOpenFilm, initialStateFilter }: StockScreenProps) {
	const { t } = useTranslation();
	const { films, cameras, backs } = data;

	const [scope, setScope] = usePersistedState<StockScope>(SCOPE_STORAGE_KEY, "stock");
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);

	useEffect(() => {
		const target = mapStateToScope(initialStateFilter);
		if (target) setScope(target);
	}, [initialStateFilter, setScope]);

	const stockFilters = useStockFilters(films, scope);

	// Counts for the scope toggle inside the dialog. They reflect the
	// other-than-scope filters so the user knows how many are on each side
	// before flipping.
	const scopeCounts = useMemo(() => {
		const lowerSearch = stockFilters.search.trim().toLowerCase();
		let stock = 0;
		let scanned = 0;
		for (const f of films) {
			if (lowerSearch) {
				const name = `${f.brand ?? ""} ${f.model ?? f.customName ?? ""}`.toLowerCase();
				if (!name.includes(lowerSearch)) continue;
			}
			if (f.state === "stock") stock++;
			else if (f.state === "scanned") scanned++;
		}
		return { stock, scanned };
	}, [films, stockFilters.search]);

	const rawScopeFilms = useMemo(() => films.filter((f) => f.state === scope), [films, scope]);
	const totalCount = rawScopeFilms.length;
	const searchActive = stockFilters.search.trim() !== "" || stockFilters.hasActiveFilters;

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
			/>

			<div className="px-[18px] pt-6 pb-32 flex flex-col gap-3">
				{stockFilters.activeFilterDescriptions.length > 0 && (
					<ActiveFilterChips
						filters={stockFilters.activeFilterDescriptions}
						onRemove={stockFilters.removeFilter}
						onReset={stockFilters.resetFilters}
					/>
				)}

				{scope === "stock" ? (
					<StockTab
						films={rawScopeFilms}
						filteredFilms={stockFilters.filteredFilms}
						cameras={cameras}
						backs={backs}
						onOpenFilm={onOpenFilm}
						searchActive={searchActive}
					/>
				) : (
					<ArchiveTab films={stockFilters.filteredFilms} cameras={cameras} backs={backs} onOpenFilm={onOpenFilm} />
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
				scope={scope}
				scopeCounts={scopeCounts}
				onScopeChange={setScope}
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
