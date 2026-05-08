import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	active?: boolean;
}

function Chip({ active, className, ...props }: ChipProps) {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer whitespace-nowrap rounded-full",
				"text-xs font-medium leading-none transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
				active ? "bg-text text-bg" : "bg-surface-2 text-text-2 hover:bg-line",
				className,
			)}
			{...props}
		/>
	);
}

export { Chip };
