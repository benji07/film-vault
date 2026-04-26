import { Package } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import type { Back, Camera, Film } from "@/types";
import {
	buildHierarchy,
	filterByPath,
	groupByExpiration,
	type HierarchyLevel,
	type HierarchyPath,
	isLeaf,
	setPathLevel,
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

const LEVELS: HierarchyLevel[] = ["format", "type", "brand", "model"];

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

	const flatGroups = useMemo(
		() => (searchActive ? groupByExpiration(filteredFilms, locale) : []),
		[filteredFilms, searchActive, locale],
	);

	const reachedLeaf = isLeaf(path);

	const nodes = useMemo(
		() => (!searchActive && !reachedLeaf ? buildHierarchy(films, path) : []),
		[films, path, searchActive, reachedLeaf],
	);

	const leafGroups = useMemo(
		() => (!searchActive && reachedLeaf ? groupByExpiration(filterByPath(films, path), locale) : []),
		[films, path, locale, searchActive, reachedLeaf],
	);

	const handleBreadcrumb = (lvl: HierarchyLevel | null) => {
		if (lvl === null) {
			onPathChange({});
			return;
		}
		const next: HierarchyPath = {};
		for (const key of LEVELS) {
			if (path[key] != null) next[key] = path[key];
			if (key === lvl) break;
		}
		onPathChange(next);
	};

	const handleNodeClick = (lvl: HierarchyLevel, value: string) => {
		onPathChange(setPathLevel(path, lvl, value));
	};

	if (films.length === 0) {
		return <EmptyState icon={Package} title={t("stock.emptyStock")} subtitle={t("stock.emptyStockSubtitle")} />;
	}

	return (
		<div className="flex flex-col gap-3" data-tour="stock-list">
			<StockBreadcrumb path={path} onNavigate={handleBreadcrumb} disabled={searchActive} />

			{searchActive ? (
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
