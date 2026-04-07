import { ImageIcon, NotebookPen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useToast } from "@/components/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Film, ShotNote } from "@/types";
import { uid } from "@/utils/helpers";

interface ShotNotesSectionProps {
	film: Film;
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
		notes: note.notes ?? "",
		date: note.date ?? "",
		photo: note.photo ? [note.photo] : [],
	};
}

function formToNote(form: NoteFormData, id?: string): ShotNote {
	const frameNum = form.frameNumber ? Number.parseInt(form.frameNumber, 10) : null;
	return {
		id: id ?? uid(),
		frameNumber: Number.isNaN(frameNum) ? null : frameNum,
		aperture: form.aperture || null,
		shutterSpeed: form.shutterSpeed || null,
		lens: form.lens || null,
		location: form.location || null,
		notes: form.notes || null,
		date: form.date || null,
		photo: form.photo[0] || null,
	};
}

function ShotNotesSection({ film, onUpdateNotes }: ShotNotesSectionProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<NoteFormData>(emptyForm);

	const notes = film.shotNotes ?? [];
	const sorted = sortNotes(notes);

	const openAdd = () => {
		setEditingId(null);
		setForm({ ...emptyForm, lens: film.lens ?? "" });
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
								<button
									key={note.id}
									type="button"
									onClick={() => openEdit(note)}
									className="flex items-center gap-3 p-2.5 rounded-[10px] bg-surface-alt border border-border text-left transition-colors hover:border-accent animate-stagger-item"
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
									{note.photo && <ImageIcon size={14} className="text-text-muted shrink-0" />}
								</button>
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
							<FormField label={t("filmDetail.shotNotesAperture")}>
								<Input
									placeholder={t("filmDetail.shotNotesAperturePlaceholder")}
									value={form.aperture}
									onChange={(e) => updateField("aperture", e.target.value)}
								/>
							</FormField>
							<FormField label={t("filmDetail.shotNotesShutter")}>
								<Input
									placeholder={t("filmDetail.shotNotesShutterPlaceholder")}
									value={form.shutterSpeed}
									onChange={(e) => updateField("shutterSpeed", e.target.value)}
								/>
							</FormField>
						</div>

						<FormField label={t("filmDetail.shotNotesLens")}>
							<Input
								placeholder={t("filmDetail.shotNotesLensPlaceholder")}
								value={form.lens}
								onChange={(e) => updateField("lens", e.target.value)}
							/>
						</FormField>

						<FormField label={t("filmDetail.shotNotesLocation")}>
							<Input
								placeholder={t("filmDetail.shotNotesLocationPlaceholder")}
								value={form.location}
								onChange={(e) => updateField("location", e.target.value)}
							/>
						</FormField>

						<FormField label={t("filmDetail.shotNotesNotes")}>
							<Textarea
								placeholder={t("filmDetail.shotNotesNotesPlaceholder")}
								value={form.notes}
								onChange={(e) => updateField("notes", e.target.value)}
							/>
						</FormField>

						<FormField label={t("filmDetail.shotNotesDate")}>
							<Input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
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
