import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SHUTTER_SPEEDS } from "@/constants/photography";
import { type Camera as CameraType, INSTANT_FORMATS } from "@/types";

export interface EditableCamera extends Omit<CameraType, "mount"> {
	mount?: string | null;
}

interface EditCameraDialogProps {
	camera: EditableCamera | null;
	onChange: (next: EditableCamera) => void;
	onSave: () => void;
	onCancel: () => void;
	mountSuggestions: string[];
}

export function EditCameraDialog({ camera, onChange, onSave, onCancel, mountSuggestions }: EditCameraDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={!!camera} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("cameras.editCamera")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				{camera && (
					<div className="flex flex-col gap-4">
						<PhotoPicker
							photos={camera.photo ? [camera.photo] : []}
							onChange={(p) => onChange({ ...camera, photo: p[0] || undefined })}
							max={1}
							size={48}
							placeholderIcon
							label={t("cameras.photo")}
						/>
						<FormField label={t("cameras.brand")}>
							<Input value={camera.brand} onChange={(e) => onChange({ ...camera, brand: e.target.value })} />
						</FormField>
						<FormField label={t("cameras.model")}>
							<Input value={camera.model} onChange={(e) => onChange({ ...camera, model: e.target.value })} />
						</FormField>
						<FormField label={t("cameras.nickname")}>
							<Input value={camera.nickname} onChange={(e) => onChange({ ...camera, nickname: e.target.value })} />
						</FormField>
						<FormField label={t("cameras.serial")}>
							<Input value={camera.serial} onChange={(e) => onChange({ ...camera, serial: e.target.value })} />
						</FormField>
						<FormField label={t("cameras.format")}>
							<Select value={camera.format} onValueChange={(v) => onChange({ ...camera, format: v })}>
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
						<div className="flex items-center justify-between gap-3">
							<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								{t("cameras.interchangeableLens")}
							</label>
							<Switch
								checked={camera.hasInterchangeableLens ?? true}
								onCheckedChange={(v) => onChange({ ...camera, hasInterchangeableLens: v })}
							/>
						</div>
						{(camera.hasInterchangeableLens ?? true) && (
							<AutocompleteInput
								label={t("cameras.mount")}
								value={camera.mount || ""}
								onChange={(v) => onChange({ ...camera, mount: v })}
								suggestions={mountSuggestions}
								placeholder={t("cameras.mountPlaceholder")}
								showAllOnFocus
							/>
						)}
						<div className="flex items-center justify-between gap-3">
							<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								{t("cameras.manualControls")}
							</label>
							<Switch
								checked={camera.hasManualControls ?? true}
								onCheckedChange={(v) => onChange({ ...camera, hasManualControls: v })}
							/>
						</div>
						<div className="flex items-center justify-between gap-3">
							<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								{t("cameras.interchangeableBack")}
							</label>
							<Switch
								checked={camera.hasInterchangeableBack || false}
								onCheckedChange={(v) => onChange({ ...camera, hasInterchangeableBack: v })}
							/>
						</div>

						{(camera.hasManualControls ?? true) && (
							<>
								<div className="border-t border-border pt-4 mt-1">
									<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
										{t("cameras.exposureSection")}
									</span>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<AutocompleteInput
										label={t("cameras.shutterSpeedMin")}
										value={camera.shutterSpeedMin || ""}
										onChange={(v) => onChange({ ...camera, shutterSpeedMin: v || null })}
										suggestions={SHUTTER_SPEEDS}
										showAllOnFocus
									/>
									<AutocompleteInput
										label={t("cameras.shutterSpeedMax")}
										value={camera.shutterSpeedMax || ""}
										onChange={(v) => onChange({ ...camera, shutterSpeedMax: v || null })}
										suggestions={SHUTTER_SPEEDS}
										showAllOnFocus
									/>
								</div>
							</>
						)}

						<Button onClick={onSave} disabled={!camera.brand && !camera.model} className="w-full justify-center">
							<Check size={16} /> {t("cameras.save")}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
