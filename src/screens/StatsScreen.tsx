import { Archive, BarChart3, Coins, Film, Snowflake, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@/components/BarChart";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { CadenceCurve } from "@/components/stats/CadenceCurve";
import { FormatStack } from "@/components/stats/FormatStack";
import { PeriodSwitch, type StatsPeriod } from "@/components/stats/PeriodSwitch";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { WashiTape } from "@/components/ui/washi-tape";
import { T } from "@/constants/theme";
import type { AppData, Film as FilmType } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmBrand, filmName, filmType } from "@/utils/film-helpers";
import { fmtPrice } from "@/utils/helpers";
import { lensDisplayName } from "@/utils/lens-helpers";

interface StatsScreenProps {
	data: AppData;
}

function periodFilter(period: StatsPeriod, now: Date): (f: FilmType) => boolean {
	if (period === "all") return () => true;
	if (period === "year") {
		const yr = now.getFullYear();
		return (f) => (f.addedDate || "").slice(0, 4) === String(yr);
	}
	const cutoff = new Date(now);
	if (period === "30d") cutoff.setDate(cutoff.getDate() - 30);
	else cutoff.setMonth(cutoff.getMonth() - 12);
	const cutoffIso = cutoff.toISOString().slice(0, 10);
	return (f) => (f.addedDate || "") >= cutoffIso;
}

