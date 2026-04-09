import { Check, Edit3, Focus, Plus, Trash2 } from "lucide-react";
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
import { APERTURES, filterApertures, filterSpeeds } from "@/constants/photography";
import { alpha, T } from "@/constants/theme";
import type { AppData, Lens, StopIncrement } from "@/types";
import { uid } from "@/utils/helpers";
import { lensApertureLabel, lensDisplayName, lensFocalLabel } from "@/utils/lens-helpers";

interface LensesTabProps {
	data: AppData;
	setData: (data: AppData) => void;
}

interface LensFormData {
	isZoom: boolean;
	brand: string;
	model: string;
	nickname: string;
	serial: string;
	mount: string;
	focalLengthMin: string;
	focalLengthMax: string;
	maxApertureAtMin: string;
	maxApertureAtMax: string;
	apertureMin: string;
	apertureMax: string;
	apertureStops: string;
	shutterSpeedMin: string;
	shutterSpeedMax: string;
	shutterSpeedStops: string;
	photo: string | undefined;
}

const emptyLensForm: LensFormData = {
	isZoom: false,
	brand: "",
	model: "",
	nickname: "",
	serial: "",
	mount: "",
	focalLengthMin: "",
	focalLengthMax: "",
	maxApertureAtMin: "",
	maxApertureAtMax: "",
	apertureMin: "",
	apertureMax: "",
	apertureStops: "",
	shutterSpeedMin: "",
	shutterSpeedMax: "",
	shutterSpeedStops: "",
	photo: undefined,
};

function lensToForm(lens: Lens): LensFormData {
	return {
		isZoom: lens.isZoom ?? false,
		brand: lens.brand,
		model: lens.model,
		nickname: lens.nickname || "",
		serial: lens.serial || "",
		mount: lens.mount || "",
		focalLengthMin: lens.focalLengthMin != null ? String(lens.focalLengthMin) : "",
		focalLengthMax: lens.focalLengthMax != null ? String(lens.focalLengthMax) : "",
		maxApertureAtMin: lens.maxApertureAtMin || "",
		maxApertureAtMax: lens.maxApertureAtMax || "",
		apertureMin: lens.apertureMin || "",
		apertureMax: lens.apertureMax || "",
		apertureStops: lens.apertureStops || "",
		shutterSpeedMin: lens.shutterSpeedMin || "",
		shutterSpeedMax: lens.shutterSpeedMax || "",
		shutterSpeedStops: lens.shutterSpeedStops || "",
		photo: lens.photo,
	};
}

