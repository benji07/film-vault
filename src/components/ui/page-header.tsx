import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	count?: number | string;
	right?: ReactNode;
	children?: ReactNode;
	className?: string;
}

/**
 * Header standard à 2 niveaux :
 *   1. Ligne titre compact (titre Caveat, badge compteur Archivo Black rouge,
 *      slot droit pour élément contextuel)
 *   2. Ligne contextuelle optionnelle (chips, tabs, switch — passée en children)
 *
 * Sticky par défaut avec dégradé de fond papier qui s'estompe.
 */
export function PageHeader({ title, count, right, children, className }: PageHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-10",
				"bg-[linear-gradient(to_bottom,var(--color-paper)_95%,rgba(241,232,212,0.92))]",
				className,
			)}
		>
			<div className="flex items-center gap-2.5 px-4 pt-4 pb-2.5 pl-[18px] pr-3.5">
				<h1 className="font-caveat font-bold text-[28px] leading-none text-ink tracking-[-0.5px] flex-shrink-0">
					{title}
					{count != null && (
						<span className="font-archivo-black text-[11px] text-kodak-red ml-1.5 tracking-wider">
							·{typeof count === "number" ? String(count).padStart(2, "0") : count}
						</span>
					)}
				</h1>
				{right && <div className="flex-1 flex items-center justify-end gap-2 min-w-0">{right}</div>}
			</div>
			{children}
		</header>
	);
}
