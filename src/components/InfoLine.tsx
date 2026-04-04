import type { LucideIcon } from "@/types";

interface InfoLineProps {
	icon: LucideIcon;
	label: string;
	value: string | number;
	warn?: boolean;
}

export function InfoLine({ icon: Icon, label, value, warn }: InfoLineProps) {
	return (
		<div className="flex items-center gap-2.5 py-1">
			<Icon size={14} className={warn ? "text-accent" : "text-text-muted"} />
			<span className="text-xs text-text-muted font-body min-w-[80px]">{label}</span>
			<span className={`text-[13px] font-mono font-medium ${warn ? "text-accent" : "text-text-primary"}`}>{value}</span>
		</div>
	);
}
