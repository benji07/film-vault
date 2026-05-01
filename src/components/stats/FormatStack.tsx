import { T } from "@/constants/theme";
import { cn } from "@/lib/utils";

interface FormatStackProps {
	data: Record<string, number>;
	className?: string;
}

/** Couleurs successives utilisées pour les segments. */
const SEGMENT_COLORS = [T.yellow, T.red, T.w2, T.ink, T.gold, T.teal] as const;
const SEGMENT_FG = ["text-ink", "text-paper", "text-ink", "text-paper", "text-ink", "text-paper"] as const;

interface Segment {
	key: string;
	value: number;
	pct: number;
	color: string;
	fg: string;
}

export function FormatStack({ data, className }: FormatStackProps) {
	const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
	const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;

	const segments: Segment[] = entries.map(([k, v], i) => ({
		key: k,
		value: v,
		pct: (v / total) * 100,
		color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] ?? T.yellow,
		fg: SEGMENT_FG[i % SEGMENT_FG.length] ?? "text-ink",
	}));

	if (segments.length === 0) return null;

	return (
		<div className={className}>
			{/* Stack horizontal */}
			<div className="flex h-[50px] border-2 border-ink overflow-hidden mb-3">
				{segments.map((s, i) => (
					<div
						key={s.key}
						className={cn(
							"flex items-center justify-center relative",
							i < segments.length - 1 && "border-r-2 border-ink",
						)}
						style={{ width: `${s.pct}%`, background: s.color }}
					>
						{s.pct > 8 && (
							<span className={cn("font-archivo-black text-[14px]", s.fg)}>{Math.round(s.pct)}%</span>
						)}
					</div>
				))}
			</div>
			{/* Légende grille 2 colonnes */}
			<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
				{segments.map((s) => (
					<div
						key={s.key}
						className="flex items-center gap-2 font-archivo font-bold text-[10px] uppercase tracking-[0.1em] text-ink-soft"
					>
						<span
							className="w-2.5 h-2.5 border-[1.5px] border-ink shrink-0"
							style={{ background: s.color }}
						/>
						<span className="truncate">{s.key}</span>
						<span className="font-archivo-black text-[11px] text-ink ml-auto">{s.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}
