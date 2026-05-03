import { Camera } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { EquipmentItemCard } from "@/components/equipment/EquipmentItemCard";
import { SoldEquipmentCard } from "@/components/equipment/SoldEquipmentCard";
import { PhotoViewer } from "@/components/PhotoViewer";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { AppData } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmIso, filmName } from "@/utils/film-helpers";

interface CamerasTabProps {
	data: AppData;
	setData: (data: AppData) => void;
	onCameraClick?: (camId: string) => void;
}

export function CamerasTab({ data, setData, onCameraClick }: CamerasTabProps) {
	const { t } = useTranslation();
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);

	const activeCameras = data.cameras.filter((c) => !c.soldAt);
	const soldCameras = data.cameras.filter((c) => c.soldAt);

	const unarchiveCamera = (camId: string) => {
		const newCams = data.cameras.map((c) => (c.id === camId ? { ...c, soldAt: null } : c));
		setData({ ...data, cameras: newCams });
	};

	const hardDeleteCamera = (camId: string) => {
		const newBacks = data.backs.map((b) => ({
			...b,
			compatibleCameraIds: b.compatibleCameraIds.filter((id) => id !== camId),
		}));
		const newFilms = data.films.map((f) => (f.cameraId === camId ? { ...f, cameraId: null, backId: null } : f));
		setData({ ...data, cameras: data.cameras.filter((c) => c.id !== camId), backs: newBacks, films: newFilms });
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4">
					{activeCameras.map((cam, idx) => {
						const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.cameraId === cam.id);
						const camBacks = data.backs.filter((b) => !b.soldAt && b.compatibleCameraIds.includes(cam.id));
						const totalRolls = data.films.filter((f) => f.cameraId === cam.id).length;
						const totalShots = data.films
							.filter((f) => f.cameraId === cam.id)
							.reduce((sum, f) => sum + (f.posesShot ?? 0), 0);
						const loadedSummary = loadedFilms[0]
							? `${filmName(loadedFilms[0])} — ${filmIso(loadedFilms[0])} ISO`
							: null;
						return (
							<EquipmentItemCard
								key={cam.id}
								name={cameraDisplayName(cam)}
								year={cam.format}
								formatLabel={cam.format}
								photo={cam.photo}
								index={idx}
								onClick={onCameraClick ? () => onCameraClick(cam.id) : undefined}
								stats={[
									{ value: totalRolls, label: t("cameras.rolls", { defaultValue: "rolls" }) },
									{ value: totalShots || "—", label: t("cameras.shots", { defaultValue: "poses" }) },
									{ value: camBacks.length, label: t("cameras.backsLabel", { defaultValue: "dos" }) },
								]}
								loadedSummary={loadedSummary}
							/>
						);
					})}
					{activeCameras.length === 0 && (
						<EmptyState icon={Camera} title={t("cameras.noCameras")} subtitle={t("cameras.noCamerasSubtitle")} />
					)}
				</div>

				{soldCameras.length > 0 && (
					<CollapsibleSection title={t("cameras.soldSection")} count={soldCameras.length}>
						<div className="flex flex-col gap-2.5">
							{soldCameras.map((cam) => {
								const associatedFilms = data.films.filter((f) => f.cameraId === cam.id).length;
								const soldDate = cam.soldAt ? new Date(cam.soldAt).toLocaleDateString() : null;
								return (
									<SoldEquipmentCard
										key={cam.id}
										name={cameraDisplayName(cam)}
										photo={cam.photo}
										fallbackIcon={Camera}
										soldDate={soldDate}
										formatLabel={cam.format}
										associatedFilmsCount={associatedFilms}
										onPhotoClick={() => cam.photo && setViewerPhoto(cam.photo)}
										onUnarchive={() => unarchiveCamera(cam.id)}
										onHardDelete={() => setPendingHardDeleteId(cam.id)}
										unarchiveLabel={t("aria.unarchiveCamera")}
										hardDeleteLabel={t("aria.hardDeleteCamera")}
									/>
								);
							})}
						</div>
					</CollapsibleSection>
				)}
			</div>

			{viewerPhoto && <PhotoViewer photos={[viewerPhoto]} initialIndex={0} onClose={() => setViewerPhoto(null)} />}

			<ConfirmDialog
				open={pendingHardDeleteId !== null}
				onOpenChange={(open) => !open && setPendingHardDeleteId(null)}
				title={t("equipment.hardDelete")}
				description={t("cameras.hardDeleteConfirm")}
				confirmLabel={t("equipment.hardDelete")}
				destructive
				onConfirm={() => {
					if (pendingHardDeleteId) hardDeleteCamera(pendingHardDeleteId);
				}}
			/>
		</>
	);
}
