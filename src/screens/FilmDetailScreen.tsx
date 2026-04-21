import { CopyPlus, Film, History, Info, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmLifecycleStepper } from "@/components/FilmLifecycleStepper";
import { PhotoViewer } from "@/components/PhotoViewer";
import { ShotNotesSection } from "@/components/ShotNotesSection";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/components/Toast";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { alpha, T } from "@/constants/theme";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { createNewFilm } from "@/utils/film-factory";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";
import { today } from "@/utils/helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";
import { DevScanModals } from "./film-detail/DevScanModals";
import { EditModal } from "./film-detail/EditModal";
import { FilmInfoSection } from "./film-detail/FilmInfoSection";
import { FloatingActionBar } from "./film-detail/FloatingActionBar";
import { TransitionModals } from "./film-detail/TransitionModals";
import type { ActionData, ActionType, EditData } from "./film-detail/types";

interface FilmDetailScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	filmId: string | null;
	onNavigateToMap?: (filmId: string) => void;
	onNavigateToCamera?: (camId: string) => void;
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
	onNavigateToCamera,
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
		tags: [],
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
			tags: film.tags ?? [],
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
		if (c.soldAt) return false;
		if (c.format === film.format) return true;
		if (c.hasInterchangeableBack) {
			return data.backs.some((b) => !b.soldAt && b.compatibleCameraIds.includes(c.id) && b.format === film.format);
		}
		return false;
	});

	const selectedCamera = actionData.cameraId ? availableCameras.find((c) => c.id === actionData.cameraId) : null;
	const compatibleBacks =
		selectedCamera?.hasInterchangeableBack === true
			? data.backs.filter(
					(b) => !b.soldAt && b.compatibleCameraIds.includes(selectedCamera.id) && b.format === film.format,
				)
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
	// Include the currently-selected camera even if sold, so the Select always has a matching option.
	const editAvailableCameras =
		editSelectedCamera?.soldAt && !availableCameras.some((c) => c.id === editSelectedCamera.id)
			? [...availableCameras, editSelectedCamera]
			: availableCameras;
	const editCompatibleBacks =
		editSelectedCamera?.hasInterchangeableBack === true
			? data.backs.filter(
					(b) =>
						(!b.soldAt || b.id === editData.backId) &&
						b.compatibleCameraIds.includes(editSelectedCamera.id) &&
						b.format === (editData.format || film.format),
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
					{film.tags?.map((tag) => (
						<Badge key={tag} style={{ color: T.accent, background: alpha(T.accent, 0.12) }}>
							{tag}
						</Badge>
					))}
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
				<FilmInfoSection film={film} data={data} onCameraClick={onNavigateToCamera} />
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
			<FloatingActionBar film={film} setShowAction={setShowAction} />

			{/* MODALS */}
			<TransitionModals
				film={film}
				data={data}
				showAction={showAction}
				closeAction={closeAction}
				actionData={actionData}
				setActionData={setActionData}
				updateFilm={updateFilm}
				availableCameras={availableCameras}
				compatibleBacks={compatibleBacks}
				fIso={fIso}
			/>
			<DevScanModals
				film={film}
				data={data}
				showAction={showAction}
				closeAction={closeAction}
				actionData={actionData}
				setActionData={setActionData}
				updateFilm={updateFilm}
				availableCameras={availableCameras}
				compatibleBacks={compatibleBacks}
				fIso={fIso}
			/>
			<EditModal
				showAction={showAction}
				closeAction={closeAction}
				film={film}
				data={data}
				editData={editData}
				setEditData={setEditData}
				updateFilm={updateFilm}
				availableCameras={editAvailableCameras}
				editCompatibleBacks={editCompatibleBacks}
				showLoading={showLoading}
				showExposure={showExposure}
				showEndDate={showEndDate}
				showDev={showDev}
				showScan={showScan}
				brands={brands}
				modelsForBrand={modelsForBrand}
				filmDataFor={filmDataFor}
			/>

			{viewerPhotos && (
				<PhotoViewer photos={viewerPhotos} initialIndex={viewerIndex} onClose={() => setViewerPhotos(null)} />
			)}
		</div>
	);
}
