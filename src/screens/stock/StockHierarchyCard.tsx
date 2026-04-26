import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FILM_TYPE_COLORS, T } from "@/constants/theme";
import type { HierarchyLevel } from "@/utils/stock-hierarchy";

interface StockHierarchyCardProps {
	level: HierarchyLevel;
	value: string;
	label: string;
	count: number;
	childCount: number;
	onClick: () => void;
}

const UNKNOWN = "?";

function getAccentColor(level: HierarchyLevel, value: string): string {
	if (level === "type" && value !== UNKNOWN) {
		return FILM_TYPE_COLORS[value] || T.textMuted;
	}
	return T.textMuted;
}

function resolveLabel(
	level: HierarchyLevel,
	value: string,
	fallback: string,
	t: ReturnType<typeof useTranslation>["t"],
): string {
	if (value === UNKNOWN) return t("stock.unknown");
	if (level === "format") {
		const key = `filmFormats.${value}`;
		const translated = t(key);
		return translated === key ? fallback : translated;
	}
	if (level === "type") {
		const key = `filmTypes.${value}`;
		const translated = t(key);
		return translated === key ? fallback : translated;
	}
	return fallback;
}

export function StockHierarchyCard({ level, value, label, count, childCount, onClick }: StockHierarchyCardProps) {
	const { t } = useTranslation();
	const displayLabel = resolveLabel(level, value, label, t);
	const accent = getAccentColor(level, value);
	const childKey = level === "model" ? null : level === "brand" ? "modelCount" : "childCount";

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 py-3.5 pr-4 pl-0 bg-card border border-border rounded-[14px] cursor-pointer transition-all overflow-hidden text-left w-full hover:bg-card-hover"
		>
			<div className="w-[3px] self-stretch shrink-0 rounded-r-full" style={{ backgroundColor: accent }} />
			<div className="flex-1 min-w-0 pl-1">
				<div className="text-sm font-semibold text-text-primary font-body overflow-hidden text-ellipsis whitespace-nowrap">
					{displayLabel}
				</div>
				<div className="flex gap-3 mt-1 text-[11px] font-mono text-text-muted">
					<span style={{ color: T.accent }}>{t("stock.hierarchy.filmCount", { count })}</span>
					{childKey && childCount > 0 && <span>{t(`stock.hierarchy.${childKey}`, { count: childCount })}</span>}
				</div>
			</div>
			<ChevronRight size={16} className="text-text-muted shrink-0" />
		</button>
	);
}
