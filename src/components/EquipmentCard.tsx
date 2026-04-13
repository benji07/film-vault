import { Camera, RectangleHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { alpha, T } from "@/constants/theme";
import type { Film } from "@/types";
import { filmIso, filmName } from "@/utils/film-helpers";

interface EquipmentCardProps {
	label: string;
	sublabel?: string;
	loadedFilm?: Film | null;
	icon: "camera" | "back";
	onClick: () => void;
	className?: string;
}

export function EquipmentCard({ label, sublabel, loadedFilm, icon, onClick, className }: EquipmentCardProps) {
	const { t } = useTranslation();
	const isLoaded = !!loadedFilm;
	const statusColor = isLoaded ? T.green : T.textMuted;
	const Icon = icon === "camera" ? Camera : RectangleHorizontal;

	return (
		<Card
			role="button"
			tabIndex={0}
			className={`shrink-0 p-3 cursor-pointer transition-all ${className ?? "w-[140px]"}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div className="flex items-center gap-2 mb-2">
				<div
					className="w-8 h-8 rounded-lg flex items-center justify-center"
					style={{ background: `linear-gradient(135deg, ${alpha(statusColor, 0.15)}, ${alpha(statusColor, 0.05)})` }}
				>
					<Icon size={16} color={statusColor} />
				</div>
				<div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
			</div>
			<div className="text-[13px] font-semibold text-text-primary font-body leading-tight truncate">{label}</div>
			{sublabel && (
				<div className="text-[11px] text-text-muted font-body leading-tight truncate mt-0.5">{sublabel}</div>
			)}
			<div className="mt-2">
				{isLoaded ? (
					<>
						<div className="text-[12px] text-text-sec font-body leading-tight truncate">{filmName(loadedFilm)}</div>
						<div className="text-[11px] text-text-muted font-body">{filmIso(loadedFilm)} ISO</div>
					</>
				) : (
					<div className="text-[12px] text-text-muted font-body italic">{t("dashboard.empty")}</div>
				)}
			</div>
		</Card>
	);
}
