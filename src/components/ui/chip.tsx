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
				"py-2.5 px-4 rounded-full border-none cursor-pointer text-xs font-semibold font-body whitespace-nowrap transition-all min-h-[44px]",
				active ? "bg-accent text-white" : "bg-surface-alt text-text-sec",
				className,
			)}
			{...props}
		/>
	);
}

export { Chip };
