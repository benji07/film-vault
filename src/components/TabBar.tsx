import { BarChart3, Camera, Film, Home, Map as MapIcon, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrushDivider } from "@/components/ui/brush-divider";
import { Button } from "@/components/ui/button";
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
			<nav className={cn("w-[220px] shrink-0 bg-surface border-r border-border flex flex-col pt-8 pb-6", className)}>
				<div className="px-6 mb-8">
					<h1 className="font-display text-xl text-text-primary m-0 italic">My Film Vault</h1>
					<p className="text-[11px] text-text-muted font-body mt-1">{t("nav.subtitle")}</p>
				</div>
				<div className="flex flex-col gap-1 px-3 flex-1">
					{tabs.map((tab) => {
						const active = screen === tab.key;
						return (
							<Button
								variant="ghost"
								key={tab.key}
								onClick={() => setScreen(tab.key)}
								className={cn(
									"w-full justify-start gap-3 text-sm font-medium",
									active ? "bg-accent-soft text-accent" : "text-text-sec hover:bg-surface-alt",
								)}
							>
								<tab.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
								{tab.label}
							</Button>
						);
					})}
				</div>
				<div className="px-3">
					<Button
						variant="ghost"
						onClick={() => setScreen("settings")}
						className={cn(
							"w-full justify-start gap-3 text-sm font-medium",
							screen === "settings" ? "bg-accent-soft text-accent" : "text-text-sec hover:bg-surface-alt",
						)}
					>
						<Settings size={18} strokeWidth={screen === "settings" ? 2.5 : 1.5} />
						{t("nav.settings")}
					</Button>
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
					<Button
						variant="ghost"
						key={tab.key}
						onClick={() => setScreen(tab.key)}
						className="flex-col gap-0.5 px-3 relative"
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
						{active && (
							<BrushDivider
								className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-accent w-[44px]"
								thickness={2}
							/>
						)}
					</Button>
				);
			})}
		</div>
	);
}
