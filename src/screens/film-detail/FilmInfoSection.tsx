import {
	Aperture,
	Calendar,
	CircleDot,
	Coins,
	Focus,
	MapPin,
	MessageSquare,
	Package,
	ScanLine,
	Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CameraMiniCard } from "@/components/CameraMiniCard";
import { InfoLine } from "@/components/InfoLine";
import type { AppData, Film } from "@/types";
import { fmtExpDate, getExpirationStatus } from "@/utils/expiration";
import { fmtDate, fmtPrice } from "@/utils/helpers";
import { lensDisplayName } from "@/utils/lens-helpers";

interface FilmInfoSectionProps {
	film: Film;
	data: AppData;
	onCameraClick?: (camId: string) => void;
}

export function FilmInfoSection({ film, data, onCameraClick }: FilmInfoSectionProps) {
	const { t } = useTranslation();
	const cam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId ? data.backs.find((b) => b.id === film.backId) : null;

	return (
		<div className="flex flex-col gap-2">
			{film.expDate && (
				<InfoLine
					icon={Calendar}
					label={t("filmDetail.expiration")}
					value={fmtExpDate(film.expDate, t("dateLocale"))}
					warn={getExpirationStatus(film.expDate)?.status === "expired"}
				/>
			)}
			{film.shootIso && <InfoLine icon={Aperture} label={t("filmDetail.shootIso")} value={film.shootIso} />}
			{cam && (
				<div className="py-1">
					<span className="text-xs text-text-muted font-body block mb-1.5">{t("filmDetail.camera")}</span>
					<CameraMiniCard camera={cam} back={back} onClick={onCameraClick ? () => onCameraClick(cam.id) : undefined} />
				</div>
			)}
			{(film.lensId || film.lens) && (
				<InfoLine
					icon={Focus}
					label={t("filmDetail.lens")}
					value={
						film.lensId
							? lensDisplayName(data.lenses.find((l) => l.id === film.lensId)) || film.lens || ""
							: film.lens || ""
					}
				/>
			)}
			{film.startDate && <InfoLine icon={Calendar} label={t("filmDetail.start")} value={fmtDate(film.startDate)} />}
			{film.endDate && <InfoLine icon={Calendar} label={t("filmDetail.end")} value={fmtDate(film.endDate)} />}
			{film.posesShot != null && (
				<InfoLine icon={CircleDot} label={t("filmDetail.poses")} value={`${film.posesShot} / ${film.posesTotal}`} />
			)}
			{film.lab && <InfoLine icon={Package} label={t("filmDetail.lab")} value={film.lab} />}
			{film.labRef && <InfoLine icon={Tag} label={t("filmDetail.labRef")} value={film.labRef} />}
			{film.scanRef && <InfoLine icon={ScanLine} label={t("filmDetail.scanRef")} value={film.scanRef} />}
			{film.price != null && (
				<InfoLine icon={Coins} label={t("filmDetail.purchasePrice")} value={fmtPrice(film.price)} />
			)}
			{film.devCost != null && (
				<InfoLine
					icon={Coins}
					label={film.devScanPackage ? t("filmDetail.devScanPackageCost") : t("filmDetail.devCost")}
					value={fmtPrice(film.devCost)}
				/>
			)}
			{film.scanCost != null && (
				<InfoLine icon={Coins} label={t("filmDetail.scanCost")} value={fmtPrice(film.scanCost)} />
			)}
			{(() => {
				const total = (film.price ?? 0) + (film.devCost ?? 0) + (film.scanCost ?? 0);
				if (total > 0) {
					const frameCount = film.posesShot ?? film.posesTotal;
					const perFrame = frameCount ? total / frameCount : null;
					return (
						<>
							<InfoLine icon={Coins} label={t("filmDetail.totalCost")} value={fmtPrice(total)} />
							{perFrame != null && (
								<InfoLine icon={Coins} label={t("filmDetail.costPerFrame")} value={fmtPrice(perFrame)} />
							)}
						</>
					);
				}
				return null;
			})()}
			{film.state === "stock" && film.storageLocation && (
				<InfoLine icon={MapPin} label={t("filmDetail.storageLocation")} value={film.storageLocation} />
			)}
			{film.comment && <InfoLine icon={MessageSquare} label={t("filmDetail.notes")} value={film.comment} />}
		</div>
	);
}
