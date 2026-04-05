import { BarChart3, Camera, Film, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon, ScreenName } from "@/types";

interface Tab {
	key: ScreenName;
	icon: LucideIcon;
	label: string;
}

const tabs: Tab[] = [
	{ key: "home", icon: Home, label: "Accueil" },
	{ key: "stock", icon: Film, label: "Pellicules" },
	{ key: "cameras", icon: Camera, label: "Appareils" },
	{ key: "stats", icon: BarChart3, label: "Stats" },
];

interface TabBarProps {
	screen: ScreenName;
	setScreen: (screen: ScreenName) => void;
	variant?: "bar" | "sidebar";
	className?: string;
}

export function TabBar({ screen, setScreen, variant = "bar", className }: TabBarProps) {
	if (variant === "sidebar") {
		return (
			<nav className={cn("w-[220px] shrink-0 bg-surface border-r border-border flex flex-col pt-8 pb-6", className)}>
				<div className="px-6 mb-8">
					<h1 className="font-display text-xl text-text-primary m-0 italic">My Film Vault</h1>
					<p className="text-[11px] text-text-muted font-body mt-1">Ton inventaire argentique</p>
				</div>
				<div className="flex flex-col gap-1 px-3 flex-1">
					{tabs.map((t) => {
						const active = screen === t.key;
						return (
							<button
								type="button"
								key={t.key}
								onClick={() => setScreen(t.key)}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium cursor-pointer border-none transition-all min-h-[44px]",
									active ? "bg-accent-soft text-accent" : "bg-transparent text-text-sec hover:bg-surface-alt",
								)}
							>
								<t.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
								{t.label}
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
						Réglages
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
			{tabs.map((t) => {
				const active = screen === t.key;
				return (
					<button
						type="button"
						key={t.key}
						onClick={() => setScreen(t.key)}
						className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer min-w-[44px] min-h-[44px] justify-center px-3"
					>
						<t.icon size={20} className={active ? "text-accent" : "text-text-muted"} strokeWidth={active ? 2.5 : 1.5} />
						<span
							className={`text-[10px] font-body ${active ? "font-bold text-accent" : "font-medium text-text-muted"}`}
						>
							{t.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
