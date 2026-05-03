import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ListButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function ListButton({ className, ...props }: ListButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"flex items-center gap-3 p-3 bg-paper-card border-2 border-ink text-left cursor-pointer",
				"shadow-[3px_3px_0_var(--color-ink)] transition-all",
				"hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)]",
				"active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--color-ink)]",
				className,
			)}
			{...props}
		/>
	);
}

export type { ListButtonProps };
export { ListButton };
