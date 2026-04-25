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
import { type AppData, type Back, INSTANT_FORMATS } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { uid } from "@/utils/helpers";

interface AddBackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
}

const emptyBack = {
	name: "",
	nickname: "",
	ref: "",
	serial: "",
	format: "120",
	compatibleCameraIds: [] as string[],
	photo: undefined as string | undefined,
};

export function AddBackDialog({ open, onOpenChange, data, setData }: AddBackDialogProps) {
	const { t } = useTranslation();
	const [newBack, setNewBack] = useState(emptyBack);

	useEffect(() => {
		if (!open) setNewBack(emptyBack);
	}, [open]);

	const interchangeableCameras = data.cameras.filter((c) => c.hasInterchangeableBack && !c.soldAt);

	const toggleCamera = (cameraId: string) => {
		const ids = newBack.compatibleCameraIds;
		if (ids.includes(cameraId)) {
			setNewBack({ ...newBack, compatibleCameraIds: ids.filter((id) => id !== cameraId) });
		} else {
			setNewBack({ ...newBack, compatibleCameraIds: [...ids, cameraId] });
		}
	};

	const addBack = () => {
		if (!newBack.name) return;
		const back: Back = {
			id: uid(),
			name: newBack.name,
			nickname: newBack.nickname,
			ref: newBack.ref,
			serial: newBack.serial,
			format: newBack.format,
			compatibleCameraIds: newBack.compatibleCameraIds,
			photo: newBack.photo,
		};
		setData({ ...data, backs: [...data.backs, back] });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("cameras.addBackTitle")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<PhotoPicker
						photos={newBack.photo ? [newBack.photo] : []}
						onChange={(p) => setNewBack({ ...newBack, photo: p[0] || undefined })}
						max={1}
						size={32}
						placeholderIcon
						label={t("cameras.photo")}
					/>
					<FormField label={t("cameras.backName")}>
						<Input
							value={newBack.name}
							onChange={(e) => setNewBack({ ...newBack, name: e.target.value })}
							placeholder={t("cameras.backNamePlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.backFormat")}>
						<Select value={newBack.format} onValueChange={(v) => setNewBack({ ...newBack, format: v })}>
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
					<FormField label={t("cameras.reference")}>
						<Input
							value={newBack.ref}
							onChange={(e) => setNewBack({ ...newBack, ref: e.target.value })}
							placeholder={t("cameras.refPlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.backNickname")}>
						<Input
							value={newBack.nickname}
							onChange={(e) => setNewBack({ ...newBack, nickname: e.target.value })}
							placeholder={t("cameras.backNicknamePlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.backSerial")}>
						<Input
							value={newBack.serial}
							onChange={(e) => setNewBack({ ...newBack, serial: e.target.value })}
							placeholder={t("cameras.serialPlaceholder")}
						/>
					</FormField>
					<FormField label={t("cameras.compatibleCameras")}>
						{interchangeableCameras.length > 0 ? (
							<div className="flex flex-col gap-2">
								{interchangeableCameras.map((c) => (
									<div key={c.id} className="flex items-center justify-between gap-3">
										<span className="text-[13px] text-text-sec font-body">{cameraDisplayName(c)}</span>
										<Switch
											checked={newBack.compatibleCameraIds.includes(c.id)}
											onCheckedChange={() => toggleCamera(c.id)}
										/>
									</div>
								))}
							</div>
						) : (
							<span className="text-[12px] text-text-muted font-body">{t("cameras.noCompatibleCameras")}</span>
						)}
					</FormField>
					<Button onClick={addBack} disabled={!newBack.name} className="w-full justify-center">
						<Plus size={16} /> {t("cameras.addBackButton")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
