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

// LegalScreen renders its own back button and title in its body,
// so it keeps the root-style header here.
const DETAIL_SCREENS: ReadonlySet<ScreenName> = new Set(["filmDetail", "cameraDetail", "settings"]);

export function AppHeader({ screen, goBack, onOpenSettings, filmTitle, cameraTitle, className }: AppHeaderProps) {
	const { t } = useTranslation();
	const isSubScreen = DETAIL_SCREENS.has(screen);

	const subScreenTitles: Partial<Record<ScreenName, string>> = {
		filmDetail: filmTitle || t("filmDetail.back"),
		cameraDetail: cameraTitle || t("cameraDetail.title"),
		settings: t("nav.settings"),
	};

	return (
		<div
			className={cn(
				"shrink-0 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 bg-paper border-b border-ink-faded/40",
				className,
			)}
		>
			<div className="flex items-center gap-2 min-w-0">
				{isSubScreen ? (
					<>
						<Button variant="ghost" size="icon" onClick={goBack} className="-ml-2" aria-label={t("aria.back")}>
							<ArrowLeft size={20} className="text-ink-soft" />
						</Button>
						<h1 className="font-caveat text-2xl text-ink m-0 truncate">{subScreenTitles[screen]}</h1>
					</>
				) : (
					<h1 className="font-caveat text-2xl text-ink m-0">My Film Vault</h1>
				)}
			</div>

			{screen !== "settings" && (
				<div className="flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="icon"
						onClick={onOpenSettings}
						className="shrink-0"
						aria-label={t("nav.settings")}
					>
						<Settings size={15} className="text-ink-faded" />
					</Button>
				</div>
			)}
		</div>
	);
}
