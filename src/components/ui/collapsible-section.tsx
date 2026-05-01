import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
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
	const panelId = useId();

	return (
		<div
			className={cn("border-2 border-ink bg-paper-card overflow-hidden shadow-[3px_3px_0_var(--color-ink)]", className)}
		>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-controls={panelId}
				className="flex items-center gap-2.5 w-full px-4 py-3 hover:bg-paper-dark/40 transition-colors cursor-pointer text-left"
			>
				{Icon && <Icon size={16} className="text-ink-soft shrink-0" />}
				<span className="font-archivo-black text-[12px] uppercase tracking-[0.12em] text-ink flex-1">{title}</span>
				{count != null && count > 0 && (
					<span className="font-archivo-black text-[10px] text-ink bg-kodak-yellow px-1.5 py-0.5 border-[1.5px] border-ink">
						{count}
					</span>
				)}
				<ChevronDown
					size={16}
					className={cn("text-ink-soft shrink-0 transition-transform duration-200", open && "rotate-180")}
				/>
			</button>
			<section
				id={panelId}
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="overflow-hidden">
					<div className="px-4 pb-4 pt-2 border-t border-dashed border-ink-faded/40">{children}</div>
				</div>
			</section>
		</div>
	);
}
