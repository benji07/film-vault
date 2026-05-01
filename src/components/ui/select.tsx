import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root {...props} />;
}

function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-auto w-full items-center justify-between gap-2",
				"bg-paper-card/60 border-[1.5px] border-ink py-2 px-3 rounded-none",
				"shadow-[2px_2px_0_var(--color-ink)]",
				"font-cormorant text-[15px] text-ink outline-none transition-colors",
				"focus:border-kodak-yellow focus:shadow-[2px_2px_0_var(--color-kodak-yellow)]",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"[&>span]:truncate",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className="h-4 w-4 shrink-0 text-ink-faded" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "popper",
	...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					"relative z-[1001] max-h-[300px] min-w-[8rem] overflow-hidden",
					"bg-paper-card border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-none",
					"data-[state=open]:animate-in data-[state=closed]:animate-out",
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						"p-1",
						position === "popper" &&
							"h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"relative flex w-full cursor-pointer select-none items-center py-2 pl-8 pr-3",
				"font-cormorant text-[15px] text-ink outline-none",
				"focus:bg-kodak-yellow/30 hover:bg-kodak-yellow/30",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<Check className="h-4 w-4 text-kodak-red" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value {...props} />;
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
