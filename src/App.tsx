import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { ToastProvider, useToast } from "@/components/Toast";
import { AddFilmScreen } from "@/screens/AddFilmScreen";
import { CamerasScreen } from "@/screens/CamerasScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { FilmDetailScreen } from "@/screens/FilmDetailScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { StockScreen } from "@/screens/StockScreen";
import type { AppData, ScreenName } from "@/types";
import { checkStorage, getInitialData, isStorageAvailable, loadData, saveData } from "@/utils/storage";

function FilmVaultInner() {
	const [data, setData] = useState<AppData | null>(null);
	const [loading, setLoading] = useState(true);
	const [screen, setScreen] = useState<ScreenName>("home");
	const [selectedFilm, setSelectedFilm] = useState<string | null>(null);
	const [persistent, setPersistent] = useState(false);
	const { toast } = useToast();

	const updateData = useCallback(
		async (newData: AppData) => {
			setData(newData);
			if (isStorageAvailable()) {
				const ok = await saveData(newData);
				if (!ok) toast("Erreur de sauvegarde", "error");
			}
		},
		[toast],
	);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const hasStorage = await checkStorage();
			if (cancelled) return;
			setPersistent(hasStorage);
			if (hasStorage) {
				const saved = await loadData();
				if (!cancelled) setData(saved && Array.isArray(saved.films) ? saved : getInitialData());
			} else {
				setData(getInitialData());
			}
			if (!cancelled) setLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading || !data) {
		return (
			<div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
				<Loader2 size={24} className="text-accent animate-spin" />
				<span className="text-xs text-text-muted font-body">Chargement des données…</span>
			</div>
		);
	}

	const renderScreen = () => {
		switch (screen) {
			case "home":
				return <DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
			case "stock":
				return <StockScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
			case "addFilm":
				return <AddFilmScreen data={data} setData={updateData} setScreen={setScreen} />;
			case "filmDetail":
				return <FilmDetailScreen data={data} setData={updateData} setScreen={setScreen} filmId={selectedFilm} />;
			case "cameras":
				return <CamerasScreen data={data} setData={updateData} />;
			case "stats":
				return <StatsScreen data={data} />;
			case "settings":
				return <SettingsScreen data={data} setData={updateData} setScreen={setScreen} />;
			default:
				return <DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} />;
		}
	};

	const showTabBar = !["addFilm", "filmDetail", "settings"].includes(screen);

	return (
		<div className="min-h-screen bg-bg text-text-primary font-body max-w-[480px] mx-auto relative">
			<div className={`px-4 pt-5 ${showTabBar ? "pb-20" : "pb-5"}`}>
				<div key={`${screen}-${selectedFilm || ""}`} className="animate-screen-enter">
					{renderScreen()}
				</div>
			</div>

			{/* Mode indicator */}
			<div
				className={`fixed top-1.5 right-2 z-[200] text-[9px] font-mono opacity-60 flex items-center gap-1 ${persistent ? "text-green" : "text-amber"}`}
			>
				<div className={`w-[5px] h-[5px] rounded-full ${persistent ? "bg-green" : "bg-amber"}`} />
				{persistent ? "sync" : "session"}
			</div>

			{showTabBar && <TabBar screen={screen} setScreen={setScreen} />}
		</div>
	);
}

export default function FilmVaultApp() {
	return (
		<ToastProvider>
			<FilmVaultInner />
		</ToastProvider>
	);
}
