import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Film, FilmState } from "@/types";

interface FilmLifecycleStepperProps {
	currentState: FilmState;
	history?: Film["history"];
	className?: string;
}

/** 6 étapes visuelles du parcours d'une pellicule. */
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
			{/* Ligne de connexion en pointillés */}
			<div
				className="absolute left-4 right-4 top-3.5 h-[2px] z-0"
				style={{
					backgroundImage:
						"repeating-linear-gradient(90deg, var(--color-ink-faded) 0 4px, transparent 4px 8px)",
				}}
			/>
			{STEPS.map((step, i) => {
				const done = i < currentIdx;
				const current = i === currentIdx;
				const label = (t(step.labelKey, { defaultValue: step.fallback }) as string) || step.fallback;
				return (
					<div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
						<div
							className={cn(
								"w-7 h-7 flex items-center justify-center font-archivo-black text-[11px] border-2 transition-all",
								current && "bg-kodak-red text-paper border-ink scale-[1.15] animate-timeline-pulse",
								done && "bg-ink text-kodak-yellow border-ink",
								!current && !done && "bg-paper text-ink-faded border-ink-faded",
							)}
						>
							{done ? "✓" : current ? "●" : "·"}
						</div>
						<div
							className={cn(
								"font-archivo text-[9px] tracking-[0.12em] uppercase text-center leading-none whitespace-nowrap",
								current ? "font-black text-kodak-red" : done ? "font-extrabold text-ink-soft" : "font-bold text-ink-faded",
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
