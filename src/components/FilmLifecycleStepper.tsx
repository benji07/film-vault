import { useTranslation } from "react-i18next";
import { getStates } from "@/constants/films";
import { alpha } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { FilmState } from "@/types";

interface FilmLifecycleStepperProps {
	currentState: FilmState;
	className?: string;
}

const LIFECYCLE_STATES: FilmState[] = ["stock", "loaded", "exposed", "developed", "scanned"];

export function FilmLifecycleStepper({ currentState, className }: FilmLifecycleStepperProps) {
	const { t } = useTranslation();
	const STATES = getStates(t);

	// "partial" maps to the "loaded" position
	const effectiveState = currentState === "partial" ? "loaded" : currentState;
	const currentIdx = LIFECYCLE_STATES.indexOf(effectiveState);

	return (
		<div className={cn("flex items-center gap-1", className)}>
			{LIFECYCLE_STATES.map((state, i) => {
				const st = STATES[state];
				const isPast = i < currentIdx;
				const isCurrent = i === currentIdx;
				const isFuture = i > currentIdx;

				return (
					<div key={state} className="flex items-center flex-1 min-w-0">
						<div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
							{/* Dot */}
							<div className="flex items-center w-full">
								{/* Line before */}
								{i > 0 && (
									<div
										className="h-[2px] flex-1 rounded-full transition-colors"
										style={{
											backgroundColor: isPast || isCurrent ? alpha(st.color, 0.4) : alpha(st.color, 0.1),
										}}
									/>
								)}
								{/* Circle */}
								<div
									className={cn(
										"shrink-0 rounded-full flex items-center justify-center transition-all",
										isCurrent && "w-8 h-8 animate-timeline-pulse",
										isPast && "w-6 h-6",
										isFuture && "w-6 h-6",
									)}
									style={{
										backgroundColor: isCurrent
											? alpha(st.color, 0.15)
											: isPast
												? alpha(st.color, 0.12)
												: alpha(st.color, 0.06),
										border: isCurrent ? `2px solid ${st.color}` : "none",
									}}
								>
									<st.icon size={isCurrent ? 14 : 12} color={isFuture ? alpha(st.color, 0.3) : st.color} />
								</div>
								{/* Line after */}
								{i < LIFECYCLE_STATES.length - 1 && (
									<div
										className="h-[2px] flex-1 rounded-full transition-colors"
										style={{
											backgroundColor: isPast
												? alpha(STATES[LIFECYCLE_STATES[i + 1]!].color, 0.4)
												: alpha(st.color, 0.1),
										}}
									/>
								)}
							</div>
							{/* Label */}
							<span
								className={cn(
									"text-[10px] font-body leading-tight text-center truncate w-full",
									isCurrent && "font-bold",
									isPast && "font-medium",
									isFuture && "font-normal",
								)}
								style={{
									color: isFuture ? alpha(st.color, 0.35) : st.color,
								}}
							>
								{st.label}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
