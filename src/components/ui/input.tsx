import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"bg-paper-card/60 border-[1.5px] border-ink rounded-none px-3 py-2",
				"shadow-[2px_2px_0_var(--color-ink)]",
				"font-cormorant text-[16px] text-ink outline-none transition-colors",
				"focus:border-kodak-yellow focus:shadow-[2px_2px_0_var(--color-kodak-yellow)]",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-ink-faded placeholder:italic",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
