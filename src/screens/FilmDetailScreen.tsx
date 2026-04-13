import {
	Aperture,
	Archive,
	Calendar,
	Camera,
	Check,
	CircleDot,
	Clock,
	Coins,
	CopyPlus,
	Film,
	Focus,
	History,
	Info,
	MapPin,
	MessageSquare,
	NotebookPen,
	Package,
	Pencil,
	RotateCcw,
	Save,
	ScanLine,
	Send,
	Tag,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmLifecycleStepper } from "@/components/FilmLifecycleStepper";
import { FilmFormatSelect, FilmTypeSelect } from "@/components/FilmTypeFormatFields";
import { InfoLine } from "@/components/InfoLine";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PhotoViewer } from "@/components/PhotoViewer";
import { ShotNotesSection } from "@/components/ShotNotesSection";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/components/Toast";
import { Alert } from "@/components/ui/alert";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { alpha, T } from "@/constants/theme";
import { type AppData, type Film as FilmType, isInstantFormat, type ScreenName } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { createNewFilm } from "@/utils/film-factory";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";
import { fmtDate, fmtPrice, today } from "@/utils/helpers";
import { lensDisplayName } from "@/utils/lens-helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";

type ActionType = "load" | "finish" | "partial" | "reload" | "sendDev" | "develop" | "edit" | "scan" | null;

interface ActionData {
	cameraId?: string;
	backId?: string;
	lens?: string;
	lensId?: string;
	shootIso?: string;
	startDate?: string;
	endDate?: string;
	comment?: string;
	posesShot?: string;
	lab?: string;
	labRef?: string;
	devDate?: string;
	scanRef?: string;
	photos?: string[];
	devCost?: string;
	scanCost?: string;
	devScanPackage?: boolean;
}

interface EditData {
	// General
	brand: string;
	model: string;
	iso: string;
	type: string;
	format: string;
	expDate: string;
	storageLocation: string;
	comment: string;
	price: string;
	// Loading
	shootIso: string;
	cameraId: string;
	backId: string;
	lensId: string;
	lens: string;
	startDate: string;
	posesTotal: string;
	// Exposure
	endDate: string;
	posesShot: string;
	// Development
	lab: string;
	labRef: string;
	devDate: string;
	devCost: string;
	devScanPackage: boolean;
	// Scanning
	scanRef: string;
	scanCost: string;
}

interface FilmDetailScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	filmId: string | null;
	onNavigateToMap?: (filmId: string) => void;
	autoOpenShotNote?: boolean;
	setAutoOpenShotNote?: (open: boolean) => void;
}

