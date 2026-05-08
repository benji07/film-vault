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
		<nav className={cn("flex bg-surface-2 rounded-[10px] p-1 gap-1", className)}>
			{ITEMS.map((item) => {
				const active = value === item.id;
				return (
					<button
						type="button"
						key={item.id}
						onClick={() => onChange(item.id)}
						aria-pressed={active}
						className={cn(
							"flex-1 px-2 py-1.5 cursor-pointer leading-none rounded-[8px] transition-colors",
							"text-xs font-medium",
							active ? "bg-surface text-text shadow-sm" : "bg-transparent text-text-3 hover:text-text",
						)}
					>
						{item.label(yearLabel)}
					</button>
				);
			})}
		</nav>
	);
}
