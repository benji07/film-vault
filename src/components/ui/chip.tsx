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
				"py-2.5 px-4 rounded-full border cursor-pointer text-xs font-semibold font-body whitespace-nowrap transition-all duration-200 min-h-[44px]",
				active
					? "bg-accent text-[#1a2230] border-accent -rotate-[0.8deg] shadow-[0_2px_8px_rgba(232,155,74,0.25)]"
					: "bg-surface-alt text-text-sec border-dashed border-border hover:border-accent hover:text-text-primary",
				className,
			)}
			{...props}
		/>
	);
}

export { Chip };
