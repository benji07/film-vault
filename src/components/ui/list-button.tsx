import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ListButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function ListButton({ className, ...props }: ListButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"flex items-center gap-3 p-3 bg-surface rounded-[10px] text-left cursor-pointer transition-colors",
				"hover:bg-surface-2",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
				className,
			)}
			{...props}
		/>
	);
}

export type { ListButtonProps };
export { ListButton };
