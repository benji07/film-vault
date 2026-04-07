import { Camera, Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { alpha, T } from "@/constants/theme";
import type { AppData, Back, Camera as CameraType } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";
import { uid } from "@/utils/helpers";

interface CamerasScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
}

export function CamerasScreen({ data, setData }: CamerasScreenProps) {
	const { t } = useTranslation();
	const [showAdd, setShowAdd] = useState(false);
	const [newCam, setNewCam] = useState({
		brand: "",
		model: "",
		nickname: "",
		serial: "",
		format: "35mm",
		hasInterchangeableBack: false,
		photo: undefined as string | undefined,
	});
	const [showBackModal, setShowBackModal] = useState(false);
	const [newBack, setNewBack] = useState({
		name: "",
		nickname: "",
		ref: "",
		serial: "",
		format: "120",
		compatibleCameraIds: [] as string[],
		photo: undefined as string | undefined,
	});
	const [editCam, setEditCam] = useState<CameraType | null>(null);
	const [editBack, setEditBack] = useState<Back | null>(null);

	const interchangeableCameras = data.cameras.filter((c) => c.hasInterchangeableBack);

	const addCamera = () => {
		if (!newCam.brand && !newCam.model) return;
		const camera: CameraType = {
			id: uid(),
			brand: newCam.brand,
			model: newCam.model,
			nickname: newCam.nickname,
			serial: newCam.serial,
			format: newCam.format,
			hasInterchangeableBack: newCam.hasInterchangeableBack || false,
			photo: newCam.photo,
		};
		setData({ ...data, cameras: [...data.cameras, camera] });
		setShowAdd(false);
		setNewCam({
			brand: "",
			model: "",
			nickname: "",
			serial: "",
			format: "35mm",
			hasInterchangeableBack: false,
			photo: undefined,
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
						hasInterchangeableBack: editCam.hasInterchangeableBack || false,
						photo: editCam.photo,
					}
				: c,
		);
		setData({ ...data, cameras: newCams });
		setEditCam(null);
	};

	const addBack = () => {
		if (!newBack.name) return;
		const back: Back = {
			id: uid(),
			name: newBack.name,
			nickname: newBack.nickname,
			ref: newBack.ref,
			serial: newBack.serial,
			format: newBack.format,
			compatibleCameraIds: newBack.compatibleCameraIds,
			photo: newBack.photo,
		};
		setData({ ...data, backs: [...data.backs, back] });
		setShowBackModal(false);
		setNewBack({
			name: "",
			nickname: "",
			ref: "",
			serial: "",
			format: "120",
			compatibleCameraIds: [],
			photo: undefined,
		});
	};

	const saveEditBack = () => {
		if (!editBack?.name) return;
		const newBacks = data.backs.map((b) => (b.id === editBack.id ? { ...editBack } : b));
		setData({ ...data, backs: newBacks });
		setEditBack(null);
	};

	const deleteBack = (backId: string) => {
		const newBacks = data.backs.filter((b) => b.id !== backId);
		const newFilms = data.films.map((f) => (f.backId === backId ? { ...f, backId: null } : f));
		setData({ ...data, backs: newBacks, films: newFilms });
		setEditBack(null);
	};

	const deleteCamera = (camId: string) => {
		const newBacks = data.backs.map((b) => ({
			...b,
			compatibleCameraIds: b.compatibleCameraIds.filter((id) => id !== camId),
		}));
		const newFilms = data.films.map((f) => (f.cameraId === camId ? { ...f, cameraId: null, backId: null } : f));
		setData({ ...data, cameras: data.cameras.filter((c) => c.id !== camId), backs: newBacks, films: newFilms });
	};

	const toggleBackCamera = (
		cameraId: string,
		backState: { compatibleCameraIds: string[] },
		setter: (ids: string[]) => void,
	) => {
		const ids = backState.compatibleCameraIds;
		if (ids.includes(cameraId)) {
			setter(ids.filter((id) => id !== cameraId));
		} else {
			setter([...ids, cameraId]);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* === Cameras section === */}
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
												className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
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
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											onClick={() => deleteCamera(cam.id)}
											className="w-11 h-11 rounded-lg"
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

			{/* === Backs section === */}
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("cameras.backsSection")}</h2>
					<Button size="sm" onClick={() => setShowBackModal(true)}>
						<Plus size={14} /> {t("cameras.add")}
					</Button>
				</div>

				<div className="flex flex-col gap-2.5">
					{data.backs.map((b) => {
						const backFilm = data.films.find((f) => f.state === "loaded" && f.backId === b.id);
						const compatCams = data.cameras.filter((c) => b.compatibleCameraIds.includes(c.id));
						return (
							<Card key={b.id}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 flex-1 min-w-0">
										{b.photo ? (
											<img
												src={b.photo}
												alt=""
												className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
											/>
										) : (
											<div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
												<Camera size={16} className="text-text-muted opacity-40" />
											</div>
										)}
										<div className="min-w-0">
											<div className="text-[14px] font-semibold text-text-primary font-body">{backDisplayName(b)}</div>
											<div className="flex gap-1.5 mt-1 flex-wrap">
												<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{b.format}</Badge>
												{compatCams.map((c) => (
													<Badge key={c.id} style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>
														{cameraDisplayName(c)}
													</Badge>
												))}
												{backFilm && (
													<Badge style={{ color: T.green, background: alpha(T.green, 0.09) }}>
														{filmName(backFilm)}
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex gap-1.5">
										<Button
											variant="outline"
											size="icon"
											onClick={() => setEditBack({ ...b })}
											className="w-11 h-11 rounded-lg"
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
					{data.backs.length === 0 && (
						<EmptyState icon={Camera} title={t("cameras.noBacks")} subtitle={t("cameras.noBacksSubtitle")} />
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
									<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
								</SelectContent>
							</Select>
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
										<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
									</SelectContent>
								</Select>
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

			{/* Add back modal */}
			<Dialog open={showBackModal} onOpenChange={(open) => !open && setShowBackModal(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("cameras.addBackTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<PhotoPicker
							photos={newBack.photo ? [newBack.photo] : []}
							onChange={(p) => setNewBack({ ...newBack, photo: p[0] || undefined })}
							max={1}
							size={32}
							placeholderIcon
							label={t("cameras.photo")}
						/>
						<FormField label={t("cameras.backName")}>
							<Input
								value={newBack.name}
								onChange={(e) => setNewBack({ ...newBack, name: e.target.value })}
								placeholder={t("cameras.backNamePlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.backFormat")}>
							<Select value={newBack.format} onValueChange={(v) => setNewBack({ ...newBack, format: v })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="35mm">{t("filmFormats.35mm")}</SelectItem>
									<SelectItem value="120">{t("filmFormats.120")}</SelectItem>
									<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
						<FormField label={t("cameras.reference")}>
							<Input
								value={newBack.ref}
								onChange={(e) => setNewBack({ ...newBack, ref: e.target.value })}
								placeholder={t("cameras.refPlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.backNickname")}>
							<Input
								value={newBack.nickname}
								onChange={(e) => setNewBack({ ...newBack, nickname: e.target.value })}
								placeholder={t("cameras.backNicknamePlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.backSerial")}>
							<Input
								value={newBack.serial}
								onChange={(e) => setNewBack({ ...newBack, serial: e.target.value })}
								placeholder={t("cameras.serialPlaceholder")}
							/>
						</FormField>
						<FormField label={t("cameras.compatibleCameras")}>
							{interchangeableCameras.length > 0 ? (
								<div className="flex flex-col gap-2">
									{interchangeableCameras.map((c) => (
										<div key={c.id} className="flex items-center justify-between gap-3">
											<span className="text-[13px] text-text-sec font-body">{cameraDisplayName(c)}</span>
											<Switch
												checked={newBack.compatibleCameraIds.includes(c.id)}
												onCheckedChange={() =>
													toggleBackCamera(c.id, newBack, (ids) => setNewBack({ ...newBack, compatibleCameraIds: ids }))
												}
											/>
										</div>
									))}
								</div>
							) : (
								<span className="text-[12px] text-text-muted font-body">{t("cameras.noCompatibleCameras")}</span>
							)}
						</FormField>
						<Button onClick={addBack} disabled={!newBack.name} className="w-full justify-center">
							<Plus size={16} /> {t("cameras.addBackButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

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
										<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
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
													onCheckedChange={() =>
														toggleBackCamera(c.id, editBack, (ids) =>
															setEditBack({ ...editBack, compatibleCameraIds: ids }),
														)
													}
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
							<Button variant="destructive" onClick={() => deleteBack(editBack.id)} className="w-full justify-center">
								<Trash2 size={14} /> {t("cameras.deleteBack")}
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
