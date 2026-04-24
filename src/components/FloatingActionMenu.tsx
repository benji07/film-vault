import { Camera, Film as FilmIcon, Focus, NotebookPen, Package, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FloatingActionMenuProps {
	visible: boolean;
	hasLoadedFilm: boolean;
	onAddFilm: () => void;
	onAddCamera: () => void;
	onAddLens: () => void;
	onAddBack: () => void;
	onQuickShot: () => void;
}

export function FloatingActionMenu({
	visible,
	hasLoadedFilm,
	onAddFilm,
	onAddCamera,
	onAddLens,
	onAddBack,
	onQuickShot,
}: FloatingActionMenuProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	if (!visible) return null;

	const run = (handler: () => void) => {
		setOpen(false);
		// Defer to next tick so the current Dialog finishes closing before the
		// next one opens (prevents two Radix focus traps from fighting).
		setTimeout(handler, 0);
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={t("fab.openMenu")}
				className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent-hover shadow-lg flex items-center justify-center text-white transition-colors"
			>
				<Plus size={24} strokeWidth={2.5} />
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("fab.title")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>

					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 gap-3">
							<GridCard icon={FilmIcon} label={t("fab.film")} onClick={() => run(onAddFilm)} />
							<GridCard icon={Camera} label={t("fab.camera")} onClick={() => run(onAddCamera)} />
							<GridCard icon={Package} label={t("fab.back")} onClick={() => run(onAddBack)} />
							<GridCard icon={Focus} label={t("fab.lens")} onClick={() => run(onAddLens)} />
						</div>

						<button
							type="button"
							onClick={() => run(onQuickShot)}
							disabled={!hasLoadedFilm}
							className="w-full bg-accent hover:bg-accent-hover disabled:bg-surface-alt disabled:text-text-muted disabled:cursor-not-allowed text-white rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-colors"
						>
							<div className="flex items-center gap-2">
								<NotebookPen size={18} />
								<span className="text-[15px] font-semibold">{t("fab.quickShot")}</span>
							</div>
							{!hasLoadedFilm && <span className="text-[12px] opacity-80">{t("fab.quickShotDisabled")}</span>}
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

interface GridCardProps {
	icon: typeof FilmIcon;
	label: string;
	onClick: () => void;
}

function GridCard({ icon: Icon, label, onClick }: GridCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="aspect-square flex flex-col items-center justify-center gap-2 bg-surface-alt hover:bg-card-hover border border-border rounded-lg p-3 transition-colors"
		>
			<Icon size={28} className="text-text-primary" />
			<span className="text-[13px] font-semibold text-text-primary font-body">{label}</span>
		</button>
	);
}
