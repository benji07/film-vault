import { ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PhotoImg } from "@/components/ui/photo-img";
import type { Film, HistoryEntry, LucideIcon } from "@/types";
import { filmName } from "@/utils/film-helpers";
import { fmtDate } from "@/utils/helpers";
import { CAMERA_HISTORY_ACTIONS, HISTORY_ACTION_ICONS, HISTORY_ACTION_KEYS } from "@/utils/history-action";

interface CameraHistoryTimelineProps {
	films: Film[];
	onFilmClick: (filmId: string) => void;
	onPhotoClick?: (photos: string[], index: number) => void;
}

interface EnrichedEntry extends HistoryEntry {
	filmId: string;
	filmLabel: string;
	sourceIndex: number;
}

export function CameraHistoryTimeline({ films, onFilmClick, onPhotoClick }: CameraHistoryTimelineProps) {
	const { t } = useTranslation();

	// Keep actions that physically involve the camera (load/reload/expose/remove).
	// Legacy entries without an `actionCode` are also kept because they pre-date
	// the structured codes and would otherwise be invisible for older films.
	const entries: EnrichedEntry[] = films
		.flatMap((f) =>
			(f.history || [])
				.map((h, idx): EnrichedEntry | null =>
					!h.actionCode || CAMERA_HISTORY_ACTIONS.has(h.actionCode)
						? { ...h, filmId: f.id, filmLabel: filmName(f), sourceIndex: idx }
						: null,
				)
				.filter((e): e is EnrichedEntry => e !== null),
		)
		.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

	if (entries.length === 0) {
		return <span className="text-[12px] text-text-muted font-body italic">{t("cameraDetail.noHistory")}</span>;
	}

	return (
		<div>
			<span className="text-[11px] font-bold text-text-muted font-body uppercase tracking-wide">
				{t("timeline.history")}
			</span>
			<div className="mt-3 flex flex-col">
				{entries.map((h, i) => {
					const isFirst = i === 0;
					const isLast = i === entries.length - 1;
					let Icon: LucideIcon = Plus;
					let text = h.action;
					if (h.actionCode) {
						Icon = HISTORY_ACTION_ICONS[h.actionCode];
						const keyOrFn = HISTORY_ACTION_KEYS[h.actionCode];
						const key = typeof keyOrFn === "function" ? keyOrFn(h.params) : keyOrFn;
						text = t(key, h.params ?? {});
					}

					return (
						<div key={`${h.filmId}-${h.sourceIndex}`} className="flex gap-3">
							<div className="flex flex-col items-center">
								<div
									className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${
										isFirst
											? "bg-accent border-2 border-accent animate-timeline-pulse"
											: "bg-bg border-2 border-border-light"
									}`}
								/>
								{!isLast && <div className="w-[2px] flex-1 bg-border min-h-4" />}
							</div>
							<div className={`flex flex-col gap-0.5 ${isLast ? "pb-0" : "pb-3"} flex-1 min-w-0`}>
								<div className="flex items-center gap-1.5">
									<Icon size={12} className={isFirst ? "text-accent" : "text-text-muted"} />
									<span className="text-[11px] text-text-muted font-mono">{fmtDate(h.date)}</span>
								</div>
								<span className={`text-xs font-body ${isFirst ? "text-text-primary" : "text-text-sec"}`}>{text}</span>
								<button
									type="button"
									onClick={() => onFilmClick(h.filmId)}
									className="flex items-center gap-1 text-[11px] font-body text-accent hover:underline self-start cursor-pointer"
								>
									<span className="truncate max-w-[220px]">{h.filmLabel}</span>
									<ChevronRight size={11} />
								</button>
								{h.photos && h.photos.length > 0 && (
									<div className="flex gap-1.5 mt-1.5">
										{h.photos.map((photo, pi) => (
											<Button
												key={photo.slice(-20)}
												variant="ghost"
												size="icon"
												onClick={() => onPhotoClick?.(h.photos!, pi)}
												className="rounded-md overflow-hidden border border-border bg-surface-alt !p-0"
												aria-label={t("aria.openPhoto", { index: pi + 1 })}
											>
												<PhotoImg src={photo} className="w-full h-full object-cover" alt="" />
											</Button>
										))}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
