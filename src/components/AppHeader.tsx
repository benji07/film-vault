import { ArrowLeft, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScreenName } from "@/types";

interface AppHeaderProps {
	screen: ScreenName;
	goBack: () => void;
	onOpenSettings: () => void;
	onEditFilm?: () => void;
	filmTitle?: string;
	cameraTitle?: string;
	className?: string;
}

const DETAIL_SCREENS: ReadonlySet<ScreenName> = new Set(["filmDetail", "cameraDetail", "settings"]);

export function AppHeader({ screen, goBack, onEditFilm, filmTitle, cameraTitle, className }: AppHeaderProps) {
	const { t } = useTranslation();
	const isSubScreen = DETAIL_SCREENS.has(screen);

	const subScreenTitles: Partial<Record<ScreenName, string>> = {
		filmDetail: filmTitle || t("filmDetail.back"),
		cameraDetail: cameraTitle || t("cameraDetail.title"),
		settings: t("nav.settings"),
	};

	// Sub-screens: back button + title (+ optional contextual action on the
	// right, e.g. edit on filmDetail). Root screens render their own header
	// via PageHeader inside the scroll container — nothing to render here.
	// The safe-area-inset-top is handled by the root container's padding,
	// so this header sits flush below it with no extra pt.
	if (!isSubScreen) return null;

	return (
		<div
			className={cn(
				"shrink-0 flex items-center justify-between gap-2 px-4 pt-2 pb-2 bg-paper border-b border-ink-faded/40",
				className,
			)}
		>
			<div className="flex items-center gap-2 min-w-0 flex-1">
				<Button variant="ghost" size="icon" onClick={goBack} className="-ml-2" aria-label={t("aria.back")}>
					<ArrowLeft size={20} className="text-ink-soft" />
				</Button>
				<h1 className="font-caveat text-2xl text-ink m-0 truncate">{subScreenTitles[screen]}</h1>
			</div>
			{screen === "filmDetail" && onEditFilm && (
				<Button variant="ghost" size="icon" onClick={onEditFilm} aria-label={t("aria.editFilm")}>
					<Pencil size={18} className="text-ink-soft" />
				</Button>
			)}
		</div>
	);
}
