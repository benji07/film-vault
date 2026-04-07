import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center gap-1.5 border-none cursor-pointer font-body font-semibold rounded-xl transition-all justify-center whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "bg-accent text-white hover:bg-accent-hover",
				outline: "bg-surface-alt text-text-primary border border-border",
				ghost: "bg-transparent text-text-sec",
				destructive: "bg-accent-soft text-accent",
			},
			size: {
				default: "py-2.5 px-4.5 text-[13px] min-h-[44px]",
				sm: "py-2 px-3 text-xs min-h-[44px]",
				icon: "p-0 w-10 h-10 min-h-[40px]",
				"icon-sm": "p-0 w-9 h-9 min-h-[36px]",
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
