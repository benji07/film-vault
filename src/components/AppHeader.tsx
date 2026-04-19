import { ArrowLeft, Moon, Settings, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/ThemeProvider";
import { BrushDivider } from "@/components/ui/brush-divider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScreenName } from "@/types";

interface AppHeaderProps {
	screen: ScreenName;
	setScreen: (screen: ScreenName) => void;
	filmTitle?: string;
	cameraTitle?: string;
	filmBackTarget?: ScreenName | null;
	className?: string;
}

const backTargets: Partial<Record<ScreenName, ScreenName>> = {
	filmDetail: "stock",
	cameraDetail: "cameras",
	settings: "home",
};

export function AppHeader({ screen, setScreen, filmTitle, cameraTitle, filmBackTarget, className }: AppHeaderProps) {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const backTarget = screen === "filmDetail" && filmBackTarget ? filmBackTarget : backTargets[screen];
	const isSubScreen = !!backTarget;

	const subScreenTitles: Partial<Record<ScreenName, string>> = {
		filmDetail: filmTitle || t("filmDetail.back"),
		cameraDetail: cameraTitle || t("cameraDetail.title"),
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
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setScreen(backTarget)}
							className="-ml-2"
							aria-label={t("aria.back")}
						>
							<ArrowLeft size={20} className="text-text-sec" />
						</Button>
						<h1 className="font-display text-[26px] text-text-primary m-0 truncate leading-none">
							{subScreenTitles[screen]}
						</h1>
					</>
				) : (
					<div className="flex flex-col">
						<h1 className="font-display text-[30px] text-text-primary m-0 leading-none tracking-tight">
							My Film Vault
						</h1>
						<BrushDivider className="text-accent -mt-1 w-[130px]" thickness={2} />
					</div>
				)}
			</div>

			{screen !== "settings" && (
				<div className="flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="shrink-0"
						aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
					>
						{theme === "dark" ? (
							<Sun size={15} className="text-text-muted" />
						) : (
							<Moon size={15} className="text-text-muted" />
						)}
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setScreen("settings")}
						className="shrink-0"
						aria-label={t("nav.settings")}
					>
						<Settings size={15} className="text-text-muted" />
					</Button>
				</div>
			)}
		</div>
	);
}
