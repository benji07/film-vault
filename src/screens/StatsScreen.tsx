import { Archive, BarChart3, Coins, Eye, Film } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@/components/BarChart";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { T } from "@/constants/theme";
import type { AppData } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmBrand, filmName, filmType } from "@/utils/film-helpers";
import { fmtPrice } from "@/utils/helpers";
import { lensDisplayName } from "@/utils/lens-helpers";

interface StatsScreenProps {
	data: AppData;
}

export function StatsScreen({ data }: StatsScreenProps) {
	const { t } = useTranslation();
	const { films } = data;
	const shotStates = new Set(["exposed", "developed", "scanned", "loaded", "partial"]);
	const consumedStates = new Set(["exposed", "developed", "scanned"]);

	const lensNameMap = new Map(data.lenses.map((l) => [l.id, lensDisplayName(l)]));

	const byType: Record<string, number> = {};
	const byBrand: Record<string, number> = {};
	const byFormat: Record<string, number> = {};
	const byCamera: Record<string, number> = {};
	const byLens: Record<string, number> = {};
	const topFilms: Record<string, number> = {};
	const byYearMonth: Record<string, number> = {};
	let shotCount = 0;
	let developedCount = 0;

	for (const f of films) {
		byType[filmType(f)] = (byType[filmType(f)] || 0) + 1;
		byBrand[filmBrand(f)] = (byBrand[filmBrand(f)] || 0) + 1;
		const ff = f.format || "?";
		byFormat[ff] = (byFormat[ff] || 0) + 1;

		if (f.state === "developed") developedCount++;

		const isShot = shotStates.has(f.state);
		if (isShot) {
			shotCount++;
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
	}

	const monthLabels = t("stats.monthLabels", { returnObjects: true }) as string[];
	const now = new Date();
	const byMonth: Record<string, number> = {};
	let annualTotal = 0;
	for (let i = 11; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const key = `${monthLabels[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
		const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		const count = byYearMonth[ym] || 0;
		byMonth[key] = count;
		annualTotal += count;
	}

	let totalSpent = 0;
	let filmsWithCost = 0;
	let totalFramesWithCost = 0;
	const costByType: Record<string, number> = {};

	for (const f of films) {
		const cost = (f.price ?? 0) + (f.devCost ?? 0) + (f.scanCost ?? 0);
		if (cost > 0) {
			totalSpent += cost;
			filmsWithCost++;
			totalFramesWithCost += f.posesTotal ?? 0;
			const type = filmType(f);
			costByType[type] = (costByType[type] || 0) + cost;
		}
	}

	const avgPerFilm = filmsWithCost > 0 ? totalSpent / filmsWithCost : 0;
	const avgPerFrame = totalFramesWithCost > 0 ? totalSpent / totalFramesWithCost : 0;

	const topFilmsSorted = Object.entries(topFilms)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	if (films.length === 0) {
		return <EmptyState icon={BarChart3} title={t("stats.noStats")} subtitle={t("stats.noStatsSubtitle")} />;
	}

	return (
		<div className="flex flex-col gap-5">
			<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("stats.title")}</h2>

			<div className="grid grid-cols-3 gap-2.5">
				<StatCard icon={Film} label={t("stats.totalFilms")} value={films.length} color={T.blue} />
				<StatCard icon={Eye} label={t("stats.shot")} value={shotCount} color={T.green} />
				<StatCard icon={Archive} label={t("stats.developed")} value={developedCount} color={T.textSec} />
			</div>

			<Card>
				<span className="text-sm font-bold text-text-primary font-body mb-3 block">
					{t("stats.monthlyConsumption")}
				</span>
				<BarChart data={byMonth} color={T.accent} sort={false} />
				<div className="text-xs text-text-muted font-body mt-2 text-center">
					{t("stats.annualTotal", { count: annualTotal })}
				</div>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.byType")}</span>
					<BarChart data={byType} color={T.accent} />
				</Card>

				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.byBrand")}</span>
					<BarChart data={byBrand} color={T.blue} />
				</Card>

				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.byFormat")}</span>
					<BarChart data={byFormat} color={T.green} />
				</Card>
			</div>

			{Object.keys(byCamera).length > 0 && (
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.byCamera")}</span>
					<BarChart data={byCamera} color={T.amber} />
				</Card>
			)}

			{Object.keys(byLens).length > 0 && (
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.byLens")}</span>
					<BarChart data={byLens} color={T.blue} />
				</Card>
			)}

			{topFilmsSorted.length > 0 && (
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.favoriteFilms")}</span>
					<div className="flex flex-col gap-2">
						{topFilmsSorted.map(([name, count], i) => (
							<div key={name} className="flex items-center gap-3">
								<span
									className={`text-lg font-mono font-bold min-w-[28px] ${i === 0 ? "text-accent" : "text-text-muted"}`}
								>
									#{i + 1}
								</span>
								<span className="text-[13px] text-text-primary font-body flex-1">{name}</span>
								<span className="text-sm font-mono font-semibold text-text-sec">{count}</span>
							</div>
						))}
					</div>
				</Card>
			)}

			{totalSpent > 0 && (
				<>
					<h3 className="font-display text-xl text-text-primary m-0 italic mt-2">{t("stats.expenses")}</h3>
					<div className="grid grid-cols-3 gap-2.5">
						<StatCard icon={Coins} label={t("stats.totalSpent")} value={fmtPrice(totalSpent)} color={T.orange} />
						<StatCard icon={Coins} label={t("stats.avgPerFilm")} value={fmtPrice(avgPerFilm)} color={T.amber} />
						<StatCard icon={Coins} label={t("stats.avgPerFrame")} value={fmtPrice(avgPerFrame)} color={T.green} />
					</div>
					{Object.keys(costByType).length > 1 && (
						<Card>
							<span className="text-sm font-bold text-text-primary font-body mb-3 block">{t("stats.costByType")}</span>
							<BarChart data={costByType} color={T.orange} formatValue={(v) => fmtPrice(v)} />
						</Card>
					)}
				</>
			)}
		</div>
	);
}
