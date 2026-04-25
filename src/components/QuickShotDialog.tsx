import { ExternalLink, Loader2, LocateFixed, NotebookPen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { filterApertures, filterSpeeds } from "@/constants/photography";
import type { AppData, ShotNote } from "@/types";
import { filmName } from "@/utils/film-helpers";
import { nowDateTimeLocal, uid } from "@/utils/helpers";
import { filterLensesByMount, lensDisplayName, pickSoleCompatibleLens } from "@/utils/lens-helpers";

interface QuickShotDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
	onAddFilm?: () => void;
}

function nextFrame(posesShot: number | null | undefined): string {
	return String((posesShot ?? 0) + 1);
}

export function QuickShotDialog({ open, onOpenChange, data, setData, onAddFilm }: QuickShotDialogProps) {
	const { t } = useTranslation();
	const { toast } = useToast();

	const eligibleFilms = data.films.filter((f) => f.state === "loaded" || f.state === "partial");

	const [filmId, setFilmId] = useState("");
	const [frameNumber, setFrameNumber] = useState("");
	const [aperture, setAperture] = useState("");
	const [shutterSpeed, setShutterSpeed] = useState("");
	const [lensId, setLensId] = useState("");
	const [lens, setLens] = useState("");
	const [notes, setNotes] = useState("");
	const [location, setLocation] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [photo, setPhoto] = useState<string[]>([]);
	const [gpsLoading, setGpsLoading] = useState(false);

	const currentFilm = filmId ? (data.films.find((f) => f.id === filmId) ?? null) : null;
	const camera = currentFilm?.cameraId ? data.cameras.find((c) => c.id === currentFilm.cameraId) : null;
	const selectedLens = lensId ? data.lenses.find((l) => l.id === lensId) : null;

	const showManualFields = camera?.hasManualControls ?? true;
	const showLensField = camera?.hasInterchangeableLens ?? true;

	const speedSource = selectedLens?.shutterSpeedMin || selectedLens?.shutterSpeedMax ? selectedLens : camera;
	const filteredSpeeds = filterSpeeds(speedSource?.shutterSpeedMin, speedSource?.shutterSpeedMax);
	const filteredApertures = filterApertures(selectedLens?.apertureMin, selectedLens?.apertureMax);

	const resetExposureFields = () => {
		setAperture("");
		setShutterSpeed("");
		setNotes("");
		setLocation("");
		setLatitude("");
		setLongitude("");
		setPhoto([]);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: only react to open flips; snapshot other state on open.
	useEffect(() => {
		if (!open) {
			setFilmId("");
			setFrameNumber("");
			setLensId("");
			setLens("");
			resetExposureFields();
			return;
		}
		const only = eligibleFilms.length === 1 ? eligibleFilms[0] : null;
		if (only && !filmId) {
			const onlyCam = only.cameraId ? data.cameras.find((c) => c.id === only.cameraId) : null;
			const sole =
				!only.lensId && onlyCam?.hasInterchangeableLens ? pickSoleCompatibleLens(data.lenses, onlyCam) : null;
			setFilmId(only.id);
			setFrameNumber(nextFrame(only.posesShot));
			setLensId(sole ? sole.id : (only.lensId ?? ""));
			setLens(sole ? lensDisplayName(sole) : (only.lens ?? ""));
		}
	}, [open]);

	const handleFilmChange = (newId: string) => {
		setFilmId(newId);
		const film = data.films.find((f) => f.id === newId);
		if (film) {
			const cam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
			const sole = !film.lensId && cam?.hasInterchangeableLens ? pickSoleCompatibleLens(data.lenses, cam) : null;
			setFrameNumber(nextFrame(film.posesShot));
			setLensId(sole ? sole.id : (film.lensId ?? ""));
			setLens(sole ? lensDisplayName(sole) : (film.lens ?? ""));
			resetExposureFields();
		}
	};

	const handleGpsLocate = () => {
		if (!navigator.geolocation) {
			toast(t("filmDetail.shotNotesGpsError"));
			return;
		}
		setGpsLoading(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude: lat, longitude: lng } = position.coords;
				setLatitude(String(lat));
				setLongitude(String(lng));
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
						{ headers: { "Accept-Language": navigator.language } },
					);
					const body = await res.json();
					if (body.display_name) setLocation(body.display_name);
				} catch {
					// reverse geocoding failed — coordinates still saved
				}
				setGpsLoading(false);
			},
			() => {
				setGpsLoading(false);
				toast(t("filmDetail.shotNotesGpsError"));
			},
			{ enableHighAccuracy: true, timeout: 10000 },
		);
	};

	const buildNote = (): ShotNote => {
		const fn = Number.parseInt(frameNumber, 10);
		const lat = latitude ? Number.parseFloat(latitude) : null;
		const lng = longitude ? Number.parseFloat(longitude) : null;
		const resolvedLens = selectedLens ? lensDisplayName(selectedLens) : lens.trim() || null;
		return {
			id: uid(),
			frameNumber: Number.isNaN(fn) ? null : fn,
			aperture: showManualFields ? aperture || null : null,
			shutterSpeed: showManualFields ? shutterSpeed || null : null,
			lens: showLensField ? resolvedLens : null,
			lensId: showLensField ? lensId || null : null,
			location: location || null,
			latitude: lat != null && !Number.isNaN(lat) ? lat : null,
			longitude: lng != null && !Number.isNaN(lng) ? lng : null,
			notes: notes || null,
			date: nowDateTimeLocal(),
			photo: photo[0] ?? null,
		};
	};

	const persist = (note: ShotNote): void => {
		if (!currentFilm) return;
		const newNotes = [...(currentFilm.shotNotes ?? []), note];
		const newPoses = Math.max(currentFilm.posesShot ?? 0, note.frameNumber ?? 0);
		const newFilms = data.films.map((f) =>
			f.id === currentFilm.id ? { ...f, shotNotes: newNotes, posesShot: newPoses } : f,
		);
		setData({ ...data, films: newFilms });
	};

	const handleSave = () => {
		if (!currentFilm || !frameNumber) return;
		persist(buildNote());
		toast(t("quickShot.saved"));
		onOpenChange(false);
	};

	const handleSaveAndNext = () => {
		if (!currentFilm || !frameNumber) return;
		const note = buildNote();
		persist(note);
		toast(t("quickShot.saved"));
		const nextFn = (note.frameNumber ?? 0) + 1;
		setFrameNumber(String(nextFn));
		resetExposureFields();
	};

	const frameInt = Number.parseInt(frameNumber, 10);
	const posesTotal = currentFilm?.posesTotal ?? null;
	const nextWouldExceed = !Number.isNaN(frameInt) && posesTotal != null && frameInt + 1 > posesTotal;
	const canSave = !!currentFilm && !!frameNumber && !Number.isNaN(frameInt);

	// Empty state: no films loaded
	if (eligibleFilms.length === 0) {
		return (
			<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("quickShot.title")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col items-center gap-4 py-6 text-center">
						<NotebookPen size={32} className="text-text-muted opacity-40" />
						<p className="text-sm text-text-sec">{t("quickShot.emptyMessage")}</p>
						{onAddFilm && (
							<Button onClick={onAddFilm} className="w-full justify-center">
								<Plus size={16} /> {t("quickShot.addFilm")}
							</Button>
						)}
						<Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full justify-center">
							{t("quickShot.cancel")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// Always preserve the currently-selected lens in the dropdown options, even if its
	// mount doesn't match (or is unset), so the Select value can never become orphaned.
	const visibleLenses = filterLensesByMount(data.lenses, camera, lensId).filter((l) => !l.soldAt || l.id === lensId);

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("quickShot.title")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<FormField label={t("quickShot.filmField")}>
						<Select value={filmId} onValueChange={handleFilmChange}>
							<SelectTrigger>
								<SelectValue placeholder={t("quickShot.filmPlaceholder")} />
							</SelectTrigger>
							<SelectContent>
								{eligibleFilms.map((f) => {
									const cam = f.cameraId ? data.cameras.find((c) => c.id === f.cameraId) : null;
									const camLabel = cam ? ` · ${cam.nickname || cam.model}` : "";
									return (
										<SelectItem key={f.id} value={f.id}>
											{filmName(f)}
											{camLabel}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</FormField>

					<FormField label={posesTotal ? `${t("quickShot.frameField")} / ${posesTotal}` : t("quickShot.frameField")}>
						<Input
							type="number"
							min={1}
							max={posesTotal ?? undefined}
							value={frameNumber}
							onChange={(e) => setFrameNumber(e.target.value)}
							className="font-mono"
						/>
					</FormField>

					{showManualFields && (
						<div className="grid grid-cols-2 gap-3">
							<AutocompleteInput
								label={t("quickShot.apertureField")}
								value={aperture}
								onChange={setAperture}
								suggestions={filteredApertures}
								showAllOnFocus
							/>
							<AutocompleteInput
								label={t("quickShot.shutterField")}
								value={shutterSpeed}
								onChange={setShutterSpeed}
								suggestions={filteredSpeeds}
								showAllOnFocus
							/>
						</div>
					)}

					{showLensField && (
						<FormField label={t("quickShot.lensField")}>
							<div className="flex flex-col gap-2">
								{visibleLenses.length > 0 && (
									<Select value={lensId || "__other__"} onValueChange={(v) => setLensId(v === "__other__" ? "" : v)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{visibleLenses.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{lensDisplayName(l)}
												</SelectItem>
											))}
											<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
										</SelectContent>
									</Select>
								)}
								{!lensId && (
									<Input
										value={lens}
										onChange={(e) => setLens(e.target.value)}
										placeholder={t("filmDetail.shotNotesLensPlaceholder")}
									/>
								)}
							</div>
						</FormField>
					)}

					<FormField label={t("quickShot.noteField")}>
						<Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
					</FormField>

					<FormField label={t("quickShot.locationField")}>
						<div className="flex gap-2">
							<Input
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								className="flex-1"
								placeholder={t("filmDetail.shotNotesLocationPlaceholder")}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleGpsLocate}
								disabled={gpsLoading}
								className="shrink-0 h-10 w-10 p-0"
								aria-label={t("filmDetail.shotNotesGpsButton")}
							>
								{gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
							</Button>
						</div>
						{latitude && longitude && (
							<a
								href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-xs text-accent mt-1 hover:underline"
							>
								<ExternalLink size={12} />
								{Number.parseFloat(latitude).toFixed(5)}, {Number.parseFloat(longitude).toFixed(5)}
							</a>
						)}
					</FormField>

					<PhotoPicker photos={photo} onChange={setPhoto} max={1} label={t("quickShot.photoField")} />

					<div className="flex flex-col gap-2">
						<Button onClick={handleSave} disabled={!canSave} className="w-full justify-center">
							{t("quickShot.save")}
						</Button>
						<Button
							variant="outline"
							onClick={handleSaveAndNext}
							disabled={!canSave || nextWouldExceed}
							className="w-full justify-center"
						>
							{t("quickShot.saveAndNext")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
