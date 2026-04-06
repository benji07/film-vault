import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"bg-surface-alt border border-border rounded-[10px] py-2.5 px-3.5",
				"text-text-primary text-sm outline-none transition-colors font-body",
				"focus:border-accent",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-text-muted",
				"resize-y min-h-[80px]",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
