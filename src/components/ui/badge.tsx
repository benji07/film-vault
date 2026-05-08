import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 px-2 py-0.5 font-medium text-xs leading-tight rounded-full", {
	variants: {
		variant: {
			default: "bg-surface-2 text-text",
			ink: "bg-text text-bg",
			red: "bg-accent text-bg",
			teal: "bg-fill-2 text-text",
			gold: "bg-fill-1 text-text",
			outline: "bg-transparent text-text-2 ring-1 ring-line",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
