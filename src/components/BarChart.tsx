import { T } from "@/constants/theme";

interface BarChartProps {
	data: Record<string, number>;
	color?: string;
	sort?: boolean;
	formatValue?: (v: number) => string;
}

export function BarChart({ data: chartData, color = T.yellow, sort = true, formatValue }: BarChartProps) {
	const entries = Object.entries(chartData);
	const sorted = sort ? entries.sort((a, b) => b[1] - a[1]) : entries;
	const max = Math.max(...Object.values(chartData), 1);
	return (
		<div className="flex flex-col">
			{sorted.map(([k, v], i) => (
				<div
					key={k}
					className="grid items-center gap-2.5 py-1.5"
					style={{
						gridTemplateColumns: "80px 1fr 36px",
						borderBottom: i < sorted.length - 1 ? "1px dashed rgba(60,40,20,0.18)" : undefined,
					}}
				>
					<span className="font-archivo-black text-[10px] uppercase tracking-[0.05em] text-ink leading-tight">{k}</span>
					<div className="h-4 bg-ink relative overflow-hidden">
						<div
							className="h-full transition-[width] duration-500 ease-out"
							style={{ width: `${(v / max) * 100}%`, background: color }}
						>
							<div
								className="absolute inset-0"
								style={{
									backgroundImage:
										"repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,0.2) 6px 7px)",
								}}
							/>
						</div>
					</div>
					<span className="font-archivo-black text-[12px] text-ink text-right leading-none">
						{formatValue ? formatValue(v) : v}
					</span>
				</div>
			))}
		</div>
	);
}
