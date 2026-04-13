import { ChevronRight } from "lucide-react";
import { alpha } from "@/constants/theme";
import type { LucideIcon } from "@/types";

interface TodoItemProps {
	icon: LucideIcon;
	label: string;
	color: string;
	onClick: () => void;
}

export function TodoItem({ icon: Icon, label, color, onClick }: TodoItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3 w-full text-left transition-all hover:border-text-muted cursor-pointer"
		>
			<div
				className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
				style={{ background: alpha(color, 0.1) }}
			>
				<Icon size={16} color={color} />
			</div>
			<span className="text-[13px] text-text-primary font-body font-medium">{label}</span>
			<ChevronRight size={16} className="text-text-muted ml-auto shrink-0" />
		</button>
	);
}
