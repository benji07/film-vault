import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"bg-surface ring-1 ring-line rounded-[10px] px-3 py-2",
				"text-base text-text outline-none transition-shadow",
				"focus:ring-2 focus:ring-text",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-text-3",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
