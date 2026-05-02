import { Camera, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { EditCameraDialog, type EditableCamera } from "@/components/equipment/EditCameraDialog";
import { EquipmentItemCard } from "@/components/equipment/EquipmentItemCard";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PhotoImg } from "@/components/ui/photo-img";
import { alpha, T } from "@/constants/theme";
import type { AppData } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmIso, filmName } from "@/utils/film-helpers";
import { collectMounts } from "@/utils/lens-helpers";

interface CamerasTabProps {
	data: AppData;
	setData: (data: AppData) => void;
	onCameraClick?: (camId: string) => void;
}

export function CamerasTab({ data, setData, onCameraClick }: CamerasTabProps) {
	const { t } = useTranslation();
	const [editCam, setEditCam] = useState<EditableCamera | null>(null);
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);
	const mountSuggestions = useMemo(() => collectMounts(data.cameras, data.lenses), [data.cameras, data.lenses]);

	const activeCameras = data.cameras.filter((c) => !c.soldAt);
	const soldCameras = data.cameras.filter((c) => c.soldAt);

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
								washi={(["w1", "w2", "w3", "w4"][idx % 4] as "w1" | "w2" | "w3" | "w4") ?? "w1"}
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
								const soldDate = cam.soldAt ? new Date(cam.soldAt).toLocaleDateString() : "";
								return (
									<Card key={cam.id} className="opacity-70">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{cam.photo ? (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setViewerPhoto(cam.photo!);
														}}
														aria-label={t("aria.openPhoto", { index: 1 })}
														className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
													>
														<PhotoImg
															src={cam.photo}
															alt=""
															aria-hidden="true"
															className="w-full h-full object-cover border border-border cursor-pointer grayscale"
														/>
													</button>
												) : (
													<div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
														<Camera size={20} className="text-text-muted opacity-40" />
													</div>
												)}
												<div>
													<div className="text-[15px] font-semibold text-text-primary font-body">
														{cameraDisplayName(cam)}
													</div>
													<div className="flex gap-1.5 mt-1.5 flex-wrap">
														<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
															{cam.format}
														</Badge>
														{soldDate && (
															<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
																{t("equipment.soldOn", { date: soldDate })}
															</Badge>
														)}
														{associatedFilms > 0 && (
															<Badge style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>
																{t("equipment.associatedFilms", { count: associatedFilms })}
															</Badge>
														)}
													</div>
												</div>
											</div>
											<div className="flex gap-1.5">
												<Button
													variant="outline"
													size="icon"
													onClick={() => unarchiveCamera(cam.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.unarchiveCamera")}
												>
													<RotateCcw size={14} className="text-text-sec" />
												</Button>
												<Button
													variant="destructive"
													size="icon"
													onClick={() => setPendingHardDeleteId(cam.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.hardDeleteCamera")}
												>
													<Trash2 size={14} className="text-accent" />
												</Button>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</CollapsibleSection>
				)}
			</div>

			<EditCameraDialog
				camera={editCam}
				onChange={setEditCam}
				onSave={saveEditCamera}
				onCancel={() => setEditCam(null)}
				mountSuggestions={mountSuggestions}
			/>

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
