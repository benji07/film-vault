import { Film as FilmIcon } from "lucide-react";
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

export function DashboardScreen({ data, onOpenFilm }: DashboardScreenProps) {
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

	const stats = [
		{ value: counts.loaded, label: t("dashboard.stats.loaded"), color: "text-kodak-red" },
		{ value: counts.toDev, label: t("dashboard.stats.toDev"), color: "text-kodak-yellow" },
		{ value: counts.toScan, label: t("dashboard.stats.toScan"), color: "text-kodak-gold" },
	];

	return (
		<div className="-mx-4 md:-mx-8 -mt-5 md:-mt-[max(1.25rem,env(safe-area-inset-top))]">
			<PageHeader title={t("dashboard.title")} count={counts.all}>
				{/* Stats strip — 3 actions concrètes */}
				<section
					className="relative grid grid-cols-3 overflow-hidden bg-ink text-paper mx-[18px] mt-1 mb-2.5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]"
					data-tour="stat-cards"
				>
					<div className="absolute top-0 left-0 right-0 h-1 bg-kodak-yellow" />
					{stats.map((s, i) => (
						<div
							key={s.label}
							className={cn(
								"text-center py-2.5 px-2",
								i < 2 && "border-r border-paper/10",
							)}
						>
							<div className={cn("font-archivo-black text-[22px] leading-none tracking-[-0.5px]", s.color)}>
								{String(s.value).padStart(2, "0")}
							</div>
							<div className="font-typewriter text-[8px] tracking-[0.18em] uppercase text-paper/55 mt-1">
								{s.label}
							</div>
						</div>
					))}
				</section>

				{/* Chips filtres logiques — axe unique : étape du workflow */}
				<nav
					className="flex gap-2 overflow-x-auto px-[18px] pb-2.5 fv-noscroll"
					aria-label={t("dashboard.title")}
				>
					{filterDefs.map((f) => (
						<Chip
							key={f.id}
							active={filter === f.id}
							onClick={() => setFilter(f.id)}
							className="flex-none"
						>
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

			{/* Feed des pellicules en mouvement */}
			<main className="px-[18px] pt-3.5 pb-32 flex flex-col gap-[18px]">
				{visible.length === 0 ? (
					<EmptyState
						icon={FilmIcon}
						title={t("dashboard.emptyMoving")}
						subtitle={t("dashboard.emptyMovingSubtitle")}
					/>
				) : (
					visible.map((f, idx) => {
						const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
						return (
							<CarnetFilmCard
								key={f.id}
								film={f}
								camera={cam}
								index={idx}
								onClick={() => onOpenFilm(f.id)}
							/>
						);
					})
				)}
			</main>
		</div>
	);
}
