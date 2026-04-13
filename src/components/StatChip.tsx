import { alpha } from "@/constants/theme";
import type { LucideIcon } from "@/types";

interface StatChipProps {
	icon: LucideIcon;
	label: string;
	value: number;
	color: string;
	onClick?: () => void;
}

export function StatChip({ icon: Icon, label, value, color, onClick }: StatChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2 bg-card border border-border rounded-full pl-2.5 pr-3.5 py-2 shrink-0 transition-all hover:border-text-muted cursor-pointer"
		>
			<div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: alpha(color, 0.12) }}>
				<Icon size={12} color={color} />
			</div>
			<span className="text-xs text-text-sec font-body font-medium whitespace-nowrap">{label}</span>
			<span className="text-sm font-bold font-mono text-text-primary tabular-nums">{value}</span>
		</button>
	);
}
