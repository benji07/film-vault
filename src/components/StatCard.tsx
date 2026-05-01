import { cn } from "@/lib/utils";
import type { LucideIcon } from "@/types";
import { useCountUp } from "@/utils/useCountUp";

interface StatCardProps {
	icon?: LucideIcon;
	label: string;
	value: string | number;
	hint?: string;
	color?: string;
	className?: string;
}

/**
 * Big stat tile : ink panel with a colored top stripe and shadow,
 * archivo-black big number, archivo uppercase label, caveat hint.
 */
export function StatCard({
	icon: Icon,
	label,
	value,
	hint,
	color = "var(--color-kodak-yellow)",
	className,
}: StatCardProps) {
	const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10);
	const isNumeric = !Number.isNaN(numericValue) && /^\d/.test(String(value));
	const animated = useCountUp(isNumeric ? numericValue : 0);
	const suffix = isNumeric && typeof value === "string" ? value.replace(/^\d+/, "") : "";

	return (
		<div
			className={cn("relative bg-ink text-paper border-2 border-ink overflow-hidden px-3.5 py-3", className)}
			style={{ boxShadow: `4px 4px 0 ${color}` }}
		>
			<div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
			<div className="flex items-center gap-2 mb-1">
				{Icon && <Icon size={12} color={color} className="opacity-70" />}
				<div className="font-archivo font-extrabold text-[9px] uppercase tracking-[0.18em] text-paper/65">{label}</div>
			</div>
			<div className="font-archivo-black text-[28px] leading-none tracking-[-0.5px] tabular-nums" style={{ color }}>
				{isNumeric ? `${animated}${suffix}` : value}
			</div>
			{hint && (
				<div className="font-caveat text-[14px] mt-1.5 leading-tight" style={{ color }}>
					{hint}
				</div>
			)}
		</div>
	);
}
