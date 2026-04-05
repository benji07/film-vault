import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddFilmDialog } from "@/components/AddFilmDialog";
import { AppHeader } from "@/components/AppHeader";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { PwaUpdateBanner } from "@/components/PwaUpdateBanner";
import { TabBar } from "@/components/TabBar";
import { ToastProvider, useToast } from "@/components/Toast";
import { CamerasScreen } from "@/screens/CamerasScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { FilmDetailScreen } from "@/screens/FilmDetailScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { StockScreen } from "@/screens/StockScreen";
import type { AppData, ScreenName } from "@/types";
import { checkStorage, getInitialData, isStorageAvailable, loadData, saveData } from "@/utils/storage";
import { isSupabaseConfigured } from "@/utils/supabase";
import { getRecoveryCode, pushToCloud, syncData } from "@/utils/sync";

function FilmVaultInner() {
	const [data, setData] = useState<AppData | null>(null);
	const [loading, setLoading] = useState(true);
	const [screen, setScreen] = useState<ScreenName>("home");
	const [selectedFilm, setSelectedFilm] = useState<string | null>(null);
	const [showAddFilm, setShowAddFilm] = useState(false);
	const [persistent, setPersistent] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [recoveryCode, setRecoveryCodeState] = useState<string | null>(null);
	const { toast } = useToast();
	const dataRef = useRef<AppData | null>(null);

	const updateData = useCallback(
		async (newData: AppData) => {
			setData(newData);
			dataRef.current = newData;
			if (isStorageAvailable()) {
				const ok = await saveData(newData);
				if (!ok) toast("Erreur de sauvegarde", "error");
			}
			// Background push to cloud
			const code = getRecoveryCode();
			if (code && isSupabaseConfigured) {
				pushToCloud(code, newData).catch(() => {});
			}
		},
		[toast],
	);

	const triggerSync = useCallback(async () => {
		const code = getRecoveryCode();
		const currentData = dataRef.current;
		if (!code || !currentData || !isSupabaseConfigured) return;
		setSyncing(true);
		try {
			const result = await syncData(code, currentData);
			if (result.source === "cloud") {
				setData(result.data);
				dataRef.current = result.data;
				await saveData(result.data);
				toast("Données synchronisées depuis le cloud", "success");
			}
		} catch {
			toast("Erreur de synchronisation", "error");
		} finally {
			setSyncing(false);
		}
	}, [toast]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const hasStorage = await checkStorage();
			if (cancelled) return;
			setPersistent(hasStorage);

			let appData: AppData;
			if (hasStorage) {
				const saved = await loadData();
				appData = saved && Array.isArray(saved.films) ? saved : getInitialData();
			} else {
				appData = getInitialData();
			}

			// Sync with cloud on startup
			const code = getRecoveryCode();
			setRecoveryCodeState(code);
			if (code && isSupabaseConfigured && navigator.onLine) {
				try {
					const result = await syncData(code, appData);
					appData = result.data;
					if (result.source === "cloud" && hasStorage) {
						await saveData(appData);
					}
				} catch {
					// Sync failed silently, use local data
				}
			}

			if (!cancelled) {
				setData(appData);
				dataRef.current = appData;
				setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Sync when coming back online
	useEffect(() => {
		const handleOnline = () => {
			triggerSync();
		};
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, [triggerSync]);

	if (loading || !data) {
		return (
			<div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
				<Loader2 size={24} className="text-accent animate-spin" />
				<span className="text-xs text-text-muted font-body">Chargement des données…</span>
			</div>
		);
	}

	const onAddFilm = () => setShowAddFilm(true);

	const renderScreen = () => {
		switch (screen) {
			case "home":
				return (
					<DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} onAddFilm={onAddFilm} />
				);
			case "stock":
				return (
					<StockScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} onAddFilm={onAddFilm} />
				);
			case "filmDetail":
				return (
					<FilmDetailScreen
						data={data}
						setData={updateData}
						setScreen={setScreen}
						setSelectedFilm={setSelectedFilm}
						filmId={selectedFilm}
					/>
				);
			case "cameras":
				return <CamerasScreen data={data} setData={updateData} />;
			case "stats":
				return <StatsScreen data={data} />;
			case "settings":
				return (
					<SettingsScreen
						data={data}
						setData={updateData}
						syncing={syncing}
						recoveryCode={recoveryCode}
						onRecoveryCodeChange={setRecoveryCodeState}
						onSyncNow={triggerSync}
					/>
				);
			default:
				return (
					<DashboardScreen data={data} setScreen={setScreen} setSelectedFilm={setSelectedFilm} onAddFilm={onAddFilm} />
				);
		}
	};

	const filmTitle = selectedFilm ? data.films.find((f) => f.id === selectedFilm)?.model : undefined;
	const showTabBar = !["filmDetail", "settings"].includes(screen);

	return (
		<div className="h-[100dvh] bg-bg text-text-primary font-body flex flex-col md:flex-row relative">
			{/* Sidebar — desktop only, always visible */}
			<TabBar screen={screen} setScreen={setScreen} variant="sidebar" className="hidden md:flex" />

			<main className="flex-1 flex flex-col min-h-0 min-w-0">
				<AppHeader screen={screen} setScreen={setScreen} filmTitle={filmTitle} className="md:hidden" />
				<div className="flex-1 overflow-y-auto px-4 md:px-8 pt-5 pb-5 md:pt-[max(1.25rem,env(safe-area-inset-top))]">
					<div className="max-w-3xl mx-auto">
						<div key={`${screen}-${selectedFilm || ""}`} className="animate-screen-enter">
							{renderScreen()}
						</div>
					</div>
				</div>

				{/* Bottom TabBar — mobile only */}
				{showTabBar && <TabBar screen={screen} setScreen={setScreen} className="md:hidden" />}
			</main>

			<AddFilmDialog open={showAddFilm} onOpenChange={setShowAddFilm} data={data} setData={updateData} />
			<PwaUpdateBanner />
			<PwaInstallBanner />

			{/* Mode indicator */}
			<div
				className={`fixed top-1.5 right-2 z-[200] text-[9px] font-mono opacity-60 flex items-center gap-1 ${persistent ? "text-green" : "text-amber"}`}
			>
				<div className={`w-[5px] h-[5px] rounded-full ${persistent ? "bg-green" : "bg-amber"}`} />
				{persistent ? "sync" : "session"}
			</div>
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
