import { Camera, Film as FilmIcon, Focus, NotebookPen, Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "@/types";

interface FloatingActionMenuProps {
	visible: boolean;
	onAddFilm: () => void;
	onAddCamera: () => void;
	onAddLens: () => void;
	onAddBack: () => void;
	onQuickShot: () => void;
}

export function FloatingActionMenu({
	visible,
	onAddFilm,
	onAddCamera,
	onAddLens,
	onAddBack,
	onQuickShot,
}: FloatingActionMenuProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	useEffect(() => {
		if (!visible) setOpen(false);
	}, [visible]);

	if (!visible) return null;

	const run = (handler: () => void) => {
		setOpen(false);
		handler();
	};

	const items: { id: string; icon: LucideIcon; label: string; onClick: () => void; primary?: boolean }[] = [
		{ id: "quickShot", icon: NotebookPen, label: t("fab.quickShot"), onClick: () => run(onQuickShot), primary: true },
		{ id: "film", icon: FilmIcon, label: t("fab.film"), onClick: () => run(onAddFilm) },
		{ id: "camera", icon: Camera, label: t("fab.camera"), onClick: () => run(onAddCamera) },
		{ id: "back", icon: Package, label: t("fab.back"), onClick: () => run(onAddBack) },
		{ id: "lens", icon: Focus, label: t("fab.lens"), onClick: () => run(onAddLens) },
	];

	return (
		<>
			{open && (
				<button
					type="button"
					aria-label={t("aria.close")}
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm animate-backdrop-fade-in cursor-default"
				/>
			)}

			{open && (
				<div className="fixed z-40 right-4 md:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom)+4rem)] md:bottom-[5.5rem] flex flex-col-reverse gap-3 items-end">
					{items.map((item, i) => (
						<SpeedDialItem
							key={item.id}
							icon={item.icon}
							label={item.label}
							onClick={item.onClick}
							primary={item.primary}
							delayMs={i * 30}
						/>
					))}
				</div>
			)}

			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label={open ? t("aria.close") : t("fab.openMenu")}
				aria-expanded={open}
				className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent-hover shadow-lg flex items-center justify-center text-white transition-colors"
			>
				<Plus
					size={24}
					strokeWidth={2.5}
					className={`transition-transform duration-200 ease-out ${open ? "rotate-45" : ""}`}
				/>
			</button>
		</>
	);
}

interface SpeedDialItemProps {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	primary?: boolean;
	delayMs: number;
}

function SpeedDialItem({ icon: Icon, label, onClick, primary, delayMs }: SpeedDialItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 animate-stagger-item"
			style={{ animationDelay: `${delayMs}ms` }}
		>
			<span className="bg-surface border border-border rounded-full px-3 py-1.5 text-sm font-semibold text-text-primary shadow-md whitespace-nowrap">
				{label}
			</span>
			<span
				className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center ${
					primary ? "bg-accent text-white" : "bg-surface-alt border border-border text-text-primary"
				}`}
			>
				<Icon size={20} />
			</span>
		</button>
	);
}
