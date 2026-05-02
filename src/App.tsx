import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddFilmDialog } from "@/components/AddFilmDialog";
import { AppHeader } from "@/components/AppHeader";
import { AddBackDialog } from "@/components/equipment/AddBackDialog";
import { AddCameraDialog } from "@/components/equipment/AddCameraDialog";
import { AddLensDialog } from "@/components/equipment/AddLensDialog";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { PwaUpdateBanner } from "@/components/PwaUpdateBanner";
import { QuickShotDialog } from "@/components/QuickShotDialog";
import { TabBar } from "@/components/TabBar";
import { ToastProvider, useToast } from "@/components/Toast";
import { CameraDetailScreen } from "@/screens/CameraDetailScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { EquipmentScreen } from "@/screens/EquipmentScreen";
import { FilmDetailScreen } from "@/screens/FilmDetailScreen";
import { LegalScreen } from "@/screens/LegalScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { StockScreen } from "@/screens/StockScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { TourOverlay } from "@/tour/TourOverlay";
import { hasCompletedTour, TourProvider, useTour } from "@/tour/TourProvider";
import type { AppData, ScreenName } from "@/types";
import { refreshCatalogs } from "@/utils/catalog";
import { checkStorage, getInitialData, isStorageAvailable, loadData, saveData } from "@/utils/storage";
import { isLocalOnly, isSupabaseConfigured, setLocalOnly, signOut, supabase } from "@/utils/supabase";
import {
	clearLegacyRecoveryCode,
	clearLocalSyncState,
	ensureProfile,
	getLegacyRecoveryCode,
	linkRecoveryCode,
	pushToCloud,
	syncData,
} from "@/utils/sync";
import { useNavigationStack } from "@/utils/use-navigation-stack";
import { useUrlSync } from "@/utils/use-url-sync";

const MapScreen = lazy(() => import("@/screens/MapScreen").then((m) => ({ default: m.MapScreen })));

// Screens without a bottom tab: hide the tabbar and animate as sub-screens.
const SUB_SCREENS: ReadonlySet<ScreenName> = new Set(["filmDetail", "cameraDetail", "settings", "legal"]);

