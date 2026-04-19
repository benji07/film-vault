import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ListButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function ListButton({ className, ...props }: ListButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"flex items-center gap-3 p-2.5 rounded-[10px] bg-surface-alt border border-dashed border-border text-left transition-all duration-200 hover:border-solid hover:border-accent hover:-translate-y-[1px] hover:rotate-[0.3deg] cursor-pointer",
				className,
			)}
			{...props}
		/>
	);
}

export type { ListButtonProps };
export { ListButton };
