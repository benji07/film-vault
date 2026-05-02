import { cn } from "@/lib/utils";

export type StatsPeriod = "30d" | "year" | "12m" | "all";

interface PeriodSwitchProps {
	value: StatsPeriod;
	onChange: (period: StatsPeriod) => void;
	yearLabel: string;
	className?: string;
}

const ITEMS: { id: StatsPeriod; label: (year: string) => string }[] = [
	{ id: "30d", label: () => "30 j" },
	{ id: "year", label: (y) => y },
	{ id: "12m", label: () => "1 an" },
	{ id: "all", label: () => "tout" },
];

export function PeriodSwitch({ value, onChange, yearLabel, className }: PeriodSwitchProps) {
	return (
		<nav className={cn("flex border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] bg-paper-card", className)}>
			{ITEMS.map((item, i) => {
				const active = value === item.id;
				return (
					<button
						type="button"
						key={item.id}
						onClick={() => onChange(item.id)}
						aria-pressed={active}
						className={cn(
							"flex-1 px-2 py-2 cursor-pointer leading-none",
							"font-archivo-black text-[10px] uppercase tracking-[0.15em]",
							active ? "bg-kodak-yellow text-ink" : "bg-transparent text-ink-faded hover:bg-paper-dark/30",
							i < ITEMS.length - 1 && "border-r-2 border-ink",
						)}
					>
						{item.label(yearLabel)}
					</button>
				);
			})}
		</nav>
	);
}
