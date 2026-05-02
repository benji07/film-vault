import { type LucideIcon, RotateCcw, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhotoImg } from "@/components/ui/photo-img";

interface SoldEquipmentCardProps {
	name: string;
	photo?: string | null;
	fallbackIcon: LucideIcon;
	soldDate?: string | null;
	formatLabel?: string;
	associatedFilmsCount?: number;
	extraBadges?: ReactNode;
	compact?: boolean;
	onPhotoClick: () => void;
	onUnarchive: () => void;
	onHardDelete: () => void;
	unarchiveLabel: string;
	hardDeleteLabel: string;
}

const NEUTRAL_BADGE = "text-ink-faded bg-ink-faded/10 border-transparent";
const INFO_BADGE = "text-washi-4 bg-washi-4/10 border-transparent";

export function SoldEquipmentCard({
	name,
	photo,
	fallbackIcon: FallbackIcon,
	soldDate,
	formatLabel,
	associatedFilmsCount,
	extraBadges,
	compact = false,
	onPhotoClick,
	onUnarchive,
	onHardDelete,
	unarchiveLabel,
	hardDeleteLabel,
}: SoldEquipmentCardProps) {
	const { t } = useTranslation();
	const photoSize = compact ? "w-10 h-10" : "w-12 h-12";
	const iconSize = compact ? 16 : 20;
	const nameSize = compact ? "text-[14px]" : "text-[15px]";

	return (
		<Card className="opacity-70">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					{photo ? (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onPhotoClick();
							}}
							aria-label={t("aria.openPhoto", { index: 1 })}
							className={`${photoSize} rounded-lg overflow-hidden shrink-0`}
						>
							<PhotoImg
								src={photo}
								alt=""
								aria-hidden="true"
								className="w-full h-full object-cover border border-border cursor-pointer grayscale"
							/>
						</button>
					) : (
						<div className={`${photoSize} rounded-lg bg-surface-alt flex items-center justify-center shrink-0`}>
							<FallbackIcon size={iconSize} className="text-text-muted opacity-40" />
						</div>
					)}
					<div className="min-w-0">
						<div className={`${nameSize} font-semibold text-text-primary font-body`}>{name}</div>
						<div className="flex gap-1.5 mt-1.5 flex-wrap">
							{formatLabel && <Badge className={NEUTRAL_BADGE}>{formatLabel}</Badge>}
							{soldDate && <Badge className={NEUTRAL_BADGE}>{t("equipment.soldOn", { date: soldDate })}</Badge>}
							{associatedFilmsCount != null && associatedFilmsCount > 0 && (
								<Badge className={INFO_BADGE}>{t("equipment.associatedFilms", { count: associatedFilmsCount })}</Badge>
							)}
							{extraBadges}
						</div>
					</div>
				</div>
				<div className="flex gap-1.5">
					<Button
						variant="outline"
						size="icon"
						onClick={onUnarchive}
						className="w-11 h-11 rounded-lg"
						aria-label={unarchiveLabel}
					>
						<RotateCcw size={14} className="text-text-sec" />
					</Button>
					<Button
						variant="destructive"
						size="icon"
						onClick={onHardDelete}
						className="w-11 h-11 rounded-lg"
						aria-label={hardDeleteLabel}
					>
						<Trash2 size={14} className="text-accent" />
					</Button>
				</div>
			</div>
		</Card>
	);
}
