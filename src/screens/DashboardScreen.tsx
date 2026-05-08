import { Film as FilmIcon, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CarnetFilmCard } from "@/components/CarnetFilmCard";
import { EmptyState } from "@/components/EmptyState";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { AppData, Film, FilmState } from "@/types";
import { filmLastActionDate } from "@/utils/film-helpers";

interface DashboardScreenProps {
	data: AppData;
	onOpenFilm: (id: string) => void;
	onOpenSettings?: () => void;
}

const CARNET_STATES: ReadonlySet<FilmState> = new Set(["loaded", "partial", "exposed", "developed", "scanned"]);
const ACTIVE_STATE_ORDER: Record<string, number> = { loaded: 0, partial: 1 };

export function DashboardScreen({ data, onOpenFilm, onOpenSettings }: DashboardScreenProps) {
	const { t } = useTranslation();
	const { films, cameras } = data;

	const datedFilms = useMemo(() => {
		const list: Array<{ film: Film; lastDate: string }> = [];
		for (const film of films) {
			if (!CARNET_STATES.has(film.state)) continue;
			const lastDate = filmLastActionDate(film);
			if (lastDate) list.push({ film, lastDate });
		}
		return list;
	}, [films]);

	const activeFilms = useMemo(() => {
		return films
			.filter((f) => f.state === "loaded" || f.state === "partial")
			.map((film) => ({ film, lastDate: filmLastActionDate(film) ?? "" }))
			.sort((a, b) => {
				const orderDiff = (ACTIVE_STATE_ORDER[a.film.state] ?? 99) - (ACTIVE_STATE_ORDER[b.film.state] ?? 99);
				if (orderDiff !== 0) return orderDiff;
				return b.lastDate.localeCompare(a.lastDate);
			})
			.map(({ film }) => film);
	}, [films]);

	const yearBuckets = useMemo(() => {
		const map = new Map<string, number>();
		for (const { lastDate } of datedFilms) {
			const year = lastDate.slice(0, 4);
			map.set(year, (map.get(year) ?? 0) + 1);
		}
		return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
	}, [datedFilms]);

	const [selectedYear, setSelectedYear] = useState<string | null>(() => {
		if (yearBuckets.length === 0) return null;
		const currentYear = new Date().getFullYear().toString();
		return yearBuckets.some(([y]) => y === currentYear) ? currentYear : (yearBuckets[0]?.[0] ?? null);
	});

	useEffect(() => {
		if (yearBuckets.length === 0) {
			if (selectedYear !== null) setSelectedYear(null);
			return;
		}
		if (!selectedYear || !yearBuckets.some(([y]) => y === selectedYear)) {
			setSelectedYear(yearBuckets[0]?.[0] ?? null);
		}
	}, [yearBuckets, selectedYear]);

	const visible = useMemo(() => {
		if (!selectedYear) return [];
		return datedFilms
			.filter(({ lastDate }) => lastDate.startsWith(selectedYear))
			.sort((a, b) => b.lastDate.localeCompare(a.lastDate))
			.map(({ film }) => film);
	}, [datedFilms, selectedYear]);

	return (
		<div className="-mx-4 md:-mx-8">
			<PageHeader
				title={t("dashboard.title")}
				count={visible.length}
				right={
					onOpenSettings ? (
						<button
							type="button"
							onClick={onOpenSettings}
							aria-label={t("nav.settings")}
							className="flex items-center justify-center bg-surface-2 hover:bg-line w-9 h-9 rounded-full cursor-pointer transition-colors"
						>
							<Settings size={16} className="text-text-2" />
						</button>
					) : undefined
				}
			>
				{yearBuckets.length > 0 && (
					<nav
						className="flex gap-2 overflow-x-auto px-[18px] pb-2.5 fv-noscroll"
						aria-label={t("dashboard.title")}
						data-tour="carnet-filters"
					>
						{yearBuckets.map(([year, count]) => (
							<Chip
								key={year}
								active={selectedYear === year}
								onClick={() => setSelectedYear(year)}
								className="flex-none"
							>
								{year}
								<span
									className={cn(
										"font-archivo-black text-[9px] px-1.5 py-px",
										selectedYear === year ? "bg-ink/20 text-ink" : "bg-ink/10 text-ink",
									)}
								>
									{count}
								</span>
							</Chip>
						))}
					</nav>
				)}
			</PageHeader>

			<main className="px-[18px] pt-8 pb-32 flex flex-col gap-[18px]">
				{activeFilms.length > 0 && (
					<section className="flex flex-col gap-[18px]" aria-label={t("dashboard.activeRolls")}>
						<header className="flex items-center justify-between">
							<h2 className="font-archivo-black text-[11px] tracking-[0.2em] uppercase flex items-center gap-2 text-ink">
								<span className="w-2.5 h-2.5 bg-kodak-red border-[1.5px] border-ink" />
								{t("dashboard.activeRolls")}
							</h2>
							<span className="font-archivo-black text-[11px] text-ink-faded">{activeFilms.length}</span>
						</header>
						{activeFilms.map((f, idx) => {
							const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
							return <CarnetFilmCard key={f.id} film={f} camera={cam} index={idx} onClick={() => onOpenFilm(f.id)} />;
						})}
						<hr className="border-0 border-t border-dashed border-ink-faded/35" />
					</section>
				)}
				{visible.length === 0 ? (
					<EmptyState
						icon={FilmIcon}
						title={t("dashboard.emptyMoving")}
						subtitle={t("dashboard.emptyMovingSubtitle")}
					/>
				) : (
					visible.map((f, idx) => {
						const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
						const card = (
							<CarnetFilmCard key={f.id} film={f} camera={cam} index={idx} onClick={() => onOpenFilm(f.id)} />
						);
						return idx === 0 ? (
							<div key={f.id} data-tour="carnet-card">
								{card}
							</div>
						) : (
							card
						);
					})
				)}
			</main>
		</div>
	);
}
