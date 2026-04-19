import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-dashed border-border transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:bg-accent data-[state=checked]:border-solid data-[state=checked]:border-accent data-[state=unchecked]:bg-surface-alt",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block h-[18px] w-[18px] rounded-full shadow-lg ring-0 transition-transform",
					"data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-[#f4ead4]",
					"data-[state=unchecked]:translate-x-[2px] data-[state=unchecked]:bg-text-muted",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
