import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	[
		"inline-flex items-center gap-1.5 cursor-pointer justify-center whitespace-nowrap",
		"font-archivo font-extrabold uppercase tracking-[0.12em]",
		"border-2 border-ink rounded-none",
		"shadow-[3px_3px_0_var(--color-ink)]",
		"transition-all duration-150",
		"hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)]",
		"active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--color-ink)]",
		"disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0",
	].join(" "),
	{
		variants: {
			variant: {
				default: "bg-kodak-red text-paper",
				primary: "bg-kodak-red text-paper",
				secondary: "bg-paper-card text-ink",
				kodak: "bg-kodak-yellow text-ink",
				outline: "bg-paper-card text-ink",
				ghost:
					"bg-transparent text-ink border-transparent shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none hover:bg-paper-dark/60",
				destructive: "bg-kodak-red text-paper",
			},
			size: {
				default: "py-2.5 px-4 text-[11px] min-h-[42px]",
				sm: "py-2 px-3 text-[10px] min-h-[36px]",
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