export function FilmDetailScreen({
	data,
	setData,
	setScreen,
	setSelectedFilm,
	filmId,
	onNavigateToMap,
	autoOpenShotNote,
	setAutoOpenShotNote,
}: FilmDetailScreenProps) {
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
		storageLocation: "",
		comment: "",
		price: "",
		shootIso: "",
		cameraId: "",
		backId: "",
		lensId: "",
		lens: "",
		startDate: "",
		posesTotal: "",
		endDate: "",
		posesShot: "",
		lab: "",
		labRef: "",
		devDate: "",
		devCost: "",
		devScanPackage: false,
		scanRef: "",
		scanCost: "",
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
			storageLocation: film.storageLocation || "",
			comment: film.comment || "",
			price: film.price != null ? String(film.price) : "",
			shootIso: film.shootIso != null ? String(film.shootIso) : "",
			cameraId: film.cameraId || "",
			backId: film.backId || "",
			lensId: film.lensId || "",
			lens: film.lens || "",
			startDate: film.startDate || "",
			posesTotal: film.posesTotal != null ? String(film.posesTotal) : "",
			endDate: film.endDate || "",
			posesShot: film.posesShot != null ? String(film.posesShot) : "",
			lab: film.lab || "",
			labRef: film.labRef || "",
			devDate: film.devDate || "",
			devCost: film.devCost != null ? String(film.devCost) : "",
			devScanPackage: film.devScanPackage || false,
			scanRef: film.scanRef || "",
			scanCost: film.scanCost != null ? String(film.scanCost) : "",
		});
		setShowAction("edit");
	};

	const cam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? data.backs.find((b) => b.id === film.backId) : null;
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
		const newFilm = createNewFilm({
			brand: film.brand || "",
			model: film.model || "",
			iso: film.iso || 0,
			type: film.type || "Couleur",
			format: film.format || "35mm",
			expDate: film.expDate ?? null,
			comment: film.comment ?? null,
			price: film.price ?? null,
			posesTotal: film.posesTotal ?? undefined,
			storageLocation: film.storageLocation ?? null,
		});
		newFilm.history = [{ date: today(), action: "", actionCode: "duplicated", params: { name: filmName(film) } }];
		setData({ ...data, films: [...data.films, newFilm] });
		setSelectedFilm(newFilm.id);
		toast(t("filmDetail.filmDuplicated"));
	};

	const availableCameras = data.cameras.filter((c) => {
		if (c.format === film.format) return true;
		if (c.hasInterchangeableBack) {
			return data.backs.some((b) => b.compatibleCameraIds.includes(c.id) && b.format === film.format);
		}
		return false;
	});

	const selectedCamera = actionData.cameraId ? availableCameras.find((c) => c.id === actionData.cameraId) : null;
	const compatibleBacks =
		selectedCamera?.hasInterchangeableBack === true
			? data.backs.filter((b) => b.compatibleCameraIds.includes(selectedCamera.id) && b.format === film.format)
			: [];

	const closeAction = () => setShowAction(null);

	// Edit modal: section visibility
	const showLoading = film.state !== "stock";
	const showExposure = ["partial", "exposed", "developed", "scanned"].includes(film.state);
	const showEndDate = ["exposed", "developed", "scanned"].includes(film.state);
	const showDev = ["developed", "scanned"].includes(film.state);
	const showScan = film.state === "scanned";

	// Edit modal: camera/back/lens selection
	const editSelectedCamera = editData.cameraId ? data.cameras.find((c) => c.id === editData.cameraId) : null;
	const editCompatibleBacks =
		editSelectedCamera?.hasInterchangeableBack === true
			? data.backs.filter(
					(b) => b.compatibleCameraIds.includes(editSelectedCamera.id) && b.format === (editData.format || film.format),
				)
			: [];

	return (
		<div className="flex flex-col gap-5 pb-20">
			{/* Header: name + edit + badges */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h2 className="font-display text-[22px] text-text-primary m-0 italic">{filmName(film)}</h2>
					<Button variant="ghost" size="icon" onClick={openEdit} aria-label={t("aria.editFilm")}>
						<Pencil size={18} className="text-text-sec" />
					</Button>
				</div>
				<div className="flex gap-2 flex-wrap">
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{film.format}</Badge>
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{filmType(film)}</Badge>
					<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>ISO {fIso}</Badge>
				</div>
			</div>

			{/* Lifecycle stepper */}
			<FilmLifecycleStepper currentState={film.state} />

			{film.state === "stock" &&
				(() => {
					const siblings = data.films.filter(
						(f) =>
							f.id !== film.id &&
							f.state === "stock" &&
							filmName(f) === filmName(film) &&
							(f.expDate || "") === (film.expDate || ""),
					);
					return siblings.length > 0 ? (
						<Alert icon={CopyPlus} color={T.accent}>
							<span>
								{siblings.length === 1
									? t("filmDetail.oneOtherInStock")
									: t("filmDetail.othersInStock", { count: siblings.length })}
							</span>
						</Alert>
					) : null;
				})()}

			{/* Collapsible: Informations */}
			<CollapsibleSection icon={Info} title={t("filmDetail.sectionInfo")} defaultOpen>
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
					{(film.lensId || film.lens) && (
						<InfoLine
							icon={Focus}
							label={t("filmDetail.lens")}
							value={
								film.lensId
									? lensDisplayName(data.lenses.find((l) => l.id === film.lensId)) || film.lens || ""
									: film.lens || ""
							}
						/>
					)}
					{film.startDate && <InfoLine icon={Calendar} label={t("filmDetail.start")} value={fmtDate(film.startDate)} />}
					{film.endDate && <InfoLine icon={Calendar} label={t("filmDetail.end")} value={fmtDate(film.endDate)} />}
					{film.posesShot != null && (
						<InfoLine icon={CircleDot} label={t("filmDetail.poses")} value={`${film.posesShot} / ${film.posesTotal}`} />
					)}
					{film.lab && <InfoLine icon={Package} label={t("filmDetail.lab")} value={film.lab} />}
					{film.labRef && <InfoLine icon={Tag} label={t("filmDetail.labRef")} value={film.labRef} />}
					{film.scanRef && <InfoLine icon={ScanLine} label={t("filmDetail.scanRef")} value={film.scanRef} />}
					{film.price != null && (
						<InfoLine icon={Coins} label={t("filmDetail.purchasePrice")} value={fmtPrice(film.price)} />
					)}
					{film.devCost != null && (
						<InfoLine
							icon={Coins}
							label={film.devScanPackage ? t("filmDetail.devScanPackageCost") : t("filmDetail.devCost")}
							value={fmtPrice(film.devCost)}
						/>
					)}
					{film.scanCost != null && (
						<InfoLine icon={Coins} label={t("filmDetail.scanCost")} value={fmtPrice(film.scanCost)} />
					)}
					{(() => {
						const total = (film.price ?? 0) + (film.devCost ?? 0) + (film.scanCost ?? 0);
						if (total > 0) {
							const frameCount = film.posesShot ?? film.posesTotal;
							const perFrame = frameCount ? total / frameCount : null;
							return (
								<>
									<InfoLine icon={Coins} label={t("filmDetail.totalCost")} value={fmtPrice(total)} />
									{perFrame != null && (
										<InfoLine icon={Coins} label={t("filmDetail.costPerFrame")} value={fmtPrice(perFrame)} />
									)}
								</>
							);
						}
						return null;
					})()}
					{film.state === "stock" && film.storageLocation && (
						<InfoLine icon={MapPin} label={t("filmDetail.storageLocation")} value={film.storageLocation} />
					)}
					{film.comment && <InfoLine icon={MessageSquare} label={t("filmDetail.notes")} value={film.comment} />}
				</div>
			</CollapsibleSection>

			{/* Collapsible: Shot notes */}
			{film.state !== "stock" && (
				<CollapsibleSection
					icon={NotebookPen}
					title={t("filmDetail.sectionShotNotes")}
					count={film.shotNotes?.length}
					defaultOpen={!!film.shotNotes?.length}
				>
					<ShotNotesSection
						film={film}
						cameras={data.cameras}
						lenses={data.lenses}
						onUpdateNotes={(notes) => updateFilm({ shotNotes: notes })}
						onNavigateToMap={onNavigateToMap ? () => onNavigateToMap(film.id) : undefined}
						autoOpenShotNote={autoOpenShotNote}
						onAutoOpenConsumed={() => setAutoOpenShotNote?.(false)}
					/>
				</CollapsibleSection>
			)}

			{/* Collapsible: History */}
			{film.history && film.history.length > 0 && (
				<CollapsibleSection
					icon={History}
					title={t("filmDetail.sectionHistory")}
					count={film.history.length}
					defaultOpen={false}
				>
					<div data-tour="film-timeline">
						<Timeline
							entries={film.history}
							onPhotoClick={(photos, index) => {
								setViewerPhotos(photos);
								setViewerIndex(index);
							}}
						/>
					</div>
				</CollapsibleSection>
			)}

			{/* Secondary actions */}
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={handleDuplicate} className="flex-1 justify-center">
					<CopyPlus size={16} /> {t("filmDetail.duplicate")}
				</Button>
				<Button variant="destructive" onClick={deleteFilm} className="flex-1 justify-center">
					<Trash2 size={14} /> {t("filmDetail.delete")}
				</Button>
			</div>

			{/* Floating primary action bar */}
			{film.state !== "scanned" && (
				<div className="fixed bottom-0 left-0 right-0 md:left-[220px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-bg via-bg to-transparent z-10">
					<div className="max-w-3xl mx-auto">
						{film.state === "stock" && (
							<Button onClick={() => setShowAction("load")} className="w-full justify-center shadow-lg">
								<Camera size={16} /> {t("filmDetail.loadInCamera")}
							</Button>
						)}
						{film.state === "loaded" && (
							<div className="flex gap-2">
								<Button onClick={() => setShowAction("finish")} className="flex-1 justify-center shadow-lg">
									<Check size={16} /> {t("filmDetail.markFinished")}
								</Button>
								{film.format === "35mm" && (
									<Button
										variant="outline"
										size="icon"
										onClick={() => setShowAction("partial")}
										className="shrink-0 bg-card shadow-lg"
										aria-label={t("filmDetail.removeNotFinished")}
									>
										<Clock size={16} />
									</Button>
								)}
							</div>
						)}
						{film.state === "partial" && (
							<Button onClick={() => setShowAction("reload")} className="w-full justify-center shadow-lg">
								<RotateCcw size={16} /> {t("filmDetail.reloadInCamera")}
							</Button>
						)}
						{film.state === "exposed" && (
							<Button onClick={() => setShowAction("develop")} className="w-full justify-center shadow-lg">
								<Archive size={16} /> {t("filmDetail.markDeveloped")}
							</Button>
						)}
						{film.state === "developed" && (
							<Button onClick={() => setShowAction("scan")} className="w-full justify-center shadow-lg">
								<ScanLine size={16} /> {t("filmDetail.markScanned")}
							</Button>
						)}
					</div>
				</div>
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
									{availableCameras.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						{compatibleBacks.length > 0 && (
							<FormField label={t("filmDetail.backField")}>
								<Select
									value={actionData.backId || ""}
									onValueChange={(v) => setActionData({ ...actionData, backId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										{compatibleBacks.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{backDisplayName(b)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
						)}
						<FormField label={t("filmDetail.lensField")}>
							{data.lenses.length > 0 ? (
								<>
									<Select
										value={actionData.lensId || "__other__"}
										onValueChange={(v) => {
											if (v === "__other__") {
												setActionData({ ...actionData, lensId: undefined, lens: "" });
											} else {
												const lens = data.lenses.find((l) => l.id === v);
												setActionData({
													...actionData,
													lensId: v,
													lens: lens ? lensDisplayName(lens) : "",
												});
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{data.lenses.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{lensDisplayName(l)}
												</SelectItem>
											))}
											<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
										</SelectContent>
									</Select>
									{!actionData.lensId && (
										<Input
											value={actionData.lens || ""}
											onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
											className="mt-2"
										/>
									)}
								</>
							) : (
								<Input
									value={actionData.lens || ""}
									onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
									placeholder={t("filmDetail.lensPlaceholder")}
								/>
							)}
						</FormField>
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
										lensId: actionData.lensId || null,
										lens: actionData.lens?.trim() || null,
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
									{availableCameras.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						{compatibleBacks.length > 0 && (
							<FormField label={t("filmDetail.backField")}>
								<Select
									value={actionData.backId || ""}
									onValueChange={(v) => setActionData({ ...actionData, backId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										{compatibleBacks.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{backDisplayName(b)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
						)}
						<FormField label={t("filmDetail.lensField")}>
							{data.lenses.length > 0 ? (
								<>
									<Select
										value={actionData.lensId || "__other__"}
										onValueChange={(v) => {
											if (v === "__other__") {
												setActionData({ ...actionData, lensId: undefined, lens: "" });
											} else {
												const lens = data.lenses.find((l) => l.id === v);
												setActionData({
													...actionData,
													lensId: v,
													lens: lens ? lensDisplayName(lens) : "",
												});
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{data.lenses.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{lensDisplayName(l)}
												</SelectItem>
											))}
											<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
										</SelectContent>
									</Select>
									{!actionData.lensId && (
										<Input
											value={actionData.lens || ""}
											onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
											className="mt-2"
										/>
									)}
								</>
							) : (
								<Input
									value={actionData.lens || ""}
									onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
									placeholder={t("filmDetail.lensPlaceholder")}
								/>
							)}
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
										lensId: "lensId" in actionData ? (actionData.lensId ?? null) : (film.lensId ?? null),
										lens: actionData.lens?.trim() || film.lens || null,
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
						<FormField label={t("filmDetail.labRefField")}>
							<Input
								value={actionData.labRef || ""}
								onChange={(e) => setActionData({ ...actionData, labRef: e.target.value })}
								placeholder={t("filmDetail.labRefPlaceholder")}
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
						<FormField
							label={
								actionData.devScanPackage ? `${t("filmDetail.devScanPackageCost")} (€)` : t("filmDetail.devCostField")
							}
						>
							<Input
								type="number"
								value={actionData.devCost || ""}
								onChange={(e) => setActionData({ ...actionData, devCost: e.target.value })}
								placeholder={t("filmDetail.costPlaceholder")}
								className="font-mono"
								step="0.01"
								min="0"
							/>
						</FormField>
						<label className="flex items-center justify-between gap-3 cursor-pointer">
							<span className="text-sm text-text-primary">{t("filmDetail.devScanPackage")}</span>
							<Switch
								checked={actionData.devScanPackage || false}
								onCheckedChange={(v) => setActionData({ ...actionData, devScanPackage: v })}
							/>
						</label>
						{actionData.devScanPackage && (
							<div
								className="rounded-xl p-3.5"
								style={{ background: alpha(T.amber, 0.09), border: `1px solid ${alpha(T.amber, 0.2)}` }}
							>
								<span className="text-xs font-body" style={{ color: T.amber }}>
									{t("filmDetail.devScanPackageInfo")}
								</span>
							</div>
						)}
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
										labRef: actionData.labRef?.trim() || null,
										devDate: actionData.devDate || today(),
										devCost: actionData.devCost?.trim() ? Number.parseFloat(actionData.devCost) : null,
										devScanPackage: actionData.devScanPackage || false,
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
						{!film.devScanPackage && (
							<FormField label={t("filmDetail.scanCostField")}>
								<Input
									type="number"
									value={actionData.scanCost || ""}
									onChange={(e) => setActionData({ ...actionData, scanCost: e.target.value })}
									placeholder={t("filmDetail.costPlaceholder")}
									className="font-mono"
									step="0.01"
									min="0"
								/>
							</FormField>
						)}
						{film.devScanPackage && (
							<div
								className="rounded-xl p-3.5"
								style={{
									background: alpha(T.amber, 0.09),
									border: `1px solid ${alpha(T.amber, 0.2)}`,
								}}
							>
								<span className="text-xs font-body" style={{ color: T.amber }}>
									{t("filmDetail.scanCostIncluded")}
								</span>
							</div>
						)}
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
										scanCost: film.devScanPackage
											? null
											: actionData.scanCost?.trim()
												? Number.parseFloat(actionData.scanCost)
												: null,
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
						{/* === General section === */}
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
						<FilmFormatSelect
							value={editData.format}
							onValueChange={(v) => {
								const typeReset =
									isInstantFormat(v) && editData.type !== "Couleur" && editData.type !== "N&B"
										? { type: "Couleur" }
										: {};
								setEditData({ ...editData, format: v, ...typeReset });
							}}
							disabled={film.state !== "stock"}
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
							<FilmTypeSelect
								value={editData.type}
								onValueChange={(v) => setEditData({ ...editData, type: v })}
								format={editData.format}
							/>
						</div>
						<FormField label={t("addFilm.expirationDate")}>
							<MonthYearPicker value={editData.expDate} onChange={(v) => setEditData({ ...editData, expDate: v })} />
						</FormField>
						{film.state === "stock" && (
							<FormField label={t("addFilm.storageLocation")}>
								<Input
									value={editData.storageLocation}
									onChange={(e) => setEditData({ ...editData, storageLocation: e.target.value })}
									placeholder={t("addFilm.storageLocationPlaceholder")}
								/>
							</FormField>
						)}
						<FormField label={t("filmDetail.purchasePrice")}>
							<Input
								type="number"
								value={editData.price}
								onChange={(e) => setEditData({ ...editData, price: e.target.value })}
								placeholder={t("addFilm.pricePlaceholder")}
								className="font-mono"
								step="0.01"
								min="0"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={editData.comment}
								onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
								placeholder={t("addFilm.notesPlaceholder")}
							/>
						</FormField>

						{/* === Loading section === */}
						{showLoading && (
							<>
								<div className="border-t border-border pt-4 mt-1">
									<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
										{t("filmDetail.editSectionLoading")}
									</span>
								</div>
								<FormField label={t("filmDetail.cameraField")}>
									<Select
										value={editData.cameraId || ""}
										onValueChange={(v) => setEditData({ ...editData, cameraId: v, backId: "" })}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{availableCameras.map((c) => (
												<SelectItem key={c.id} value={c.id}>
													{cameraDisplayName(c)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormField>
								{editCompatibleBacks.length > 0 && (
									<FormField label={t("filmDetail.backField")}>
										<Select
											value={editData.backId || ""}
											onValueChange={(v) => setEditData({ ...editData, backId: v })}
										>
											<SelectTrigger>
												<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
											</SelectTrigger>
											<SelectContent>
												{editCompatibleBacks.map((b) => (
													<SelectItem key={b.id} value={b.id}>
														{backDisplayName(b)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormField>
								)}
								<FormField label={t("filmDetail.lensField")}>
									{data.lenses.length > 0 ? (
										<>
											<Select
												value={editData.lensId || "__other__"}
												onValueChange={(v) => {
													if (v === "__other__") {
														setEditData({
															...editData,
															lensId: "",
															lens: "",
														});
													} else {
														const lens = data.lenses.find((l) => l.id === v);
														setEditData({
															...editData,
															lensId: v,
															lens: lens ? lensDisplayName(lens) : "",
														});
													}
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
												</SelectTrigger>
												<SelectContent>
													{data.lenses.map((l) => (
														<SelectItem key={l.id} value={l.id}>
															{lensDisplayName(l)}
														</SelectItem>
													))}
													<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
												</SelectContent>
											</Select>
											{!editData.lensId && (
												<Input
													value={editData.lens}
													onChange={(e) =>
														setEditData({
															...editData,
															lens: e.target.value,
														})
													}
													placeholder={t("filmDetail.lensPlaceholder")}
													className="mt-2"
												/>
											)}
										</>
									) : (
										<Input
											value={editData.lens}
											onChange={(e) => setEditData({ ...editData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
										/>
									)}
								</FormField>
								<FormField label={t("filmDetail.shootIsoField")}>
									<Input
										type="number"
										value={editData.shootIso}
										onChange={(e) => setEditData({ ...editData, shootIso: e.target.value })}
										className="font-mono"
									/>
								</FormField>
								<FormField label={t("filmDetail.startDateField")}>
									<Input
										type="date"
										value={editData.startDate}
										onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
										className="font-mono"
									/>
								</FormField>
								<FormField label={t("filmDetail.posesTotalField")}>
									<Input
										type="number"
										value={editData.posesTotal}
										onChange={(e) => setEditData({ ...editData, posesTotal: e.target.value })}
										className="font-mono"
										min="1"
									/>
								</FormField>
							</>
						)}

						{/* === Exposure section === */}
						{showExposure && (
							<>
								<div className="border-t border-border pt-4 mt-1">
									<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
										{t("filmDetail.editSectionExposure")}
									</span>
								</div>
								{showEndDate && (
									<FormField label={t("filmDetail.endDateField")}>
										<Input
											type="date"
											value={editData.endDate}
											onChange={(e) =>
												setEditData({
													...editData,
													endDate: e.target.value,
												})
											}
											className="font-mono"
										/>
									</FormField>
								)}
								<FormField label={t("filmDetail.posesField")}>
									<Input
										type="number"
										value={editData.posesShot}
										onChange={(e) => setEditData({ ...editData, posesShot: e.target.value })}
										className="font-mono"
										min="0"
									/>
								</FormField>
							</>
						)}

						{/* === Development section === */}
						{showDev && (
							<>
								<div className="border-t border-border pt-4 mt-1">
									<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
										{t("filmDetail.editSectionDevelopment")}
									</span>
								</div>
								<FormField label={t("filmDetail.labField")}>
									<Input
										value={editData.lab}
										onChange={(e) => setEditData({ ...editData, lab: e.target.value })}
										placeholder={t("filmDetail.labPlaceholder")}
									/>
								</FormField>
								<FormField label={t("filmDetail.labRefField")}>
									<Input
										value={editData.labRef}
										onChange={(e) => setEditData({ ...editData, labRef: e.target.value })}
										placeholder={t("filmDetail.labRefPlaceholder")}
									/>
								</FormField>
								<FormField label={t("filmDetail.devDateField")}>
									<Input
										type="date"
										value={editData.devDate}
										onChange={(e) => setEditData({ ...editData, devDate: e.target.value })}
										className="font-mono"
									/>
								</FormField>
								<FormField
									label={
										editData.devScanPackage ? `${t("filmDetail.devScanPackageCost")} (€)` : t("filmDetail.devCostField")
									}
								>
									<Input
										type="number"
										value={editData.devCost}
										onChange={(e) => setEditData({ ...editData, devCost: e.target.value })}
										placeholder={t("filmDetail.costPlaceholder")}
										className="font-mono"
										step="0.01"
										min="0"
									/>
								</FormField>
								<label className="flex items-center justify-between gap-3 cursor-pointer">
									<span className="text-sm text-text-primary">{t("filmDetail.devScanPackage")}</span>
									<Switch
										checked={editData.devScanPackage}
										onCheckedChange={(v) => setEditData({ ...editData, devScanPackage: v })}
									/>
								</label>
								{editData.devScanPackage && (
									<div
										className="rounded-xl p-3.5"
										style={{
											background: alpha(T.amber, 0.09),
											border: `1px solid ${alpha(T.amber, 0.2)}`,
										}}
									>
										<span className="text-xs font-body" style={{ color: T.amber }}>
											{t("filmDetail.devScanPackageInfo")}
										</span>
									</div>
								)}
							</>
						)}

						{/* === Scanning section === */}
						{showScan && (
							<>
								<div className="border-t border-border pt-4 mt-1">
									<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
										{t("filmDetail.editSectionScanning")}
									</span>
								</div>
								<FormField label={t("filmDetail.scanRefField")}>
									<Input
										value={editData.scanRef}
										onChange={(e) => setEditData({ ...editData, scanRef: e.target.value })}
										placeholder={t("filmDetail.scanRefPlaceholder")}
									/>
								</FormField>
								{!editData.devScanPackage && (
									<FormField label={t("filmDetail.scanCostField")}>
										<Input
											type="number"
											value={editData.scanCost}
											onChange={(e) =>
												setEditData({
													...editData,
													scanCost: e.target.value,
												})
											}
											placeholder={t("filmDetail.costPlaceholder")}
											className="font-mono"
											step="0.01"
											min="0"
										/>
									</FormField>
								)}
								{editData.devScanPackage && (
									<div
										className="rounded-xl p-3.5"
										style={{
											background: alpha(T.amber, 0.09),
											border: `1px solid ${alpha(T.amber, 0.2)}`,
										}}
									>
										<span className="text-xs font-body" style={{ color: T.amber }}>
											{t("filmDetail.scanCostIncluded")}
										</span>
									</div>
								)}
							</>
						)}

						{/* === Save button === */}
						<Button
							disabled={!editData.brand || !editData.model}
							onClick={() => {
								const safeInt = (v: string) => {
									const n = Number.parseInt(v, 10);
									return Number.isFinite(n) ? n : null;
								};
								const safeFloat = (v: string) => {
									const n = Number.parseFloat(v);
									return Number.isFinite(n) ? n : null;
								};
								const editUpdate: Partial<FilmType> = {
									brand: editData.brand.trim(),
									model: editData.model.trim(),
									iso: safeInt(editData.iso) ?? 0,
									type: editData.type,
									format: film.state !== "stock" ? film.format : editData.format,
									expDate: editData.expDate || null,
									storageLocation: editData.storageLocation.trim() || null,
									price: editData.price.trim() ? safeFloat(editData.price) : null,
									comment: editData.comment.trim() || null,
									history: [...(film.history || []), { date: today(), action: "", actionCode: "modified" }],
								};
								if (showLoading) {
									editUpdate.cameraId = editData.cameraId || null;
									editUpdate.backId = editData.backId || null;
									editUpdate.lensId = editData.lensId || null;
									editUpdate.lens = editData.lens.trim() || null;
									editUpdate.shootIso = editData.shootIso.trim() ? safeInt(editData.shootIso) : null;
									editUpdate.startDate = editData.startDate || null;
									editUpdate.posesTotal = editData.posesTotal.trim() ? safeInt(editData.posesTotal) : null;
								}
								if (showExposure) {
									if (showEndDate) {
										editUpdate.endDate = editData.endDate || null;
									}
									editUpdate.posesShot = editData.posesShot.trim() ? safeInt(editData.posesShot) : null;
								}
								if (showDev) {
									editUpdate.lab = editData.lab.trim() || null;
									editUpdate.labRef = editData.labRef.trim() || null;
									editUpdate.devDate = editData.devDate || null;
									editUpdate.devCost = editData.devCost.trim() ? safeFloat(editData.devCost) : null;
									editUpdate.devScanPackage = editData.devScanPackage;
								}
								if (showScan) {
									editUpdate.scanRef = editData.scanRef.trim() || null;
									editUpdate.scanCost = editData.devScanPackage
										? null
										: editData.scanCost.trim()
											? safeFloat(editData.scanCost)
											: null;
								}
								updateFilm(editUpdate, t("filmDetail.filmModified"));
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
