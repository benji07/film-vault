import { Archive, Camera, Clock, Eye, Package, Plus, RotateCcw, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HistoryEntry, LucideIcon } from "@/types";
import { fmtDate } from "@/utils/helpers";

interface TimelineProps {
	entries: HistoryEntry[];
	onPhotoClick?: (photos: string[], index: number) => void;
}

function getActionIcon(action: string): LucideIcon {
	if (/Chargée|Loaded|appareil|camera/i.test(action)) return Camera;
	if (/Rechargée|Reloaded/i.test(action)) return RotateCcw;
	if (/Retirée|removed|Partially/i.test(action)) return Clock;
	if (/Exposée|Exposed|attente|awaiting/i.test(action)) return Eye;
	if (/Envoyée|Sent/i.test(action)) return Send;
	if (/Développée|Developed/i.test(action)) return Archive;
	if (/Ajoutée|Added|Duplicat/i.test(action)) return Plus;
	if (/labo|Labo|Lab/i.test(action)) return Package;
	return Plus;
}

export function Timeline({ entries, onPhotoClick }: TimelineProps) {
	const { t } = useTranslation();

	return (
		<div>
			<span className="text-[11px] font-bold text-text-muted font-body uppercase tracking-wide">
				{t("timeline.history")}
			</span>
			<div className="mt-3 flex flex-col">
				{entries.map((h, i) => {
					const isFirst = i === 0;
					const isLast = i === entries.length - 1;
					const Icon = getActionIcon(h.action);

					return (
						<div key={`${h.date}-${h.action}`} className="flex gap-3">
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
								<span className={`text-xs font-body ${isFirst ? "text-text-primary" : "text-text-sec"}`}>
									{h.action}
								</span>
								{h.photos && h.photos.length > 0 && (
									<div className="flex gap-1.5 mt-1.5">
										{h.photos.map((photo, pi) => (
											<button
												key={photo.slice(-20)}
												type="button"
												onClick={() => onPhotoClick?.(h.photos!, pi)}
												className="w-10 h-10 rounded-md overflow-hidden border border-border bg-surface-alt cursor-pointer p-0"
											>
												<img src={photo} className="w-full h-full object-cover" alt="" />
											</button>
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
