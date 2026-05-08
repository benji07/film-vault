import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:bg-text data-[state=unchecked]:bg-line",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block h-5 w-5 rounded-full bg-bg shadow-sm ring-0 transition-transform",
					"data-[state=checked]:translate-x-[22px]",
					"data-[state=unchecked]:translate-x-0.5",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
