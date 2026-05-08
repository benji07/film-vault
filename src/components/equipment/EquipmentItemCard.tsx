import type { ReactNode } from "react";
import { PhotoImg } from "@/components/ui/photo-img";
import { cn } from "@/lib/utils";
import type { WashiColor } from "@/utils/card-decorations";

export type EquipmentVignette = "default" | "silver" | "red" | "lens" | "back";

interface EquipmentItemCardProps {
	name: string;
	year?: string;
	formatLabel?: string;
	stats: { value: string | number; label: string }[];
	loadedSummary?: string | null;
	photo?: string | null;
	vignette?: EquipmentVignette;
	washi?: WashiColor;
	washiOffset?: number;
	index?: number;
	actions?: ReactNode;
	onClick?: () => void;
	className?: string;
}

const VIGNETTE_BG: Record<EquipmentVignette, string> = {
	default: "linear-gradient(180deg, #4a4845 0%, #2a2825 100%)",
	silver: "linear-gradient(180deg, #d8d6d2 0%, #9c9a96 100%)",
	red: "linear-gradient(180deg, #4a4845 0%, #2a2825 100%)",
	lens: "linear-gradient(180deg, #3a3a38 0%, #18181a 100%)",
	back: "linear-gradient(180deg, #524f4a 0%, #2c2a26 100%)",
};

export function EquipmentItemCard({
	name,
	year,
	formatLabel,
	stats,
	loadedSummary,
	photo,
	vignette = "default",
	actions,
	onClick,
	className,
}: EquipmentItemCardProps) {
	const innerClasses = cn(
		"grid w-full text-left grid-cols-[110px_1fr] overflow-hidden rounded-[14px]",
		onClick && "cursor-pointer transition-colors hover:bg-surface-2",
	);

	const inner = (
		<>
			<div className="relative overflow-hidden flex items-center justify-center min-h-[124px]">
				{photo ? (
					<PhotoImg src={photo} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
				) : (
					<div className="absolute inset-2 rounded-[10px]" style={{ background: VIGNETTE_BG[vignette] }} />
				)}
				{formatLabel && (
					<div className="absolute bottom-2 left-2 right-2 bg-text/85 text-bg text-[10px] font-medium text-center px-2 py-0.5 uppercase tracking-wider rounded-full backdrop-blur-sm">
						{formatLabel}
					</div>
				)}
			</div>

			<div className="px-4 py-3 flex flex-col gap-1.5 min-w-0">
				<div className="text-[15px] font-semibold text-text leading-tight">
					<div className="truncate">{name}</div>
					{year && <div className="text-xs font-normal text-text-3 mt-0.5">{year}</div>}
				</div>

				{stats.length > 0 && (
					<div className="flex gap-3 mt-1">
						{stats.map((s) => (
							<div key={s.label} className="flex flex-col">
								<div className="text-sm font-semibold text-text leading-none">{s.value}</div>
								<div className="text-[10px] tracking-wider uppercase text-text-3 mt-1">{s.label}</div>
							</div>
						))}
					</div>
				)}

				{loadedSummary ? (
					<div className="flex items-center gap-2 mt-1.5 px-2 py-1.5 rounded-[8px] bg-accent-soft text-accent ring-1 ring-accent">
						<span className="w-1.5 h-1.5 rounded-full bg-accent" />
						<span className="text-xs font-medium leading-none flex-1 truncate">{loadedSummary}</span>
					</div>
				) : (
					<div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-3">—</div>
				)}
			</div>
		</>
	);

	return (
		<article className={cn("relative bg-surface rounded-[14px] overflow-hidden", className)}>
			{onClick ? (
				<button type="button" onClick={onClick} className={innerClasses}>
					{inner}
				</button>
			) : (
				<div className={innerClasses}>{inner}</div>
			)}

			{actions && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: wrapper only stops propagation; inner buttons handle keyboard.
				<div className="absolute top-2 right-2 flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
					{actions}
				</div>
			)}
		</article>
	);
}
