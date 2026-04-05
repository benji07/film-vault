import { Archive, BarChart3, Eye, Film } from "lucide-react";
import { BarChart } from "@/components/BarChart";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { T } from "@/constants/theme";
import type { AppData } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmBrand, filmName, filmType } from "@/utils/film-helpers";

interface StatsScreenProps {
	data: AppData;
}

export function StatsScreen({ data }: StatsScreenProps) {
	const { films } = data;
	const allShot = films.filter((f) => ["exposed", "developed", "scanned", "loaded", "partial"].includes(f.state));
	const developed = films.filter((f) => f.state === "developed");

	const byType: Record<string, number> = {};
	const byBrand: Record<string, number> = {};
	const byFormat: Record<string, number> = {};
	const byCamera: Record<string, number> = {};

	for (const f of films) {
		const ft = filmType(f);
		const fb = filmBrand(f);
		const ff = f.format || "?";
		byType[ft] = (byType[ft] || 0) + 1;
		byBrand[fb] = (byBrand[fb] || 0) + 1;
		byFormat[ff] = (byFormat[ff] || 0) + 1;
	}

	for (const f of allShot) {
		if (f.cameraId) {
			const cam = data.cameras.find((c) => c.id === f.cameraId);
			const name = cam ? cameraDisplayName(cam) : "Inconnu";
			byCamera[name] = (byCamera[name] || 0) + 1;
		}
	}

	const topFilms: Record<string, number> = {};
	for (const f of allShot) {
		const name = filmName(f);
		topFilms[name] = (topFilms[name] || 0) + 1;
	}
	const topFilmsSorted = Object.entries(topFilms)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	if (films.length === 0) {
		return (
			<EmptyState
				icon={BarChart3}
				title="Pas encore de stats"
				subtitle="Ajoute des pellicules pour voir tes statistiques"
			/>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<h2 className="font-display text-2xl text-text-primary m-0 italic">Statistiques</h2>

			<div className="grid grid-cols-3 gap-2.5">
				<StatCard icon={Film} label="Total pellicules" value={films.length} color={T.blue} />
				<StatCard icon={Eye} label="Shootées" value={allShot.length} color={T.green} />
				<StatCard icon={Archive} label="Développées" value={developed.length} color={T.textSec} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">Par type</span>
					<BarChart data={byType} color={T.accent} />
				</Card>

				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">Par marque</span>
					<BarChart data={byBrand} color={T.blue} />
				</Card>

				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">Par format</span>
					<BarChart data={byFormat} color={T.green} />
				</Card>
			</div>

			{Object.keys(byCamera).length > 0 && (
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">Par appareil</span>
					<BarChart data={byCamera} color={T.amber} />
				</Card>
			)}

			{topFilmsSorted.length > 0 && (
				<Card>
					<span className="text-sm font-bold text-text-primary font-body mb-3 block">Films favoris</span>
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
		</div>
	);
}
