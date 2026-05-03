import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 px-2 py-0.5 font-archivo font-extrabold text-[9px] uppercase tracking-[0.15em] leading-none border-[1.5px]",
	{
		variants: {
			variant: {
				default: "bg-kodak-yellow text-ink border-ink",
				ink: "bg-ink text-paper border-ink",
				red: "bg-kodak-red text-paper border-ink",
				teal: "bg-kodak-teal text-paper border-ink",
				gold: "bg-kodak-gold text-ink border-ink",
				outline: "bg-transparent text-ink border-ink-faded",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
