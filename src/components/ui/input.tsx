import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"bg-surface-alt border border-dashed border-border rounded-[10px] py-2.5 px-3.5",
				"text-text-primary text-sm outline-none transition-colors font-body",
				"focus:border-solid focus:border-accent focus:shadow-[0_2px_0_var(--color-accent-soft)]",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-text-muted placeholder:italic placeholder:font-serif",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
