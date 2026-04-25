import { Aperture, Camera as CameraIcon, Gauge, Hash, Layers, PackageX, Puzzle, Settings2, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoLine } from "@/components/InfoLine";
import type { Camera } from "@/types";
import { fmtDate } from "@/utils/helpers";

interface CameraInfoSectionProps {
	camera: Camera;
}

function stopsLabel(value: string | null | undefined, t: (k: string) => string): string | null {
	if (!value) return null;
	if (value === "1") return t("cameras.stopsFull");
	if (value === "1/2") return t("cameras.stopsHalf");
	if (value === "1/3") return t("cameras.stopsThird");
	return value;
}

export function CameraInfoSection({ camera }: CameraInfoSectionProps) {
	const { t } = useTranslation();
	const shutterRange =
		camera.shutterSpeedMin || camera.shutterSpeedMax
			? `${camera.shutterSpeedMin ?? "—"} → ${camera.shutterSpeedMax ?? "—"}`
			: null;
	const shutterStops = stopsLabel(camera.shutterSpeedStops, t);
	const apertureStops = stopsLabel(camera.apertureStops, t);
	const hasInterchangeableLens = camera.hasInterchangeableLens ?? true;
	const hasManualControls = camera.hasManualControls ?? true;

	return (
		<div className="flex flex-col gap-2">
			{camera.brand && <InfoLine icon={Tag} label={t("cameras.brand")} value={camera.brand} />}
			{camera.model && <InfoLine icon={CameraIcon} label={t("cameras.model")} value={camera.model} />}
			{camera.nickname && <InfoLine icon={Hash} label={t("cameras.nickname")} value={camera.nickname} />}
			{camera.serial && <InfoLine icon={Hash} label={t("cameras.serial")} value={camera.serial} />}
			{camera.format && <InfoLine icon={Layers} label={t("cameras.format")} value={camera.format} />}
			<InfoLine
				icon={Puzzle}
				label={t("cameras.interchangeableLens")}
				value={hasInterchangeableLens ? t("common.yes") : t("common.no")}
			/>
			{hasInterchangeableLens && camera.mount && (
				<InfoLine icon={Puzzle} label={t("cameras.mount")} value={camera.mount} />
			)}
			<InfoLine
				icon={Settings2}
				label={t("cameras.manualControls")}
				value={hasManualControls ? t("common.yes") : t("common.no")}
			/>
			{camera.hasInterchangeableBack && (
				<InfoLine icon={Puzzle} label={t("cameras.interchangeableBack")} value={t("common.yes")} />
			)}
			{hasManualControls && shutterRange && (
				<InfoLine icon={Gauge} label={t("cameraDetail.shutterRange")} value={shutterRange} />
			)}
			{hasManualControls && shutterStops && (
				<InfoLine icon={Gauge} label={t("cameras.shutterSpeedStops")} value={shutterStops} />
			)}
			{hasManualControls && apertureStops && (
				<InfoLine icon={Aperture} label={t("cameras.apertureStops")} value={apertureStops} />
			)}
			{camera.soldAt && (
				<InfoLine icon={PackageX} label={t("cameraDetail.archivedOn")} value={fmtDate(camera.soldAt)} />
			)}
		</div>
	);
}
