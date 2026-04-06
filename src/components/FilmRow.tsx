import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { getStates } from "@/constants/films";
import { alpha, FILM_TYPE_COLORS, T } from "@/constants/theme";
import type { Camera, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
	groupCount?: number;
}

export function FilmRow({ film, onClick, cameras, groupCount }: FilmRowProps) {
	const { t } = useTranslation();
	const STATES = getStates(t);
	const st = STATES[film.state];
	const StIcon = st.icon;
	const typeColor = FILM_TYPE_COLORS[filmType(film)] || T.textMuted;
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId && cam ? cam.backs.find((b) => b.id === film.backId) : null;
	const expInfo = getExpirationStatus(film.expDate, t);

	return (
		<div
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick();
			}}
			className="flex items-center gap-3 py-3.5 pr-4 pl-0 bg-card border border-border rounded-[14px] cursor-pointer transition-all overflow-hidden"
		>
			<div className="w-[3px] self-stretch shrink-0 rounded-r-full" style={{ backgroundColor: typeColor }} />
			<div
				className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
				style={{ background: `linear-gradient(135deg, ${alpha(st.color, 0.13)}, ${alpha(st.color, 0.03)})` }}
			>
				<StIcon size={18} color={st.color} />
			</div>
			<div className="flex-1 min-w-0">
				<div className="text-sm font-semibold text-text-primary font-body overflow-hidden text-ellipsis whitespace-nowrap">
					{filmName(film)}
					{groupCount && groupCount > 1 && (
						<span className="ml-1.5 text-[11px] font-semibold font-body" style={{ color: T.accent }}>
							&times;&nbsp;{groupCount}
						</span>
					)}
				</div>
				<div className="flex gap-1.5 mt-1 flex-wrap">
					<Badge style={{ color: st.color, background: alpha(st.color, 0.09) }}>{st.label}</Badge>
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{film.format}</Badge>
					{film.shootIso && film.shootIso !== filmIso(film) && (
						<Badge style={{ color: T.amber, background: alpha(T.amber, 0.09) }}>Push {film.shootIso}</Badge>
					)}
					{cam && (
						<Badge style={{ color: T.green, background: alpha(T.green, 0.09) }}>
							{cameraDisplayName(cam)}
							{back ? ` · ${backDisplayName(back)}` : ""}
						</Badge>
					)}
					{film.expDate && (
						<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
							{fmtExpDate(film.expDate, t("dateLocale"))}
						</Badge>
					)}
					{expInfo && expInfo.status !== "ok" && (
						<Badge style={{ color: expInfo.color, background: expInfo.bgColor }}>{expInfo.label}</Badge>
					)}
				</div>
			</div>
			<ChevronRight size={16} className="text-text-muted" />
		</div>
	);
}
