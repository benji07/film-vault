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
	bg: string;
	fg: string;
	dark: boolean;
}

const ACTION_DEFS: Record<ActionId, ActionDef> = {
	roll: {
		id: "roll",
		icon: FilmIcon,
		labelKey: "fab.film",
		bg: "bg-kodak-yellow",
		fg: "text-ink",
		dark: false,
	},
	shot: {
		id: "shot",
		icon: NotebookPen,
		labelKey: "fab.quickShot",
		bg: "bg-kodak-red",
		fg: "text-paper",
		dark: true,
	},
	camera: {
		id: "camera",
		icon: Camera,
		labelKey: "fab.camera",
		bg: "bg-kodak-teal",
		fg: "text-paper",
		dark: true,
	},
	lens: {
		id: "lens",
		icon: Focus,
		labelKey: "fab.lens",
		bg: "bg-washi-1",
		fg: "text-ink",
		dark: false,
	},
	back: {
		id: "back",
		icon: Package,
		labelKey: "fab.back",
		bg: "bg-washi-2",
		fg: "text-ink",
		dark: false,
	},
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

	const primary = ACTION_DEFS[order[0] as ActionId];

	return (
		<>
			{open && (
				<button
					type="button"
					aria-label={t("aria.close")}
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-30 bg-ink/55 backdrop-blur-sm animate-backdrop-fade-in cursor-default"
				/>
			)}

			{open && (
				<div className="fixed z-40 right-4 md:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom)+4.5rem)] md:bottom-[6.5rem] flex flex-col gap-3 items-end">
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
					"fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6 z-40",
					"w-16 h-16 border-[3px] border-ink flex flex-col items-center justify-center cursor-pointer",
					"shadow-[4px_4px_0_var(--color-ink),0_8px_20px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-out",
					open ? `bg-ink text-kodak-yellow rotate-45` : cn(primary.bg, primary.dark ? "text-paper" : "text-ink"),
				)}
			>
				<Plus size={open ? 30 : 26} strokeWidth={2.6} />
				{!open && (
					<span className="font-archivo-black text-[8px] tracking-[0.15em] mt-0.5 uppercase">
						{t("fab.add", { defaultValue: "Ajouter" })}
					</span>
				)}
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
	const btnSize = primary ? "w-14 h-14" : "w-11 h-11";
	const iconSize = primary ? 22 : 18;
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
					"font-archivo-black uppercase tracking-[0.12em] leading-none text-right border-2 border-ink",
					primary
						? cn(
								"px-3 py-2 text-[12px]",
								action.bg,
								action.dark ? "text-paper" : "text-ink",
								"shadow-[3px_3px_0_var(--color-ink)]",
							)
						: "px-2.5 py-1.5 text-[10px] bg-paper-card text-ink shadow-[2px_2px_0_var(--color-ink)]",
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					btnSize,
					action.bg,
					action.dark ? "text-paper" : "text-ink",
					"flex items-center justify-center flex-shrink-0",
					primary
						? "border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)]"
						: "border-2 border-ink shadow-[3px_3px_0_var(--color-ink)]",
				)}
			>
				<Icon size={iconSize} />
			</span>
		</button>
	);
}
