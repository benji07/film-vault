import { Loader2 } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddFilmDialog } from "@/components/AddFilmDialog";
import { AppHeader } from "@/components/AppHeader";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { PwaUpdateBanner } from "@/components/PwaUpdateBanner";
import { TabBar } from "@/components/TabBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider, useToast } from "@/components/Toast";
import { CameraDetailScreen } from "@/screens/CameraDetailScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { EquipmentScreen } from "@/screens/EquipmentScreen";
import { FilmDetailScreen } from "@/screens/FilmDetailScreen";
import { LegalScreen } from "@/screens/LegalScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { StockScreen } from "@/screens/StockScreen";
import { TourOverlay } from "@/tour/TourOverlay";
import { hasCompletedTour, TourProvider, useTour } from "@/tour/TourProvider";
import type { AppData, ScreenName } from "@/types";
import { refreshCatalogs } from "@/utils/catalog";
import { checkStorage, getInitialData, isStorageAvailable, loadData, saveData } from "@/utils/storage";
import { ensureAnonSession, isSupabaseConfigured } from "@/utils/supabase";
import { getRecoveryCode, pushToCloud, syncData } from "@/utils/sync";
import { useNavigationStack } from "@/utils/use-navigation-stack";

const MapScreen = lazy(() => import("@/screens/MapScreen").then((m) => ({ default: m.MapScreen })));

