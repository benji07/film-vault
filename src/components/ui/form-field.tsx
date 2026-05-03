import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
	label?: string;
	children: ReactNode;
	className?: string;
}

function FormField({ label, children, className }: FormFieldProps) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			{label && (
				<label className="text-[9px] font-extrabold text-ink-faded font-archivo uppercase tracking-[0.18em]">
					{label}
				</label>
			)}
			{children}
		</div>
	);
}

export { FormField };
