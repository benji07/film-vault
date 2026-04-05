import { ArrowLeft, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ScreenName } from "@/types";

interface AppHeaderProps {
	screen: ScreenName;
	setScreen: (screen: ScreenName) => void;
	filmTitle?: string;
	className?: string;
}

const backTargets: Partial<Record<ScreenName, ScreenName>> = {
	filmDetail: "stock",
	settings: "home",
};

export function AppHeader({ screen, setScreen, filmTitle, className }: AppHeaderProps) {
	const { t } = useTranslation();
	const backTarget = backTargets[screen];
	const isSubScreen = !!backTarget;

	const subScreenTitles: Partial<Record<ScreenName, string>> = {
		filmDetail: filmTitle || t("filmDetail.back"),
		settings: t("nav.settings"),
	};

	return (
		<div
			className={cn(
				"shrink-0 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 bg-bg border-b border-border",
				className,
			)}
		>
			<div className="flex items-center gap-2 min-w-0">
				{isSubScreen ? (
					<>
						<button
							type="button"
							onClick={() => setScreen(backTarget)}
							className="bg-transparent border-none cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
						>
							<ArrowLeft size={20} className="text-text-sec" />
						</button>
						<h1 className="font-display text-lg text-text-primary m-0 italic truncate">{subScreenTitles[screen]}</h1>
					</>
				) : (
					<h1 className="font-display text-xl text-text-primary m-0 italic">My Film Vault</h1>
				)}
			</div>

			{screen !== "settings" && (
				<button
					type="button"
					onClick={() => setScreen("settings")}
					className="bg-surface-alt border border-border rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer shrink-0"
				>
					<Settings size={15} className="text-text-muted" />
				</button>
			)}
		</div>
	);
}
