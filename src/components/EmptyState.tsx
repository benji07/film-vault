import type { ReactNode } from "react";
import type { LucideIcon } from "@/types";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	subtitle?: string;
	action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center py-12 px-6 gap-3">
			<div className="w-14 h-14 bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] -rotate-2 flex items-center justify-center">
				<Icon size={22} className="text-ink-soft" />
			</div>
			<span className="font-caveat text-[22px] text-ink leading-tight">{title}</span>
			{subtitle && (
				<span className="font-cormorant text-[14px] text-ink-faded text-center italic max-w-[280px]">{subtitle}</span>
			)}
			{action}
		</div>
	);
}
