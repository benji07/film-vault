import { Camera, Check, Edit3, PackageX, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import { alpha, T } from "@/constants/theme";
import { type AppData, type Back, INSTANT_FORMATS } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";
import { AddBackDialog } from "./AddBackDialog";

interface BacksTabProps {
	data: AppData;
	setData: (data: AppData) => void;
}

export function BacksTab({ data, setData }: BacksTabProps) {
	const { t } = useTranslation();
	const [showBackModal, setShowBackModal] = useState(false);
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
				<div className="flex justify-between items-center">
					<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("cameras.backsSection")}</h2>
					<Button size="sm" onClick={() => setShowBackModal(true)}>
						<Plus size={14} /> {t("cameras.add")}
					</Button>
				</div>

				<div className="flex flex-col gap-2.5">
					{activeBacks.map((b) => {
						const backFilm = data.films.find((f) => f.state === "loaded" && f.backId === b.id);
						const compatCams = data.cameras.filter((c) => !c.soldAt && b.compatibleCameraIds.includes(c.id));
						return (
							<Card key={b.id}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 flex-1 min-w-0">
										{b.photo ? (
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setViewerPhoto(b.photo!);
												}}
												aria-label={t("aria.openPhoto", { index: 1 })}
												className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
											>
												<PhotoImg
													src={b.photo}
													alt=""
													aria-hidden="true"
													className="w-full h-full object-cover border border-border cursor-pointer"
												/>
											</button>
										) : (
											<div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
												<Camera size={16} className="text-text-muted opacity-40" />
											</div>
										)}
										<div className="min-w-0">
											<div className="text-[14px] font-semibold text-text-primary font-body">
												{b.nickname ? `${b.nickname} (${b.name})` : b.name}
											</div>
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
											aria-label={t("aria.editBack")}
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											onClick={() => sellBack(b.id)}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.sellBack")}
										>
											<PackageX size={14} className="text-accent" />
										</Button>
									</div>
								</div>
							</Card>
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
								const soldDate = b.soldAt ? new Date(b.soldAt).toLocaleDateString() : "";
								return (
									<Card key={b.id} className="opacity-70">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												{b.photo ? (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setViewerPhoto(b.photo!);
														}}
														aria-label={t("aria.openPhoto", { index: 1 })}
														className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
													>
														<PhotoImg
															src={b.photo}
															alt=""
															aria-hidden="true"
															className="w-full h-full object-cover border border-border cursor-pointer grayscale"
														/>
													</button>
												) : (
													<div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
														<Camera size={16} className="text-text-muted opacity-40" />
													</div>
												)}
												<div className="min-w-0">
													<div className="text-[14px] font-semibold text-text-primary font-body">
														{b.nickname ? `${b.nickname} (${b.name})` : b.name}
													</div>
													<div className="flex gap-1.5 mt-1 flex-wrap">
														<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
															{b.format}
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
													onClick={() => unarchiveBack(b.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.unarchiveBack")}
												>
													<RotateCcw size={14} className="text-text-sec" />
												</Button>
												<Button
													variant="destructive"
													size="icon"
													onClick={() => setPendingHardDeleteId(b.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.hardDeleteBack")}
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

			<AddBackDialog open={showBackModal} onOpenChange={setShowBackModal} data={data} setData={setData} />

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
