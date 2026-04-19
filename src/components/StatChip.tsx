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
			className="flex items-center gap-2 bg-card border-2 border-dashed rounded-full pl-2.5 pr-3.5 py-2 shrink-0 transition-all hover:-rotate-1 hover:border-solid cursor-pointer"
			style={{ borderColor: alpha(color, 0.45) }}
		>
			<div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: alpha(color, 0.14) }}>
				<Icon size={12} color={color} />
			</div>
			<span className="text-xs text-text-sec font-body font-medium whitespace-nowrap">{label}</span>
			<span className="font-display text-xl leading-none" style={{ color }}>
				{value}
			</span>
		</button>
	);
}
