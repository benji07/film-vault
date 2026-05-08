import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FormatStackProps {
	data: Record<string, number>;
	className?: string;
}

// Ramp neutre dérivée de la palette monochrome — du plus foncé au plus clair.
const SEGMENT_COLORS = [
	"var(--color-text)",
	"var(--color-text-2)",
	"var(--color-text-3)",
	"var(--color-fill-2)",
	"var(--color-fill-1)",
	"var(--color-line)",
] as const;

const SEGMENT_FG = ["text-bg", "text-bg", "text-bg", "text-text", "text-text", "text-text"] as const;

interface Segment {
	key: string;
	value: number;
	pct: number;
	color: string;
	fg: string;
}

export function FormatStack({ data, className }: FormatStackProps) {
	const segments = useMemo<Segment[]>(() => {
		const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
		const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
		return entries.map(([k, v], i) => ({
			key: k,
			value: v,
			pct: (v / total) * 100,
			color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] ?? SEGMENT_COLORS[0],
			fg: SEGMENT_FG[i % SEGMENT_FG.length] ?? "text-text",
		}));
	}, [data]);

	if (segments.length === 0) return null;

	return (
		<div className={className}>
			<div className="flex h-10 rounded-full overflow-hidden mb-3 gap-0.5">
				{segments.map((s) => (
					<div
						key={s.key}
						className="flex items-center justify-center relative"
						style={{ width: `${s.pct}%`, background: s.color }}
					>
						{s.pct > 8 && <span className={cn("text-xs font-medium tabular-nums", s.fg)}>{Math.round(s.pct)}%</span>}
					</div>
				))}
			</div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
				{segments.map((s) => (
					<div key={s.key} className="flex items-center gap-2 text-xs text-text-2">
						<span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
						<span className="truncate">{s.key}</span>
						<span className="text-sm font-medium text-text ml-auto tabular-nums">{s.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}
