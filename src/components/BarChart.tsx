import { useMemo } from "react";

interface BarChartProps {
	data: Record<string, number>;
	color?: string;
	sort?: boolean;
	limit?: number;
	formatValue?: (v: number) => string;
}

export function BarChart({ data: chartData, color, sort = true, limit, formatValue }: BarChartProps) {
	const visible = useMemo(() => {
		const entries = Object.entries(chartData);
		const sorted = sort ? entries.sort((a, b) => b[1] - a[1]) : entries;
		return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
	}, [chartData, sort, limit]);
	const max = Math.max(...visible.map(([, v]) => v), 1);
	const barColor = color ?? "var(--color-text)";
	return (
		<div className="flex flex-col">
			{visible.map(([k, v]) => (
				<div key={k} className="grid items-center gap-2.5 py-2" style={{ gridTemplateColumns: "80px 1fr 36px" }}>
					<span className="text-xs font-medium text-text-2 leading-tight truncate">{k}</span>
					<div className="h-2 bg-fill-1 rounded-full relative overflow-hidden">
						<div
							className="h-full rounded-full transition-[width] duration-500 ease-out"
							style={{ width: `${(v / max) * 100}%`, background: barColor }}
						/>
					</div>
					<span className="text-sm font-medium text-text text-right leading-none">
						{formatValue ? formatValue(v) : v}
					</span>
				</div>
			))}
		</div>
	);
}
