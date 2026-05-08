import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"bg-surface ring-1 ring-line rounded-[10px] py-2 px-3",
				"text-base text-text outline-none transition-shadow",
				"focus:ring-2 focus:ring-text",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-text-3",
				"resize-y min-h-[80px]",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
