import { useTranslation } from "react-i18next";
import { useTour } from "@/tour/TourProvider";
import { TourTooltip } from "@/tour/TourTooltip";
import { TOUR_STEPS } from "@/tour/tour-steps";
import { useTourAnchor } from "@/tour/use-tour-anchor";

export function TourOverlay() {
	const { t } = useTranslation();
	const { tourState, nextStep, prevStep, skipTour } = useTour();

	const step = TOUR_STEPS[tourState.currentStep];
	const target = step?.target ?? null;
	const delay = step?.delay ?? 0;

	const anchorRect = useTourAnchor(target, delay);

	if (!step) return null;

	const padding = step.padding ?? 8;
	const hasTarget = step.target !== null && anchorRect !== null;

	const title = t(`${step.i18nKey}.title`);
	const description = t(`${step.i18nKey}.description`);

	// Build SVG cutout mask
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	let cutoutPath = "";
	if (hasTarget) {
		const x = anchorRect.left - padding;
		const y = anchorRect.top - padding;
		const w = anchorRect.width + padding * 2;
		const h = anchorRect.height + padding * 2;
		const r = 12;
		// Outer rect (clockwise) + inner rounded rect (counter-clockwise) for hole
		cutoutPath = [
			`M0,0 L${vw},0 L${vw},${vh} L0,${vh} Z`,
			`M${x + r},${y}`,
			`L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r}`,
			`L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h}`,
			`L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r}`,
			`L${x},${y + r} Q${x},${y} ${x + r},${y} Z`,
		].join(" ");
	}

	return (
		<div className="fixed inset-0 z-[2000] animate-tour-backdrop-fade-in" key={tourState.currentStep}>
			{/* SVG backdrop with optional cutout */}
			<svg className="absolute inset-0 w-full h-full" role="img" aria-hidden="true" style={{ pointerEvents: "none" }}>
				<title>Tour overlay</title>
				{hasTarget ? (
					<path d={cutoutPath} fill="rgba(0,0,0,0.65)" fillRule="evenodd" />
				) : (
					<rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.65)" />
				)}
			</svg>

			{/* Block all pointer events on the backdrop */}
			<div className="absolute inset-0" />

			{/* Tooltip */}
			<TourTooltip
				title={title}
				description={description}
				currentStep={tourState.currentStep}
				totalSteps={tourState.totalSteps}
				isFirst={tourState.currentStep === 0}
				isLast={tourState.currentStep === tourState.totalSteps - 1}
				onNext={nextStep}
				onPrev={prevStep}
				onSkip={skipTour}
				placement={step.placement}
				anchorRect={hasTarget ? anchorRect : null}
			/>
		</div>
	);
}
