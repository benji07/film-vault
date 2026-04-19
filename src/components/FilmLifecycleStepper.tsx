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

/** Per-step tilt angles — gives the flashcard row its hand-placed feel */
const TILTS = [-1.5, 1, -2, 1.5, -1.2];

export function FilmLifecycleStepper({ currentState, className }: FilmLifecycleStepperProps) {
	const { t } = useTranslation();
	const STATES = getStates(t);

	const effectiveState = currentState === "partial" ? "loaded" : currentState;
	const currentIdx = LIFECYCLE_STATES.indexOf(effectiveState);

	return (
		<div className={cn("flex items-stretch gap-2 md:gap-3", className)}>
			{LIFECYCLE_STATES.map((state, i) => {
				const st = STATES[state];
				const isPast = i < currentIdx;
				const isCurrent = i === currentIdx;
				const isFuture = i > currentIdx;
				const StIcon = st.icon;
				const tilt = TILTS[i] ?? 0;

				return (
					<div
						key={state}
						className={cn(
							"relative flex-1 min-w-0 flex flex-col items-center justify-between gap-1 py-2 px-1.5",
							"rounded-[12px] border-2 transition-all",
							isCurrent
								? "bg-card animate-sunset-glow"
								: isPast
									? "bg-card/80 border-solid"
									: "bg-surface-alt border-dashed opacity-70",
						)}
						style={{
							borderColor: isFuture ? alpha(st.color, 0.3) : st.color,
							transform: `rotate(${isCurrent ? 0 : tilt}deg)`,
							boxShadow: isCurrent
								? `0 4px 14px ${alpha(st.color, 0.25)}, inset 0 0 0 1px ${alpha(st.color, 0.15)}`
								: isPast
									? "0 2px 6px rgba(0,0,0,0.12)"
									: "none",
							zIndex: isCurrent ? 2 : 1,
						}}
					>
						{/* Corner ornaments */}
						<span
							className="absolute top-1 left-1 w-2 h-2 border-t border-l"
							style={{ borderColor: alpha(st.color, isFuture ? 0.25 : 0.5) }}
							aria-hidden="true"
						/>
						<span
							className="absolute top-1 right-1 w-2 h-2 border-t border-r"
							style={{ borderColor: alpha(st.color, isFuture ? 0.25 : 0.5) }}
							aria-hidden="true"
						/>
						<span
							className="absolute bottom-1 left-1 w-2 h-2 border-b border-l"
							style={{ borderColor: alpha(st.color, isFuture ? 0.25 : 0.5) }}
							aria-hidden="true"
						/>
						<span
							className="absolute bottom-1 right-1 w-2 h-2 border-b border-r"
							style={{ borderColor: alpha(st.color, isFuture ? 0.25 : 0.5) }}
							aria-hidden="true"
						/>

						<div
							className="w-8 h-8 rounded-full flex items-center justify-center"
							style={{
								background: alpha(st.color, isFuture ? 0.08 : isCurrent ? 0.2 : 0.14),
								border: isCurrent ? `1.5px dashed ${st.color}` : "none",
							}}
						>
							<StIcon size={15} color={isFuture ? alpha(st.color, 0.45) : st.color} />
						</div>

						<span
							className={cn(
								"font-display leading-none text-center truncate w-full text-[14px] md:text-base",
								isCurrent && "text-[15px] md:text-[17px]",
							)}
							style={{ color: isFuture ? alpha(st.color, 0.45) : st.color }}
						>
							{st.label}
						</span>

						{/* Step number in tiny mono */}
						<span
							className="text-[9px] font-mono tracking-tight"
							style={{ color: alpha(st.color, isFuture ? 0.35 : 0.7) }}
						>
							{String(i + 1).padStart(2, "0")}
						</span>
					</div>
				);
			})}
		</div>
	);
}
