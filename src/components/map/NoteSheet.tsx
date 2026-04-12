import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoImg } from "@/components/ui/photo-img";
import { filmName } from "@/utils/film-helpers";
import type { GeoNote } from "@/utils/map-helpers";

interface NoteSheetProps {
	geoNote: GeoNote;
	onClose: () => void;
	onViewFilm: () => void;
}

export function NoteSheet({ geoNote, onClose, onViewFilm }: NoteSheetProps) {
	const { t } = useTranslation();
	const { note, film } = geoNote;
	const name = filmName(film);
	const [showViewer, setShowViewer] = useState(false);

	return (
		<>
			<div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
				<div className="bg-card border-t border-border rounded-t-2xl shadow-2xl mx-auto max-w-lg w-full">
					<div className="flex justify-center pt-2 pb-1">
						<div className="w-10 h-1 rounded-full bg-border" />
					</div>
					<div className="px-4 pb-4">
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2 mb-1">
									{note.frameNumber != null && (
										<Badge
											style={{
												color: "var(--color-text-primary)",
												background: "var(--color-accent-soft)",
												fontFamily: "var(--font-mono)",
											}}
										>
											#{note.frameNumber}
										</Badge>
									)}
									<span className="text-sm font-semibold text-text-primary truncate">{name}</span>
								</div>
								{(note.aperture || note.shutterSpeed) && (
									<p className="text-xs text-text-sec">
										{[note.aperture, note.shutterSpeed].filter(Boolean).join(" · ")}
									</p>
								)}
								{note.location && <p className="text-xs text-text-muted mt-0.5 truncate">{note.location}</p>}
								{note.lens && <p className="text-xs text-text-muted truncate">{note.lens}</p>}
							</div>
							<Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -mr-2">
								<X size={18} className="text-text-muted" />
							</Button>
						</div>

						{note.photo && (
							<div className="mb-3 rounded-lg overflow-hidden">
								<button
									type="button"
									className="block w-full"
									onClick={() => setShowViewer(true)}
									aria-label={t("aria.openPhoto", { index: 1 })}
								>
									<PhotoImg
										src={note.photo}
										alt=""
										aria-hidden="true"
										className="w-full h-32 object-cover cursor-pointer"
									/>
								</button>
							</div>
						)}

						<Button variant="outline" className="w-full justify-center" onClick={onViewFilm}>
							{t("map.viewFilm")}
						</Button>
					</div>
				</div>
			</div>

			{showViewer && note.photo && (
				<PhotoViewer photos={[note.photo]} initialIndex={0} onClose={() => setShowViewer(false)} />
			)}
		</>
	);
}
