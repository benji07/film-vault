import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATES } from "@/constants/films";
import { T } from "@/constants/theme";
import type { Camera, Film } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmIso, filmName } from "@/utils/film-helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
}

export function FilmRow({ film, onClick, cameras }: FilmRowProps) {
	const st = STATES[film.state];
	const StIcon = st.icon;
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId && cam ? cam.backs.find((b) => b.id === film.backId) : null;
	const isExpiring =
		film.state === "stock" && film.expDate && new Date(film.expDate) < new Date(Date.now() + 90 * 86400000);
	const isExpired = film.state === "stock" && film.expDate && new Date(film.expDate) < new Date();

	return (
		<div
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick();
			}}
			className="flex items-center gap-3 py-3.5 px-4 bg-card border border-border rounded-[14px] cursor-pointer transition-all"
		>
			<div
				className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
				style={{ background: `linear-gradient(135deg, ${st.color}22, ${st.color}08)` }}
			>
				<StIcon size={18} color={st.color} />
			</div>
			<div className="flex-1 min-w-0">
				<div className="text-sm font-semibold text-text-primary font-body overflow-hidden text-ellipsis whitespace-nowrap">
					{filmName(film)}
				</div>
				<div className="flex gap-1.5 mt-1 flex-wrap">
					<Badge style={{ color: st.color, background: `${st.color}18` }}>{st.label}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{film.format}</Badge>
					{film.shootIso && film.shootIso !== filmIso(film) && (
						<Badge style={{ color: T.amber, background: `${T.amber}18` }}>Push {film.shootIso}</Badge>
					)}
					{cam && (
						<Badge style={{ color: T.green, background: `${T.green}18` }}>
							{cameraDisplayName(cam)}
							{back ? ` · ${back.name}` : ""}
						</Badge>
					)}
					{isExpired && <Badge style={{ color: T.accent, background: `${T.accent}18` }}>Périmée</Badge>}
					{isExpiring && !isExpired && (
						<Badge style={{ color: T.amber, background: `${T.amber}18` }}>Expire bientôt</Badge>
					)}
				</div>
			</div>
			<ChevronRight size={16} className="text-text-muted" />
		</div>
	);
}
