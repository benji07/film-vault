import { Check, PackageX, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { APERTURES, SHUTTER_SPEEDS } from "@/constants/photography";
import type { Lens } from "@/types";

export interface LensFormData {
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
	shutterSpeedMin: string;
	shutterSpeedMax: string;
	photo: string | undefined;
}

export const emptyLensForm: LensFormData = {
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
	shutterSpeedMin: "",
	shutterSpeedMax: "",
	photo: undefined,
};

export function lensToForm(lens: Lens): LensFormData {
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
		shutterSpeedMin: lens.shutterSpeedMin || "",
		shutterSpeedMax: lens.shutterSpeedMax || "",
		photo: lens.photo,
	};
}

export function formToLens(form: LensFormData, id: string): Lens {
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
		shutterSpeedMin: form.shutterSpeedMin || null,
		shutterSpeedMax: form.shutterSpeedMax || null,
	};
}

interface LensFormProps {
	form: LensFormData;
	setForm: (form: LensFormData) => void;
	onSave: () => void;
	isEdit: boolean;
	onSell?: () => void;
}

export function LensForm({ form, setForm, onSave, isEdit, onSell }: LensFormProps) {
	const { t } = useTranslation();

	return (
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
				<AutocompleteInput
					label={form.isZoom ? t("lenses.maxApertureAtMin") : t("lenses.maxAperture")}
					value={form.maxApertureAtMin}
					onChange={(v) => setForm({ ...form, maxApertureAtMin: v })}
					suggestions={APERTURES}
					showAllOnFocus
				/>
				{form.isZoom && (
					<AutocompleteInput
						label={t("lenses.maxApertureAtMax")}
						value={form.maxApertureAtMax}
						onChange={(v) => setForm({ ...form, maxApertureAtMax: v })}
						suggestions={APERTURES}
						showAllOnFocus
					/>
				)}
			</div>

			<div className="border-t border-border pt-4 mt-1">
				<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
					{t("lenses.apertureSection")}
				</span>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<AutocompleteInput
					label={t("lenses.apertureMin")}
					value={form.apertureMin}
					onChange={(v) => setForm({ ...form, apertureMin: v })}
					suggestions={APERTURES}
					showAllOnFocus
				/>
				<AutocompleteInput
					label={t("lenses.apertureMax")}
					value={form.apertureMax}
					onChange={(v) => setForm({ ...form, apertureMax: v })}
					suggestions={APERTURES}
					showAllOnFocus
				/>
			</div>

			<div className="border-t border-border pt-4 mt-1">
				<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
					{t("lenses.exposureSection")}
				</span>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<AutocompleteInput
					label={t("lenses.shutterSpeedMin")}
					value={form.shutterSpeedMin}
					onChange={(v) => setForm({ ...form, shutterSpeedMin: v })}
					suggestions={SHUTTER_SPEEDS}
					showAllOnFocus
				/>
				<AutocompleteInput
					label={t("lenses.shutterSpeedMax")}
					value={form.shutterSpeedMax}
					onChange={(v) => setForm({ ...form, shutterSpeedMax: v })}
					suggestions={SHUTTER_SPEEDS}
					showAllOnFocus
				/>
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

			{isEdit && onSell && (
				<Button variant="destructive" onClick={onSell} className="w-full justify-center">
					<PackageX size={14} /> {t("lenses.sellLens")}
				</Button>
			)}
		</div>
	);
}
