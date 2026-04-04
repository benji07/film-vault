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
			<div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center">
				<Icon size={24} className="text-text-muted" />
			</div>
			<span className="text-base font-semibold text-text-sec font-body">{title}</span>
			{subtitle && <span className="text-[13px] text-text-muted font-body text-center">{subtitle}</span>}
			{action}
		</div>
	);
}
