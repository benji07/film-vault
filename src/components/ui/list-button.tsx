import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ListButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function ListButton({ className, ...props }: ListButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"flex items-center gap-3 p-2.5 rounded-[10px] bg-surface-alt border border-border text-left transition-colors hover:border-accent cursor-pointer",
				className,
			)}
			{...props}
		/>
	);
}

export type { ListButtonProps };
export { ListButton };
