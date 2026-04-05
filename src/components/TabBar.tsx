import { BarChart3, Camera, Film, Home, Settings } from "lucide-react";
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
			<nav className={cn("w-[220px] shrink-0 bg-surface border-r border-border flex flex-col pt-8 pb-6", className)}>
				<div className="px-6 mb-8">
					<h1 className="font-display text-xl text-text-primary m-0 italic">My Film Vault</h1>
					<p className="text-[11px] text-text-muted font-body mt-1">{t("nav.subtitle")}</p>
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
									"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium cursor-pointer border-none transition-all min-h-[44px]",
									active ? "bg-accent-soft text-accent" : "bg-transparent text-text-sec hover:bg-surface-alt",
								)}
							>
								<tab.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
								{tab.label}
							</button>
						);
					})}
				</div>
				<div className="px-3">
					<button
						type="button"
						onClick={() => setScreen("settings")}
						className={cn(
							"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium cursor-pointer border-none transition-all min-h-[44px] w-full",
							screen === "settings"
								? "bg-accent-soft text-accent"
								: "bg-transparent text-text-sec hover:bg-surface-alt",
						)}
					>
						<Settings size={18} strokeWidth={screen === "settings" ? 2.5 : 1.5} />
						{t("nav.settings")}
					</button>
				</div>
			</nav>
		);
	}

	return (
		<div
			className={cn(
				"shrink-0 w-full bg-surface border-t border-border flex justify-around pt-2.5 pb-[max(1.125rem,env(safe-area-inset-bottom))]",
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
						className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer min-w-[44px] min-h-[44px] justify-center px-3"
					>
						<tab.icon
							size={20}
							className={active ? "text-accent" : "text-text-muted"}
							strokeWidth={active ? 2.5 : 1.5}
						/>
						<span
							className={`text-[10px] font-body ${active ? "font-bold text-accent" : "font-medium text-text-muted"}`}
						>
							{tab.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
