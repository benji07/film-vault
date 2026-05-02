import { Film as FilmIcon, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CarnetFilmCard } from "@/components/CarnetFilmCard";
import { EmptyState } from "@/components/EmptyState";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { AppData, Film as FilmType } from "@/types";

interface DashboardScreenProps {
	data: AppData;
	onOpenFilm: (id: string) => void;
	onOpenCameras?: () => void;
	onOpenSettings?: () => void;
	setAutoOpenShotNote?: (open: boolean) => void;
	onNavigateToStock?: (stateFilter: string) => void;
}

type CarnetFilter = "all" | "loaded" | "toDev" | "toScan";

const MOVING_STATES: ReadonlySet<FilmType["state"]> = new Set(["loaded", "partial", "exposed", "developed"]);

function matchesFilter(state: FilmType["state"], filter: CarnetFilter): boolean {
	if (filter === "all") return MOVING_STATES.has(state);
	if (filter === "loaded") return state === "loaded" || state === "partial";
	if (filter === "toDev") return state === "exposed";
	return state === "developed";
}

export function DashboardScreen({ data, onOpenFilm, onOpenSettings }: DashboardScreenProps) {
	const { t } = useTranslation();
	const { films, cameras } = data;
	const [filter, setFilter] = useState<CarnetFilter>("all");

	const moving = films.filter((f) => MOVING_STATES.has(f.state));
	const counts = {
		all: moving.length,
		loaded: moving.filter((f) => f.state === "loaded" || f.state === "partial").length,
		toDev: moving.filter((f) => f.state === "exposed").length,
		toScan: moving.filter((f) => f.state === "developed").length,
	};

	const visible = moving.filter((f) => matchesFilter(f.state, filter));

	const filterDefs: { id: CarnetFilter; label: string; count: number }[] = [
		{ id: "all", label: t("dashboard.filter.all"), count: counts.all },
		{ id: "loaded", label: t("dashboard.filter.loaded"), count: counts.loaded },
		{ id: "toDev", label: t("dashboard.filter.toDev"), count: counts.toDev },
		{ id: "toScan", label: t("dashboard.filter.toScan"), count: counts.toScan },
	];

	return (
		<div className="-mx-4 md:-mx-8 -mt-5 md:-mt-[max(1.25rem,env(safe-area-inset-top))]">
			<PageHeader
				title={t("dashboard.title")}
				count={counts.all}
				right={
					onOpenSettings ? (
						<button
							type="button"
							onClick={onOpenSettings}
							aria-label={t("nav.settings")}
							className="flex items-center justify-center bg-paper-card border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] w-9 h-9 cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)] transition-all"
						>
							<Settings size={15} className="text-ink-faded" />
						</button>
					) : undefined
				}
			>
				<nav className="flex gap-2 overflow-x-auto px-[18px] pb-2.5 fv-noscroll" aria-label={t("dashboard.title")}>
					{filterDefs.map((f) => (
						<Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} className="flex-none">
							{f.label}
							<span
								className={cn(
									"font-archivo-black text-[9px] px-1.5 py-px",
									filter === f.id ? "bg-ink/20 text-ink" : "bg-ink/10 text-ink",
								)}
							>
								{f.count}
							</span>
						</Chip>
					))}
				</nav>
			</PageHeader>

			<main className="px-[18px] pt-8 pb-32 flex flex-col gap-[18px]">
				{visible.length === 0 ? (
					<EmptyState
						icon={FilmIcon}
						title={t("dashboard.emptyMoving")}
						subtitle={t("dashboard.emptyMovingSubtitle")}
					/>
				) : (
					visible.map((f, idx) => {
						const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
						return <CarnetFilmCard key={f.id} film={f} camera={cam} index={idx} onClick={() => onOpenFilm(f.id)} />;
					})
				)}
			</main>
		</div>
	);
}
