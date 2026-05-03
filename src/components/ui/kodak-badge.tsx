import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface KodakBadgeProps extends HTMLAttributes<HTMLSpanElement> {
	size?: "xs" | "sm";
}

export function KodakBadge({ children, size = "sm", className, ...props }: KodakBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center font-archivo-black bg-ink text-kodak-yellow tracking-[0.05em]",
				size === "xs" ? "text-[9px] px-1 py-px" : "text-[11px] px-1.5 py-0.5",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
