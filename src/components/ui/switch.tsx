import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center border-2 border-ink transition-colors rounded-none",
				"shadow-[2px_2px_0_var(--color-ink)]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kodak-yellow focus-visible:ring-offset-1",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:bg-kodak-red data-[state=unchecked]:bg-paper-dark",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block h-4 w-4 ring-0 transition-transform",
					"data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-paper",
					"data-[state=unchecked]:translate-x-[2px] data-[state=unchecked]:bg-ink",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
