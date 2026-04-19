import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center gap-1.5 border-none cursor-pointer font-body font-semibold rounded-xl transition-all duration-200 justify-center whitespace-nowrap hover:-translate-y-[1px] active:translate-y-0",
	{
		variants: {
			variant: {
				default:
					"bg-accent text-[#1a2230] shadow-[0_3px_0_rgba(0,0,0,0.2),0_6px_14px_rgba(232,155,74,0.28)] hover:bg-accent-hover hover:rotate-[-0.4deg] active:shadow-[0_1px_0_rgba(0,0,0,0.2),0_3px_6px_rgba(232,155,74,0.2)]",
				outline:
					"bg-surface-alt text-text-primary border border-dashed border-border hover:border-accent hover:text-accent",
				ghost: "bg-transparent text-text-sec hover:text-text-primary",
				destructive:
					"bg-orange-soft text-orange border border-dashed border-orange/40 hover:bg-orange hover:text-[#1a2230]",
			},
			size: {
				default: "py-2.5 px-4.5 text-[13px] min-h-[44px]",
				sm: "py-2 px-3 text-xs min-h-[44px]",
				icon: "p-0 w-11 h-11 min-w-[44px] min-h-[44px]",
				"icon-sm": "p-0 w-11 h-11 min-w-[44px] min-h-[44px]",
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
