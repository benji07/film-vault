import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourTooltipProps {
	title: string;
	description: string;
	currentStep: number;
	totalSteps: number;
	isFirst: boolean;
	isLast: boolean;
	onNext: () => void;
	onPrev: () => void;
	onSkip: () => void;
	placement: "top" | "bottom" | "center";
	anchorRect: DOMRect | null;
}

export function TourTooltip({
	title,
	description,
	currentStep,
	totalSteps,
	isFirst,
	isLast,
	onNext,
	onPrev,
	onSkip,
	placement,
	anchorRect,
}: TourTooltipProps) {
	const { t } = useTranslation();

	const isCentered = placement === "center" || !anchorRect;

	const positionStyle = isCentered
		? {}
		: placement === "bottom"
			? { top: Math.min(anchorRect.bottom + 12, window.innerHeight - 220), left: 16, right: 16 }
			: { bottom: window.innerHeight - anchorRect.top + 12, left: 16, right: 16 };

	return (
		<div
			className={cn(
				"absolute z-[2001] max-w-md animate-tour-tooltip-enter",
				isCentered && "inset-0 flex items-center justify-center px-6",
			)}
			style={isCentered ? undefined : positionStyle}
		>
			<div className={cn("bg-surface border border-border rounded-2xl p-5 shadow-lg", isCentered && "w-full max-w-sm")}>
				<h3 className="font-display text-lg italic text-text-primary mb-1.5">{title}</h3>
				<p className="text-sm text-text-sec font-body leading-relaxed mb-4">{description}</p>

				<div className="flex items-center justify-between gap-3">
					<span className="text-[11px] font-mono text-text-muted">
						{t("tour.stepOf", { current: currentStep + 1, total: totalSteps })}
					</span>
					<div className="flex items-center gap-2">
						{!isFirst && (
							<Button variant="ghost" onClick={onPrev} className="!px-2.5 !py-1.5 !min-h-0 text-xs">
								<ChevronLeft size={14} />
								{t("tour.prev")}
							</Button>
						)}
						<Button onClick={onNext} className="!px-3.5 !py-1.5 !min-h-0 text-xs">
							{isLast ? t("tour.finish") : t("tour.next")}
							{!isLast && <ChevronRight size={14} />}
						</Button>
					</div>
				</div>

				<button
					type="button"
					onClick={onSkip}
					className="mt-3 w-full text-center text-[11px] text-text-muted font-body hover:text-text-sec transition-colors cursor-pointer bg-transparent border-0 p-0"
				>
					{t("tour.skip")}
				</button>
			</div>
		</div>
	);
}
