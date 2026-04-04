import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-body tracking-wide",
	{
		variants: {
			variant: {
				default: "",
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
