import { useTranslation } from "react-i18next";
import { FilmLabel } from "@/components/ui/film-label";
import { cn } from "@/lib/utils";
import type { Back, Camera, Film } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmName } from "@/utils/film-helpers";
import { fmtPrice } from "@/utils/helpers";

interface FilmRowProps {
	film: Film;
	onClick: () => void;
	cameras: Camera[];
	backs: Back[];
	groupCount?: number;
	index?: number;
}

const STATE_TONE: Record<Film["state"], { className: string; dot: "accent" | "none" }> = {
	stock: { className: "bg-transparent text-text-3 ring-1 ring-line", dot: "none" },
	loaded: { className: "bg-text text-bg", dot: "none" },
	partial: { className: "bg-fill-2 text-text", dot: "none" },
	exposed: { className: "bg-text text-bg", dot: "accent" },
	developed: { className: "bg-fill-1 text-text", dot: "none" },
	scanned: { className: "bg-transparent text-text-2 ring-1 ring-line", dot: "none" },
};

export function FilmRow({ film, onClick, cameras, backs, groupCount }: FilmRowProps) {
	const { t } = useTranslation();
	const cam = film.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? backs.find((b) => b.id === film.backId) : null;
	const expInfo = getExpirationStatus(film.expDate, t);
	const isExpiring = expInfo && (expInfo.status === "expiring" || expInfo.status === "expired");
	const stateLabel = t(`states.${film.state}`);
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
				"relative grid bg-surface rounded-[12px]",
				"grid-cols-[64px_1fr_auto] items-stretch overflow-hidden text-left w-full cursor-pointer",
				"transition-colors hover:bg-surface-2",
			)}
		>
			<FilmLabel iso={film.iso ?? "—"} format={film.format ?? ""} brand={film.brand} size="sm" />

			<div className="px-3 py-2.5 min-w-0">
				<div className="text-[15px] font-semibold text-text leading-tight">
					{filmName(film)}
					{sub && <span className="font-normal text-[12px] text-text-3 ml-1.5">{sub}</span>}
				</div>
				<div className="text-[11px] text-text-3 mt-1 leading-snug">{metaParts.join(" · ")}</div>
				{film.tags && film.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-1.5">
						{film.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-2 text-text-2"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>

			<div className="flex flex-col items-end justify-between px-3 py-2 min-w-[64px]">
				<div className="text-xl font-semibold text-text leading-none tracking-tight text-right">
					{groupCount && groupCount > 1 ? groupCount : (film.quantity ?? 1)}
					<span className="block text-[10px] text-text-3 font-normal mt-1 text-right">
						{groupCount && groupCount > 1 ? t("stock.resultCount", { count: groupCount }) : stateLabel.toLowerCase()}
					</span>
				</div>
				{isExpiring ? (
					<span className="inline-flex items-center text-[10px] font-medium px-2 py-1 leading-none rounded-full mt-2 bg-accent-soft text-accent ring-1 ring-accent">
						{expInfo.label}
					</span>
				) : (
					<span
						className={cn(
							"inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 leading-none rounded-full mt-2",
							tone.className,
						)}
					>
						{tone.dot === "accent" && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
						{stateLabel}
					</span>
				)}
			</div>
		</button>
	);
}
