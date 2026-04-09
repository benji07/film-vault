import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { filmName } from "@/utils/film-helpers";
import type { Cluster, GeoNote } from "@/utils/map-helpers";
import { getMarkerColor } from "@/utils/map-helpers";

interface ClusterSheetProps {
	cluster: Cluster;
	onClose: () => void;
	onSelectNote: (geoNote: GeoNote) => void;
}

export function ClusterSheet({ cluster, onClose, onSelectNote }: ClusterSheetProps) {
	const { t } = useTranslation();
	return (
		<div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
			<div className="bg-card border-t border-border rounded-t-2xl shadow-2xl mx-auto max-w-lg w-full">
				<div className="flex justify-center pt-2 pb-1">
					<div className="w-10 h-1 rounded-full bg-border" />
				</div>
				<div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-semibold text-text-primary">
							{t("map.noteCount", { count: cluster.notes.length })}
						</span>
						<Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
							<X size={18} className="text-text-muted" />
						</Button>
					</div>
					<div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
						{cluster.notes.map((geoNote) => {
							const name = filmName(geoNote.film);
							const color = getMarkerColor(geoNote.film.type);
							return (
								<button
									type="button"
									key={geoNote.note.id}
									onClick={() => onSelectNote(geoNote)}
									className="flex items-center gap-2 rounded-lg px-3 py-2 bg-surface hover:bg-surface-alt transition-colors text-left"
								>
									<div
										className="w-3 h-3 rounded-full shrink-0 border border-white/50"
										style={{ backgroundColor: color }}
									/>
									{geoNote.note.frameNumber != null && (
										<span className="text-xs font-mono text-text-sec">#{geoNote.note.frameNumber}</span>
									)}
									<span className="text-sm text-text-primary truncate flex-1">{name}</span>
									{geoNote.note.aperture && <span className="text-xs text-text-muted">{geoNote.note.aperture}</span>}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
