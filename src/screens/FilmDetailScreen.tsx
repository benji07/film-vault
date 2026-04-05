import {
	Aperture,
	Archive,
	Calendar,
	Camera,
	Check,
	CircleDot,
	Clock,
	CopyPlus,
	Film,
	MessageSquare,
	Package,
	Pencil,
	RotateCcw,
	Save,
	ScanLine,
	Send,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { InfoLine } from "@/components/InfoLine";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStates } from "@/constants/films";
import { T } from "@/constants/theme";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";
import { fmtDate, today, uid } from "@/utils/helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";

type ActionType = "load" | "finish" | "partial" | "reload" | "sendDev" | "develop" | "edit" | "scan" | null;

interface ActionData {
	cameraId?: string;
	backId?: string;
	shootIso?: string;
	startDate?: string;
	endDate?: string;
	comment?: string;
	posesShot?: string;
	lab?: string;
	devDate?: string;
	scanRef?: string;
	photos?: string[];
}

interface EditData {
	brand: string;
	model: string;
	iso: string;
	type: string;
	format: string;
	expDate: string;
	comment: string;
}

interface FilmDetailScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	filmId: string | null;
}

export function FilmDetailScreen({ data, setData, setScreen, setSelectedFilm, filmId }: FilmDetailScreenProps) {
	const { t } = useTranslation();
	const film = data.films.find((f) => f.id === filmId);
	const [showAction, setShowAction] = useState<ActionType>(null);
	const [actionData, setActionData] = useState<ActionData>({});
	const [editData, setEditData] = useState<EditData>({
		brand: "",
		model: "",
		iso: "",
		type: "",
		format: "",
		expDate: "",
		comment: "",
	});
	const { toast } = useToast();
	const { brands, modelsForBrand, filmDataFor } = useFilmSuggestions(data.films);
	const [viewerPhotos, setViewerPhotos] = useState<string[] | null>(null);
	const [viewerIndex, setViewerIndex] = useState(0);

	if (!film)
		return (
			<EmptyState
				icon={Film}
				title={t("filmDetail.notFound")}
				action={<Button onClick={() => setScreen("stock")}>{t("filmDetail.back")}</Button>}
			/>
		);

	const openEdit = () => {
		setEditData({
			brand: film.brand || "",
			model: film.model || "",
			iso: film.iso != null ? String(film.iso) : "",
			type: film.type || "Couleur",
			format: film.format || "35mm",
			expDate: film.expDate || "",
			comment: film.comment || "",
		});
		setShowAction("edit");
	};

	const STATES = getStates(t);
	const st = STATES[film.state];
	const cam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId && cam ? cam.backs.find((b) => b.id === film.backId) : null;
	const fIso = filmIso(film);

	const updateFilm = (updates: Partial<FilmType>, toastMessage?: string) => {
		const newFilms = data.films.map((f) => (f.id === filmId ? { ...f, ...updates } : f));
		setData({ ...data, films: newFilms });
		setShowAction(null);
		setActionData({});
		if (toastMessage) toast(toastMessage);
	};

	const deleteFilm = () => {
		setData({ ...data, films: data.films.filter((f) => f.id !== filmId) });
		toast(t("filmDetail.filmDeleted"), "info");
		setScreen("stock");
	};

	const handleDuplicate = () => {
		const newId = uid();
		const newFilm: FilmType = {
			id: newId,
			brand: film.brand,
			model: film.model,
			customName: film.customName,
			iso: film.iso,
			type: film.type,
			format: film.format,
			state: "stock",
			expDate: film.expDate,
			comment: film.comment,
			addedDate: today(),
			shootIso: null,
			cameraId: null,
			backId: null,
			startDate: null,
			endDate: null,
			posesShot: null,
			posesTotal: film.posesTotal,
			lab: null,
			devDate: null,
			scanRef: null,
			history: [{ date: today(), action: "", actionCode: "duplicated", params: { name: filmName(film) } }],
		};
		setData({ ...data, films: [...data.films, newFilm] });
		setSelectedFilm(newId);
		toast(t("filmDetail.filmDuplicated"));
	};

	const getAvailableCameras = () => {
		return data.cameras.filter((c) => {
			if (film.format === "120" && c.format !== "120") return false;
			if (film.format === "35mm" && c.format !== "35mm") return false;
			return true;
		});
	};

	const closeAction = () => setShowAction(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="font-display text-[22px] text-text-primary m-0 italic">{filmName(film)}</h2>
				<button
					type="button"
					onClick={openEdit}
					className="bg-transparent border-none cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
				>
					<Pencil size={18} className="text-text-sec" />
				</button>
			</div>

			<Card>
				<div className="flex gap-2 mb-3 flex-wrap">
					<Badge style={{ color: st.color, background: `${st.color}18` }}>{st.label}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{film.format}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{filmType(film)}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>ISO {fIso}</Badge>
				</div>
				<div className="flex flex-col gap-2">
					{film.expDate && (
						<InfoLine
							icon={Calendar}
							label={t("filmDetail.expiration")}
							value={fmtExpDate(film.expDate, t("dateLocale"))}
							warn={getExpirationStatus(film.expDate)?.status === "expired"}
						/>
					)}
					{film.shootIso && <InfoLine icon={Aperture} label={t("filmDetail.shootIso")} value={film.shootIso} />}
					{cam && (
						<InfoLine
							icon={Camera}
							label={t("filmDetail.camera")}
							value={`${cameraDisplayName(cam)}${back ? ` · ${backDisplayName(back)}` : ""}`}
						/>
					)}
					{film.startDate && <InfoLine icon={Calendar} label={t("filmDetail.start")} value={fmtDate(film.startDate)} />}
					{film.endDate && <InfoLine icon={Calendar} label={t("filmDetail.end")} value={fmtDate(film.endDate)} />}
					{film.posesShot != null && (
						<InfoLine icon={CircleDot} label={t("filmDetail.poses")} value={`${film.posesShot} / ${film.posesTotal}`} />
					)}
					{film.lab && <InfoLine icon={Package} label={t("filmDetail.lab")} value={film.lab} />}
					{film.scanRef && <InfoLine icon={ScanLine} label={t("filmDetail.scanRef")} value={film.scanRef} />}
					{film.comment && <InfoLine icon={MessageSquare} label={t("filmDetail.notes")} value={film.comment} />}
				</div>
			</Card>

			{/* Actions by state */}
			<div className="flex flex-col gap-2">
				{film.state === "stock" && (
					<Button onClick={() => setShowAction("load")} className="w-full justify-center">
						<Camera size={16} /> {t("filmDetail.loadInCamera")}
					</Button>
				)}
				{film.state === "loaded" && (
					<>
						<Button onClick={() => setShowAction("finish")} className="w-full justify-center">
							<Check size={16} /> {t("filmDetail.markFinished")}
						</Button>
						{film.format === "35mm" && (
							<Button variant="outline" onClick={() => setShowAction("partial")} className="w-full justify-center">
								<Clock size={16} /> {t("filmDetail.removeNotFinished")}
							</Button>
						)}
					</>
				)}
				{film.state === "partial" && (
					<>
						<Button onClick={() => setShowAction("reload")} className="w-full justify-center">
							<RotateCcw size={16} /> {t("filmDetail.reloadInCamera")}
						</Button>
						<Button variant="outline" onClick={() => setShowAction("sendDev")} className="w-full justify-center">
							<Send size={16} /> {t("filmDetail.sendToDev")}
						</Button>
					</>
				)}
				{film.state === "exposed" && (
					<Button onClick={() => setShowAction("develop")} className="w-full justify-center">
						<Archive size={16} /> {t("filmDetail.markDeveloped")}
					</Button>
				)}
				{film.state === "developed" && (
					<Button onClick={() => setShowAction("scan")} className="w-full justify-center">
						<ScanLine size={16} /> {t("filmDetail.markScanned")}
					</Button>
				)}
				<Button variant="outline" onClick={handleDuplicate} className="w-full justify-center">
					<CopyPlus size={16} /> {t("filmDetail.duplicate")}
				</Button>
				<Button variant="destructive" onClick={deleteFilm} className="w-full justify-center">
					<Trash2 size={14} /> {t("filmDetail.delete")}
				</Button>
			</div>

			{/* History */}
			{film.history && film.history.length > 0 && (
				<Timeline
					entries={film.history}
					onPhotoClick={(photos, index) => {
						setViewerPhotos(photos);
						setViewerIndex(index);
					}}
				/>
			)}

			{/* MODALS */}
			<Dialog open={showAction === "load"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.loadModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.cameraField")}>
							<Select
								value={actionData.cameraId || ""}
								onValueChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{getAvailableCameras().map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						{actionData.cameraId &&
							(data.cameras.find((c) => c.id === actionData.cameraId)?.backs?.length ?? 0) > 0 && (
								<FormField label={t("filmDetail.backField")}>
									<Select
										value={actionData.backId || ""}
										onValueChange={(v) => setActionData({ ...actionData, backId: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{data.cameras
												.find((c) => c.id === actionData.cameraId)
												?.backs.map((b) => (
													<SelectItem key={b.id} value={b.id}>
														{backDisplayName(b)}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</FormField>
							)}
						<FormField label={t("filmDetail.shootIsoField")}>
							<Input
								type="number"
								value={actionData.shootIso || String(fIso)}
								onChange={(e) => setActionData({ ...actionData, shootIso: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.startDateField")}>
							<Input
								type="date"
								value={actionData.startDate || today()}
								onChange={(e) => setActionData({ ...actionData, startDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							disabled={!actionData.cameraId}
							onClick={() => {
								const loadCam = data.cameras.find((c) => c.id === actionData.cameraId);
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "loaded",
										cameraId: actionData.cameraId,
										backId: actionData.backId || null,
										shootIso: Number.parseInt(actionData.shootIso || "", 10) || (typeof fIso === "number" ? fIso : 0),
										startDate: actionData.startDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "loaded",
												params: { camera: loadCam ? cameraDisplayName(loadCam) : "?" },
												photos,
											},
										],
									},
									t("filmDetail.filmLoaded"),
								);
							}}
							className="w-full justify-center"
						>
							<Camera size={16} /> {t("filmDetail.loadButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "finish"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.finishedModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.endDateField")}>
							<Input
								type="date"
								value={actionData.endDate || today()}
								onChange={(e) => setActionData({ ...actionData, endDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "exposed",
										endDate: actionData.endDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										cameraId: null,
										backId: null,
										history: [...(film.history || []), { date: today(), action: "", actionCode: "exposed", photos }],
									},
									t("filmDetail.filmExposed"),
								);
							}}
							className="w-full justify-center"
						>
							<Check size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "partial"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.removeModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
							<span className="text-xs font-body" style={{ color: T.amber }}>
								{t("filmDetail.partialInfo")}
							</span>
						</div>
						<FormField label={t("filmDetail.posesField")}>
							<Input
								type="number"
								value={actionData.posesShot || ""}
								onChange={(e) => setActionData({ ...actionData, posesShot: e.target.value })}
								placeholder={t("filmDetail.posesPlaceholder", { total: film.posesTotal })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "partial",
										posesShot: Number.parseInt(actionData.posesShot || "", 10) || 0,
										comment: actionData.comment?.trim() || film.comment,
										cameraId: null,
										backId: null,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "removed_partial",
												params: {
													posesShot: actionData.posesShot || 0,
													posesTotal: film.posesTotal,
												},
												photos,
											},
										],
									},
									t("filmDetail.filmRemoved"),
								);
							}}
							className="w-full justify-center"
						>
							<Clock size={16} /> {t("filmDetail.removeButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "reload"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.reloadModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
							<span className="text-xs font-body font-semibold" style={{ color: T.amber }}>
								{t("filmDetail.advanceFilm", { pose: (film.posesShot || 0) + 1 })}
							</span>
						</div>
						<FormField label={t("filmDetail.cameraField")}>
							<Select
								value={actionData.cameraId || ""}
								onValueChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{getAvailableCameras().map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						<FormField label={t("filmDetail.resumeDateField")}>
							<Input
								type="date"
								value={actionData.startDate || today()}
								onChange={(e) => setActionData({ ...actionData, startDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							disabled={!actionData.cameraId}
							onClick={() => {
								const reloadCam = data.cameras.find((c) => c.id === actionData.cameraId);
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "loaded",
										cameraId: actionData.cameraId,
										backId: actionData.backId || null,
										startDate: actionData.startDate || today(),
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "reloaded",
												params: { camera: reloadCam ? cameraDisplayName(reloadCam) : "?" },
												photos,
											},
										],
									},
									t("filmDetail.filmReloaded"),
								);
							}}
							className="w-full justify-center"
						>
							<RotateCcw size={16} /> {t("filmDetail.reloadButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "sendDev"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.sendDevModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.endDateField")}>
							<Input
								type="date"
								value={actionData.endDate || today()}
								onChange={(e) => setActionData({ ...actionData, endDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "exposed",
										endDate: actionData.endDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										history: [...(film.history || []), { date: today(), action: "", actionCode: "sent_dev", photos }],
									},
									t("filmDetail.sendToDev"),
								);
							}}
							className="w-full justify-center"
						>
							<Send size={16} /> {t("filmDetail.sendButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "develop"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.developModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.labField")}>
							<Input
								value={actionData.lab || ""}
								onChange={(e) => setActionData({ ...actionData, lab: e.target.value })}
								placeholder={t("filmDetail.labPlaceholder")}
							/>
						</FormField>
						<FormField label={t("filmDetail.devDateField")}>
							<Input
								type="date"
								value={actionData.devDate || today()}
								onChange={(e) => setActionData({ ...actionData, devDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "developed",
										lab: actionData.lab?.trim() || null,
										devDate: actionData.devDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "developed",
												params: { lab: actionData.lab?.trim() || null },
												photos,
											},
										],
									},
									t("filmDetail.filmDeveloped"),
								);
							}}
							className="w-full justify-center"
						>
							<Archive size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "scan"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.scanModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.labRefField")}>
							<Input
								value={actionData.scanRef || ""}
								onChange={(e) => setActionData({ ...actionData, scanRef: e.target.value })}
								placeholder={t("filmDetail.scanRefPlaceholder")}
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "scanned",
										scanRef: actionData.scanRef?.trim() || null,
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "scanned",
												params: { ref: actionData.scanRef?.trim() || null },
												photos,
											},
										],
									},
									t("filmDetail.filmScanned"),
								);
							}}
							className="w-full justify-center"
						>
							<ScanLine size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAction === "edit"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.editModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<AutocompleteInput
							label={t("addFilm.brand")}
							value={editData.brand}
							onChange={(v) => setEditData({ ...editData, brand: v })}
							suggestions={brands}
							placeholder={t("addFilm.brandPlaceholder")}
						/>
						<AutocompleteInput
							label={t("addFilm.model")}
							value={editData.model}
							onChange={(v) => setEditData({ ...editData, model: v })}
							onSelect={(selectedModel) => {
								const data = filmDataFor(editData.brand, selectedModel);
								if (data) {
									setEditData((prev) => ({
										...prev,
										model: selectedModel,
										iso: String(data.iso),
										type: data.type,
										format: data.format,
									}));
								}
							}}
							suggestions={modelsForBrand(editData.brand)}
							placeholder={t("addFilm.modelPlaceholder")}
						/>
						<div className="grid grid-cols-2 gap-3">
							<FormField label={t("addFilm.iso")}>
								<Input
									type="number"
									value={editData.iso}
									onChange={(e) => setEditData({ ...editData, iso: e.target.value })}
									placeholder="400"
									className="font-mono"
								/>
							</FormField>
							<FormField label={t("addFilm.type")}>
								<Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Couleur">{t("filmTypes.Couleur")}</SelectItem>
										<SelectItem value="N&B">{t("filmTypes.N&B")}</SelectItem>
										<SelectItem value="Diapo">{t("filmTypes.Diapo")}</SelectItem>
										<SelectItem value="ECN-2">{t("filmTypes.ECN-2")}</SelectItem>
										<SelectItem value="Instant">{t("filmTypes.Instant")}</SelectItem>
									</SelectContent>
								</Select>
							</FormField>
						</div>
						<FormField label={t("addFilm.format")}>
							<Select
								value={editData.format}
								onValueChange={(v) => setEditData({ ...editData, format: v })}
								disabled={film.state === "loaded"}
							>
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
						<FormField label={t("addFilm.expirationDate")}>
							<MonthYearPicker value={editData.expDate} onChange={(v) => setEditData({ ...editData, expDate: v })} />
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={editData.comment}
								onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
								placeholder={t("addFilm.notesPlaceholder")}
							/>
						</FormField>
						<Button
							disabled={!editData.brand || !editData.model}
							onClick={() => {
								updateFilm(
									{
										brand: editData.brand.trim(),
										model: editData.model.trim(),
										iso: Number.parseInt(editData.iso, 10) || 0,
										type: editData.type,
										format: film.state === "loaded" ? film.format : editData.format,
										expDate: editData.expDate || null,
										comment: editData.comment.trim() || null,
										history: [...(film.history || []), { date: today(), action: "", actionCode: "modified" }],
									},
									t("filmDetail.filmModified"),
								);
							}}
							className="w-full justify-center"
						>
							<Save size={16} /> {t("filmDetail.saveButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{viewerPhotos && (
				<PhotoViewer photos={viewerPhotos} initialIndex={viewerIndex} onClose={() => setViewerPhotos(null)} />
			)}
		</div>
	);
}
