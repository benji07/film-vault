import { Camera, Film as FilmIcon, Focus, NotebookPen, Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "@/types";

export type FabContext =
	| "dashboard"
	| "stock"
	| "filmDetail"
	| "gear_cameras"
	| "gear_lenses"
	| "gear_backs"
	| "stats"
	| "default";

interface FloatingActionMenuProps {
	visible: boolean;
	context?: FabContext;
	onAddFilm: () => void;
	onAddCamera: () => void;
	onAddLens: () => void;
	onAddBack: () => void;
	onQuickShot: () => void;
}

type ActionId = "shot" | "roll" | "camera" | "lens" | "back";

interface ActionDef {
	id: ActionId;
	icon: LucideIcon;
	labelKey: string;
}

const ACTION_DEFS: Record<ActionId, ActionDef> = {
	roll: { id: "roll", icon: FilmIcon, labelKey: "fab.film" },
	shot: { id: "shot", icon: NotebookPen, labelKey: "fab.quickShot" },
	camera: { id: "camera", icon: Camera, labelKey: "fab.camera" },
	lens: { id: "lens", icon: Focus, labelKey: "fab.lens" },
	back: { id: "back", icon: Package, labelKey: "fab.back" },
};

const PRIORITY: Record<FabContext, ActionId[]> = {
	dashboard: ["shot", "roll", "camera", "lens"],
	stock: ["roll", "shot", "camera", "lens"],
	filmDetail: ["shot", "roll", "camera", "lens"],
	gear_cameras: ["camera", "lens", "roll", "shot"],
	gear_lenses: ["lens", "camera", "roll", "shot"],
	gear_backs: ["back", "camera", "roll", "shot"],
	stats: ["roll", "shot", "camera", "lens"],
	default: ["shot", "roll", "camera", "lens"],
};

export function FloatingActionMenu({
	visible,
	context = "default",
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally close menu on context change
	useEffect(() => {
		setOpen(false);
	}, [context]);

	useEffect(() => {
		if (!visible) setOpen(false);
	}, [visible]);

	if (!visible) return null;

	const order = PRIORITY[context] ?? PRIORITY.default;
	const handlerFor = (id: ActionId): (() => void) => {
		if (id === "shot") return onQuickShot;
		if (id === "roll") return onAddFilm;
		if (id === "camera") return onAddCamera;
		if (id === "lens") return onAddLens;
		return onAddBack;
	};
	const fire = (id: ActionId) => {
		setOpen(false);
		handlerFor(id)();
	};

	return (
		<>
			{open && (
				<button
					type="button"
					aria-label={t("aria.close")}
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-30 bg-text/35 backdrop-blur-sm animate-backdrop-fade-in cursor-default"
				/>
			)}

			{open && (
				<div className="fixed z-40 right-5 md:right-8 bottom-[calc(7rem+env(safe-area-inset-bottom)+4.5rem)] md:bottom-[8.5rem] flex flex-col gap-3 items-end">
					{order.map((id, i) => {
						const action = ACTION_DEFS[id];
						const isPrimary = i === 0;
						const last = i === order.length - 1;
						return (
							<SpeedDialItem
								key={id}
								action={action}
								label={t(action.labelKey)}
								onClick={() => fire(id)}
								primary={isPrimary}
								delayMs={i * 50}
								extraMargin={last}
							/>
						);
					})}
				</div>
			)}

			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label={open ? t("aria.close") : t("fab.openMenu")}
				aria-expanded={open}
				className={cn(
					"fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] right-5 md:bottom-8 md:right-8 z-40",
					"w-14 h-14 rounded-full flex items-center justify-center cursor-pointer",
					"shadow-lg transition-transform duration-200 ease-out",
					open ? "bg-surface-2 text-text rotate-45" : "bg-accent text-bg hover:bg-accent-hover",
				)}
			>
				<Plus size={26} strokeWidth={2.4} />
			</button>
		</>
	);
}

interface SpeedDialItemProps {
	action: ActionDef;
	label: string;
	onClick: () => void;
	primary?: boolean;
	delayMs: number;
	extraMargin?: boolean;
}

function SpeedDialItem({ action, label, onClick, primary, delayMs, extraMargin }: SpeedDialItemProps) {
	const Icon = action.icon;
	const btnSize = primary ? "w-12 h-12" : "w-10 h-10";
	const iconSize = primary ? 20 : 16;
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2.5 cursor-pointer animate-fab-pop bg-transparent border-0 p-0",
				extraMargin && "mb-3",
			)}
			style={{ animationDelay: `${delayMs}ms` }}
		>
			<span
				className={cn(
					"text-xs font-medium leading-none rounded-full px-3 py-1.5 shadow-sm",
					primary ? "bg-text text-bg" : "bg-surface text-text",
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					btnSize,
					"flex items-center justify-center flex-shrink-0 rounded-full shadow-sm",
					primary ? "bg-text text-bg" : "bg-surface text-text",
				)}
			>
				<Icon size={iconSize} />
			</span>
		</button>
	);
}
