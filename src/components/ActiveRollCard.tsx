import { Camera, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alpha, FILM_TYPE_COLORS, T } from "@/constants/theme";
import type { Back, Camera as CameraType, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";

interface ActiveRollCardProps {
	film: Film;
	camera?: CameraType | null;
	back?: Back | null;
	onShotClick: () => void;
	onClick: () => void;
	className?: string;
}

function getLoadedDate(film: Film): string | null {
	return film.startDate ?? null;
}

export function ActiveRollCard({ film, camera, back, onShotClick, onClick, className }: ActiveRollCardProps) {
	const { t, i18n } = useTranslation();
	const typeColor = FILM_TYPE_COLORS[filmType(film)] || T.textMuted;
	const loadedDate = getLoadedDate(film);

	const formattedDate = loadedDate
		? new Date(`${loadedDate}T00:00:00`).toLocaleDateString(i18n.language.startsWith("fr") ? "fr-FR" : "en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: null;

	const hasFrameInfo = film.posesShot != null;

	return (
		<button
			type="button"
			className={`flex items-stretch bg-card border border-border rounded-[14px] cursor-pointer transition-all overflow-hidden text-left w-full ${className ?? ""}`}
			onClick={onClick}
		>
			<div className="w-[3px] shrink-0 rounded-r-full" style={{ backgroundColor: typeColor }} />
			<div className="flex-1 p-3.5 min-w-0">
				<div className="text-sm font-semibold text-text-primary font-body truncate">
					{film.customName || filmName(film)}
				</div>
				<div className="flex gap-1.5 mt-1.5 flex-wrap">
					<Badge style={{ color: typeColor, background: alpha(typeColor, 0.09) }}>
						{t(`filmTypes.${filmType(film)}`, filmType(film))}
					</Badge>
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{filmIso(film)} ISO</Badge>
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{film.format}</Badge>
				</div>
				{camera && (
					<div className="flex items-center gap-1.5 mt-2 text-[12px] text-text-sec font-body">
						<Camera size={12} color={T.textSec} />
						<span className="truncate">
							{cameraDisplayName(camera)}
							{back ? ` · ${backDisplayName(back)}` : ""}
						</span>
					</div>
				)}
				<div className="flex items-center gap-3 mt-2">
					{formattedDate && (
						<span className="text-[11px] text-text-muted font-body">
							{t("dashboard.loadedOn", { date: formattedDate })}
						</span>
					)}
					{hasFrameInfo && (
						<span className="text-[11px] font-semibold font-body" style={{ color: T.textSec }}>
							{film.posesTotal
								? t("dashboard.frames", { shot: film.posesShot, total: film.posesTotal })
								: t("dashboard.framesUnknown", { shot: film.posesShot })}
						</span>
					)}
				</div>
			</div>
			<div className="flex items-center gap-1 pr-2">
				<Button
					variant="ghost"
					size="sm"
					className="px-2"
					onClick={(e) => {
						e.stopPropagation();
						onShotClick();
					}}
				>
					<Plus size={14} />
					{t("dashboard.shotPlus")}
				</Button>
				<ChevronRight size={16} className="text-text-muted shrink-0" />
			</div>
		</button>
	);
}
