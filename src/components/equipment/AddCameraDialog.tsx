import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SHUTTER_SPEEDS } from "@/constants/photography";
import { type AppData, type Camera as CameraType, INSTANT_FORMATS, type StopIncrement } from "@/types";
import { uid } from "@/utils/helpers";

interface AddCameraDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
}

const emptyCam = {
	brand: "",
	model: "",
	nickname: "",
	serial: "",
	format: "35mm",
	mount: "",
	hasInterchangeableBack: false,
	hasInterchangeableLens: true,
	hasManualControls: true,
	photo: undefined as string | undefined,
	shutterSpeedMin: "" as string,
	shutterSpeedMax: "" as string,
	shutterSpeedStops: "" as string,
	apertureStops: "" as string,
};

export function AddCameraDialog({ open, onOpenChange, data, setData }: AddCameraDialogProps) {
	const { t } = useTranslation();
	const [newCam, setNewCam] = useState(emptyCam);

	useEffect(() => {
		if (!open) setNewCam(emptyCam);
	}, [open]);

	const addCamera = () => {
		if (!newCam.brand && !newCam.model) return;
		const camera: CameraType = {
			id: uid(),
			brand: newCam.brand,
			model: newCam.model,
			nickname: newCam.nickname,
			serial: newCam.serial,
			format: newCam.format,
			mount: newCam.hasInterchangeableLens ? newCam.mount || null : null,
			hasInterchangeableBack: newCam.hasInterchangeableBack || false,
			hasInterchangeableLens: newCam.hasInterchangeableLens,
			hasManualControls: newCam.hasManualControls,
			photo: newCam.photo,
			shutterSpeedMin: newCam.hasManualControls ? newCam.shutterSpeedMin || null : null,
			shutterSpeedMax: newCam.hasManualControls ? newCam.shutterSpeedMax || null : null,
			shutterSpeedStops: newCam.hasManualControls ? (newCam.shutterSpeedStops as StopIncrement) || null : null,
			apertureStops: newCam.hasManualControls ? (newCam.apertureStops as StopIncrement) || null : null,
		};
		setData({ ...data, cameras: [...data.cameras, camera] });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("cameras.newCamera")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<PhotoPicker
						photos={newCam.photo ? [newCam.photo] : []}
						onChange={(p) => setNewCam({ ...newCam, photo: p[0] || undefined })}
						max={1}
						size={48}
						placeholderIcon
						label={t("cameras.photo")}
					/>
					<FormField label={t("cameras.brand")}>
						<Input
							value={newCam.brand}
							onChange={(e) => setNewCam({ ...newCam, brand: e.target.value })}
							placeholder={t("cameras.brandPlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.model")}>
						<Input
							value={newCam.model}
							onChange={(e) => setNewCam({ ...newCam, model: e.target.value })}
							placeholder={t("cameras.modelPlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.nickname")}>
						<Input
							value={newCam.nickname}
							onChange={(e) => setNewCam({ ...newCam, nickname: e.target.value })}
							placeholder={t("cameras.nicknamePlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.serial")}>
						<Input
							value={newCam.serial}
							onChange={(e) => setNewCam({ ...newCam, serial: e.target.value })}
							placeholder={t("cameras.serialPlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.format")}>
						<Select value={newCam.format} onValueChange={(v) => setNewCam({ ...newCam, format: v })}>
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
							checked={newCam.hasInterchangeableLens}
							onCheckedChange={(v) => setNewCam({ ...newCam, hasInterchangeableLens: v })}
						/>
					</div>
					{newCam.hasInterchangeableLens && (
						<FormField label={t("cameras.mount")}>
							<Input
								value={newCam.mount}
								onChange={(e) => setNewCam({ ...newCam, mount: e.target.value })}
								placeholder={t("cameras.mountPlaceholder")}
							/>
						</FormField>
					)}
					<div className="flex items-center justify-between gap-3">
						<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
							{t("cameras.manualControls")}
						</label>
						<Switch
							checked={newCam.hasManualControls}
							onCheckedChange={(v) => setNewCam({ ...newCam, hasManualControls: v })}
						/>
					</div>
					<div className="flex items-center justify-between gap-3">
						<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
							{t("cameras.interchangeableBack")}
						</label>
						<Switch
							checked={newCam.hasInterchangeableBack}
							onCheckedChange={(v) => setNewCam({ ...newCam, hasInterchangeableBack: v })}
						/>
					</div>

					{newCam.hasManualControls && (
						<>
							<div className="border-t border-border pt-4 mt-1">
								<span className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									{t("cameras.exposureSection")}
								</span>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<FormField label={t("cameras.shutterSpeedMin")}>
									<Select
										value={newCam.shutterSpeedMin}
										onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedMin: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="—" />
										</SelectTrigger>
										<SelectContent>
											{SHUTTER_SPEEDS.filter((_, i) => i % 3 === 0).map((s) => (
												<SelectItem key={s} value={s}>
													{s}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormField>
								<FormField label={t("cameras.shutterSpeedMax")}>
									<Select
										value={newCam.shutterSpeedMax}
										onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedMax: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="—" />
										</SelectTrigger>
										<SelectContent>
											{SHUTTER_SPEEDS.filter((_, i) => i % 3 === 0).map((s) => (
												<SelectItem key={s} value={s}>
													{s}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormField>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<FormField label={t("cameras.shutterSpeedStops")}>
									<Select
										value={newCam.shutterSpeedStops}
										onValueChange={(v) => setNewCam({ ...newCam, shutterSpeedStops: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="—" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">{t("cameras.stopsFull")}</SelectItem>
											<SelectItem value="1/2">{t("cameras.stopsHalf")}</SelectItem>
											<SelectItem value="1/3">{t("cameras.stopsThird")}</SelectItem>
										</SelectContent>
									</Select>
								</FormField>
								<FormField label={t("cameras.apertureStops")}>
									<Select
										value={newCam.apertureStops}
										onValueChange={(v) => setNewCam({ ...newCam, apertureStops: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder="—" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">{t("cameras.stopsFull")}</SelectItem>
											<SelectItem value="1/2">{t("cameras.stopsHalf")}</SelectItem>
											<SelectItem value="1/3">{t("cameras.stopsThird")}</SelectItem>
										</SelectContent>
									</Select>
								</FormField>
							</div>
						</>
					)}

					<Button onClick={addCamera} disabled={!newCam.brand && !newCam.model} className="w-full justify-center">
						<Plus size={16} /> {t("cameras.add")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
