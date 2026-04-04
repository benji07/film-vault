import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
	style?: CSSProperties;
}

export function Card({ children, onClick, className, style = {} }: CardProps) {
	return (
		<div
			onClick={onClick}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter") onClick();
						}
					: undefined
			}
			className={cn(
				"bg-card border border-border rounded-[14px] p-4 transition-all",
				onClick && "cursor-pointer",
				className,
			)}
			style={style}
		>
			{children}
		</div>
	);
}
