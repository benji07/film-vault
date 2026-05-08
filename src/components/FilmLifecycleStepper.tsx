import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Film, FilmState } from "@/types";

interface FilmLifecycleStepperProps {
	currentState: FilmState;
	history?: Film["history"];
	className?: string;
}

const STEPS = [
	{ key: "stock", labelKey: "lifecycle.stock", fallback: "Stock" },
	{ key: "loaded", labelKey: "lifecycle.loaded", fallback: "Chargée" },
	{ key: "exposed", labelKey: "lifecycle.exposed", fallback: "Exposée" },
	{ key: "lab", labelKey: "lifecycle.lab", fallback: "Labo" },
	{ key: "developed", labelKey: "lifecycle.developed", fallback: "Dévelop." },
	{ key: "scanned", labelKey: "lifecycle.scanned", fallback: "Scannée" },
] as const;

function computeStepIndex(state: FilmState, history: Film["history"] | undefined): number {
	switch (state) {
		case "stock":
			return 0;
		case "loaded":
		case "partial":
			return 1;
		case "exposed": {
			const sentDev = history?.some((h) => h.actionCode === "sent_dev");
			return sentDev ? 3 : 2;
		}
		case "developed":
			return 4;
		case "scanned":
			return 5;
		default:
			return 0;
	}
}

export function FilmLifecycleStepper({ currentState, history, className }: FilmLifecycleStepperProps) {
	const { t } = useTranslation();
	const currentIdx = computeStepIndex(currentState, history);

	return (
		<div className={cn("relative flex items-center justify-between px-1", className)}>
			<div className="absolute left-4 right-4 top-3.5 h-[2px] bg-line z-0" />
			{STEPS.map((step, i) => {
				const done = i < currentIdx;
				const current = i === currentIdx;
				const label = (t(step.labelKey, { defaultValue: step.fallback }) as string) || step.fallback;
				return (
					<div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
						<div
							className={cn(
								"w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
								current && "bg-accent text-bg scale-[1.15] animate-timeline-pulse",
								done && "bg-text text-bg",
								!current && !done && "bg-surface-2 text-text-3",
							)}
						>
							{done ? "✓" : current ? "●" : "·"}
						</div>
						<div
							className={cn(
								"text-[10px] font-medium text-center leading-none whitespace-nowrap",
								current ? "text-accent font-semibold" : done ? "text-text-2" : "text-text-3",
							)}
						>
							{label}
						</div>
					</div>
				);
			})}
		</div>
	);
}
