import { useTranslation } from "react-i18next";
import { FilmLabel } from "@/components/ui/film-label";
import { filmTypeToVariant } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { Back, Camera, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { pickRotation } from "@/utils/card-decorations";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmName, filmType } from "@/utils/film-helpers";
import { fmtPrice } from "@/utils/helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
	backs: Back[];
	groupCount?: number;
	index?: number;
}

const STATE_TONE: Record<Film["state"], { bg: string; fg: string }> = {
	stock: { bg: "bg-transparent border-ink-faded", fg: "text-ink-faded" },
	loaded: { bg: "bg-kodak-red border-ink", fg: "text-paper" },
	partial: { bg: "bg-kodak-yellow-deep border-ink", fg: "text-ink" },
	exposed: { bg: "bg-ink border-ink", fg: "text-kodak-yellow" },
	developed: { bg: "bg-kodak-gold border-ink", fg: "text-ink" },
	scanned: { bg: "bg-kodak-teal border-ink", fg: "text-paper" },
};

export function FilmRow({ film, onClick, cameras, backs, groupCount, index = 0 }: FilmRowProps) {
	const { t } = useTranslation();
	const variant = filmTypeToVariant(filmType(film));
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? backs.find((b) => b.id === film.backId) : null;
	const expInfo = getExpirationStatus(film.expDate, t);
	const isExpiring = expInfo && (expInfo.status === "expiring" || expInfo.status === "expired");
	const stateLabel = t(`states.${film.state}`);
	const rotation = pickRotation(index, "subtle");
	const tone = STATE_TONE[film.state];

	const sub = film.type ? film.type.toLowerCase() : "";
	const localeTag = t("dateLocale");
	const metaParts: string[] = [];
	if (film.type) metaParts.push(film.type.toLowerCase());
	if (film.expDate) metaParts.push(t("stock.metaExp", { date: fmtExpDate(film.expDate, localeTag) }));
	if (film.price != null) metaParts.push(fmtPrice(film.price, localeTag));
	if (cam) metaParts.push(cameraDisplayName(cam) + (back ? ` · ${backDisplayName(back)}` : ""));
	if (film.labRef) metaParts.push(t("stock.metaRef", { ref: film.labRef }));

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative grid bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]",
				"grid-cols-[64px_1fr_auto] items-stretch overflow-hidden text-left w-full cursor-pointer",
				"transition-transform active:scale-[.99]",
				rotation,
			)}
		>
			<FilmLabel iso={film.iso ?? "—"} format={film.format ?? ""} variant={variant} size="sm" />

			<div className="px-3 py-2.5 min-w-0">
				<div className="font-cormorant text-[16px] font-semibold text-ink leading-[1.1]">
					{filmName(film)}
					{sub && <em className="font-normal italic text-[13px] text-ink-faded ml-1.5">{sub}</em>}
				</div>
				<div className="font-typewriter text-[9px] tracking-[0.1em] uppercase text-ink-faded mt-1.5 leading-tight">
					{metaParts.join(" · ")}
				</div>
				{film.tags && film.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-1.5">
						{film.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center font-archivo font-extrabold text-[9px] uppercase tracking-[0.15em] px-1.5 py-px border-[1.5px] border-ink-faded text-ink-faded"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>

			<div className="flex flex-col items-end justify-between px-3 py-2 border-l border-dashed border-ink-faded/40 bg-white/15 min-w-[64px]">
				<div className="font-archivo-black text-[26px] text-ink leading-[0.9] tracking-[-0.5px] text-right">
					{groupCount && groupCount > 1 ? groupCount : (film.quantity ?? 1)}
					<span className="block font-archivo font-bold text-[9px] text-ink-faded mt-0.5 tracking-[0.18em] uppercase text-right">
						{groupCount && groupCount > 1 ? t("stock.resultCount", { count: groupCount }) : stateLabel.toLowerCase()}
					</span>
				</div>
				{isExpiring ? (
					<span className="inline-flex items-center font-archivo font-extrabold text-[9px] uppercase tracking-[0.15em] px-1.5 py-1 border-[1.5px] border-ink bg-kodak-yellow text-ink leading-none -rotate-3 mt-2">
						{expInfo.label}
					</span>
				) : (
					<span
						className={cn(
							"inline-flex items-center font-archivo font-extrabold text-[9px] uppercase tracking-[0.15em] px-1.5 py-1 border-[1.5px] leading-none mt-2",
							tone.bg,
							tone.fg,
						)}
					>
						{stateLabel}
					</span>
				)}
			</div>
		</button>
	);
}
