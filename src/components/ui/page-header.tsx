import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	count?: number | string;
	right?: ReactNode;
	children?: ReactNode;
	className?: string;
}

export function PageHeader({ title, count, right, children, className }: PageHeaderProps) {
	return (
		<header className={cn("sticky top-0 z-30 bg-bg/85 backdrop-blur-md", className)}>
			<div className="flex items-center gap-2.5 px-4 pt-3 md:pt-5 pb-3">
				<h1 className="text-2xl font-semibold leading-none text-text tracking-tight flex-shrink-0">
					{title}
					{count != null && (
						<span className="text-sm font-normal text-text-3 ml-2">
							{typeof count === "number" ? String(count).padStart(2, "0") : count}
						</span>
					)}
				</h1>
				{right && <div className="flex-1 flex items-center justify-end gap-2 min-w-0">{right}</div>}
			</div>
			{children}
		</header>
	);
}
