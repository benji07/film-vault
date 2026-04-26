import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/chip";

export type StockTab = "active" | "stock" | "archive";

interface StockTabBarProps {
	tab: StockTab;
	onChange: (tab: StockTab) => void;
	counts: { active: number; stock: number; archive: number };
}

export function StockTabBar({ tab, onChange, counts }: StockTabBarProps) {
	const { t } = useTranslation();
	const items: { key: StockTab; label: string; count: number }[] = [
		{ key: "active", label: t("stock.tabs.active"), count: counts.active },
		{ key: "stock", label: t("stock.tabs.stock"), count: counts.stock },
		{ key: "archive", label: t("stock.tabs.archive"), count: counts.archive },
	];

	return (
		<div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
			{items.map((item) => (
				<Chip
					key={item.key}
					active={tab === item.key}
					onClick={() => onChange(item.key)}
					className="text-[12px] py-2 px-3.5 min-h-[36px]"
				>
					{item.label}
					<span className="opacity-60 ml-1 font-mono text-[10px]">{item.count}</span>
				</Chip>
			))}
		</div>
	);
}
