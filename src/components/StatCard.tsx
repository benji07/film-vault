import type { LucideIcon } from "@/types";
import { useCountUp } from "@/utils/useCountUp";

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: string | number;
	color?: string;
}

export function StatCard({ icon: Icon, label, value, color = "var(--color-accent)" }: StatCardProps) {
	const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10);
	const isNumeric = !Number.isNaN(numericValue);
	const animated = useCountUp(isNumeric ? numericValue : 0);
	const suffix = isNumeric && typeof value === "string" ? value.replace(/[\d]+/, "") : "";

	return (
		<div className="bg-card border border-border rounded-[14px] py-3.5 px-4 flex-1 min-w-0">
			<div className="flex items-center gap-2 mb-1.5">
				<div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
					<Icon size={14} color={color} />
				</div>
				<span className="text-[11px] text-text-muted font-body font-semibold">{label}</span>
			</div>
			<span className="text-[26px] font-bold font-mono text-text-primary tabular-nums">
				{isNumeric ? `${animated}${suffix}` : value}
			</span>
		</div>
	);
}