export function StatsScreen({ data }: StatsScreenProps) {
	const { t } = useTranslation();
	const { films } = data;
	const [period, setPeriod] = useState<StatsPeriod>("year");
	const now = useMemo(() => new Date(), []);
	const yearLabel = String(now.getFullYear());

	const shotStates = new Set(["exposed", "developed", "scanned", "loaded", "partial"]);
	const consumedStates = new Set(["exposed", "developed", "scanned"]);

	const filtered = useMemo(() => films.filter(periodFilter(period, now)), [films, period, now]);
	const lensNameMap = new Map(data.lenses.map((l) => [l.id, lensDisplayName(l)]));

	const aggregates = useMemo(() => {
		const byType: Record<string, number> = {};
		const byBrand: Record<string, number> = {};
		const byFormat: Record<string, number> = {};
		const byCamera: Record<string, number> = {};
		const byLens: Record<string, number> = {};
		const byTag: Record<string, number> = {};
		const topFilms: Record<string, number> = {};
		const byYearMonth: Record<string, number> = {};
		let stockCount = 0;
		let exposedCount = 0;
		const uniqueBrands = new Set<string>();

		for (const f of filtered) {
			byType[filmType(f)] = (byType[filmType(f)] || 0) + 1;
			const brand = filmBrand(f);
			byBrand[brand] = (byBrand[brand] || 0) + 1;
			uniqueBrands.add(brand);
			const ff = f.format || "?";
			byFormat[ff] = (byFormat[ff] || 0) + 1;

			if (f.state === "stock") stockCount++;
			if (f.state === "exposed") exposedCount++;

			if (shotStates.has(f.state)) {
				const name = filmName(f);
				topFilms[name] = (topFilms[name] || 0) + 1;
				if (f.cameraId) {
					const cam = data.cameras.find((c) => c.id === f.cameraId);
					const camName = cam ? cameraDisplayName(cam) : t("stats.unknown");
					byCamera[camName] = (byCamera[camName] || 0) + 1;
				}
				if (f.lensId) {
					const lensName = lensNameMap.get(f.lensId) || f.lens || t("stats.unknown");
					byLens[lensName] = (byLens[lensName] || 0) + 1;
				} else if (f.lens) {
					byLens[f.lens] = (byLens[f.lens] || 0) + 1;
				}
			}

			if (f.endDate && consumedStates.has(f.state)) {
				const ym = f.endDate.slice(0, 7);
				byYearMonth[ym] = (byYearMonth[ym] || 0) + 1;
			}

			if (f.tags) {
				for (const tag of f.tags) {
					byTag[tag] = (byTag[tag] || 0) + 1;
				}
			}
		}

		return {
			byType,
			byBrand,
			byFormat,
			byCamera,
			byLens,
			byTag,
			topFilms,
			byYearMonth,
			stockCount,
			exposedCount,
			uniqueBrandsCount: uniqueBrands.size,
		};
	}, [filtered, data.cameras, lensNameMap, t, consumedStates, shotStates]);

	const monthLabels = t("stats.monthLabels", { returnObjects: true }) as string[];
	const byMonth = useMemo(() => {
		const result: Record<string, number> = {};
		let total = 0;
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = `${monthLabels[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
			const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			const count = aggregates.byYearMonth[ym] || 0;
			result[key] = count;
			total += count;
		}
		return { data: result, total };
	}, [aggregates.byYearMonth, monthLabels, now]);

	// Coûts (calculés sur tous les films, indépendamment de la période)
	const costs = useMemo(() => {
		let totalSpent = 0;
		let filmsWithCost = 0;
		let totalFramesWithCost = 0;
		let totalPurchase = 0;
		let totalDev = 0;
		let totalScan = 0;
		for (const f of filtered) {
			const cost = (f.price ?? 0) + (f.devCost ?? 0) + (f.scanCost ?? 0);
			if (cost > 0) {
				totalSpent += cost;
				filmsWithCost++;
				totalFramesWithCost += f.posesShot ?? f.posesTotal ?? 0;
				totalPurchase += f.price ?? 0;
				totalDev += f.devCost ?? 0;
				totalScan += f.scanCost ?? 0;
			}
		}
		const avgPerFilm = filmsWithCost > 0 ? totalSpent / filmsWithCost : 0;
		const avgPerFrame = totalFramesWithCost > 0 ? totalSpent / totalFramesWithCost : 0;
		const costByCategory: Record<string, number> = {};
		if (totalPurchase > 0) costByCategory[t("stats.costPurchase")] = totalPurchase;
		if (totalDev > 0) costByCategory[t("stats.costDev")] = totalDev;
		if (totalScan > 0) costByCategory[t("stats.costScan")] = totalScan;
		return { totalSpent, avgPerFilm, avgPerFrame, costByCategory };
	}, [filtered, t]);

	const topFilmsSorted = Object.entries(aggregates.topFilms)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	// Insight : boitier le plus utilisé sur la période
	const topCamera = Object.entries(aggregates.byCamera).sort((a, b) => b[1] - a[1])[0];

	if (films.length === 0) {
		return <EmptyState icon={BarChart3} title={t("stats.noStats")} subtitle={t("stats.noStatsSubtitle")} />;
	}

	return (
		<div className="-mx-4 md:-mx-8 -mt-5 md:-mt-[max(1.25rem,env(safe-area-inset-top))]">
			<PageHeader title={t("stats.title")} count={films.length}>
				<div className="px-[18px] pb-2.5">
					<PeriodSwitch value={period} onChange={setPeriod} yearLabel={yearLabel} />
				</div>
			</PageHeader>

			<div className="px-[18px] pt-8 pb-32 flex flex-col gap-6">
				{/* 4 big stats — métriques fiables */}
				<section className="grid grid-cols-2 gap-2.5" data-tour="stats-overview">
					<StatCard
						icon={Film}
						label={t("stats.bigStats.collected", { defaultValue: "Rolls collectés" })}
						value={filtered.length}
						color={T.yellow}
					/>
					<StatCard
						icon={Archive}
						label={t("stats.bigStats.toDev", { defaultValue: "À développer" })}
						value={aggregates.exposedCount}
						color={T.red}
					/>
					<StatCard
						icon={Snowflake}
						label={t("stats.bigStats.inStock", { defaultValue: "En stock" })}
						value={aggregates.stockCount}
						color={T.teal}
					/>
					<StatCard
						icon={Sparkles}
						label={t("stats.bigStats.brands", { defaultValue: "Marques essayées" })}
						value={aggregates.uniqueBrandsCount}
						color={T.gold}
					/>
				</section>

				{Object.keys(aggregates.byBrand).length > 0 && (
					<section className="relative bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-4 py-4 -rotate-[0.2deg]">
						<WashiTape color="w1" rotate={-2} width={60} className="-top-[8px] left-10" />
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">
							{t("stats.byBrand")}
							<span className="font-typewriter text-[10px] tracking-[0.12em] text-ink-faded font-normal ml-2">
								— top
							</span>
						</h2>
						<BarChart data={aggregates.byBrand} color={T.yellow} limit={5} />
					</section>
				)}

				{Object.keys(aggregates.byFormat).length > 0 && (
					<section className="relative bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-4 py-4 rotate-[0.2deg]">
						<WashiTape color="w3" rotate={2} width={60} className="-top-[8px] right-10" />
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">
							{t("stats.byFormat")}
							<span className="font-typewriter text-[10px] tracking-[0.12em] text-ink-faded font-normal ml-2">
								— stack
							</span>
						</h2>
						<FormatStack data={aggregates.byFormat} />
					</section>
				)}

				{Object.keys(aggregates.byType).length > 0 && (
					<section className="relative bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-4 py-4">
						<WashiTape color="w2" rotate={-2} width={60} className="-top-[8px] left-10" />
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">
							{t("stats.byType")}
							<span className="font-typewriter text-[10px] tracking-[0.12em] text-ink-faded font-normal ml-2">
								— rolls par type
							</span>
						</h2>
						<BarChart data={aggregates.byType} color={T.teal} />
					</section>
				)}

				{/* Cadence — courbe SVG */}
				<section className="relative bg-paper-card border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-4 py-4 -rotate-[0.2deg]">
					<WashiTape color="w1" rotate={-2} width={60} className="-top-[8px] left-10" />
					<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-1">
						{t("stats.monthlyConsumption")}
						<span className="font-typewriter text-[10px] tracking-[0.12em] text-ink-faded font-normal ml-2">
							— rolls par mois
						</span>
					</h2>
					<div className="font-archivo flex justify-between font-extrabold text-[8px] tracking-[0.18em] uppercase text-ink-faded mb-1.5 mt-2">
						<span>nb. rolls</span>
						<span>{yearLabel} · ytd</span>
					</div>
					<CadenceCurve data={byMonth.data} />
				</section>

				{Object.keys(aggregates.byCamera).length > 0 && (
					<Card className="-rotate-[0.15deg]">
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">{t("stats.byCamera")}</h2>
						<BarChart data={aggregates.byCamera} color={T.gold} limit={5} />
					</Card>
				)}

				{Object.keys(aggregates.byLens).length > 0 && (
					<Card>
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">{t("stats.byLens")}</h2>
						<BarChart data={aggregates.byLens} color={T.teal} limit={5} />
					</Card>
				)}

				{Object.keys(aggregates.byTag).length > 0 && (
					<Card>
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">{t("stats.byTag")}</h2>
						<BarChart data={aggregates.byTag} color={T.red} limit={5} />
					</Card>
				)}

				{topFilmsSorted.length > 0 && (
					<Card className="rotate-[0.15deg]">
						<h2 className="font-caveat text-[24px] font-bold text-ink leading-none mb-3">{t("stats.favoriteFilms")}</h2>
						<div className="flex flex-col gap-2">
							{topFilmsSorted.map(([name, count], i) => (
								<div
									key={name}
									className="flex items-center gap-3 py-1 border-b border-dashed border-ink-faded/30 last:border-0"
								>
									<span
										className={`font-archivo-black text-[16px] min-w-[28px] ${i === 0 ? "text-kodak-red" : "text-ink-faded"}`}
									>
										#{i + 1}
									</span>
									<span className="font-cormorant text-[15px] text-ink flex-1">{name}</span>
									<span className="font-archivo-black text-[14px] text-ink">{count}</span>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* Insight final — fond ink + washi jaune */}
				{topCamera && (
					<section className="relative bg-ink text-paper border-2 border-ink shadow-[4px_4px_0_var(--color-kodak-yellow)] px-4 py-4 rotate-[0.3deg]">
						<WashiTape color="yellow" rotate={-2} width={60} className="-top-[8px] left-6" />
						<div className="font-archivo font-extrabold text-[9px] uppercase tracking-[0.2em] text-kodak-yellow">
							{t("stats.insight.favoriteCamera", { defaultValue: "★ ton boîtier favori" })}
						</div>
						<div className="font-archivo-black text-[20px] uppercase tracking-[-0.3px] leading-[1.1] mt-1.5">
							{topCamera[0]}
						</div>
						<div className="font-caveat text-[18px] text-kodak-yellow mt-1.5 leading-[1.2]">
							{t("stats.insight.rollCount", { count: topCamera[1], defaultValue: "{{count}} rolls" })}
						</div>
					</section>
				)}

				{costs.totalSpent > 0 && (
					<>
						<h3 className="font-caveat text-[26px] font-bold text-ink leading-none mt-2">{t("stats.expenses")}</h3>
						<div className="grid grid-cols-3 gap-2.5">
							<StatCard
								icon={Coins}
								label={t("stats.totalSpent")}
								value={fmtPrice(costs.totalSpent)}
								color={T.yellow}
							/>
							<StatCard icon={Coins} label={t("stats.avgPerFilm")} value={fmtPrice(costs.avgPerFilm)} color={T.red} />
							<StatCard
								icon={Coins}
								label={t("stats.avgPerFrame")}
								value={fmtPrice(costs.avgPerFrame)}
								color={T.teal}
							/>
						</div>
						{Object.keys(costs.costByCategory).length > 1 && (
							<Card>
								<h2 className="font-caveat text-[22px] font-bold text-ink leading-none mb-3">
									{t("stats.costByCategory")}
								</h2>
								<BarChart data={costs.costByCategory} color={T.gold} formatValue={(v) => fmtPrice(v)} />
							</Card>
						)}
					</>
				)}
			</div>
		</div>
	);
}
