import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { HIERARCHY_ORDER, type HierarchyLevel, type HierarchyPath } from "@/utils/stock-hierarchy";

interface StockBreadcrumbProps {
	path: HierarchyPath;
	onNavigate: (level: HierarchyLevel | null) => void;
	disabled?: boolean;
}

function resolveSegmentLabel(level: HierarchyLevel, value: string, t: ReturnType<typeof useTranslation>["t"]): string {
	if (value === "?") return t("stock.unknown");
	if (level === "format") {
		const key = `filmFormats.${value}`;
		const translated = t(key);
		return translated === key ? value : translated;
	}
	if (level === "type") {
		const key = `filmTypes.${value}`;
		const translated = t(key);
		return translated === key ? value : translated;
	}
	return value;
}

export function StockBreadcrumb({ path, onNavigate, disabled }: StockBreadcrumbProps) {
	const { t } = useTranslation();
	const segments: { level: HierarchyLevel | null; label: string }[] = [
		{ level: null, label: t("stock.breadcrumbAll") },
	];
	for (const level of HIERARCHY_ORDER) {
		const value = path[level];
		if (!value) continue;
		segments.push({ level, label: resolveSegmentLabel(level, value, t) });
	}

	if (segments.length === 1) return null;

	return (
		<nav
			aria-label="breadcrumb"
			className={cn("flex items-center gap-1 flex-wrap text-[12px] font-body", disabled && "opacity-50")}
		>
			{segments.map((seg, idx) => {
				const isLast = idx === segments.length - 1;
				return (
					<Fragment key={`${seg.level ?? "root"}:${seg.label}`}>
						{idx > 0 && <ChevronRight size={12} className="text-text-muted shrink-0" />}
						{isLast ? (
							<span className="text-text-primary font-semibold">{seg.label}</span>
						) : (
							<button
								type="button"
								onClick={() => !disabled && onNavigate(seg.level)}
								disabled={disabled}
								className="text-text-sec hover:text-text-primary transition-colors cursor-pointer disabled:cursor-default"
							>
								{seg.label}
							</button>
						)}
					</Fragment>
				);
			})}
		</nav>
	);
}
