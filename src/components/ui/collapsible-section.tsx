import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "@/types";

interface CollapsibleSectionProps {
	icon?: LucideIcon;
	title: string;
	count?: number;
	defaultOpen?: boolean;
	children: ReactNode;
	className?: string;
}

export function CollapsibleSection({
	icon: Icon,
	title,
	count,
	defaultOpen = false,
	children,
	className,
}: CollapsibleSectionProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className={cn("border border-border rounded-[14px] overflow-hidden", className)}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex items-center gap-2.5 w-full px-4 py-3 bg-card hover:bg-card-hover transition-colors cursor-pointer text-left"
			>
				{Icon && <Icon size={16} className="text-text-sec shrink-0" />}
				<span className="text-[13px] font-semibold text-text-primary font-body flex-1">{title}</span>
				{count != null && count > 0 && (
					<span className="text-[11px] font-mono font-bold text-text-muted bg-surface-alt rounded-full px-2 py-0.5">
						{count}
					</span>
				)}
				<ChevronDown
					size={16}
					className={cn("text-text-muted shrink-0 transition-transform duration-200", open && "rotate-180")}
				/>
			</button>
			<div
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="overflow-hidden">
					<div className="px-4 pb-4 pt-2">{children}</div>
				</div>
			</div>
		</div>
	);
}
