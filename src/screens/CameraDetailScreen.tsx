import { Archive, Camera as CameraIcon, Edit3, Film as FilmIcon, History, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditCameraDialog, type EditableCamera } from "@/components/equipment/EditCameraDialog";
import { EmptyState } from "@/components/EmptyState";
import { PhotoViewer } from "@/components/PhotoViewer";
import { useToast } from "@/components/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PhotoImg } from "@/components/ui/photo-img";
import { alpha, T } from "@/constants/theme";
import type { AppData } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { collectMounts } from "@/utils/lens-helpers";
import { CameraFilmsList } from "./camera-detail/CameraFilmsList";
import { CameraHistoryTimeline } from "./camera-detail/CameraHistoryTimeline";
import { CameraInfoSection } from "./camera-detail/CameraInfoSection";

interface CameraDetailScreenProps {
	data: AppData;
	setData: (data: AppData) => Promise<void> | void;
	cameraId: string | null;
	onExit: () => void;
	onFilmClick: (filmId: string) => void;
}

export function CameraDetailScreen({ data, setData, cameraId, onExit, onFilmClick }: CameraDetailScreenProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const camera = cameraId ? data.cameras.find((c) => c.id === cameraId) : null;
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [viewerPhotos, setViewerPhotos] = useState<string[] | null>(null);
	const [viewerIndex, setViewerIndex] = useState(0);
	const [editCam, setEditCam] = useState<EditableCamera | null>(null);
	const [archiveOpen, setArchiveOpen] = useState(false);
	const mountSuggestions = useMemo(() => collectMounts(data.cameras, data.lenses), [data.cameras, data.lenses]);

	if (!camera) {
		return (
			<EmptyState
				icon={CameraIcon}
				title={t("cameraDetail.notFound")}
				action={<Button onClick={onExit}>{t("filmDetail.back")}</Button>}
			/>
		);
	}

	const cameraFilms = data.films.filter((f) => f.cameraId === camera.id);
	const loadedCount = cameraFilms.filter((f) => f.state === "loaded").length;
	const partialCount = cameraFilms.filter((f) => f.state === "partial").length;
	const totalCount = cameraFilms.length;
	const canArchive = !camera.soldAt && loadedCount === 0;

	const saveEditCamera = () => {
		if (!editCam || (!editCam.brand && !editCam.model)) return;
		const hasLens = editCam.hasInterchangeableLens ?? true;
		const hasManual = editCam.hasManualControls ?? true;
		const newCams = data.cameras.map((c) =>
			c.id === editCam.id
				? {
						...c,
						brand: editCam.brand,
						model: editCam.model,
						nickname: editCam.nickname,
						serial: editCam.serial,
						format: editCam.format,
						mount: hasLens ? editCam.mount || null : null,
						hasInterchangeableBack: editCam.hasInterchangeableBack || false,
						hasInterchangeableLens: hasLens,
						hasManualControls: hasManual,
						photo: editCam.photo,
						shutterSpeedMin: hasManual ? editCam.shutterSpeedMin || null : null,
						shutterSpeedMax: hasManual ? editCam.shutterSpeedMax || null : null,
					}
				: c,
		);
		setData({ ...data, cameras: newCams });
		setEditCam(null);
	};

	const archiveCamera = () => {
		const newCams = data.cameras.map((c) => (c.id === camera.id ? { ...c, soldAt: new Date().toISOString() } : c));
		setData({ ...data, cameras: newCams });
		toast(t("cameras.archived", { defaultValue: "Boitier archivé" }), "info");
		onExit();
	};

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
					{partialCount > 0 && (
						<Badge style={{ color: T.amber, background: alpha(T.amber, 0.09) }}>
							{t("cameraDetail.partial", { count: partialCount })}
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

			{/* Actions */}
			{!camera.soldAt && (
				<div className="flex gap-2 mt-2">
					<Button variant="secondary" className="flex-1 justify-center" onClick={() => setEditCam({ ...camera })}>
						<Edit3 size={14} /> {t("cameras.editCamera")}
					</Button>
					<Button
						variant="ghost"
						className="flex-1 justify-center text-kodak-red"
						onClick={() => setArchiveOpen(true)}
						disabled={!canArchive}
						aria-label={t("aria.sellCamera")}
					>
						<Archive size={14} /> {t("cameras.archive", { defaultValue: "Archiver" })}
					</Button>
				</div>
			)}

			<EditCameraDialog
				camera={editCam}
				onChange={setEditCam}
				onSave={saveEditCamera}
				onCancel={() => setEditCam(null)}
				mountSuggestions={mountSuggestions}
			/>

			<ConfirmDialog
				open={archiveOpen}
				onOpenChange={setArchiveOpen}
				title={t("cameras.archive", { defaultValue: "Archiver le boitier" })}
				description={t("cameras.archiveConfirm", {
					defaultValue: "Le boitier sera déplacé dans la section archivée et ne sera plus utilisable pour de nouveaux rolls.",
				})}
				confirmLabel={t("cameras.archive", { defaultValue: "Archiver" })}
				destructive
				onConfirm={archiveCamera}
			/>

			{viewerPhoto && <PhotoViewer photos={[viewerPhoto]} initialIndex={0} onClose={() => setViewerPhoto(null)} />}
			{viewerPhotos && (
				<PhotoViewer photos={viewerPhotos} initialIndex={viewerIndex} onClose={() => setViewerPhotos(null)} />
			)}
		</div>
	);
}
