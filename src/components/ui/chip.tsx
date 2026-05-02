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
				"inline-flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer whitespace-nowrap",
				"font-archivo font-bold text-[10px] uppercase tracking-[0.1em] leading-none",
				"border-[1.5px] border-ink text-ink rounded-none",
				"transition-all duration-150",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kodak-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
				active
					? "bg-kodak-yellow shadow-[3px_3px_0_var(--color-ink)] -translate-x-px -translate-y-px"
					: "bg-transparent shadow-[2px_2px_0_var(--color-ink)] hover:bg-paper-dark/30",
				className,
			)}
			{...props}
		/>
	);
}

export { Chip };
