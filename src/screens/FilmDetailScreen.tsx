import { CopyPlus, Film, History, Info, NotebookPen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmLifecycleStepper } from "@/components/FilmLifecycleStepper";
import { PhotoViewer } from "@/components/PhotoViewer";
import { ShotNotesSection } from "@/components/ShotNotesSection";
import { Timeline } from "@/components/Timeline";
import { useToast } from "@/components/Toast";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FilmPackagingHeader } from "@/components/ui/film-packaging-header";
import { WashiTape } from "@/components/ui/washi-tape";
import { filmTypeToVariant, T } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { AppData, FilmState, Film as FilmType } from "@/types";
import { createNewFilm } from "@/utils/film-factory";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";
import { today } from "@/utils/helpers";
import { lensDisplayName, pickSoleCompatibleLens } from "@/utils/lens-helpers";
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
	onExit: () => void;
	onFilmDuplicated: (id: string) => void;
	filmId: string | null;
	editTrigger?: number;
	onNavigateToMap?: (filmId: string) => void;
	onNavigateToCamera?: (camId: string) => void;
	autoOpenShotNote?: boolean;
	setAutoOpenShotNote?: (open: boolean) => void;
}

export function FilmDetailScreen({
	data,
	setData,
	onExit,
	onFilmDuplicated,
	filmId,
	editTrigger = 0,
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

	const openEdit = () => {
		if (!film) return;
		const editCam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
		const soleLens =
			!film.lensId && editCam?.hasInterchangeableLens ? pickSoleCompatibleLens(data.lenses, editCam) : null;
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
			lensId: soleLens ? soleLens.id : film.lensId || "",
			lens: soleLens ? lensDisplayName(soleLens) : film.lens || "",
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

	// Edit requested from the AppHeader (lifted trigger).
	const lastEditTrigger = useRef(editTrigger);
	// biome-ignore lint/correctness/useExhaustiveDependencies: openEdit is stable enough; only react to trigger changes
	useEffect(() => {
		if (editTrigger !== lastEditTrigger.current) {
			lastEditTrigger.current = editTrigger;
			openEdit();
		}
	}, [editTrigger]);

	if (!film)
		return (
			<EmptyState
				icon={Film}
				title={t("filmDetail.notFound")}
				action={<Button onClick={onExit}>{t("filmDetail.back")}</Button>}
			/>
		);

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
		onExit();
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
			tags: film.tags,
		});
		newFilm.history = [{ date: today(), action: "", actionCode: "duplicated", params: { name: filmName(film) } }];
		setData({ ...data, films: [...data.films, newFilm] });
		onFilmDuplicated(newFilm.id);
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

	const variant = filmTypeToVariant(filmType(film));
	const stateBanner = computeStateBanner(film.state, film, t);

	return (
		<div className="flex flex-col gap-5 pb-20">
			{/* Packaging Kodak header */}
			<FilmPackagingHeader
				brand={film.brand || "—"}
				model={filmName(film)}
				iso={fIso ?? "—"}
				format={film.format ?? ""}
				type={filmType(film)}
				variant={variant}
				refCode={film.labRef?.trim() || undefined}
				exposures={film.posesTotal ?? undefined}
			/>

			{/* État banner — coloré, légère rotation */}
			<div
				className={cn(
					"relative border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] flex items-center justify-between px-4 py-3 rotate-[0.6deg]",
					stateBanner.bg,
					stateBanner.fg,
				)}
			>
				<div className="font-archivo-black text-[22px] tracking-[0.05em] leading-none uppercase">
					{stateBanner.label}
					<small className="block font-archivo not-italic font-bold text-[10px] tracking-[0.18em] mt-1.5 opacity-85">
						{stateBanner.sub}
					</small>
				</div>
				<div className="text-right font-archivo-black">
					<div className="text-[28px] leading-[0.85] tracking-[-1px]">
						{film.posesShot && film.posesShot > 0 ? film.posesShot : (film.posesTotal ?? "—")}
						{film.posesShot && film.posesShot > 0 && film.posesTotal && (
							<span className="text-[16px] opacity-55">/{film.posesTotal}</span>
						)}
					</div>
					<div className="font-typewriter font-normal text-[8px] tracking-[0.18em] mt-1 opacity-75 uppercase">
						poses
					</div>
				</div>
			</div>

			{/* Lifecycle stepper — 6 étapes */}
			<section
				data-tour="film-lifecycle"
				className="relative bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-4 pt-5 pb-4 -rotate-[0.3deg]"
			>
				<WashiTape color="w2" rotate={-2} width={50} className="-top-[9px] left-6" />
				<div className="font-archivo-black text-[11px] tracking-[0.2em] uppercase mb-3.5 flex items-center gap-2">
					<span className="w-2.5 h-2.5 bg-kodak-yellow border-[1.5px] border-ink" />
					{t("filmDetail.lifecycleTitle", { defaultValue: "Parcours de la pellicule" })}
				</div>
				<FilmLifecycleStepper currentState={film.state} history={film.history} />
			</section>

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
						<Alert icon={CopyPlus} color={T.red}>
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
					<div>
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

interface StateBannerInfo {
	label: string;
	sub: string;
	bg: string;
	fg: string;
}

function computeStateBanner(
	state: FilmState,
	film: FilmType,
	t: (key: string, opts?: Record<string, unknown>) => string,
): StateBannerInfo {
	const sentDev = film.history?.some((h) => h.actionCode === "sent_dev");
	if (state === "exposed" && sentDev) {
		return {
			label: t("states.atLab", { defaultValue: "Au labo" }) as string,
			sub: t("filmDetail.stateSub.atLab", { defaultValue: "développement en cours" }) as string,
			bg: "bg-kodak-teal",
			fg: "text-paper",
		};
	}
	switch (state) {
		case "stock":
			return {
				label: t("states.stock") as string,
				sub: t("filmDetail.stateSub.stock", { defaultValue: "prête à charger" }) as string,
				bg: "bg-paper-dark",
				fg: "text-ink",
			};
		case "loaded":
			return {
				label: t("states.loaded") as string,
				sub: t("filmDetail.stateSub.loaded", { defaultValue: "en cours d'exposition" }) as string,
				bg: "bg-kodak-red",
				fg: "text-paper",
			};
		case "partial":
			return {
				label: t("states.partial") as string,
				sub: t("filmDetail.stateSub.partial", { defaultValue: "déchargée, à reprendre" }) as string,
				bg: "bg-kodak-yellow-deep",
				fg: "text-ink",
			};
		case "exposed":
			return {
				label: t("states.exposed") as string,
				sub: t("filmDetail.stateSub.exposed", { defaultValue: "à envoyer au labo" }) as string,
				bg: "bg-ink",
				fg: "text-kodak-yellow",
			};
		case "developed":
			return {
				label: t("states.developed") as string,
				sub: t("filmDetail.stateSub.developed", { defaultValue: "à scanner" }) as string,
				bg: "bg-kodak-gold",
				fg: "text-ink",
			};
		case "scanned":
			return {
				label: t("states.scanned") as string,
				sub: t("filmDetail.stateSub.scanned", { defaultValue: "archive complète" }) as string,
				bg: "bg-paper-dark",
				fg: "text-ink",
			};
		default:
			return {
				label: state,
				sub: "",
				bg: "bg-paper-dark",
				fg: "text-ink",
			};
	}
}
