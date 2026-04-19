import { alpha } from "@/constants/theme";
import type { LucideIcon } from "@/types";
import { useCountUp } from "@/utils/useCountUp";

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: string | number;
	color?: string;
	tilt?: number;
}

export function StatCard({ icon: Icon, label, value, color = "var(--color-accent)", tilt = 0 }: StatCardProps) {
	const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10);
	const isNumeric = !Number.isNaN(numericValue);
	const animated = useCountUp(isNumeric ? numericValue : 0);
	const suffix = isNumeric && typeof value === "string" ? value.replace(/[\d]+/, "") : "";

	return (
		<div
			className="relative bg-card border-2 rounded-[18px] py-4 px-4 flex-1 min-w-0 flex flex-col items-start gap-2"
			style={{
				borderColor: alpha(color, 0.55),
				boxShadow: `0 6px 18px rgba(0,0,0,0.18), inset 0 0 0 2px ${alpha(color, 0.08)}`,
				transform: `rotate(${tilt}deg)`,
			}}
		>
			{/* Corner ornaments — tarot/flashcard feel */}
			<span
				className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 rounded-tl-[6px]"
				style={{ borderColor: alpha(color, 0.6) }}
				aria-hidden="true"
			/>
			<span
				className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 rounded-tr-[6px]"
				style={{ borderColor: alpha(color, 0.6) }}
				aria-hidden="true"
			/>
			<span
				className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 rounded-bl-[6px]"
				style={{ borderColor: alpha(color, 0.6) }}
				aria-hidden="true"
			/>
			<span
				className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 rounded-br-[6px]"
				style={{ borderColor: alpha(color, 0.6) }}
				aria-hidden="true"
			/>

			<div className="flex items-center gap-2">
				<div
					className="w-7 h-7 rounded-full flex items-center justify-center"
					style={{ background: alpha(color, 0.12) }}
				>
					<Icon size={14} color={color} />
				</div>
				<span className="text-[10px] tracking-[0.2em] uppercase text-text-muted font-body font-semibold">{label}</span>
			</div>

			<span className="font-display leading-none text-text-primary mt-1" style={{ fontSize: 52, color }}>
				{isNumeric ? `${animated}${suffix}` : value}
			</span>
		</div>
	);
}