function FilmVaultInner() {
	const [data, setData] = useState<AppData | null>(null);
	const [loading, setLoading] = useState(true);
	const nav = useNavigationStack({ screen: "home" });
	const [autoOpenShotNote, setAutoOpenShotNote] = useState(false);
	const [showAddFilm, setShowAddFilm] = useState(false);
	const [persistent, setPersistent] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [recoveryCode, setRecoveryCodeState] = useState<string | null>(null);
	const { toast } = useToast();
	const { t } = useTranslation();
	const dataRef = useRef<AppData | null>(null);

	const updateData = useCallback(
		async (newData: AppData) => {
			setData(newData);
			dataRef.current = newData;
			if (isStorageAvailable()) {
				const ok = await saveData(newData);
				if (!ok) toast(t("app.saveError"), "error");
			}
			// Background push to cloud
			const code = getRecoveryCode();
			if (code && isSupabaseConfigured) {
				pushToCloud(code, newData).catch(() => {});
			}
		},
		[toast, t],
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
				toast(t("app.syncedFromCloud"), "success");
			}
		} catch {
			toast(t("app.syncError"), "error");
		} finally {
			setSyncing(false);
		}
	}, [toast, t]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			// Ensure anonymous auth session before any cloud operations
			if (isSupabaseConfigured && navigator.onLine) {
				await ensureAnonSession();
			}

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

			// Refresh catalogs in background (non-blocking)
			if (isSupabaseConfigured && navigator.onLine) {
				refreshCatalogs().catch(() => {});
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

	// Sync when coming back online (ensure auth session first)
	useEffect(() => {
		const handleOnline = async () => {
			await ensureAnonSession();
			triggerSync();
		};
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, [triggerSync]);

	const { resetTo: navResetTo, replace: navReplace, current: navCurrent } = nav;

	// TabBar: tabs are top-level, they reset the history stack.
	const tabSetScreen = useCallback(
		(s: ScreenName) => {
			navResetTo({ screen: s });
		},
		[navResetTo],
	);

	// Tour: scripted screen jumps should not pollute history.
	const tourSetScreen = useCallback(
		(s: ScreenName) => {
			navResetTo({ screen: s });
		},
		[navResetTo],
	);
	const tourSetSelectedFilm = useCallback(
		(id: string | null) => {
			navReplace({ ...navCurrent, selectedFilm: id });
		},
		[navReplace, navCurrent],
	);

	if (loading || !data) {
		return (
			<div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
				<Loader2 size={24} className="text-accent animate-spin" />
				<span className="text-xs text-text-muted font-body">{t("app.loading")}</span>
			</div>
		);
	}

	return (
		<TourProvider setScreen={tourSetScreen} setSelectedFilm={tourSetSelectedFilm}>
			<AppContent
				data={data}
				updateData={updateData}
				nav={nav}
				tabSetScreen={tabSetScreen}
				autoOpenShotNote={autoOpenShotNote}
				setAutoOpenShotNote={setAutoOpenShotNote}
				showAddFilm={showAddFilm}
				setShowAddFilm={setShowAddFilm}
				syncing={syncing}
				recoveryCode={recoveryCode}
				setRecoveryCodeState={setRecoveryCodeState}
				triggerSync={triggerSync}
				persistent={persistent}
			/>
		</TourProvider>
	);
}

interface AppContentProps {
	data: AppData;
	updateData: (data: AppData) => Promise<void>;
	nav: ReturnType<typeof useNavigationStack>;
	tabSetScreen: (s: ScreenName) => void;
	autoOpenShotNote: boolean;
	setAutoOpenShotNote: (open: boolean) => void;
	showAddFilm: boolean;
	setShowAddFilm: (open: boolean) => void;
	syncing: boolean;
	recoveryCode: string | null;
	setRecoveryCodeState: (code: string | null) => void;
	triggerSync: () => Promise<void>;
	persistent: boolean;
}

function AppContent({
	data,
	updateData,
	nav,
	tabSetScreen,
	autoOpenShotNote,
	setAutoOpenShotNote,
	showAddFilm,
	setShowAddFilm,
	syncing,
	recoveryCode,
	setRecoveryCodeState,
	triggerSync,
	persistent,
}: AppContentProps) {
	const { isTourActive, tourData, startTour } = useTour();
	const autoTourTriggered = useRef(false);
	const navDirection = useRef<"forward" | "back" | "tab">("tab");
	const prevScreen = useRef<ScreenName>(nav.current.screen);

	const { current, navigate, goBack, resetTo, replace } = nav;
	const { screen, selectedFilm, selectedCamera, mapFilterFilmId, stockStateFilter } = current;

	const effectiveData = isTourActive && tourData ? tourData : data;
	const noopUpdate = useCallback(async () => {}, []);
	const effectiveUpdateData = isTourActive ? noopUpdate : updateData;

	// Track navigation direction
	useEffect(() => {
		const detailScreens: ScreenName[] = ["filmDetail", "cameraDetail", "settings", "legal"];
		const prev = prevScreen.current;
		if (detailScreens.includes(screen) && !detailScreens.includes(prev)) {
			navDirection.current = "forward";
		} else if (!detailScreens.includes(screen) && detailScreens.includes(prev)) {
			navDirection.current = "back";
		} else {
			navDirection.current = "tab";
		}
		prevScreen.current = screen;
	}, [screen]);

	// Auto-trigger tour on first launch when app is empty
	useEffect(() => {
		if (autoTourTriggered.current) return;
		if (data.films.length === 0 && data.cameras.length === 0 && !hasCompletedTour()) {
			autoTourTriggered.current = true;
			startTour();
		}
	}, [data, startTour]);

	const onAddFilm = () => setShowAddFilm(true);

	// Forward-navigation callbacks. Each one pushes onto the history stack so
	// the back button can restore the previous screen (and its params).
	const openFilm = useCallback((id: string) => navigate({ screen: "filmDetail", selectedFilm: id }), [navigate]);
	const openCamera = useCallback((id: string) => navigate({ screen: "cameraDetail", selectedCamera: id }), [navigate]);
	const openMap = useCallback(
		(filmId?: string) => navigate({ screen: "map", mapFilterFilmId: filmId ?? null }),
		[navigate],
	);
	const openStockFiltered = useCallback(
		(stateFilter: string) => navigate({ screen: "stock", stockStateFilter: stateFilter }),
		[navigate],
	);
	const openCamerasList = useCallback(() => navigate({ screen: "cameras" }), [navigate]);
	const openSettings = useCallback(() => navigate({ screen: "settings" }), [navigate]);
	const openLegal = useCallback(() => navigate({ screen: "legal" }), [navigate]);

	// Explicit redirects (not back): used after delete or when target not found.
	const exitToStock = useCallback(() => resetTo({ screen: "stock" }), [resetTo]);
	const exitToCameras = useCallback(() => resetTo({ screen: "cameras" }), [resetTo]);

	// Duplicating a film in FilmDetail needs to swap the viewed film without
	// pushing to history (it's the same screen with a different ID).
	const replaceSelectedFilm = useCallback(
		(id: string) => replace({ ...current, selectedFilm: id }),
		[replace, current],
	);

	// Map filter clear: stays on the map screen, just drops the filter.
	const clearMapFilter = useCallback(() => replace({ ...current, mapFilterFilmId: null }), [replace, current]);

	const renderScreen = () => {
		switch (screen) {
			case "home":
				return (
					<DashboardScreen
						data={effectiveData}
						onOpenFilm={openFilm}
						onOpenCameras={openCamerasList}
						onAddFilm={onAddFilm}
						setAutoOpenShotNote={setAutoOpenShotNote}
						onNavigateToStock={openStockFiltered}
					/>
				);
			case "stock":
				return (
					<StockScreen
						data={effectiveData}
						onOpenFilm={openFilm}
						onAddFilm={onAddFilm}
						initialStateFilter={stockStateFilter ?? null}
					/>
				);
			case "filmDetail":
				return (
					<FilmDetailScreen
						data={effectiveData}
						setData={effectiveUpdateData}
						onExit={exitToStock}
						onFilmDuplicated={replaceSelectedFilm}
						filmId={selectedFilm ?? null}
						onNavigateToMap={openMap}
						onNavigateToCamera={openCamera}
						autoOpenShotNote={autoOpenShotNote}
						setAutoOpenShotNote={setAutoOpenShotNote}
					/>
				);
			case "cameraDetail":
				return (
					<CameraDetailScreen
						data={effectiveData}
						cameraId={selectedCamera ?? null}
						onExit={exitToCameras}
						onFilmClick={openFilm}
					/>
				);
			case "map":
				return (
					<Suspense
						fallback={
							<div className="flex-1 flex items-center justify-center">
								<Loader2 size={24} className="text-accent animate-spin" />
							</div>
						}
					>
						<MapScreen
							data={effectiveData}
							onOpenFilm={openFilm}
							onOpenStock={exitToStock}
							filterFilmId={mapFilterFilmId ?? null}
							onClearFilter={clearMapFilter}
						/>
					</Suspense>
				);
			case "cameras":
				return <EquipmentScreen data={effectiveData} setData={effectiveUpdateData} onCameraClick={openCamera} />;
			case "stats":
				return <StatsScreen data={effectiveData} />;
			case "settings":
				return (
					<SettingsScreen
						data={effectiveData}
						setData={effectiveUpdateData}
						syncing={syncing}
						recoveryCode={recoveryCode}
						onRecoveryCodeChange={setRecoveryCodeState}
						onSyncNow={triggerSync}
						persistent={persistent}
						onOpenLegal={openLegal}
					/>
				);
			case "legal":
				return <LegalScreen onBack={goBack} />;
			default:
				return (
					<DashboardScreen
						data={effectiveData}
						onOpenFilm={openFilm}
						onOpenCameras={openCamerasList}
						onAddFilm={onAddFilm}
						setAutoOpenShotNote={setAutoOpenShotNote}
						onNavigateToStock={openStockFiltered}
					/>
				);
		}
	};

	const filmTitle = selectedFilm ? effectiveData.films.find((f) => f.id === selectedFilm)?.model : undefined;
	const cameraTitle = selectedCamera
		? (() => {
				const cam = effectiveData.cameras.find((c) => c.id === selectedCamera);
				if (!cam) return undefined;
				const fallbackTitle = [cam.brand, cam.model]
					.map((part) => part?.trim())
					.filter(Boolean)
					.join(" ");
				return cam.nickname || fallbackTitle || undefined;
			})()
		: undefined;
	const showTabBar = !["filmDetail", "cameraDetail", "settings", "legal"].includes(screen);

	return (
		<div className="h-[100dvh] bg-bg text-text-primary font-body flex flex-col md:flex-row relative">
			{/* Sidebar — desktop only, always visible */}
			<TabBar screen={screen} setScreen={tabSetScreen} variant="sidebar" className="hidden md:flex" />

			<main className="flex-1 flex flex-col min-h-0 min-w-0">
				<AppHeader
					screen={screen}
					goBack={goBack}
					onOpenSettings={openSettings}
					filmTitle={filmTitle}
					cameraTitle={cameraTitle}
					className="md:hidden"
				/>
				{screen === "map" ? (
					<div className="flex-1 min-h-0">{renderScreen()}</div>
				) : (
					<div className="flex-1 overflow-y-auto px-4 md:px-8 pt-5 pb-5 md:pt-[max(1.25rem,env(safe-area-inset-top))]">
						<div className="max-w-3xl mx-auto">
							<div
								key={`${screen}-${selectedFilm || ""}`}
								className={
									navDirection.current === "forward"
										? "animate-screen-forward"
										: navDirection.current === "back"
											? "animate-screen-back"
											: "animate-screen-enter"
								}
							>
								{renderScreen()}
							</div>
						</div>
					</div>
				)}

				{/* Bottom TabBar — mobile only */}
				{showTabBar && <TabBar screen={screen} setScreen={tabSetScreen} className="md:hidden" />}
			</main>

			<AddFilmDialog
				open={showAddFilm}
				onOpenChange={setShowAddFilm}
				data={effectiveData}
				setData={effectiveUpdateData}
			/>
			<PwaUpdateBanner />
			<PwaInstallBanner />

			{isTourActive && <TourOverlay />}
		</div>
	);
}

export default function FilmVaultApp() {
	return (
		<ThemeProvider>
			<ToastProvider>
				<FilmVaultInner />
			</ToastProvider>
		</ThemeProvider>
	);
}
