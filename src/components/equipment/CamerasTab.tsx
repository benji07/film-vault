import { Camera, Check, Edit3, Eye, PackageX, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PhotoImg } from "@/components/ui/photo-img";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SHUTTER_SPEEDS } from "@/constants/photography";
import { alpha, T } from "@/constants/theme";
import { type AppData, type Camera as CameraType, INSTANT_FORMATS, type StopIncrement } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";
import { AddCameraDialog } from "./AddCameraDialog";

interface CamerasTabProps {
	data: AppData;
	setData: (data: AppData) => void;
	onCameraClick?: (camId: string) => void;
}

export function CamerasTab({ data, setData, onCameraClick }: CamerasTabProps) {
	const { t } = useTranslation();
	const [showAdd, setShowAdd] = useState(false);
	const [editCam, setEditCam] = useState<(CameraType & { mount?: string | null }) | null>(null);
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);

	const activeCameras = data.cameras.filter((c) => !c.soldAt);
	const soldCameras = data.cameras.filter((c) => c.soldAt);

	const saveEditCamera = () => {
		if (!editCam?.brand && !editCam?.model) return;
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
						shutterSpeedStops: hasManual ? editCam.shutterSpeedStops || null : null,
						apertureStops: hasManual ? editCam.apertureStops || null : null,
					}
				: c,
		);
		setData({ ...data, cameras: newCams });
		setEditCam(null);
	};

	const sellCamera = (camId: string) => {
		const hasLoaded = data.films.some((f) => f.state === "loaded" && f.cameraId === camId);
		if (hasLoaded) return;
		const newCams = data.cameras.map((c) => (c.id === camId ? { ...c, soldAt: new Date().toISOString() } : c));
		setData({ ...data, cameras: newCams });
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
				<div className="flex justify-between items-center">
					<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("cameras.title")}</h2>
					<Button size="sm" onClick={() => setShowAdd(true)}>
						<Plus size={14} /> {t("cameras.add")}
					</Button>
				</div>

				<div className="flex flex-col gap-2.5">
					{activeCameras.map((cam) => {
						const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.cameraId === cam.id);
						const camBacks = data.backs.filter((b) => !b.soldAt && b.compatibleCameraIds.includes(cam.id));
						const handleCardClick = () => onCameraClick?.(cam.id);
						const canArchive = loadedFilms.length === 0;
						return (
							<Card
								key={cam.id}
								onClick={onCameraClick ? handleCardClick : undefined}
								role={onCameraClick ? "button" : undefined}
								tabIndex={onCameraClick ? 0 : undefined}
								onKeyDown={
									onCameraClick
										? (e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													handleCardClick();
												}
											}
										: undefined
								}
								className={onCameraClick ? "cursor-pointer hover:bg-card-hover" : undefined}
							>
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
													className="w-full h-full object-cover border border-border cursor-pointer"
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
											<div className="flex gap-1.5 mt-1.5">
												<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{cam.format}</Badge>
												{camBacks.length > 0 && (
													<Badge style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>
														{camBacks.length} {t("cameras.backs")}
													</Badge>
												)}
												{loadedFilms.length > 0 && (
													<Badge style={{ color: T.green, background: alpha(T.green, 0.09) }}>
														{t("cameras.loaded", { count: loadedFilms.length })}
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex gap-1.5">
										{onCameraClick && (
											<Button
												variant="outline"
												size="icon"
												onClick={(e) => {
													e.stopPropagation();
													onCameraClick(cam.id);
												}}
												className="w-11 h-11 rounded-lg"
												aria-label={t("aria.viewCamera")}
											>
												<Eye size={14} className="text-text-sec" />
											</Button>
										)}
										<Button
											variant="outline"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												setEditCam({ ...cam });
											}}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.editCamera")}
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
										{canArchive && (
											<Button
												variant="destructive"
												size="icon"
												onClick={(e) => {
													e.stopPropagation();
													sellCamera(cam.id);
												}}
												className="w-11 h-11 rounded-lg"
												aria-label={t("aria.sellCamera")}
											>
												<PackageX size={14} className="text-accent" />
											</Button>
										)}
									</div>
								</div>
								{loadedFilms.length > 0 && (
									<div className="mt-3 pt-3 border-t border-border">
										{loadedFilms.map((f) => (
											<div key={f.id} className="text-[13px] font-body" style={{ color: T.green }}>
												{filmName(f)} — ISO {f.shootIso}
											</div>
										))}
									</div>
								)}
							</Card>
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

			<AddCameraDialog open={showAdd} onOpenChange={setShowAdd} data={data} setData={setData} />

			{/* Edit camera modal */}
			<Dialog open={!!editCam} onOpenChange={(open) => !open && setEditCam(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("cameras.editCamera")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{editCam && (
						<div className="flex flex-col gap-4">
							<PhotoPicker
								photos={editCam.photo ? [editCam.photo] : []}
								onChange={(p) => setEditCam({ ...editCam, photo: p[0] || undefined })}
								max={1}
								size={48}
								placeholderIcon
								label={t("cameras.photo")}
							/>
							<FormField label={t("cameras.brand")}>
								<Input value={editCam.brand} onChange={(e) => setEditCam({ ...editCam, brand: e.target.value })} />
							</FormField>
							<FormField label={t("cameras.model")}>
								<Input value={editCam.model} onChange={(e) => setEditCam({ ...editCam, model: e.target.value })} />
							</FormField>
							<FormField label={t("cameras.nickname")}>
								<Input
									value={editCam.nickname}
									onChange={(e) => setEditCam({ ...editCam, nickname: e.target.value })}
								/>
							</FormField>
							<FormField label={t("cameras.serial")}>
								<Input value={editCam.serial} onChange={(e) => setEditCam({ ...editCam, serial: e.target.value })} />
							</FormField>
							<FormField label={t("cameras.format")}>
								<Select value={editCam.format} onValueChange={(v) => setEditCam({ ...editCam, format: v })}>
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
							<div className="flex items-center justify-between gap-3">
								<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									{t("cameras.interchangeableLens")}
								</label>
								<Switch
									checked={editCam.hasInterchangeableLens ?? true}
									onCheckedChange={(v) => setEditCam({ ...editCam, hasInterchangeableLens: v })}
								/>
							</div>
							{(editCam.hasInterchangeableLens ?? true) && (
								<FormField label={t("cameras.mount")}>
									<Input
										value={editCam.mount || ""}
										onChange={(e) => setEditCam({ ...editCam, mount: e.target.value })}
										placeholder={t("cameras.mountPlaceholder")}
									/>
								</FormField>
							)}
							<div className="flex items-center justify-between gap-3">
								<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									{t("cameras.manualControls")}
								</label>
								<Switch
									checked={editCam.hasManualControls ?? true}
									onCheckedChange={(v) => setEditCam({ ...editCam, hasManualControls: v })}
								/>
							</div>
							<div className="flex items-center justify-between gap-3">
								<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									{t("cameras.interchangeableBack")}
								</label>
								<Switch
									checked={editCam.hasInterchangeableBack || false}
									onCheckedChange={(v) => setEditCam({ ...editCam, hasInterchangeableBack: v })}
								/>
							</div>

							{(editCam.hasManualControls ?? true) && (
								<>
									<div className="border-t border-border pt-4 mt-1">
										<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
											{t("cameras.exposureSection")}
										</span>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<FormField label={t("cameras.shutterSpeedMin")}>
											<Select
												value={editCam.shutterSpeedMin || ""}
												onValueChange={(v) => setEditCam({ ...editCam, shutterSpeedMin: v || null })}
											>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
													{SHUTTER_SPEEDS.filter((_, i) => i % 3 === 0).map((s) => (
														<SelectItem key={s} value={s}>
															{s}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormField>
										<FormField label={t("cameras.shutterSpeedMax")}>
											<Select
												value={editCam.shutterSpeedMax || ""}
												onValueChange={(v) => setEditCam({ ...editCam, shutterSpeedMax: v || null })}
											>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
													{SHUTTER_SPEEDS.filter((_, i) => i % 3 === 0).map((s) => (
														<SelectItem key={s} value={s}>
															{s}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormField>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<FormField label={t("cameras.shutterSpeedStops")}>
											<Select
												value={editCam.shutterSpeedStops || ""}
												onValueChange={(v) =>
													setEditCam({ ...editCam, shutterSpeedStops: (v as StopIncrement) || null })
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">{t("cameras.stopsFull")}</SelectItem>
													<SelectItem value="1/2">{t("cameras.stopsHalf")}</SelectItem>
													<SelectItem value="1/3">{t("cameras.stopsThird")}</SelectItem>
												</SelectContent>
											</Select>
										</FormField>
										<FormField label={t("cameras.apertureStops")}>
											<Select
												value={editCam.apertureStops || ""}
												onValueChange={(v) => setEditCam({ ...editCam, apertureStops: (v as StopIncrement) || null })}
											>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">{t("cameras.stopsFull")}</SelectItem>
													<SelectItem value="1/2">{t("cameras.stopsHalf")}</SelectItem>
													<SelectItem value="1/3">{t("cameras.stopsThird")}</SelectItem>
												</SelectContent>
											</Select>
										</FormField>
									</div>
								</>
							)}

							<Button
								onClick={saveEditCamera}
								disabled={!editCam.brand && !editCam.model}
								className="w-full justify-center"
							>
								<Check size={16} /> {t("cameras.save")}
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
