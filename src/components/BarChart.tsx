import { alpha, T } from "@/constants/theme";

interface BarChartProps {
	data: Record<string, number>;
	color?: string;
	sort?: boolean;
	formatValue?: (v: number) => string;
}

export function BarChart({ data: chartData, color = T.accent, sort = true, formatValue }: BarChartProps) {
	const entries = Object.entries(chartData);
	const sorted = sort ? entries.sort((a, b) => b[1] - a[1]) : entries;
	const max = Math.max(...Object.values(chartData), 1);
	return (
		<div className="flex flex-col gap-1.5">
			{sorted.map(([k, v]) => (
				<div key={k} className="flex items-center gap-2.5">
					<span className="text-xs text-text-sec font-body min-w-[80px] text-right">{k}</span>
					<div className="flex-1 h-[22px] bg-surface-alt rounded-md overflow-hidden">
						<div
							className="h-full rounded-md transition-[width] duration-500 ease-out"
							style={{
								width: `${(v / max) * 100}%`,
								background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.53)})`,
							}}
						/>
					</div>
					<span className="text-[13px] font-mono text-text-primary min-w-[24px] font-semibold">
						{formatValue ? formatValue(v) : v}
					</span>
				</div>
			))}
		</div>
	);
}
