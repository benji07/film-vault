import { ChevronDown, Film as FilmIcon, Settings } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CarnetFilmCard } from "@/components/CarnetFilmCard";
import { EmptyState } from "@/components/EmptyState";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { AppData, Film, FilmState } from "@/types";
import { filmLastActionDate } from "@/utils/film-helpers";
import { usePersistedState } from "@/utils/use-persisted-state";

interface DashboardScreenProps {
	data: AppData;
	onOpenFilm: (id: string) => void;
	onOpenSettings?: () => void;
}

const CARNET_STATES: ReadonlySet<FilmState> = new Set(["loaded", "partial", "exposed", "developed", "scanned"]);
const ACTIVE_STATE_ORDER: Record<string, number> = { loaded: 0, partial: 1 };

interface CarnetSectionProps {
	title: string;
	count: number;
	collapsed: boolean;
	onToggle: () => void;
	children: ReactNode;
}

function CarnetSection({ title, count, collapsed, onToggle, children }: CarnetSectionProps) {
	const panelId = useId();

	return (
		<section className="flex flex-col" aria-label={title}>
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={!collapsed}
				aria-controls={panelId}
				className="flex items-center gap-2 w-full cursor-pointer text-left"
			>
				<span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" />
				<h2 className="text-sm font-semibold text-text flex-1">{title}</h2>
				<span className="text-sm font-medium text-text-3">{count}</span>
				<ChevronDown
					size={15}
					className={cn("text-text-3 flex-none transition-transform duration-200", collapsed && "-rotate-90")}
				/>
			</button>
			<div
				id={panelId}
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out",
					collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
				)}
			>
				<div className="overflow-hidden min-h-0">
					<div className="flex flex-col gap-[18px] pt-[14px]">{children}</div>
				</div>
			</div>
		</section>
	);
}

function sortByLastActionDesc(films: Film[]): Film[] {
	return films
		.map((film) => ({ film, lastDate: filmLastActionDate(film) ?? "" }))
		.sort((a, b) => b.lastDate.localeCompare(a.lastDate))
		.map(({ film }) => film);
}

export function DashboardScreen({ data, onOpenFilm, onOpenSettings }: DashboardScreenProps) {
	const { t } = useTranslation();
	const { films, cameras } = data;
	const [collapsedSections, setCollapsedSections] = usePersistedState<Record<string, boolean>>(
		"filmvault-carnet-collapsed",
		{},
	);

	const toggleSection = (id: string) => {
		setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
	};

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

	const devFilms = useMemo(() => sortByLastActionDesc(films.filter((f) => f.state === "exposed")), [films]);

	const scanFilms = useMemo(() => sortByLastActionDesc(films.filter((f) => f.state === "developed")), [films]);

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

	const statusSections: Array<{ id: string; title: string; films: Film[] }> = [
		{ id: "active", title: t("dashboard.activeRolls"), films: activeFilms },
		{ id: "dev", title: t("dashboard.devSection"), films: devFilms },
		{ id: "scan", title: t("dashboard.scanSection"), films: scanFilms },
	].filter((s) => s.films.length > 0);

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
										"text-[10px] font-medium px-1.5 py-px rounded-full",
										selectedYear === year ? "bg-text/15 text-text" : "bg-surface-2 text-text-2",
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
				{statusSections.map(({ id, title, films: sectionFilms }) => (
					<CarnetSection
						key={id}
						title={title}
						count={sectionFilms.length}
						collapsed={collapsedSections[id] ?? false}
						onToggle={() => toggleSection(id)}
					>
						{sectionFilms.map((f, idx) => {
							const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
							return <CarnetFilmCard key={f.id} film={f} camera={cam} index={idx} onClick={() => onOpenFilm(f.id)} />;
						})}
					</CarnetSection>
				))}
				{statusSections.length > 0 && <hr className="border-0 border-t border-dashed border-ink-faded/35" />}
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
