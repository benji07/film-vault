import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { FilmLabel } from "@/components/ui/film-label";
import { filmTypeToVariant } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { Back, Camera, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmName, filmType } from "@/utils/film-helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
	backs: Back[];
	groupCount?: number;
}

const STATE_VARIANT: Record<Film["state"], "default" | "ink" | "red" | "teal" | "gold" | "outline"> = {
	stock: "outline",
	loaded: "red",
	partial: "default",
	exposed: "ink",
	developed: "gold",
	scanned: "teal",
};

export function FilmRow({ film, onClick, cameras, backs, groupCount }: FilmRowProps) {
	const { t } = useTranslation();
	const variant = filmTypeToVariant(filmType(film));
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? backs.find((b) => b.id === film.backId) : null;
	const expInfo = getExpirationStatus(film.expDate, t);
	const isExpiring = expInfo && expInfo.status !== "ok";
	const stateLabel = t(`states.${film.state}`);
	const sub = film.type ? `${film.type.toLowerCase()}` : "";

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative grid bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]",
				"grid-cols-[64px_1fr_auto] items-stretch overflow-hidden text-left w-full cursor-pointer",
				"transition-transform active:scale-[.99]",
			)}
		>
			<FilmLabel
				iso={film.iso ?? "—"}
				format={film.format ?? ""}
				variant={variant}
				size="sm"
			/>
			<div className="px-3 py-2.5 min-w-0">
				<div className="font-cormorant text-[16px] font-semibold text-ink leading-[1.1]">
					{filmName(film)}
					{sub && <em className="font-normal italic text-[13px] text-ink-faded ml-1">{sub}</em>}
					{groupCount && groupCount > 1 && (
						<span className="ml-1.5 font-archivo-black text-[11px] text-kodak-red">×{groupCount}</span>
					)}
				</div>
				<div className="font-typewriter text-[9px] tracking-[0.1em] uppercase text-ink-faded mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
					{film.format && <span>{film.format}</span>}
					{film.expDate && <span>périme {fmtExpDate(film.expDate, t("dateLocale"))}</span>}
					{film.price != null && <span>{film.price.toFixed(2)} €</span>}
					{cam && (
						<span>
							{cameraDisplayName(cam)}
							{back ? ` · ${backDisplayName(back)}` : ""}
						</span>
					)}
					{film.labRef && <span>ref {film.labRef}</span>}
				</div>
				{(film.tags?.length || isExpiring) && (
					<div className="flex flex-wrap gap-1 mt-2">
						{isExpiring && expInfo && (
							<Badge variant="default" className="-rotate-3">
								{expInfo.label}
							</Badge>
						)}
						{film.tags?.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>
				)}
			</div>
			<div
				className={cn(
					"px-3 py-2 border-l border-dashed border-ink-faded/40",
					"flex flex-col items-end justify-between bg-white/15",
				)}
			>
				<div className="font-archivo-black text-[24px] text-ink leading-none tracking-[-0.5px] text-right">
					{film.quantity ?? 1}
					<span className="block font-archivo font-bold text-[8px] text-ink-faded mt-0.5 tracking-[0.18em] uppercase text-right">
						{t(`states.${film.state}`).toLowerCase()}
					</span>
				</div>
				<Badge variant={STATE_VARIANT[film.state]} className="text-[8px] mt-2">
					{stateLabel}
				</Badge>
			</div>
		</button>
	);
}
