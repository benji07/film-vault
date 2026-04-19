import { Camera as CameraIcon, Film as FilmIcon, History, Info } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PhotoImg } from "@/components/ui/photo-img";
import { alpha, T } from "@/constants/theme";
import type { AppData, ScreenName } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { CameraFilmsList } from "./camera-detail/CameraFilmsList";
import { CameraHistoryTimeline } from "./camera-detail/CameraHistoryTimeline";
import { CameraInfoSection } from "./camera-detail/CameraInfoSection";

interface CameraDetailScreenProps {
	data: AppData;
	cameraId: string | null;
	setScreen: (screen: ScreenName) => void;
	onFilmClick: (filmId: string) => void;
}

export function CameraDetailScreen({ data, cameraId, setScreen, onFilmClick }: CameraDetailScreenProps) {
	const { t } = useTranslation();
	const camera = cameraId ? data.cameras.find((c) => c.id === cameraId) : null;
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [viewerPhotos, setViewerPhotos] = useState<string[] | null>(null);
	const [viewerIndex, setViewerIndex] = useState(0);

	if (!camera) {
		return (
			<EmptyState
				icon={CameraIcon}
				title={t("cameraDetail.notFound")}
				action={<Button onClick={() => setScreen("cameras")}>{t("filmDetail.back")}</Button>}
			/>
		);
	}

	const cameraFilms = data.films.filter((f) => f.cameraId === camera.id);
	const loadedCount = cameraFilms.filter((f) => f.state === "loaded").length;
	const totalCount = cameraFilms.length;

	return (
		<div className="flex flex-col gap-5 pb-10">
			{/* Header */}
			<div>
				<h2 className="font-display text-[22px] text-text-primary m-0 italic">{cameraDisplayName(camera)}</h2>
				<div className="flex gap-2 flex-wrap mt-2">
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{camera.format}</Badge>
					{camera.mount && (
						<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{camera.mount}</Badge>
					)}
					{loadedCount > 0 && (
						<Badge style={{ color: T.green, background: alpha(T.green, 0.09) }}>
							{t("cameras.loaded", { count: loadedCount })}
						</Badge>
					)}
					{totalCount > 0 && (
						<Badge style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>
							{t("equipment.associatedFilms", { count: totalCount })}
						</Badge>
					)}
				</div>
			</div>

			{/* Camera photo */}
			{camera.photo && (
				<button
					type="button"
					onClick={() => setViewerPhoto(camera.photo!)}
					aria-label={t("aria.openPhoto", { index: 1 })}
					className="w-full rounded-[14px] overflow-hidden border border-border bg-surface-alt cursor-pointer"
				>
					<PhotoImg
						src={camera.photo}
						alt=""
						aria-hidden="true"
						className={`w-full max-h-80 object-cover ${camera.soldAt ? "grayscale" : ""}`}
					/>
				</button>
			)}

			{/* Info */}
			<CollapsibleSection icon={Info} title={t("cameraDetail.sectionInfo")} defaultOpen>
				<CameraInfoSection camera={camera} />
			</CollapsibleSection>

			{/* Films */}
			<CollapsibleSection icon={FilmIcon} title={t("cameraDetail.sectionFilms")} count={cameraFilms.length} defaultOpen>
				<CameraFilmsList films={cameraFilms} onFilmClick={onFilmClick} />
			</CollapsibleSection>

			{/* History */}
			<CollapsibleSection icon={History} title={t("cameraDetail.sectionHistory")} defaultOpen={false}>
				<CameraHistoryTimeline
					films={cameraFilms}
					onFilmClick={onFilmClick}
					onPhotoClick={(photos, index) => {
						setViewerPhotos(photos);
						setViewerIndex(index);
					}}
				/>
			</CollapsibleSection>

			{viewerPhoto && <PhotoViewer photos={[viewerPhoto]} initialIndex={0} onClose={() => setViewerPhoto(null)} />}
			{viewerPhotos && (
				<PhotoViewer photos={viewerPhotos} initialIndex={viewerIndex} onClose={() => setViewerPhotos(null)} />
			)}
		</div>
	);
}
