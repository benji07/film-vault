import { AlertTriangle, Archive, Camera, Clock, Eye, Film, Plus, Settings, Snowflake } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { T } from "@/constants/theme";
import type { AppData, ScreenName } from "@/types";

interface DashboardScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
}

export function DashboardScreen({ data, setScreen, setSelectedFilm }: DashboardScreenProps) {
	const { films, cameras } = data;
	const stockCount = films.filter((f) => f.state === "stock").length;
	const loadedCount = films.filter((f) => f.state === "loaded").length;
	const exposedCount = films.filter((f) => f.state === "exposed").length;
	const developedCount = films.filter((f) => f.state === "developed").length;
	const partialCount = films.filter((f) => f.state === "partial").length;

	const expiring = films.filter(
		(f) => f.state === "stock" && f.expDate && new Date(f.expDate) < new Date(Date.now() + 90 * 86400000),
	);
	const loaded = films.filter((f) => f.state === "loaded");

	return (
		<div className="flex flex-col gap-5">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="font-display text-[28px] text-text-primary m-0 italic">FilmVault</h1>
					<p className="font-body text-[13px] text-text-muted mt-1">Ton inventaire argentique</p>
				</div>
				<button
					type="button"
					onClick={() => setScreen("settings")}
					className="bg-surface-alt border border-border rounded-xl w-11 h-11 flex items-center justify-center cursor-pointer mt-1"
				>
					<Settings size={16} className="text-text-muted" />
				</button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
				{[
					{ icon: Snowflake, label: "En stock", value: stockCount, color: T.blue },
					{ icon: Camera, label: "Chargées", value: loadedCount, color: T.green },
					{ icon: Eye, label: "Exposées", value: exposedCount, color: T.accent },
					{ icon: Archive, label: "Développées", value: developedCount, color: T.textSec },
				].map((stat, i) => (
					<div key={stat.label} className="animate-stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
						<StatCard icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
					</div>
				))}
			</div>

			{partialCount > 0 && (
				<Card style={{ borderColor: `${T.amber}44` }}>
					<div className="flex items-center gap-2.5">
						<Clock size={16} color={T.amber} />
						<span className="text-[13px] font-body font-semibold" style={{ color: T.amber }}>
							{partialCount} pellicule{partialCount > 1 ? "s" : ""} partiellement exposée
							{partialCount > 1 ? "s" : ""}
						</span>
					</div>
				</Card>
			)}

			{expiring.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-3">
						<AlertTriangle size={14} color={T.amber} />
						<span className="text-[13px] font-bold font-body" style={{ color: T.amber }}>
							Péremption proche
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{expiring.slice(0, 3).map((f) => (
							<FilmRow
								key={f.id}
								film={f}
								cameras={cameras}
								onClick={() => {
									setSelectedFilm(f.id);
									setScreen("filmDetail");
								}}
							/>
						))}
					</div>
				</div>
			)}

			{loaded.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-3">
						<span className="text-[13px] font-bold text-text-sec font-body">Dans les appareils</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{loaded.map((f) => (
							<FilmRow
								key={f.id}
								film={f}
								cameras={cameras}
								onClick={() => {
									setSelectedFilm(f.id);
									setScreen("filmDetail");
								}}
							/>
						))}
					</div>
				</div>
			)}

			{films.length === 0 && (
				<EmptyState
					icon={Film}
					title="Aucune pellicule"
					subtitle="Ajoute ta première pellicule pour commencer à tracker ton stock"
					action={
						<Button onClick={() => setScreen("addFilm")}>
							<Plus size={14} /> Ajouter une pellicule
						</Button>
					}
				/>
			)}
		</div>
	);
}
