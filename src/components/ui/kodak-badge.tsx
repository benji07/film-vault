import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface KodakBadgeProps extends HTMLAttributes<HTMLSpanElement> {
	size?: "xs" | "sm";
}

/** Pill neutre — l'identité Kodak Gold a été retirée du thème. */
export function KodakBadge({ children, size = "sm", className, ...props }: KodakBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center bg-surface-2 text-text font-medium rounded-full",
				size === "xs" ? "text-[10px] px-1.5 py-px" : "text-xs px-2 py-0.5",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
