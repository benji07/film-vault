import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StampProps {
	children: ReactNode;
	color?: string;
	className?: string;
	rotate?: number;
	size?: "sm" | "md";
}

export function Stamp({ children, color = "var(--color-accent)", className, rotate = -6, size = "md" }: StampProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center font-display uppercase tracking-wider leading-none select-none",
				"border-2 rounded-md px-2 py-1",
				size === "sm" ? "text-[11px] border" : "text-[13px]",
				className,
			)}
			style={{
				color,
				borderColor: color,
				transform: `rotate(${rotate}deg)`,
				boxShadow: `inset 0 0 0 1px ${color}22`,
				textShadow: `0 0 1px ${color}33`,
			}}
		>
			{children}
		</span>
	);
}