function FilmVaultInner() {
	const [data, setData] = useState<AppData | null>(null);
	const [loading, setLoading] = useState(true);
	const [showWelcome, setShowWelcome] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const nav = useNavigationStack({ screen: "home" });
	const [autoOpenShotNote, setAutoOpenShotNote] = useState(false);
	const [showAddFilm, setShowAddFilm] = useState(false);
	const [showAddCamera, setShowAddCamera] = useState(false);
	const [showAddLens, setShowAddLens] = useState(false);
	const [showAddBack, setShowAddBack] = useState(false);
	const [showQuickShot, setShowQuickShot] = useState(false);
	const [persistent, setPersistent] = useState(false);
	const [syncing, setSyncing] = useState(false);
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
			// Background push to cloud (only when signed in)
			if (session && isSupabaseConfigured) {
				pushToCloud(newData).catch(() => {});
			}
		},
		[toast, t, session],
	);

	const triggerSync = useCallback(async () => {
		const currentData = dataRef.current;
		if (!session || !currentData || !isSupabaseConfigured) return;
		setSyncing(true);
		try {
			const result = await syncData(currentData);
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
	}, [toast, t, session]);

	// Bootstrap: load local data, decide whether to show welcome screen
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

			// Read current session (if any). supabase-js auto-detects the URL hash
			// after a Magic Link redirect and persists the session in localStorage.
			let currentSession: Session | null = null;
			if (isSupabaseConfigured && supabase) {
				const { data: sessionData } = await supabase.auth.getSession();
				currentSession = sessionData.session;
			}

			if (!cancelled) {
				setSession(currentSession);
				setData(appData);
				dataRef.current = appData;
				setLoading(false);

				// Decide if we should display the welcome screen.
				// First-time visitors with no session and no local-only flag see it,
				// unless they already have legacy data (recovery code) — those
				// should land on the app and migrate from Settings.
				const hasLegacy = !!getLegacyRecoveryCode();
				if (!currentSession && !isLocalOnly() && !hasLegacy && isSupabaseConfigured) {
					setShowWelcome(true);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Subscribe to auth state changes (Magic Link callback, sign out from another tab, etc.)
	useEffect(() => {
		if (!supabase) return;
		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			if (newSession) setShowWelcome(false);
		});
		return () => sub.subscription.unsubscribe();
	}, []);

	// On sign-in: bootstrap profile, migrate legacy recovery code if any, then sync.
	useEffect(() => {
		if (!session || !isSupabaseConfigured) return;
		let cancelled = false;
		(async () => {
			// 1. If we have a legacy recovery code in localStorage, link it first
			//    so ensure_profile finds the existing profile (instead of creating a new one).
			//    Only clear the code on success — keeping it lets us retry on a
			//    transient network/server failure on the next launch.
			const legacy = getLegacyRecoveryCode();
			if (legacy) {
				const linked = await linkRecoveryCode(legacy);
				if (linked) {
					clearLegacyRecoveryCode();
					toast(t("account.migrated"), "success");
				}
			}

			// 2. Ensure a profile exists for this session (idempotent).
			await ensureProfile();

			if (cancelled) return;

			// 3. Sync local ↔ cloud.
			const currentData = dataRef.current;
			if (!currentData) return;
			setSyncing(true);
			try {
				const result = await syncData(currentData);
				if (result.source === "cloud") {
					setData(result.data);
					dataRef.current = result.data;
					if (isStorageAvailable()) await saveData(result.data);
				}
			} catch {
				// silent
			} finally {
				if (!cancelled) setSyncing(false);
			}

			// 4. Refresh catalogs (non-blocking).
			refreshCatalogs().catch(() => {});
		})();
		return () => {
			cancelled = true;
		};
	}, [session, toast, t]);

	// Sync when coming back online
	useEffect(() => {
		const handleOnline = () => {
			triggerSync();
		};
		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, [triggerSync]);

	const handleSignOut = useCallback(async () => {
		await signOut();
		clearLocalSyncState();
		setSession(null);
	}, []);

	const handleContinueLocal = useCallback(() => {
		setLocalOnly(true);
		setShowWelcome(false);
	}, []);

	const { resetTo: navResetTo, replace: navReplace, current: navCurrent } = nav;

	// Both the TabBar (top-level tabs) and the Tour (scripted jumps) want to
	// move without pushing onto the history stack.
	const resetScreen = useCallback(
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

	if (showWelcome) {
		return <WelcomeScreen onContinueLocal={handleContinueLocal} />;
	}

	return (
		<TourProvider setScreen={resetScreen} setSelectedFilm={tourSetSelectedFilm}>
			<AppContent
				data={data}
				updateData={updateData}
				nav={nav}
				resetScreen={resetScreen}
				autoOpenShotNote={autoOpenShotNote}
				setAutoOpenShotNote={setAutoOpenShotNote}
				showAddFilm={showAddFilm}
				setShowAddFilm={setShowAddFilm}
				showAddCamera={showAddCamera}
				setShowAddCamera={setShowAddCamera}
				showAddLens={showAddLens}
				setShowAddLens={setShowAddLens}
				showAddBack={showAddBack}
				setShowAddBack={setShowAddBack}
				showQuickShot={showQuickShot}
				setShowQuickShot={setShowQuickShot}
				syncing={syncing}
				session={session}
				onSignOut={handleSignOut}
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
	resetScreen: (s: ScreenName) => void;
	autoOpenShotNote: boolean;
	setAutoOpenShotNote: (open: boolean) => void;
	showAddFilm: boolean;
	setShowAddFilm: (open: boolean) => void;
	showAddCamera: boolean;
	setShowAddCamera: (open: boolean) => void;
	showAddLens: boolean;
	setShowAddLens: (open: boolean) => void;
	showAddBack: boolean;
	setShowAddBack: (open: boolean) => void;
	showQuickShot: boolean;
	setShowQuickShot: (open: boolean) => void;
	syncing: boolean;
	session: Session | null;
	onSignOut: () => Promise<void>;
	triggerSync: () => Promise<void>;
	persistent: boolean;
}

function AppContent({
	data,
	updateData,
	nav,
	resetScreen,
	autoOpenShotNote,
	setAutoOpenShotNote,
	showAddFilm,
	setShowAddFilm,
	showAddCamera,
	setShowAddCamera,
	showAddLens,
	setShowAddLens,
	showAddBack,
	setShowAddBack,
	showQuickShot,
	setShowQuickShot,
	syncing,
	session,
	onSignOut,
	triggerSync,
	persistent,
}: AppContentProps) {
	const { isTourActive, tourData, startTour } = useTour();
	const autoTourTriggered = useRef(false);
	const navDirection = useRef<"forward" | "back" | "tab">("tab");
	const prevScreen = useRef<ScreenName>(nav.current.screen);

	useUrlSync(nav);

	const { current, navigate, goBack, resetTo, replace } = nav;
	const { screen, selectedFilm, selectedCamera, mapFilterFilmId, stockStateFilter } = current;

	const effectiveData = isTourActive && tourData ? tourData : data;
	const noopUpdate = useCallback(async () => {}, []);
	const effectiveUpdateData = isTourActive ? noopUpdate : updateData;

	// Track navigation direction
	useEffect(() => {
		const prev = prevScreen.current;
		const isSub = SUB_SCREENS.has(screen);
		const wasSub = SUB_SCREENS.has(prev);
		if (isSub && !wasSub) navDirection.current = "forward";
		else if (!isSub && wasSub) navDirection.current = "back";
		else navDirection.current = "tab";
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
						onOpenSettings={openSettings}
						setAutoOpenShotNote={setAutoOpenShotNote}
						onNavigateToStock={openStockFiltered}
					/>
				);
			case "stock":
				return <StockScreen data={effectiveData} onOpenFilm={openFilm} initialStateFilter={stockStateFilter ?? null} />;
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
						session={session}
						onSignOut={onSignOut}
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
						onOpenSettings={openSettings}
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
	const showTabBar = !SUB_SCREENS.has(screen);

	return (
		<div className="h-[100dvh] bg-bg text-text-primary font-body flex flex-col md:flex-row relative">
			{/* Sidebar — desktop only, always visible */}
			<TabBar screen={screen} setScreen={resetScreen} variant="sidebar" className="hidden md:flex" />

			<main className="relative flex-1 flex flex-col min-h-0 min-w-0">
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
				{showTabBar && <TabBar screen={screen} setScreen={resetScreen} className="md:hidden" />}
			</main>

			<AddFilmDialog
				open={showAddFilm}
				onOpenChange={setShowAddFilm}
				data={effectiveData}
				setData={effectiveUpdateData}
			/>
			<AddCameraDialog
				open={showAddCamera}
				onOpenChange={setShowAddCamera}
				data={effectiveData}
				setData={effectiveUpdateData}
			/>
			<AddLensDialog
				open={showAddLens}
				onOpenChange={setShowAddLens}
				data={effectiveData}
				setData={effectiveUpdateData}
			/>
			<AddBackDialog
				open={showAddBack}
				onOpenChange={setShowAddBack}
				data={effectiveData}
				setData={effectiveUpdateData}
			/>
			<QuickShotDialog
				open={showQuickShot}
				onOpenChange={setShowQuickShot}
				data={effectiveData}
				setData={effectiveUpdateData}
				onAddFilm={() => {
					setShowQuickShot(false);
					setShowAddFilm(true);
				}}
			/>
			<FloatingActionMenu
				visible={showTabBar && !isTourActive}
				context={
					screen === "stock"
						? "stock"
						: screen === "stats"
							? "stats"
							: screen === "cameras"
								? "gear_cameras"
								: screen === "home"
									? "dashboard"
									: "default"
				}
				onAddFilm={() => setShowAddFilm(true)}
				onAddCamera={() => setShowAddCamera(true)}
				onAddLens={() => setShowAddLens(true)}
				onAddBack={() => setShowAddBack(true)}
				onQuickShot={() => setShowQuickShot(true)}
			/>
			<PwaUpdateBanner />
			<PwaInstallBanner />

			{isTourActive && <TourOverlay />}
		</div>
	);
}

export default function FilmVaultApp() {
	return (
		<ToastProvider>
			<div className="fv-redstripe" aria-hidden="true" />
			<FilmVaultInner />
		</ToastProvider>
	);
}
