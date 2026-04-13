import { Archive, Camera, Check, Clock, RotateCcw, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Film } from "@/types";
import type { ActionType } from "./types";

interface FloatingActionBarProps {
	film: Film;
	setShowAction: (action: ActionType) => void;
}

export function FloatingActionBar({ film, setShowAction }: FloatingActionBarProps) {
	const { t } = useTranslation();

	if (film.state === "scanned") return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 md:left-[220px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-bg via-bg to-transparent z-10">
			<div className="max-w-3xl mx-auto">
				{film.state === "stock" && (
					<Button onClick={() => setShowAction("load")} className="w-full justify-center shadow-lg">
						<Camera size={16} /> {t("filmDetail.loadInCamera")}
					</Button>
				)}
				{film.state === "loaded" && (
					<div className="flex gap-2">
						<Button onClick={() => setShowAction("finish")} className="flex-1 justify-center shadow-lg">
							<Check size={16} /> {t("filmDetail.markFinished")}
						</Button>
						{film.format === "35mm" && (
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowAction("partial")}
								className="shrink-0 bg-card shadow-lg"
								aria-label={t("filmDetail.removeNotFinished")}
							>
								<Clock size={16} />
							</Button>
						)}
					</div>
				)}
				{film.state === "partial" && (
					<Button onClick={() => setShowAction("reload")} className="w-full justify-center shadow-lg">
						<RotateCcw size={16} /> {t("filmDetail.reloadInCamera")}
					</Button>
				)}
				{film.state === "exposed" && (
					<Button onClick={() => setShowAction("develop")} className="w-full justify-center shadow-lg">
						<Archive size={16} /> {t("filmDetail.markDeveloped")}
					</Button>
				)}
				{film.state === "developed" && (
					<Button onClick={() => setShowAction("scan")} className="w-full justify-center shadow-lg">
						<ScanLine size={16} /> {t("filmDetail.markScanned")}
					</Button>
				)}
			</div>
		</div>
	);
}
