import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrushDivider } from "./brush-divider";

export interface ScreenTitleProps {
	kicker?: string;
	title: ReactNode;
	hint?: ReactNode;
	icon?: ReactNode;
	className?: string;
	size?: "md" | "lg";
	underlineClassName?: string;
}

export function ScreenTitle({
	kicker,
	title,
	hint,
	icon,
	className,
	size = "lg",
	underlineClassName,
}: ScreenTitleProps) {
	return (
		<div className={cn("flex flex-col items-start gap-1 mb-4", className)}>
			{kicker && (
				<span className="text-[11px] tracking-[0.2em] uppercase text-text-muted font-body font-semibold">{kicker}</span>
			)}
			<div className="flex items-end gap-2 max-w-full">
				{icon}
				<h1
					className={cn(
						"font-display text-text-primary m-0 leading-[0.95]",
						size === "lg" ? "text-[44px]" : "text-[32px]",
					)}
				>
					{title}
				</h1>
			</div>
			<BrushDivider className={cn("text-accent -mt-1 w-[min(220px,70%)]", underlineClassName)} thickness={3} />
			{hint && <p className="text-xs text-text-sec font-serif italic mt-1">{hint}</p>}
		</div>
	);
}
