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

export function StatCard({ icon: Icon, label, value, hint, color, className }: StatCardProps) {
	const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10);
	const isNumeric = !Number.isNaN(numericValue) && /^\d/.test(String(value));
	const animated = useCountUp(isNumeric ? numericValue : 0);
	const suffix = isNumeric && typeof value === "string" ? value.replace(/^\d+/, "") : "";
	const valueColor = color ?? "var(--color-text)";

	return (
		<div className={cn("bg-surface rounded-[14px] px-4 py-3.5", className)}>
			<div className="flex items-center gap-2 mb-1.5">
				{Icon && <Icon size={14} className="text-text-3" />}
				<div className="text-[11px] uppercase tracking-wider text-text-3 font-medium">{label}</div>
			</div>
			<div className="text-[28px] font-semibold leading-none tracking-tight tabular-nums" style={{ color: valueColor }}>
				{isNumeric ? `${animated}${suffix}` : value}
			</div>
			{hint && <div className="text-sm mt-1.5 leading-tight text-text-2">{hint}</div>}
		</div>
	);
}
