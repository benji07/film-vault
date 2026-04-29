import { Package } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import type { Back, Camera, Film } from "@/types";
import {
	buildHierarchyNodes,
	groupByExpiration,
	type HierarchyLevel,
	type HierarchyPath,
	resolveDisplayLevel,
	STOCK_FLAT_THRESHOLD,
	setPathLevel,
	truncatePath,
} from "@/utils/stock-hierarchy";
import { InventoryGroup } from "./InventoryGroup";
import { StockBreadcrumb } from "./StockBreadcrumb";
import { StockHierarchyCard } from "./StockHierarchyCard";

interface StockTabProps {
	films: Film[];
	filteredFilms: Film[];
	cameras: Camera[];
	backs: Back[];
	path: HierarchyPath;
	onPathChange: (path: HierarchyPath) => void;
	onOpenFilm: (id: string) => void;
	searchActive: boolean;
}

export function StockTab({
	films,
	filteredFilms,
	cameras,
	backs,
	path,
	onPathChange,
	onOpenFilm,
	searchActive,
}: StockTabProps) {
	const { t } = useTranslation();
	const locale = t("dateLocale");

	// Small inventories collapse to a flat expiration-grouped list — the multi-level navigation
	// adds friction without value when there are only a handful of films.
	const flatMode = !searchActive && films.length < STOCK_FLAT_THRESHOLD;

	// Single resolution shared by leaf detection, hierarchy nodes and leaf grouping —
	// avoids re-filtering the film list multiple times per render.
	const resolution = useMemo(() => resolveDisplayLevel(films, path), [films, path]);

	const reachedLeaf = !searchActive && !flatMode && resolution.level === null && resolution.filtered.length > 0;

	// Stale path: persisted from localStorage but no film matches anymore (e.g. last matching
	// film was deleted). Reset to root so the user lands on a valid view.
	const stalePath = !searchActive && !flatMode && resolution.filtered.length === 0 && films.length > 0;
	useEffect(() => {
		if (stalePath) onPathChange({});
	}, [stalePath, onPathChange]);

	const flatGroups = useMemo(
		() => (searchActive || flatMode ? groupByExpiration(filteredFilms, locale) : []),
		[filteredFilms, searchActive, flatMode, locale],
	);

	const nodes = useMemo(
		() =>
			!searchActive && !flatMode && resolution.level !== null
				? buildHierarchyNodes(resolution.level, resolution.filtered)
				: [],
		[searchActive, flatMode, resolution.level, resolution.filtered],
	);

	const leafGroups = useMemo(
		() => (reachedLeaf ? groupByExpiration(resolution.filtered, locale) : []),
		[reachedLeaf, resolution.filtered, locale],
	);

	const handleBreadcrumb = (lvl: HierarchyLevel | null) => {
		onPathChange(truncatePath(path, lvl));
	};

	const handleNodeClick = (lvl: HierarchyLevel, value: string) => {
		onPathChange(setPathLevel(path, lvl, value));
	};

	if (films.length === 0) {
		return <EmptyState icon={Package} title={t("stock.emptyStock")} subtitle={t("stock.emptyStockSubtitle")} />;
	}

	const showBreadcrumb = !flatMode;

	return (
		<div className="flex flex-col gap-3" data-tour="stock-list">
			{showBreadcrumb && <StockBreadcrumb path={path} onNavigate={handleBreadcrumb} disabled={searchActive} />}

			{searchActive || flatMode ? (
				flatGroups.length === 0 ? (
					<EmptyState icon={Package} title={t("stock.nothingFound")} subtitle={t("stock.noMatch")} />
				) : (
					<InventoryGroup groups={flatGroups} cameras={cameras} backs={backs} onOpenFilm={onOpenFilm} />
				)
			) : reachedLeaf ? (
				<InventoryGroup groups={leafGroups} cameras={cameras} backs={backs} onOpenFilm={onOpenFilm} />
			) : (
				<div className="flex flex-col gap-2">
					{nodes.map((node) => (
						<StockHierarchyCard
							key={node.key}
							level={node.level}
							value={node.value}
							label={node.label}
							count={node.count}
							childCount={node.childCount}
							onClick={() => handleNodeClick(node.level, node.value)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
