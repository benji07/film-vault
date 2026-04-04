import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SheetProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[1000] flex items-end justify-center" onClick={onClose} onKeyDown={undefined}>
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
			<div
				onClick={(e) => e.stopPropagation()}
				onKeyDown={undefined}
				className="relative w-full max-w-[480px] max-h-[85vh] overflow-auto bg-surface rounded-t-[20px] px-5 pt-6 pb-8 border border-border border-b-0"
			>
				<div className="flex justify-between items-center mb-5">
					<span className="font-display text-[22px] text-text-primary italic">{title}</span>
					<button
						type="button"
						onClick={onClose}
						className="bg-surface-alt border-none rounded-[10px] w-9 h-9 flex items-center justify-center cursor-pointer"
					>
						<X size={16} className="text-text-muted" />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
