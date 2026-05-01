import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"bg-paper-card/60 border-[1.5px] border-ink rounded-none py-2 px-3",
				"shadow-[2px_2px_0_var(--color-ink)]",
				"font-cormorant text-[16px] text-ink outline-none transition-colors",
				"focus:border-kodak-yellow focus:shadow-[2px_2px_0_var(--color-kodak-yellow)]",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"placeholder:text-ink-faded placeholder:italic",
				"resize-y min-h-[80px]",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
