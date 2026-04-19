import { Camera, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WashiTape } from "@/components/ui/washi-tape";
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
	tilt?: number;
	tape?: "top-left" | "top-right";
	tapeColor?: string;
}

function getLoadedDate(film: Film): string | null {
	return film.startDate ?? null;
}

export function ActiveRollCard({
	film,
	camera,
	back,
	onShotClick,
	onClick,
	className,
	tilt = 0,
	tape,
	tapeColor,
}: ActiveRollCardProps) {
	const { t, i18n } = useTranslation();
	const typeColor = FILM_TYPE_COLORS[filmType(film)] || T.textMuted;
	const loadedDate = getLoadedDate(film);

	const formattedDate = loadedDate
		? new Date(`${loadedDate}T00:00:00`).toLocaleDateString(i18n.language === "fr" ? "fr-FR" : "en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: null;

	const hasFrameInfo = film.posesShot != null;

	return (
		<div className={`relative ${className ?? ""}`} style={{ transform: `rotate(${tilt}deg)` }}>
			{tape && <WashiTape position={tape} color={tapeColor} />}
			<div className="polaroid flex items-stretch bg-card border border-border-light rounded-[14px] overflow-hidden w-full">
				<div className="w-[4px] shrink-0" style={{ backgroundColor: typeColor }} />
				<button
					type="button"
					onClick={onClick}
					className="flex-1 p-4 min-w-0 text-left cursor-pointer bg-transparent border-0 font-inherit"
				>
					<div className="font-display text-[22px] leading-none text-text-primary truncate">
						{film.customName || filmName(film)}
					</div>
					<div className="flex gap-1.5 mt-2 flex-wrap">
						<Badge style={{ color: typeColor, background: alpha(typeColor, 0.12) }}>
							{t(`filmTypes.${filmType(film)}`, filmType(film))}
						</Badge>
						<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{filmIso(film)} ISO</Badge>
						<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{film.format}</Badge>
					</div>
					{camera && (
						<div className="flex items-center gap-1.5 mt-2.5 text-[12px] text-text-sec font-serif italic">
							<Camera size={12} color={T.textSec} />
							<span className="truncate">
								{cameraDisplayName(camera)}
								{back ? ` · ${backDisplayName(back)}` : ""}
							</span>
						</div>
					)}
					<div className="flex items-center gap-3 mt-2 pt-2 border-t border-dashed border-border-light">
						{formattedDate && (
							<span className="text-[11px] text-text-muted font-mono tracking-tight">
								{t("dashboard.loadedOn", { date: formattedDate })}
							</span>
						)}
						{hasFrameInfo && (
							<span className="text-[12px] font-display" style={{ color: typeColor }}>
								{film.posesTotal
									? t("dashboard.frames", { shot: film.posesShot, total: film.posesTotal })
									: t("dashboard.framesUnknown", { shot: film.posesShot })}
							</span>
						)}
					</div>
				</button>
				<div className="flex items-center gap-1 pr-2">
					<Button variant="ghost" size="sm" className="px-2" onClick={onShotClick}>
						<Plus size={14} />
						{t("dashboard.shotPlus")}
					</Button>
					<ChevronRight size={16} className="text-text-muted shrink-0" />
				</div>
			</div>
		</div>
	);
}
