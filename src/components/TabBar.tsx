import { BarChart3, Camera, Film, Home, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { LucideIcon, ScreenName } from "@/types";

interface Tab {
	key: ScreenName;
	icon: LucideIcon;
	labelKey: string;
}

const tabDefs: Tab[] = [
	{ key: "home", icon: Home, labelKey: "nav.home" },
	{ key: "stock", icon: Film, labelKey: "nav.films" },
	{ key: "map", icon: MapIcon, labelKey: "nav.map" },
	{ key: "cameras", icon: Camera, labelKey: "nav.cameras" },
	{ key: "stats", icon: BarChart3, labelKey: "nav.stats" },
];

interface TabBarProps {
	screen: ScreenName;
	setScreen: (screen: ScreenName) => void;
	variant?: "bar" | "sidebar";
	className?: string;
}

export function TabBar({ screen, setScreen, variant = "bar", className }: TabBarProps) {
	const { t } = useTranslation();

	const tabs = tabDefs.map((td) => ({ ...td, label: t(td.labelKey) }));

	if (variant === "sidebar") {
		return (
			<nav
				className={cn("w-[220px] shrink-0 bg-ink text-paper border-r-2 border-ink flex flex-col pt-8 pb-6", className)}
			>
				<div className="px-6 mb-8">
					<h1 className="font-caveat text-2xl text-kodak-yellow m-0">My Film Vault</h1>
					<p className="font-typewriter text-[10px] tracking-[0.18em] uppercase text-paper/60 mt-1">
						{t("nav.subtitle")}
					</p>
				</div>
				<div className="flex flex-col gap-1 px-3 flex-1">
					{tabs.map((tab) => {
						const active = screen === tab.key;
						return (
							<button
								type="button"
								key={tab.key}
								onClick={() => setScreen(tab.key)}
								className={cn(
									"w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-left",
									"font-archivo font-extrabold text-[11px] uppercase tracking-[0.15em]",
									active
										? "bg-kodak-yellow text-ink"
										: "bg-transparent text-paper/70 hover:bg-paper/10 hover:text-paper",
								)}
							>
								<tab.icon size={18} strokeWidth={active ? 2.4 : 1.6} />
								{tab.label}
							</button>
						);
					})}
				</div>
			</nav>
		);
	}

	return (
		<nav
			className={cn(
				"shrink-0 relative w-full bg-ink flex justify-around items-stretch",
				"pt-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]",
				"border-t-2 border-kodak-yellow",
				className,
			)}
		>
			{tabs.map((tab) => {
				const active = screen === tab.key;
				return (
					<button
						type="button"
						key={tab.key}
						onClick={() => setScreen(tab.key)}
						aria-pressed={active}
						className={cn(
							"flex-1 flex flex-col items-center gap-1 px-2 py-1.5 cursor-pointer",
							"font-archivo font-bold text-[9px] uppercase tracking-[0.18em] leading-none",
							"transition-colors",
							active ? "text-kodak-yellow" : "text-paper/55 hover:text-paper",
						)}
					>
						<span
							className={cn(
								"w-7 h-7 flex items-center justify-center transition-colors",
								active ? "bg-kodak-yellow text-ink" : "bg-transparent",
							)}
						>
							<tab.icon size={16} strokeWidth={active ? 2.4 : 1.8} />
						</span>
						{tab.label}
					</button>
				);
			})}
		</nav>
	);
}
