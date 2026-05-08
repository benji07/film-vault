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
			{label && <label className="text-xs font-medium text-text-2">{label}</label>}
			{children}
		</div>
	);
}

export { FormField };
