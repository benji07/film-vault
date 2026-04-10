import { Camera, Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SHUTTER_SPEEDS } from "@/constants/photography";
import { alpha, T } from "@/constants/theme";
import { type AppData, type Camera as CameraType, INSTANT_FORMATS, type StopIncrement } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";
import { uid } from "@/utils/helpers";

interface CamerasTabProps {
	data: AppData;
	setData: (data: AppData) => void;
}

export function CamerasTab({ data, setData }: CamerasTabProps) {
	const { t } = useTranslation();
	const [showAdd, setShowAdd] = useState(false);
	const [newCam, setNewCam] = useState({
		brand: "",
		model: "",
		nickname: "",
		serial: "",
		format: "35mm",
		mount: "",
		hasInterchangeableBack: false,
		photo: undefined as string | undefined,
		shutterSpeedMin: "" as string,
		shutterSpeedMax: "" as string,
		shutterSpeedStops: "" as string,
		apertureStops: "" as string,
	});
	const [editCam, setEditCam] = useState<(CameraType & { mount?: string | null }) | null>(null);
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);

	const addCamera = () => {
		if (!newCam.brand && !newCam.model) return;
		const camera: CameraType = {
			id: uid(),
			brand: newCam.brand,
			model: newCam.model,
			nickname: newCam.nickname,
			serial: newCam.serial,
			format: newCam.format,
			mount: newCam.mount || null,
			hasInterchangeableBack: newCam.hasInterchangeableBack || false,
			photo: newCam.photo,
			shutterSpeedMin: newCam.shutterSpeedMin || null,
			shutterSpeedMax: newCam.shutterSpeedMax || null,
			shutterSpeedStops: (newCam.shutterSpeedStops as StopIncrement) || null,
			apertureStops: (newCam.apertureStops as StopIncrement) || null,
		};
		setData({ ...data, cameras: [...data.cameras, camera] });
		setShowAdd(false);
		setNewCam({
			brand: "",
			model: "",
			nickname: "",
			serial: "",
			format: "35mm",
			mount: "",
			hasInterchangeableBack: false,
			photo: undefined,
			shutterSpeedMin: "",
			shutterSpeedMax: "",
			shutterSpeedStops: "",
			apertureStops: "",
		});
	};

	const saveEditCamera = () => {
		if (!editCam?.brand && !editCam?.model) return;
		const newCams = data.cameras.map((c) =>
			c.id === editCam.id
				? {
						...c,
						brand: editCam.brand,
						model: editCam.model,
						nickname: editCam.nickname,
						serial: editCam.serial,
						format: editCam.format,
						mount: editCam.mount || null,
						hasInterchangeableBack: editCam.hasInterchangeableBack || false,
						photo: editCam.photo,
						shutterSpeedMin: editCam.shutterSpeedMin || null,
						shutterSpeedMax: editCam.shutterSpeedMax || null,
						shutterSpeedStops: editCam.shutterSpeedStops || null,
						apertureStops: editCam.apertureStops || null,
					}
				: c,
		);
		setData({ ...data, cameras: newCams });
		setEditCam(null);
	};

	const deleteCamera = (camId: string) => {
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
					{data.cameras.map((cam) => {
						const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.cameraId === cam.id);
						const camBacks = data.backs.filter((b) => b.compatibleCameraIds.includes(cam.id));
						return (
							<Card key={cam.id}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{cam.photo ? (
											<img
												src={cam.photo}
												alt=""
												className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border cursor-pointer"
												onClick={(e) => {
													e.stopPropagation();
													setViewerPhoto(cam.photo!);
												}}
												onKeyDown={undefined}
											/>
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
										<Button
											variant="outline"
											size="icon"
											onClick={() => setEditCam({ ...cam })}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.editCamera")}
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											onClick={() => deleteCamera(cam.id)}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.deleteCamera")}
										>
											<Trash2 size={14} className="text-accent" />
										</Button>
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
					{data.cameras.length === 0 && (
						<EmptyState icon={Camera} title={t("cameras.noCameras")} subtitle={t("cameras.noCamerasSubtitle")} />
					)}
				</div>
			</div>

			{/* Add camera modal */}
			<Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("cameras.newCamera")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<PhotoPicker
							photos={newCam.photo ? [newCam.photo] : []}
							onChange={(p) => setNewCam({ ...newCam, photo: p[0] || undefined })}
							max={1}
							size={48}
							placeholderIcon
							label={t("cameras.photo")}
						/>
						<FormField label={t("cameras.brand")}>
							<Input
								value={newCam.brand}
								onChange={(e) => setNewCam({ ...newCam, brand: e.target.value })}
								placeholder={t("cameras.brandPlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.model")}>
							<Input
								value={newCam.model}
								onChange={(e) => setNewCam({ ...newCam, model: e.target.value })}
								placeholder={t("cameras.modelPlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.nickname")}>
							<Input
								value={newCam.nickname}
								onChange={(e) => setNewCam({ ...newCam, nickname: e.target.value })}
								placeholder={t("cameras.nicknamePlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.serial")}>
							<Input
								value={newCam.serial}
								onChange={(e) => setNewCam({ ...newCam, serial: e.target.value })}
								placeholder={t("cameras.serialPlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.format")}>
							<Select value={newCam.format} onValueChange={(v) => setNewCam({ ...newCam, format: v })}>
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
						<FormField label={t("cameras.mount")}>
							<Input
								value={newCam.mount}
								onChange={(e) => setNewCam({ ...newCam, mount: e.target.value })}
								placeholder={t("cameras.mountPlaceholder")}
							/>
						</FormField>
						<div className="flex items-center justify-between gap-3">
							<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								{t("cameras.interchangeableBack")}
							</label>
							<Switch
								checked={newCam.hasInterchangeableBack}
								onCheckedChange={(v) => setNewCam({ ...newCam, hasInterchangeableBack: v })}
							/>
						</div>

						<div className="border-t border-border pt-4 mt-1">
							<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								{t("cameras.exposureSection")}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<FormField label={t("cameras.shutterSpeedMin")}>
								<Select
									value={newCam.shutterSpeedMin}
									onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedMin: v })}
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
									value={newCam.shutterSpeedMax}
									onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedMax: v })}
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
									value={newCam.shutterSpeedStops}
									onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedStops: v })}
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
								<Select value={newCam.apertureStops} onValueChange={(v) => setNewCam({ ...newCam, apertureStops: v })}>
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

						<Button onClick={addCamera} disabled={!newCam.brand && !newCam.model} className="w-full justify-center">
							<Plus size={16} /> {t("cameras.add")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

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
							<FormField label={t("cameras.mount")}>
								<Input
									value={editCam.mount || ""}
									onChange={(e) => setEditCam({ ...editCam, mount: e.target.value })}
									placeholder={t("cameras.mountPlaceholder")}
								/>
							</FormField>
							<div className="flex items-center justify-between gap-3">
								<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									{t("cameras.interchangeableBack")}
								</label>
								<Switch
									checked={editCam.hasInterchangeableBack || false}
									onCheckedChange={(v) => setEditCam({ ...editCam, hasInterchangeableBack: v })}
								/>
							</div>

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
										onValueChange={(v) => setEditCam({ ...editCam, shutterSpeedStops: (v as StopIncrement) || null })}
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
		</>
	);
}
