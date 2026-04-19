import { Archive, Camera, Clock, Eye, Package, Plus, RotateCcw, ScanLine, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PhotoImg } from "@/components/ui/photo-img";
import type { HistoryEntry, LucideIcon } from "@/types";
import { fmtDate } from "@/utils/helpers";
import { HISTORY_ACTION_ICONS, HISTORY_ACTION_KEYS } from "@/utils/history-action";

interface TimelineProps {
	entries: HistoryEntry[];
	onPhotoClick?: (photos: string[], index: number) => void;
}

/** Fallback icon detection for legacy entries that only have a free-text action field */
function getLegacyIcon(action: string): LucideIcon {
	if (/Chargée|Loaded|appareil|camera/i.test(action)) return Camera;
	if (/Rechargée|Reloaded/i.test(action)) return RotateCcw;
	if (/Retirée|removed|Partial/i.test(action)) return Clock;
	if (/Exposée|Exposed|attente|awaiting/i.test(action)) return Eye;
	if (/Envoyée|Sent/i.test(action)) return Send;
	if (/Développée|Developed/i.test(action)) return Archive;
	if (/Scannée|Scanned/i.test(action)) return ScanLine;
	if (/labo|Lab/i.test(action)) return Package;
	return Plus;
}

export function Timeline({ entries, onPhotoClick }: TimelineProps) {
	const { t } = useTranslation();

	const renderAction = (entry: HistoryEntry): { icon: LucideIcon; text: string } => {
		if (entry.actionCode) {
			const icon = HISTORY_ACTION_ICONS[entry.actionCode];
			const keyOrFn = HISTORY_ACTION_KEYS[entry.actionCode];
			const key = typeof keyOrFn === "function" ? keyOrFn(entry.params) : keyOrFn;
			const text = t(key, entry.params ?? {});
			return { icon, text };
		}
		// Legacy: fall back to raw action text
		return { icon: getLegacyIcon(entry.action), text: entry.action };
	};

	return (
		<div>
			<span className="text-[11px] font-bold text-text-muted font-body uppercase tracking-wide">
				{t("timeline.history")}
			</span>
			<div className="mt-3 flex flex-col">
				{entries.map((h, i) => {
					const isFirst = i === 0;
					const isLast = i === entries.length - 1;
					const { icon: Icon, text } = renderAction(h);

					return (
						<div key={`${h.date}-${h.actionCode || h.action}`} className="flex gap-3">
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
							<div className={`flex flex-col gap-0.5 ${isLast ? "pb-0" : "pb-3"}`}>
								<div className="flex items-center gap-1.5">
									<Icon size={12} className={isFirst ? "text-accent" : "text-text-muted"} />
									<span className="text-[11px] text-text-muted font-mono">{fmtDate(h.date)}</span>
								</div>
								<span className={`text-xs font-body ${isFirst ? "text-text-primary" : "text-text-sec"}`}>{text}</span>
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
