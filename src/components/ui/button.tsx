import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	[
		"inline-flex items-center gap-1.5 cursor-pointer justify-center whitespace-nowrap",
		"font-medium",
		"rounded-[10px]",
		"transition-colors duration-150",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
		"disabled:opacity-50 disabled:cursor-not-allowed",
	].join(" "),
	{
		variants: {
			variant: {
				default: "bg-text text-bg hover:bg-text-2",
				primary: "bg-text text-bg hover:bg-text-2",
				secondary: "bg-surface-2 text-text hover:bg-line",
				kodak: "bg-text text-bg hover:bg-text-2",
				outline: "bg-surface text-text ring-1 ring-line hover:bg-surface-2",
				ghost: "bg-transparent text-text hover:bg-surface-2",
				destructive: "bg-accent text-bg hover:bg-accent-hover",
			},
			size: {
				default: "py-2.5 px-4 text-sm min-h-[42px]",
				sm: "py-2 px-3 text-xs min-h-[36px]",
				icon: "p-0 w-11 h-11 min-w-[44px] min-h-[44px] text-base",
				"icon-sm": "p-0 w-9 h-9 min-w-[36px] min-h-[36px] text-sm",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return <Comp type="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
