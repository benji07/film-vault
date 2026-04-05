import { AlertTriangle, Archive, Camera, Clock, Eye, Film, Plus, Snowflake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { T } from "@/constants/theme";
import type { AppData, ScreenName } from "@/types";
import { getExpirationStatus } from "@/utils/expiration";

interface DashboardScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	onAddFilm: () => void;
}

export function DashboardScreen({ data, setScreen, setSelectedFilm, onAddFilm }: DashboardScreenProps) {
	const { t } = useTranslation();
	const { films, cameras } = data;
	const stockCount = films.filter((f) => f.state === "stock").length;
	const loadedCount = films.filter((f) => f.state === "loaded").length;
	const exposedCount = films.filter((f) => f.state === "exposed").length;
	const developedCount = films.filter((f) => f.state === "developed").length;
	const partialCount = films.filter((f) => f.state === "partial").length;

	const expiring = films
		.filter((f) => {
			if (f.state !== "stock") return false;
			const info = getExpirationStatus(f.expDate);
			return info && info.status !== "ok";
		})
		.sort((a, b) => (a.expDate || "").localeCompare(b.expDate || ""));
	const hasExpired = expiring.some((f) => getExpirationStatus(f.expDate)?.status === "expired");
	const loaded = films.filter((f) => f.state === "loaded");

	return (
		<div className="flex flex-col gap-5">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
				{[
					{ icon: Snowflake, label: t("dashboard.inStock"), value: stockCount, color: T.blue },
					{ icon: Camera, label: t("dashboard.loaded"), value: loadedCount, color: T.green },
					{ icon: Eye, label: t("dashboard.exposed"), value: exposedCount, color: T.accent },
					{ icon: Archive, label: t("dashboard.developed"), value: developedCount, color: T.textSec },
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
							{t("dashboard.partiallyExposed", { count: partialCount })}
						</span>
					</div>
				</Card>
			)}

			{expiring.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-3">
						<AlertTriangle size={14} color={hasExpired ? T.accent : T.orange} />
						<span className="text-[13px] font-bold font-body" style={{ color: hasExpired ? T.accent : T.orange }}>
							{t("dashboard.expirationSoon")}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{expiring.slice(0, 5).map((f) => (
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
						<span className="text-[13px] font-bold text-text-sec font-body">{t("dashboard.inCameras")}</span>
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
					title={t("dashboard.noFilms")}
					subtitle={t("dashboard.noFilmsSubtitle")}
					action={
						<Button onClick={onAddFilm}>
							<Plus size={14} /> {t("dashboard.addFilm")}
						</Button>
					}
				/>
			)}
		</div>
	);
}
