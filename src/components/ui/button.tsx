import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
	children: ReactNode;
	variant?: ButtonVariant;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	small?: boolean;
	style?: CSSProperties;
}

const variants: Record<ButtonVariant, string> = {
	primary: "bg-accent text-white hover:bg-accent-hover",
	secondary: "bg-surface-alt text-text-primary border border-border",
	ghost: "bg-transparent text-text-sec",
	danger: "bg-accent-soft text-accent",
};

export function Button({ children, variant = "primary", onClick, disabled, className, small, style }: ButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex items-center gap-1.5 border-none cursor-pointer font-body font-semibold rounded-xl transition-all",
				small ? "py-1.5 px-3 text-xs" : "py-2.5 px-4.5 text-[13px]",
				disabled && "opacity-40 cursor-not-allowed",
				variants[variant],
				className,
			)}
			onClick={onClick}
			disabled={disabled}
			style={style}
		>
			{children}
		</button>
	);
}
