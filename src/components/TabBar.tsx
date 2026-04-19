import { BarChart3, Camera, Film, Home, Map as MapIcon, Settings } from "lucide-react";
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

/** Tilt per tab index — gives the stack an irregular, hand-placed feel */
const TILTS = [-2, 1.2, -0.8, 2, -1.5];

export function TabBar({ screen, setScreen, variant = "bar", className }: TabBarProps) {
	const { t } = useTranslation();
	const tabs = tabDefs.map((td) => ({ ...td, label: t(td.labelKey) }));

	if (variant === "sidebar") {
		return (
			<nav
				className={cn(
					"w-[240px] shrink-0 flex flex-col pt-10 pb-6 pl-4 pr-0 relative",
					"border-r-2 border-dashed border-border",
					className,
				)}
			>
				<div className="px-2 mb-8">
					<span className="text-[11px] tracking-[0.25em] uppercase text-text-muted font-body font-semibold">
						{t("nav.subtitle")}
					</span>
					<h1 className="font-display text-[34px] text-text-primary m-0 leading-[0.9] mt-1">My Film Vault</h1>
					<svg
						viewBox="0 0 180 8"
						className="block text-accent mt-1 ml-1"
						preserveAspectRatio="none"
						role="presentation"
						aria-hidden="true"
					>
						<path
							d="M2,4 C25,1 45,7 75,4 C105,1 130,6 155,4 C170,3 175,5 178,4"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							fill="none"
						/>
					</svg>
				</div>
				<div className="flex flex-col gap-2 flex-1 pr-3">
					{tabs.map((tab, i) => {
						const active = screen === tab.key;
						return (
							<SidebarTab
								key={tab.key}
								tab={tab}
								active={active}
								tilt={TILTS[i] ?? 0}
								onClick={() => setScreen(tab.key)}
							/>
						);
					})}
				</div>
				<div className="pr-3 mt-4">
					<SidebarTab
						tab={{ key: "settings", icon: Settings, label: t("nav.settings") }}
						active={screen === "settings"}
						tilt={1}
						onClick={() => setScreen("settings")}
					/>
				</div>
			</nav>
		);
	}

	return (
		<div
			className={cn(
				"shrink-0 w-full relative flex justify-around items-end gap-1 px-2 pt-4",
				"pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				"bg-surface/90 backdrop-blur-sm",
				className,
			)}
		>
			{/* Stitched top border */}
			<svg
				viewBox="0 0 400 4"
				preserveAspectRatio="none"
				className="absolute top-0 left-0 w-full h-[4px] text-border-light"
				role="presentation"
				aria-hidden="true"
			>
				<path d="M0,2 L400,2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,4" fill="none" />
			</svg>
			{tabs.map((tab, i) => {
				const active = screen === tab.key;
				return (
					<BottomTab key={tab.key} tab={tab} active={active} tilt={TILTS[i] ?? 0} onClick={() => setScreen(tab.key)} />
				);
			})}
		</div>
	);
}

function SidebarTab({
	tab,
	active,
	tilt,
	onClick,
}: {
	tab: { key: string; icon: LucideIcon; label: string };
	active: boolean;
	tilt: number;
	onClick: () => void;
}) {
	const Icon = tab.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex items-center gap-3 pl-4 pr-5 py-2.5 cursor-pointer text-left",
				"rounded-r-[14px] border-2 border-l-0 transition-all duration-200",
				"font-display text-lg leading-none",
				active
					? "bg-card border-accent text-text-primary shadow-[var(--shadow-polaroid)] -translate-x-0"
					: "bg-surface-alt border-dashed border-border text-text-sec hover:text-text-primary hover:-translate-x-0.5",
			)}
			style={{
				transform: `rotate(${active ? tilt * 0.3 : tilt}deg) translateX(${active ? "0" : "-4px"})`,
				marginLeft: active ? "-2px" : "0",
				zIndex: active ? 2 : 1,
			}}
		>
			{active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r" aria-hidden="true" />}
			<Icon size={16} strokeWidth={active ? 2.2 : 1.6} className={active ? "text-accent" : "text-text-muted"} />
			<span className="whitespace-nowrap">{tab.label}</span>
		</button>
	);
}

function BottomTab({
	tab,
	active,
	tilt,
	onClick,
}: {
	tab: { key: string; icon: LucideIcon; label: string };
	active: boolean;
	tilt: number;
	onClick: () => void;
}) {
	const Icon = tab.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"relative flex flex-col items-center justify-center gap-0.5 cursor-pointer",
				"min-w-[58px] px-2 pt-2 pb-2 transition-all duration-200",
				"rounded-t-[14px] border-2 border-b-0",
				"font-display leading-none",
				active
					? "bg-card border-accent text-text-primary -translate-y-1 shadow-[0_-4px_10px_rgba(0,0,0,0.15)]"
					: "bg-surface-alt border-dashed border-border text-text-muted hover:-translate-y-0.5 hover:text-text-sec",
			)}
			style={{
				transform: `rotate(${active ? 0 : tilt * 0.6}deg) translateY(${active ? "-4px" : "0"})`,
				zIndex: active ? 2 : 1,
			}}
		>
			<Icon size={18} strokeWidth={active ? 2.2 : 1.5} className={active ? "text-accent" : "text-text-muted"} />
			<span className={cn("text-[13px] leading-none", active ? "text-accent" : "text-text-muted")}>{tab.label}</span>
		</button>
	);
}
