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
			<div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center">
				<Icon size={24} className="text-text-3" />
			</div>
			<span className="text-lg font-semibold text-text leading-tight mt-1">{title}</span>
			{subtitle && <span className="text-sm text-text-3 text-center max-w-[280px] leading-snug">{subtitle}</span>}
			{action}
		</div>
	);
}
