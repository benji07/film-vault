import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type StockTab = "stock" | "archive";

interface StockTabBarProps {
	tab: StockTab;
	onChange: (tab: StockTab) => void;
	counts: { stock: number; archive: number };
}

export function StockTabBar({ tab, onChange, counts }: StockTabBarProps) {
	const { t } = useTranslation();
	const items: { key: StockTab; label: string; count: number }[] = [
		{ key: "stock", label: t("stock.tabs.stock"), count: counts.stock },
		{ key: "archive", label: t("stock.tabs.archive"), count: counts.archive },
	];

	return (
		<nav className="grid grid-cols-2 mx-[18px] border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] bg-paper-card">
			{items.map((item, i) => {
				const active = tab === item.key;
				return (
					<button
						type="button"
						key={item.key}
						onClick={() => onChange(item.key)}
						aria-pressed={active}
						className={cn(
							"font-archivo-black text-[10px] uppercase tracking-[0.15em] py-2 px-2 cursor-pointer leading-none",
							"flex items-center justify-center gap-1.5",
							active ? "bg-kodak-yellow text-ink" : "bg-transparent text-ink-faded hover:bg-paper-dark/30",
							i === 0 && "border-r-2 border-ink",
						)}
					>
						{item.label}
						<span className="font-archivo font-bold text-[9px] tracking-[0.15em] opacity-70">
							{String(item.count).padStart(2, "0")}
						</span>
					</button>
				);
			})}
		</nav>
	);
}
