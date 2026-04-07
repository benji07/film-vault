import type { HTMLAttributes, ReactNode } from "react";
import { alpha } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "@/types";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
	icon?: LucideIcon;
	color: string;
	children: ReactNode;
}

function Alert({ icon: Icon, color, className, children, ...props }: AlertProps) {
	return (
		<div
			className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body", className)}
			style={{ color, background: alpha(color, 0.07) }}
			{...props}
		>
			{Icon && <Icon size={14} />}
			{children}
		</div>
	);
}

export type { AlertProps };
export { Alert };
