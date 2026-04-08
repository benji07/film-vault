import { ExternalLink, ImageIcon, Loader2, LocateFixed, NotebookPen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ListButton } from "@/components/ui/list-button";
import { Textarea } from "@/components/ui/textarea";
import { type ExposureConfig, filterApertures, filterSpeeds } from "@/constants/photography";
import type { Camera, Film, ShotNote } from "@/types";
import { uid } from "@/utils/helpers";

interface ShotNotesSectionProps {
	film: Film;
	cameras?: Camera[];
	onUpdateNotes: (notes: ShotNote[]) => void;
}

function formatNoteSummary(note: ShotNote): string {
	const parts: string[] = [];
	if (note.aperture) parts.push(note.aperture);
	if (note.shutterSpeed) parts.push(note.shutterSpeed);
	if (note.lens) parts.push(note.lens);
	if (note.location) parts.push(note.location);
	if (parts.length === 0 && note.notes) {
		return note.notes.length > 50 ? `${note.notes.slice(0, 50)}…` : note.notes;
	}
	return parts.join(" · ");
}

function sortNotes(notes: ShotNote[]): ShotNote[] {
	return [...notes].sort((a, b) => {
		if (a.frameNumber != null && b.frameNumber != null) return a.frameNumber - b.frameNumber;
		if (a.frameNumber != null) return -1;
		if (b.frameNumber != null) return 1;
		return 0;
	});
}

interface NoteFormData {
	frameNumber: string;
	aperture: string;
	shutterSpeed: string;
	lens: string;
	location: string;
	latitude: string;
	longitude: string;
	notes: string;
	date: string;
	photo: string[];
}

const emptyForm: NoteFormData = {
	frameNumber: "",
	aperture: "",
	shutterSpeed: "",
	lens: "",
	location: "",
	latitude: "",
	longitude: "",
	notes: "",
	date: "",
	photo: [],
};

function noteToForm(note: ShotNote): NoteFormData {
	return {
		frameNumber: note.frameNumber != null ? String(note.frameNumber) : "",
		aperture: note.aperture ?? "",
		shutterSpeed: note.shutterSpeed ?? "",
		lens: note.lens ?? "",
		location: note.location ?? "",
		latitude: note.latitude != null ? String(note.latitude) : "",
		longitude: note.longitude != null ? String(note.longitude) : "",
		notes: note.notes ?? "",
		date: note.date ?? "",
		photo: note.photo ? [note.photo] : [],
	};
}

function formToNote(form: NoteFormData, id?: string): ShotNote {
	const frameNum = form.frameNumber ? Number.parseInt(form.frameNumber, 10) : null;
	const lat = form.latitude ? Number.parseFloat(form.latitude) : null;
	const lng = form.longitude ? Number.parseFloat(form.longitude) : null;
	return {
		id: id ?? uid(),
		frameNumber: Number.isNaN(frameNum) ? null : frameNum,
		aperture: form.aperture || null,
		shutterSpeed: form.shutterSpeed || null,
		lens: form.lens || null,
		location: form.location || null,
		latitude: lat != null && !Number.isNaN(lat) ? lat : null,
		longitude: lng != null && !Number.isNaN(lng) ? lng : null,
		notes: form.notes || null,
		date: form.date || null,
		photo: form.photo[0] || null,
	};
}

