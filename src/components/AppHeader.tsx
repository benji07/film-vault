import { ArrowLeft, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScreenName } from "@/types";

interface AppHeaderProps {
	screen: ScreenName;
	goBack: () => void;
	onOpenSettings: () => void;
	filmTitle?: string;
	cameraTitle?: string;
	className?: string;
}

const DETAIL_SCREENS: ReadonlySet<ScreenName> = new Set(["filmDetail", "cameraDetail", "settings"]);

export function AppHeader({ screen, goBack, onOpenSettings, filmTitle, cameraTitle, className }: AppHeaderProps) {
	const { t } = useTranslation();
	const isSubScreen = DETAIL_SCREENS.has(screen);

	const subScreenTitles: Partial<Record<ScreenName, string>> = {
		filmDetail: filmTitle || t("filmDetail.back"),
		cameraDetail: cameraTitle || t("cameraDetail.title"),
		settings: t("nav.settings"),
	};

	// Sub-screens: back button + title (full bar). Root screens: no bar at all,
	// just a small floating settings button in the top-right corner — this is
	// the explicit prototype direction (no "My Film Vault" banner per screen).
	if (isSubScreen) {
		return (
			<div
				className={cn(
					"shrink-0 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 bg-paper border-b border-ink-faded/40",
					className,
				)}
			>
				<div className="flex items-center gap-2 min-w-0">
					<Button variant="ghost" size="icon" onClick={goBack} className="-ml-2" aria-label={t("aria.back")}>
						<ArrowLeft size={20} className="text-ink-soft" />
					</Button>
					<h1 className="font-caveat text-2xl text-ink m-0 truncate">{subScreenTitles[screen]}</h1>
				</div>
			</div>
		);
	}

	if (screen === "legal") {
		return null;
	}

	return (
		<div className={cn("absolute top-0 right-0 z-20", className)}>
			<button
				type="button"
				onClick={onOpenSettings}
				aria-label={t("nav.settings")}
				className={cn(
					"flex items-center justify-center bg-paper-card border-2 border-ink shadow-[2px_2px_0_var(--color-ink)]",
					"w-10 h-10 cursor-pointer",
					"mt-[max(0.75rem,env(safe-area-inset-top))] mr-3",
					"hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)] transition-all",
				)}
			>
				<Settings size={16} className="text-ink-faded" />
			</button>
		</div>
	);
}