export function LensesTab({ data, setData }: LensesTabProps) {
	const { t } = useTranslation();
	const [showAdd, setShowAdd] = useState(false);
	const [newLens, setNewLens] = useState<LensFormData>(emptyLensForm);
	const [editLensId, setEditLensId] = useState<string | null>(null);
	const [editLens, setEditLens] = useState<LensFormData>(emptyLensForm);

	const formToLens = (form: LensFormData, id: string): Lens => {
		const fMin = Number.parseInt(form.focalLengthMin, 10);
		const fMax = Number.parseInt(form.focalLengthMax, 10);
		const validZoom = form.isZoom && !Number.isNaN(fMin) && !Number.isNaN(fMax) && fMax > fMin;
		return {
			id,
			brand: form.brand,
			model: form.model,
			nickname: form.nickname || undefined,
			serial: form.serial || undefined,
			photo: form.photo,
			mount: form.mount || undefined,
			isZoom: validZoom,
			focalLengthMin: Number.isNaN(fMin) ? null : fMin,
			focalLengthMax: validZoom ? fMax : Number.isNaN(fMin) ? null : fMin,
			maxApertureAtMin: form.maxApertureAtMin || null,
			maxApertureAtMax: validZoom ? form.maxApertureAtMax || null : null,
			apertureMin: form.apertureMin || null,
			apertureMax: form.apertureMax || null,
			apertureStops: (form.apertureStops as StopIncrement) || null,
			shutterSpeedMin: form.shutterSpeedMin || null,
			shutterSpeedMax: form.shutterSpeedMax || null,
			shutterSpeedStops: (form.shutterSpeedStops as StopIncrement) || null,
		};
	};

	const addLens = () => {
		if (!newLens.brand && !newLens.model) return;
		const lens = formToLens(newLens, uid());
		setData({ ...data, lenses: [...data.lenses, lens] });
		setShowAdd(false);
		setNewLens(emptyLensForm);
	};

	const saveEditLens = () => {
		if (!editLensId || (!editLens.brand && !editLens.model)) return;
		const updated = formToLens(editLens, editLensId);
		const newLenses = data.lenses.map((l) => (l.id === editLensId ? updated : l));
		setData({ ...data, lenses: newLenses });
		setEditLensId(null);
	};

	const deleteLens = (lensId: string) => {
		const newFilms = data.films.map((f) => {
			let film = f;
			if (film.lensId === lensId) {
				film = { ...film, lensId: null };
			}
			if (film.shotNotes?.some((n) => n.lensId === lensId)) {
				film = {
					...film,
					shotNotes: film.shotNotes?.map((n) => (n.lensId === lensId ? { ...n, lensId: null } : n)),
				};
			}
			return film;
		});
		setData({ ...data, lenses: data.lenses.filter((l) => l.id !== lensId), films: newFilms });
		setEditLensId(null);
	};

	const openEdit = (lens: Lens) => {
		setEditLensId(lens.id);
		setEditLens(lensToForm(lens));
	};

	const renderForm = (form: LensFormData, setForm: (f: LensFormData) => void, onSave: () => void, isEdit: boolean) => (
		<div className="flex flex-col gap-4">
			<PhotoPicker
				photos={form.photo ? [form.photo] : []}
				onChange={(p) => setForm({ ...form, photo: p[0] || undefined })}
				max={1}
				size={48}
				placeholderIcon
				label={t("lenses.photo")}
			/>
			<FormField label={t("lenses.brand")}>
				<Input
					value={form.brand}
					onChange={(e) => setForm({ ...form, brand: e.target.value })}
					placeholder={t("lenses.brandPlaceholder")}
				/>
			</FormField>
			<FormField label={t("lenses.model")}>
				<Input
					value={form.model}
					onChange={(e) => setForm({ ...form, model: e.target.value })}
					placeholder={t("lenses.modelPlaceholder")}
				/>
			</FormField>
			<FormField label={t("lenses.nickname")}>
				<Input
					value={form.nickname}
					onChange={(e) => setForm({ ...form, nickname: e.target.value })}
					placeholder={t("lenses.nicknamePlaceholder")}
				/>
			</FormField>
			<FormField label={t("lenses.serial")}>
				<Input
					value={form.serial}
					onChange={(e) => setForm({ ...form, serial: e.target.value })}
					placeholder={t("lenses.serialPlaceholder")}
				/>
			</FormField>
			<FormField label={t("lenses.mount")}>
				<Input
					value={form.mount}
					onChange={(e) => setForm({ ...form, mount: e.target.value })}
					placeholder={t("lenses.mountPlaceholder")}
				/>
			</FormField>

			{/* Focal length section */}
			<div className="border-t border-border pt-4 mt-1">
				<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
					{t("lenses.focalSection")}
				</span>
			</div>
			<label className="flex items-center justify-between gap-3 cursor-pointer">
				<span className="text-sm text-text-primary">{t("lenses.isZoom")}</span>
				<Switch checked={form.isZoom} onCheckedChange={(v) => setForm({ ...form, isZoom: v })} />
			</label>
			{form.isZoom ? (
				<div className="grid grid-cols-2 gap-3">
					<FormField label={t("lenses.focalLengthMin")}>
						<Input
							type="number"
							min={1}
							value={form.focalLengthMin}
							onChange={(e) => setForm({ ...form, focalLengthMin: e.target.value })}
							placeholder={t("lenses.focalLengthPlaceholder")}
							className="font-mono"
						/>
					</FormField>
					<FormField label={t("lenses.focalLengthMax")}>
						<Input
							type="number"
							min={1}
							value={form.focalLengthMax}
							onChange={(e) => setForm({ ...form, focalLengthMax: e.target.value })}
							placeholder={t("lenses.focalLengthPlaceholder")}
							className="font-mono"
						/>
					</FormField>
				</div>
			) : (
				<FormField label={t("lenses.focalLength")}>
					<Input
						type="number"
						min={1}
						value={form.focalLengthMin}
						onChange={(e) => setForm({ ...form, focalLengthMin: e.target.value })}
						placeholder={t("lenses.focalLengthPlaceholder")}
						className="font-mono"
					/>
				</FormField>
			)}
			<div className={`grid gap-3 ${form.isZoom ? "grid-cols-2" : "grid-cols-1"}`}>
				<FormField label={form.isZoom ? t("lenses.maxApertureAtMin") : t("lenses.maxAperture")}>
					<Select value={form.maxApertureAtMin} onValueChange={(v) => setForm({ ...form, maxApertureAtMin: v })}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{APERTURES.filter((_, i) => i === 0 || (i - 1) % 3 === 0).map((a) => (
								<SelectItem key={a} value={a}>
									{a}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
				{form.isZoom && (
					<FormField label={t("lenses.maxApertureAtMax")}>
						<Select value={form.maxApertureAtMax} onValueChange={(v) => setForm({ ...form, maxApertureAtMax: v })}>
							<SelectTrigger>
								<SelectValue placeholder="—" />
							</SelectTrigger>
							<SelectContent>
								{APERTURES.filter((_, i) => i === 0 || (i - 1) % 3 === 0).map((a) => (
									<SelectItem key={a} value={a}>
										{a}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>
				)}
			</div>

			{/* Aperture section */}
			<div className="border-t border-border pt-4 mt-1">
				<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
					{t("lenses.apertureSection")}
				</span>
			</div>
			<FormField label={t("lenses.apertureStops")}>
				<Select value={form.apertureStops} onValueChange={(v) => setForm({ ...form, apertureStops: v })}>
					<SelectTrigger>
						<SelectValue placeholder="—" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1">{t("lenses.stopsFull")}</SelectItem>
						<SelectItem value="1/2">{t("lenses.stopsHalf")}</SelectItem>
						<SelectItem value="1/3">{t("lenses.stopsThird")}</SelectItem>
					</SelectContent>
				</Select>
			</FormField>
			<div className="grid grid-cols-2 gap-3">
				<FormField label={t("lenses.apertureMin")}>
					<Select value={form.apertureMin} onValueChange={(v) => setForm({ ...form, apertureMin: v })}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{filterApertures(form.apertureStops ? { stops: form.apertureStops as StopIncrement } : null).map((a) => (
								<SelectItem key={a} value={a}>
									{a}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={t("lenses.apertureMax")}>
					<Select value={form.apertureMax} onValueChange={(v) => setForm({ ...form, apertureMax: v })}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{filterApertures(form.apertureStops ? { stops: form.apertureStops as StopIncrement } : null).map((a) => (
								<SelectItem key={a} value={a}>
									{a}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			{/* Shutter speed section (leaf shutter) */}
			<div className="border-t border-border pt-4 mt-1">
				<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
					{t("lenses.exposureSection")}
				</span>
			</div>
			<FormField label={t("lenses.shutterSpeedStops")}>
				<Select value={form.shutterSpeedStops} onValueChange={(v) => setForm({ ...form, shutterSpeedStops: v })}>
					<SelectTrigger>
						<SelectValue placeholder="—" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1">{t("lenses.stopsFull")}</SelectItem>
						<SelectItem value="1/2">{t("lenses.stopsHalf")}</SelectItem>
						<SelectItem value="1/3">{t("lenses.stopsThird")}</SelectItem>
					</SelectContent>
				</Select>
			</FormField>
			<div className="grid grid-cols-2 gap-3">
				<FormField label={t("lenses.shutterSpeedMin")}>
					<Select value={form.shutterSpeedMin} onValueChange={(v) => setForm({ ...form, shutterSpeedMin: v })}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{filterSpeeds(form.shutterSpeedStops ? { stops: form.shutterSpeedStops as StopIncrement } : null).map(
								(s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</FormField>
				<FormField label={t("lenses.shutterSpeedMax")}>
					<Select value={form.shutterSpeedMax} onValueChange={(v) => setForm({ ...form, shutterSpeedMax: v })}>
						<SelectTrigger>
							<SelectValue placeholder="—" />
						</SelectTrigger>
						<SelectContent>
							{filterSpeeds(form.shutterSpeedStops ? { stops: form.shutterSpeedStops as StopIncrement } : null).map(
								(s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<Button onClick={onSave} disabled={!form.brand && !form.model} className="w-full justify-center">
				{isEdit ? (
					<>
						<Check size={16} /> {t("lenses.save")}
					</>
				) : (
					<>
						<Plus size={16} /> {t("lenses.add")}
					</>
				)}
			</Button>

			{isEdit && editLensId && (
				<Button variant="destructive" onClick={() => deleteLens(editLensId)} className="w-full justify-center">
					<Trash2 size={14} /> {t("lenses.deleteLens")}
				</Button>
			)}
		</div>
	);

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("lenses.title")}</h2>
					<Button size="sm" onClick={() => setShowAdd(true)}>
						<Plus size={14} /> {t("lenses.add")}
					</Button>
				</div>

				<div className="flex flex-col gap-2.5">
					{data.lenses.map((lens) => {
						const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.lensId === lens.id);
						const focal = lensFocalLabel(lens);
						const aperture = lensApertureLabel(lens);
						return (
							<Card key={lens.id}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{lens.photo ? (
											<img
												src={lens.photo}
												alt=""
												className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
											/>
										) : (
											<div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
												<Focus size={20} className="text-text-muted opacity-40" />
											</div>
										)}
										<div>
											<div className="text-[15px] font-semibold text-text-primary font-body">
												{lensDisplayName(lens)}
											</div>
											<div className="flex gap-1.5 mt-1.5 flex-wrap">
												{focal && (
													<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>{focal}</Badge>
												)}
												{aperture && (
													<Badge style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>{aperture}</Badge>
												)}
												{lens.mount && (
													<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
														{lens.mount}
													</Badge>
												)}
												{loadedFilms.length > 0 && (
													<Badge style={{ color: T.green, background: alpha(T.green, 0.09) }}>
														{t("lenses.loaded", { count: loadedFilms.length })}
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex gap-1.5">
										<Button
											variant="outline"
											size="icon"
											onClick={() => openEdit(lens)}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.editLens")}
										>
											<Edit3 size={14} className="text-text-sec" />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											onClick={() => deleteLens(lens.id)}
											className="w-11 h-11 rounded-lg"
											aria-label={t("aria.deleteLens")}
										>
											<Trash2 size={14} className="text-accent" />
										</Button>
									</div>
								</div>
							</Card>
						);
					})}
					{data.lenses.length === 0 && (
						<EmptyState icon={Focus} title={t("lenses.noLenses")} subtitle={t("lenses.noLensesSubtitle")} />
					)}
				</div>
			</div>

			{/* Add lens modal */}
			<Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("lenses.newLens")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{renderForm(newLens, setNewLens, addLens, false)}
				</DialogContent>
			</Dialog>

			{/* Edit lens modal */}
			<Dialog open={!!editLensId} onOpenChange={(open) => !open && setEditLensId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("lenses.editLens")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{renderForm(editLens, setEditLens, saveEditLens, true)}
				</DialogContent>
			</Dialog>
		</>
	);
}
