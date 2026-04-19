import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Stamp } from "@/components/ui/stamp";
import { getStates } from "@/constants/films";
import { alpha, FILM_TYPE_COLORS, T } from "@/constants/theme";
import type { Back, Camera, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
	backs: Back[];
	groupCount?: number;
}

export function FilmRow({ film, onClick, cameras, backs, groupCount }: FilmRowProps) {
	const { t } = useTranslation();
	const STATES = getStates(t);
	const st = STATES[film.state];
	const StIcon = st.icon;
	const typeColor = FILM_TYPE_COLORS[filmType(film)] || T.textMuted;
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? backs.find((b) => b.id === film.backId) : null;
	const expInfo = getExpirationStatus(film.expDate, t);

	// "Day / Month" journal date stamp from addedDate
	const added = film.addedDate ? new Date(`${film.addedDate}T00:00:00`) : null;
	const dd = added ? added.getDate().toString().padStart(2, "0") : "??";
	const mm = added ? added.toLocaleDateString(t("dateLocale") === "fr-FR" ? "fr-FR" : "en-US", { month: "short" }) : "";

	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative flex items-stretch gap-4 bg-card border border-border-light rounded-[14px] cursor-pointer transition-all overflow-hidden text-left w-full pl-0 pr-3 py-3 hover:border-accent hover:-translate-y-[1px]"
			style={{ boxShadow: "0 3px 10px rgba(0,0,0,0.08)" }}
		>
			{/* Date stamp column — journal entry feel */}
			<div
				className="flex flex-col items-center justify-center shrink-0 w-[64px] border-r-2 border-dashed border-border"
				style={{ color: typeColor }}
			>
				<span className="font-display text-[30px] leading-none">{dd}</span>
				<span className="text-[10px] tracking-[0.15em] uppercase text-text-muted font-body font-semibold mt-0.5">
					{mm}
				</span>
			</div>

			{/* Status icon as mini stamp */}
			<div
				className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 self-center"
				style={{ background: alpha(st.color, 0.14), border: `1.5px dashed ${alpha(st.color, 0.55)}` }}
			>
				<StIcon size={16} color={st.color} />
			</div>

			<div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="font-display text-[20px] leading-none text-text-primary">{filmName(film)}</span>
					{groupCount && groupCount > 1 && (
						<Stamp color={typeColor} size="sm" rotate={-4}>
							×{groupCount}
						</Stamp>
					)}
				</div>
				<div className="flex gap-1.5 flex-wrap">
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
					{film.labRef && <Badge style={{ color: T.accent, background: alpha(T.accent, 0.09) }}>{film.labRef}</Badge>}
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
			<ChevronRight
				size={16}
				className="text-text-muted self-center transition-transform group-hover:translate-x-0.5"
			/>
		</button>
	);
}
