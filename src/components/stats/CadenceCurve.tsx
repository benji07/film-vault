import { useMemo } from "react";

interface CadenceCurveProps {
	/** 12 entries — keys = month labels, values = roll count for that month. Order is preserved. */
	data: Record<string, number>;
	/** Optional Y-axis ticks (default: 5 evenly distributed). */
	yTicks?: number[];
	/** Class for the wrapper. */
	className?: string;
}

/**
 * Cadence curve : polyline noire avec aire ambrée translucide. Points
 * fumés (smoke) + point fort ambré (max). Grille discrète, axes neutres.
 */
export function CadenceCurve({ data, yTicks, className }: CadenceCurveProps) {
	const entries = Object.entries(data);
	const values = entries.map(([, v]) => v);
	const max = Math.max(...values, 1);

	const ticks = yTicks ?? buildAutoTicks(max);
	const yAxisMax = ticks[0] ?? max;

	const { polyline, area, points, maxIndex } = useMemo(() => {
		const w = 360;
		const h = 130;
		const n = entries.length;
		if (n < 2) {
			return { polyline: "", area: "", points: [] as { x: number; y: number; value: number }[], maxIndex: -1 };
		}
		const step = w / (n - 1);
		let mIdx = 0;
		let mVal = -Infinity;
		const pts = entries.map(([, v], i) => {
			const x = i * step;
			const y = h - (v / yAxisMax) * h;
			if (v > mVal) {
				mVal = v;
				mIdx = i;
			}
			return { x, y, value: v };
		});
		const polylineStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
		const areaStr = `${pts[0]!.x},${h} ${polylineStr} ${pts[pts.length - 1]!.x},${h}`;
		return { polyline: polylineStr, area: areaStr, points: pts, maxIndex: mIdx };
	}, [entries, yAxisMax]);

	const months = entries.map(([k]) => k.split(" ")[0]?.charAt(0).toUpperCase() ?? "");

	return (
		<div className={className}>
			<div className="relative pl-6">
				{/* Y axis ticks */}
				<div className="absolute -left-1 top-0 bottom-6 w-5 flex flex-col justify-between text-[10px] font-medium text-text-3 text-right">
					{ticks.map((v) => (
						<span key={v}>{v}</span>
					))}
				</div>
				<div
					className="relative h-[130px] border-l border-b border-line"
					style={{
						backgroundImage:
							"linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
						backgroundSize: "calc(100%/12) 100%, 100% 25%",
					}}
				>
					<svg
						className="absolute inset-0 w-full h-full overflow-visible"
						viewBox="0 0 360 130"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						<title>Cadence</title>
						{points.length >= 2 && (
							<>
								<polygon points={area} fill="var(--color-amber-soft)" />
								<polyline
									points={polyline}
									fill="none"
									stroke="var(--color-text)"
									strokeWidth="2"
									strokeLinejoin="round"
									strokeLinecap="round"
								/>
								{points.map((p, i) => (
									<circle
										// biome-ignore lint/suspicious/noArrayIndexKey: stable index per month
										key={i}
										cx={p.x}
										cy={p.y}
										r={i === maxIndex ? 4 : 3}
										fill={i === maxIndex ? "var(--color-amber)" : "var(--color-smoke)"}
										stroke="var(--color-bg)"
										strokeWidth="1.5"
									/>
								))}
							</>
						)}
					</svg>
				</div>
				{/* X axis labels (month initials) */}
				<div className="flex justify-between mt-1.5 text-[10px] font-medium text-text-3">
					{months.map((m, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: positional month label
						<span key={i}>{m}</span>
					))}
				</div>
			</div>
		</div>
	);
}

function buildAutoTicks(max: number): number[] {
	if (max <= 5) return [5, 4, 3, 2, 1, 0];
	const step = Math.ceil(max / 4);
	const top = step * 4;
	return [top, step * 3, step * 2, step, 0];
}
