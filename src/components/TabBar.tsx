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
				className={cn(
					"w-[220px] shrink-0 bg-surface ring-1 ring-line flex flex-col pt-8 pb-6 rounded-r-[14px]",
					className,
				)}
			>
				<div className="px-6 mb-8">
					<h1 className="text-2xl font-semibold text-text leading-none m-0 tracking-tight">My Film Vault</h1>
					<p className="text-xs text-text-3 mt-1.5">{t("nav.subtitle")}</p>
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
									"w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-colors text-left",
									"text-sm font-medium",
									active ? "bg-surface-2 text-text" : "bg-transparent text-text-3 hover:bg-surface-2 hover:text-text",
								)}
							>
								<tab.icon size={18} strokeWidth={active ? 2.2 : 1.6} />
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
				"shrink-0 relative w-full bg-surface flex justify-around items-stretch",
				"pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]",
				"border-t border-line",
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
							"flex-1 flex flex-col items-center gap-1 px-2 py-1.5 cursor-pointer relative",
							"text-[10px] font-medium leading-none",
							"transition-colors",
							active ? "text-text" : "text-text-3 hover:text-text-2",
						)}
					>
						<tab.icon size={20} strokeWidth={active ? 2.2 : 1.7} />
						{tab.label}
						{active && <span className="absolute bottom-[-2px] h-0.5 w-6 rounded-full bg-accent" aria-hidden="true" />}
					</button>
				);
			})}
		</nav>
	);
}
