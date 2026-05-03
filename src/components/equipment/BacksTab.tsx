import { Camera, Check, PackageX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { EquipmentItemCard } from "@/components/equipment/EquipmentItemCard";
import { SoldEquipmentCard } from "@/components/equipment/SoldEquipmentCard";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type AppData, type Back, INSTANT_FORMATS } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";

interface BacksTabProps {
	data: AppData;
	setData: (data: AppData) => void;
}

export function BacksTab({ data, setData }: BacksTabProps) {
	const { t } = useTranslation();
	const [editBack, setEditBack] = useState<Back | null>(null);
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);

	const interchangeableCameras = data.cameras.filter((c) => c.hasInterchangeableBack && !c.soldAt);
	const activeBacks = data.backs.filter((b) => !b.soldAt);
	const soldBacks = data.backs.filter((b) => b.soldAt);

	const toggleEditBackCamera = (cameraId: string) => {
		if (!editBack) return;
		const ids = editBack.compatibleCameraIds;
		if (ids.includes(cameraId)) {
			setEditBack({ ...editBack, compatibleCameraIds: ids.filter((id) => id !== cameraId) });
		} else {
			setEditBack({ ...editBack, compatibleCameraIds: [...ids, cameraId] });
		}
	};

	const saveEditBack = () => {
		if (!editBack?.name) return;
		const newBacks = data.backs.map((b) => (b.id === editBack.id ? { ...editBack } : b));
		setData({ ...data, backs: newBacks });
		setEditBack(null);
	};

	const sellBack = (backId: string) => {
		const newBacks = data.backs.map((b) => (b.id === backId ? { ...b, soldAt: new Date().toISOString() } : b));
		setData({ ...data, backs: newBacks });
		setEditBack(null);
	};

	const unarchiveBack = (backId: string) => {
		const newBacks = data.backs.map((b) => (b.id === backId ? { ...b, soldAt: null } : b));
		setData({ ...data, backs: newBacks });
	};

	const hardDeleteBack = (backId: string) => {
		const newBacks = data.backs.filter((b) => b.id !== backId);
		const newFilms = data.films.map((f) => (f.backId === backId ? { ...f, backId: null } : f));
		setData({ ...data, backs: newBacks, films: newFilms });
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4">
					{activeBacks.map((b, idx) => {
						const backFilm = data.films.find((f) => f.state === "loaded" && f.backId === b.id);
						const compatCams = data.cameras.filter((c) => !c.soldAt && b.compatibleCameraIds.includes(c.id));
						const totalUses = data.films.filter((f) => f.backId === b.id).length;
						return (
							<EquipmentItemCard
								key={b.id}
								name={b.nickname ? `${b.nickname} (${b.name})` : b.name}
								year={compatCams.map((c) => cameraDisplayName(c)).join(" · ") || undefined}
								formatLabel={b.format}
								photo={b.photo}
								vignette="back"
								index={idx}
								washiOffset={2}
								stats={[
									{ value: compatCams.length, label: t("cameras.cameras", { defaultValue: "boitiers" }) },
									{ value: totalUses, label: t("cameras.usesLabel", { defaultValue: "rolls" }) },
									{ value: b.format, label: t("cameras.formatLabel", { defaultValue: "format" }) },
								]}
								loadedSummary={backFilm ? filmName(backFilm) : null}
								onClick={() => setEditBack({ ...b })}
							/>
						);
					})}
					{activeBacks.length === 0 && (
						<EmptyState icon={Camera} title={t("cameras.noBacks")} subtitle={t("cameras.noBacksSubtitle")} />
					)}
				</div>

				{soldBacks.length > 0 && (
					<CollapsibleSection title={t("cameras.soldBacksSection")} count={soldBacks.length}>
						<div className="flex flex-col gap-2.5">
							{soldBacks.map((b) => {
								const associatedFilms = data.films.filter((f) => f.backId === b.id).length;
								const soldDate = b.soldAt ? new Date(b.soldAt).toLocaleDateString() : null;
								return (
									<SoldEquipmentCard
										key={b.id}
										name={b.nickname ? `${b.nickname} (${b.name})` : b.name}
										photo={b.photo}
										fallbackIcon={Camera}
										soldDate={soldDate}
										formatLabel={b.format}
										associatedFilmsCount={associatedFilms}
										compact
										onPhotoClick={() => b.photo && setViewerPhoto(b.photo)}
										onUnarchive={() => unarchiveBack(b.id)}
										onHardDelete={() => setPendingHardDeleteId(b.id)}
										unarchiveLabel={t("aria.unarchiveBack")}
										hardDeleteLabel={t("aria.hardDeleteBack")}
									/>
								);
							})}
						</div>
					</CollapsibleSection>
				)}
			</div>

			{/* Edit back modal */}
			<Dialog open={!!editBack} onOpenChange={(open) => !open && setEditBack(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("cameras.editBack")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{editBack && (
						<div className="flex flex-col gap-4">
							<PhotoPicker
								photos={editBack.photo ? [editBack.photo] : []}
								onChange={(p) => setEditBack({ ...editBack, photo: p[0] || undefined })}
								max={1}
								size={32}
								placeholderIcon
								label={t("cameras.photo")}
							/>
							<FormField label={t("cameras.backName")}>
								<Input value={editBack.name} onChange={(e) => setEditBack({ ...editBack, name: e.target.value })} />
							</FormField>
							<FormField label={t("cameras.backFormat")}>
								<Select value={editBack.format} onValueChange={(v) => setEditBack({ ...editBack, format: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="35mm">{t("filmFormats.35mm")}</SelectItem>
										<SelectItem value="120">{t("filmFormats.120")}</SelectItem>
										{INSTANT_FORMATS.map((f) => (
											<SelectItem key={f} value={f}>
												{t(`filmFormats.${f}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
							<FormField label={t("cameras.reference")}>
								<Input value={editBack.ref || ""} onChange={(e) => setEditBack({ ...editBack, ref: e.target.value })} />
							</FormField>
							<FormField label={t("cameras.backNickname")}>
								<Input
									value={editBack.nickname || ""}
									onChange={(e) => setEditBack({ ...editBack, nickname: e.target.value })}
								/>
							</FormField>
							<FormField label={t("cameras.backSerial")}>
								<Input
									value={editBack.serial || ""}
									onChange={(e) => setEditBack({ ...editBack, serial: e.target.value })}
								/>
							</FormField>
							<FormField label={t("cameras.compatibleCameras")}>
								{interchangeableCameras.length > 0 ? (
									<div className="flex flex-col gap-2">
										{interchangeableCameras.map((c) => (
											<div key={c.id} className="flex items-center justify-between gap-3">
												<span className="text-[13px] text-text-sec font-body">{cameraDisplayName(c)}</span>
												<Switch
													checked={editBack.compatibleCameraIds.includes(c.id)}
													onCheckedChange={() => toggleEditBackCamera(c.id)}
												/>
											</div>
										))}
									</div>
								) : (
									<span className="text-[12px] text-text-muted font-body">{t("cameras.noCompatibleCameras")}</span>
								)}
							</FormField>
							<Button onClick={saveEditBack} disabled={!editBack.name} className="w-full justify-center">
								<Check size={16} /> {t("cameras.save")}
							</Button>
							<Button variant="destructive" onClick={() => sellBack(editBack.id)} className="w-full justify-center">
								<PackageX size={14} /> {t("cameras.sellBack")}
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{viewerPhoto && <PhotoViewer photos={[viewerPhoto]} initialIndex={0} onClose={() => setViewerPhoto(null)} />}

			<ConfirmDialog
				open={pendingHardDeleteId !== null}
				onOpenChange={(open) => !open && setPendingHardDeleteId(null)}
				title={t("equipment.hardDelete")}
				description={t("cameras.hardDeleteBackConfirm")}
				confirmLabel={t("equipment.hardDelete")}
				destructive
				onConfirm={() => {
					if (pendingHardDeleteId) hardDeleteBack(pendingHardDeleteId);
				}}
			/>
		</>
	);
}