function nowDateTimeLocal(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function nextFrameNumber(notes: ShotNote[], posesTotal?: number | null): string {
	const frames = notes.map((n) => n.frameNumber).filter((n): n is number => n != null);
	const next = frames.length > 0 ? Math.max(...frames) + 1 : 1;
	if (posesTotal != null && next > posesTotal) return "";
	return String(next);
}

function ShotNotesSection({ film, cameras, onUpdateNotes }: ShotNotesSectionProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<NoteFormData>(emptyForm);

	const camera = cameras?.find((c) => c.id === film.cameraId);
	const speedConfig: ExposureConfig | null = camera
		? { min: camera.shutterSpeedMin, max: camera.shutterSpeedMax, stops: camera.shutterSpeedStops }
		: null;
	const apertureConfig: ExposureConfig | null = camera?.apertureStops ? { stops: camera.apertureStops } : null;
	const filteredSpeeds = filterSpeeds(speedConfig);
	const filteredApertures = filterApertures(apertureConfig);

	const notes = film.shotNotes ?? [];
	const sorted = sortNotes(notes);

	const [gpsLoading, setGpsLoading] = useState(false);

	const openAdd = () => {
		setEditingId(null);
		setForm({
			...emptyForm,
			lens: film.lens ?? "",
			frameNumber: nextFrameNumber(notes, film.posesTotal),
			date: nowDateTimeLocal(),
		});
		setDialogOpen(true);
	};

	const openEdit = (note: ShotNote) => {
		setEditingId(note.id);
		setForm(noteToForm(note));
		setDialogOpen(true);
	};

	const handleSave = () => {
		const note = formToNote(form, editingId ?? undefined);
		const hasContent =
			note.frameNumber != null ||
			note.aperture ||
			note.shutterSpeed ||
			note.lens ||
			note.location ||
			note.latitude != null ||
			note.longitude != null ||
			note.notes ||
			note.date ||
			note.photo;
		if (!hasContent) return;

		let updated: ShotNote[];
		if (editingId) {
			updated = notes.map((n) => (n.id === editingId ? note : n));
		} else {
			updated = [...notes, note];
		}
		onUpdateNotes(updated);
		setDialogOpen(false);
		toast(t("filmDetail.shotNotesSaved"));
	};

	const handleDelete = () => {
		if (!editingId) return;
		const updated = notes.filter((n) => n.id !== editingId);
		onUpdateNotes(updated);
		setDialogOpen(false);
		toast(t("filmDetail.shotNotesDeleted"));
	};

	const updateField = (field: keyof NoteFormData, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleGpsLocate = () => {
		if (!navigator.geolocation) {
			toast(t("filmDetail.shotNotesGpsError"));
			return;
		}
		setGpsLoading(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				setForm((prev) => ({
					...prev,
					latitude: String(latitude),
					longitude: String(longitude),
				}));
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
						{ headers: { "Accept-Language": navigator.language } },
					);
					const data = await res.json();
					if (data.display_name) {
						setForm((prev) => ({ ...prev, location: data.display_name }));
					}
				} catch {
					// Reverse geocoding failed — coordinates are still saved
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

	return (
		<>
			<Card>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<NotebookPen size={16} className="text-text-sec" />
						<span className="text-sm font-semibold text-text-primary font-body">{t("filmDetail.shotNotesTitle")}</span>
						{sorted.length > 0 && (
							<Badge style={{ color: "var(--color-text-sec)", background: "var(--color-surface-alt)" }}>
								{sorted.length}
							</Badge>
						)}
					</div>
					<Button variant="ghost" size="sm" onClick={openAdd}>
						<Plus size={16} /> {t("filmDetail.shotNotesAdd")}
					</Button>
				</div>

				{sorted.length === 0 ? (
					<p className="text-sm text-text-muted">{t("filmDetail.shotNotesEmpty")}</p>
				) : (
					<div className="flex flex-col gap-2">
						{sorted.map((note, i) => {
							const summary = formatNoteSummary(note);
							return (
								<ListButton
									key={note.id}
									onClick={() => openEdit(note)}
									className="animate-stagger-item"
									style={{ animationDelay: `${i * 30}ms` }}
								>
									<Badge
										style={{
											color: "var(--color-text-primary)",
											background: "var(--color-accent-soft)",
											fontFamily: "var(--font-mono)",
											minWidth: "32px",
											textAlign: "center",
										}}
									>
										{note.frameNumber != null ? `#${note.frameNumber}` : "—"}
									</Badge>
									<span className="text-sm text-text-sec truncate flex-1">{summary || "—"}</span>
									{note.latitude != null && note.longitude != null && (
										<LocateFixed size={14} className="text-accent shrink-0" />
									)}
									{note.photo && <ImageIcon size={14} className="text-text-muted shrink-0" />}
								</ListButton>
							);
						})}
					</div>
				)}
			</Card>

			<Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editingId ? t("filmDetail.shotNotesEdit") : t("filmDetail.shotNotesAdd")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>

					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.shotNotesFrame")}>
							<Input
								type="number"
								min={1}
								max={film.posesTotal ?? undefined}
								placeholder={t("filmDetail.shotNotesFramePlaceholder")}
								value={form.frameNumber}
								onChange={(e) => updateField("frameNumber", e.target.value)}
							/>
						</FormField>

						<div className="grid grid-cols-2 gap-3">
							<AutocompleteInput
								label={t("filmDetail.shotNotesAperture")}
								placeholder={t("filmDetail.shotNotesAperturePlaceholder")}
								value={form.aperture}
								onChange={(v) => updateField("aperture", v)}
								suggestions={filteredApertures}
								showAllOnFocus
							/>
							<AutocompleteInput
								label={t("filmDetail.shotNotesShutter")}
								placeholder={t("filmDetail.shotNotesShutterPlaceholder")}
								value={form.shutterSpeed}
								onChange={(v) => updateField("shutterSpeed", v)}
								suggestions={filteredSpeeds}
								showAllOnFocus
							/>
						</div>

						<FormField label={t("filmDetail.shotNotesLens")}>
							<Input
								placeholder={t("filmDetail.shotNotesLensPlaceholder")}
								value={form.lens}
								onChange={(e) => updateField("lens", e.target.value)}
							/>
						</FormField>

						<FormField label={t("filmDetail.shotNotesLocation")}>
							<div className="flex gap-2">
								<Input
									placeholder={t("filmDetail.shotNotesLocationPlaceholder")}
									value={form.location}
									onChange={(e) => updateField("location", e.target.value)}
									className="flex-1"
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
							{form.latitude && form.longitude && (
								<a
									href={`https://www.openstreetmap.org/?mlat=${form.latitude}&mlon=${form.longitude}#map=17/${form.latitude}/${form.longitude}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-xs text-accent mt-1 hover:underline"
								>
									<ExternalLink size={12} />
									{Number.parseFloat(form.latitude).toFixed(5)}, {Number.parseFloat(form.longitude).toFixed(5)}
								</a>
							)}
						</FormField>

						<FormField label={t("filmDetail.shotNotesNotes")}>
							<Textarea
								placeholder={t("filmDetail.shotNotesNotesPlaceholder")}
								value={form.notes}
								onChange={(e) => updateField("notes", e.target.value)}
							/>
						</FormField>

						<FormField label={t("filmDetail.shotNotesDate")}>
							<Input type="datetime-local" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
						</FormField>

						<PhotoPicker
							photos={form.photo}
							onChange={(photos) => setForm((prev) => ({ ...prev, photo: photos }))}
							max={1}
							label={t("filmDetail.shotNotesPhoto")}
						/>

						<Button onClick={handleSave} className="w-full justify-center">
							{t("filmDetail.saveButton")}
						</Button>

						{editingId && (
							<Button variant="destructive" onClick={handleDelete} className="w-full justify-center">
								<Trash2 size={14} /> {t("filmDetail.shotNotesDelete")}
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

export { ShotNotesSection };
