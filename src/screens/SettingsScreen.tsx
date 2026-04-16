import {
	AlertTriangle,
	BookOpen,
	Calendar,
	Camera as CameraIcon,
	Check,
	Cloud,
	CloudOff,
	Copy,
	Database,
	Download,
	Film,
	Focus,
	Globe,
	Loader2,
	Package,
	Play,
	RefreshCw,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhotoImg } from "@/components/ui/photo-img";
import { T } from "@/constants/theme";
import { useTour } from "@/tour/TourProvider";
import type { AppData, ExpirationMode } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { lensDisplayName } from "@/utils/lens-helpers";
import { exportData, parseImportFile } from "@/utils/storage";
import { isSupabaseConfigured } from "@/utils/supabase";
import {
	activateCloud,
	clearRecoveryCode,
	generateRecoveryCode,
	getLastSync,
	linkRecoveryCode,
	pullFromCloud,
	pushToCloud,
	setRecoveryCode,
} from "@/utils/sync";

interface SettingsScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	syncing: boolean;
	recoveryCode: string | null;
	onRecoveryCodeChange: (code: string | null) => void;
	onSyncNow: () => void;
	persistent: boolean;
	setScreen: (screen: import("@/types").ScreenName) => void;
}

export function SettingsScreen({
	data,
	setData,
	syncing,
	recoveryCode,
	onRecoveryCodeChange,
	onSyncNow,
	persistent,
	setScreen,
}: SettingsScreenProps) {
	const { t, i18n } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importPreview, setImportPreview] = useState<AppData | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [restoreCode, setRestoreCode] = useState("");
	const [restoring, setRestoring] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const result = await parseImportFile(file, t);
		if (result.success) {
			setImportPreview(result.data);
			setImportError(null);
		} else {
			setImportError(result.error);
			setImportPreview(null);
		}

		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const confirmImport = () => {
		if (importPreview) {
			setData(importPreview);
			setImportPreview(null);
		}
	};

	const handleActivateCloud = async () => {
		const code = generateRecoveryCode();
		try {
			const profileId = await activateCloud(code);
			if (!profileId) {
				setImportError(t("settings.pushFailed"));
				return;
			}
			await pushToCloud(code, data);
			setRecoveryCode(code);
			onRecoveryCodeChange(code);
		} catch {
			setImportError(t("settings.pushFailed"));
		}
	};

	const pullErrorKey: Record<string, string> = {
		not_found: "settings.noDataFound",
		network_error: "settings.cloudNetworkError",
		invalid_data: "settings.cloudInvalidData",
		supabase_not_configured: "settings.cloudNotConfigured",
	};

	const handleRestore = async () => {
		const code = restoreCode.trim().toUpperCase();
		if (!code) return;
		setRestoring(true);
		try {
			// Link the recovery code to the current anonymous session
			const profileId = await linkRecoveryCode(code);
			if (!profileId) {
				setImportError(t("settings.noDataFound"));
				return;
			}

			const result = await pullFromCloud(code);
			if ("data" in result) {
				setRecoveryCode(code);
				onRecoveryCodeChange(code);
				setData(result.data);
				setRestoreCode("");
			} else {
				setImportError(t(pullErrorKey[result.error] ?? "settings.restoreError"));
			}
		} catch {
			setImportError(t("settings.restoreError"));
		} finally {
			setRestoring(false);
		}
	};

	const handleDisconnect = () => {
		clearRecoveryCode();
		onRecoveryCodeChange(null);
	};

	const handleCopyCode = async () => {
		if (!recoveryCode) return;
		try {
			await navigator.clipboard.writeText(recoveryCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback: select text
		}
	};

	const { startTour } = useTour();

	const handleExpirationMode = (mode: ExpirationMode) => {
		setData({ ...data, settings: { ...data.settings, expirationMode: mode } });
	};

	const lastSync = getLastSync();
	const currentLang = i18n.language;
	const expMode = data.settings?.expirationMode ?? "date";

	return (
		<div className="flex flex-col gap-5">
			{/* Language section */}
			<Card>
				<div className="flex items-center gap-3 mb-4">
					<Globe size={18} className="text-accent" />
					<span className="text-sm font-bold text-text-primary font-body">{t("settings.language")}</span>
				</div>
				<div className="flex gap-2">
					<Button
						variant={currentLang === "fr" ? "default" : "outline"}
						onClick={() => i18n.changeLanguage("fr")}
						className="flex-1"
					>
						{t("settings.languageFr")}
					</Button>
					<Button
						variant={currentLang === "en" ? "default" : "outline"}
						onClick={() => i18n.changeLanguage("en")}
						className="flex-1"
					>
						{t("settings.languageEn")}
					</Button>
				</div>
			</Card>

			{/* Guide section */}
			<Card>
				<div className="flex items-center gap-3 mb-3">
					<BookOpen size={18} className="text-accent" />
					<span className="text-sm font-bold text-text-primary font-body">{t("tour.restartTour")}</span>
				</div>
				<span className="text-xs text-text-sec font-body block mb-3">{t("tour.restartTourSubtitle")}</span>
				<Button variant="outline" onClick={startTour} className="w-full justify-center">
					<Play size={16} /> {t("tour.restartTour")}
				</Button>
			</Card>

			{/* Expiration mode */}
			<Card>
				<div className="flex items-center gap-3 mb-4">
					<Calendar size={18} className="text-accent" />
					<span className="text-sm font-bold text-text-primary font-body">{t("settings.expirationMode")}</span>
				</div>
				<div className="flex gap-2 mb-3">
					<Button
						variant={expMode === "date" ? "default" : "outline"}
						onClick={() => handleExpirationMode("date")}
						className="flex-1"
					>
						{t("settings.expirationModeDate")}
					</Button>
					<Button
						variant={expMode === "simple" ? "default" : "outline"}
						onClick={() => handleExpirationMode("simple")}
						className="flex-1"
					>
						{t("settings.expirationModeSimple")}
					</Button>
				</div>
				<span className="text-xs text-text-sec font-body">
					{expMode === "date" ? t("settings.expirationModeDateDesc") : t("settings.expirationModeSimpleDesc")}
				</span>
			</Card>

			{/* Cloud backup section */}
			{isSupabaseConfigured && (
				<Card>
					<div className="flex items-center gap-3 mb-4">
						<Cloud size={18} className="text-accent" />
						<span className="text-sm font-bold text-text-primary font-body">{t("settings.cloudBackup")}</span>
					</div>

					{recoveryCode ? (
						<div className="flex flex-col gap-3">
							<div className="flex flex-col gap-1.5">
								<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide">
									{t("settings.recoveryCode")}
								</span>
								<div className="flex items-center gap-2">
									<span className="text-sm font-mono text-accent tracking-wider">{recoveryCode}</span>
									<Button
										variant="ghost"
										onClick={handleCopyCode}
										className="!p-1 !min-h-0"
										aria-label={t("aria.copyRecoveryCode")}
									>
										{copied ? (
											<Check size={14} className="text-green" />
										) : (
											<Copy size={14} className="text-text-muted" />
										)}
									</Button>
								</div>
								<span className="text-[11px] text-text-muted font-body">{t("settings.recoveryCodeHelp")}</span>
							</div>

							{lastSync && (
								<div className="flex items-center justify-between">
									<span className="text-xs text-text-sec font-body">{t("settings.lastSync")}</span>
									<span className="text-xs font-mono text-text-primary">
										{new Date(lastSync).toLocaleString(t("dateLocale"), {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							)}

							<div className="flex flex-col gap-2">
								<Button variant="outline" onClick={onSyncNow} disabled={syncing} className="w-full justify-center">
									{syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
									{syncing ? t("settings.syncing") : t("settings.sync")}
								</Button>
								<Button variant="outline" onClick={handleDisconnect} className="w-full justify-center">
									<CloudOff size={16} /> {t("settings.disconnect")}
								</Button>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<span className="text-xs text-text-sec font-body">{t("settings.cloudInfo")}</span>

							<Button variant="outline" onClick={handleActivateCloud} className="w-full justify-center">
								<Cloud size={16} /> {t("settings.enableCloud")}
							</Button>

							<div className="border-t border-border pt-3">
								<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
									{t("settings.haveCode")}
								</span>
								<div className="flex gap-2">
									<Input
										value={restoreCode}
										onChange={(e) => setRestoreCode(e.target.value)}
										placeholder={t("settings.recoveryPlaceholder")}
										className="flex-1 font-mono uppercase text-xs"
									/>
									<Button
										variant="outline"
										onClick={handleRestore}
										disabled={restoring || !restoreCode.trim()}
										className="shrink-0"
									>
										{restoring ? <Loader2 size={16} className="animate-spin" /> : t("settings.restore")}
									</Button>
								</div>
							</div>
						</div>
					)}
				</Card>
			)}

			<Card>
				<div className="flex items-center gap-3 mb-4">
					<Database size={18} className="text-accent" />
					<span className="text-sm font-bold text-text-primary font-body">{t("settings.myData")}</span>
				</div>
				<div className="flex flex-col gap-2.5">
					<div className="flex items-center justify-between">
						<span className="text-xs text-text-sec font-body">{t("settings.schemaVersion")}</span>
						<span className="text-xs font-mono text-text-primary">v{data.version}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-text-sec font-body">{t("settings.storageMode")}</span>
						<span className={`text-xs font-mono flex items-center gap-1.5 ${persistent ? "text-green" : "text-amber"}`}>
							<span className={`w-[6px] h-[6px] rounded-full ${persistent ? "bg-green" : "bg-amber"}`} />
							{persistent ? "sync" : "session"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Film size={14} className="text-text-muted" />
							<span className="text-xs text-text-sec font-body">{t("settings.films")}</span>
						</div>
						<span className="text-xs font-mono text-text-primary">{data.films.length}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<CameraIcon size={14} className="text-text-muted" />
							<span className="text-xs text-text-sec font-body">{t("settings.cameras")}</span>
						</div>
						<span className="text-xs font-mono text-text-primary">{data.cameras.length}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Focus size={14} className="text-text-muted" />
							<span className="text-xs text-text-sec font-body">{t("settings.lenses")}</span>
						</div>
						<span className="text-xs font-mono text-text-primary">{data.lenses.length}</span>
					</div>
				</div>
			</Card>

			{/* Equipment inventory */}
			{(data.cameras.length > 0 || data.lenses.length > 0 || data.backs.length > 0) && (
				<Card>
					<div className="flex items-center gap-3 mb-4">
						<Package size={18} className="text-accent" />
						<span className="text-sm font-bold text-text-primary font-body">{t("settings.inventoryTitle")}</span>
					</div>
					<div className="flex flex-col gap-3">
						{data.cameras.map((cam) => (
							<div key={cam.id} className="flex items-center gap-3">
								{cam.photo ? (
									<PhotoImg
										src={cam.photo}
										alt=""
										className="w-8 h-8 rounded-md object-cover shrink-0 border border-border"
									/>
								) : (
									<div className="w-8 h-8 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
										<CameraIcon size={14} className="text-text-muted opacity-40" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="text-xs font-semibold text-text-primary font-body truncate">
										{cameraDisplayName(cam)}
									</div>
									{cam.serial && (
										<div className="text-[10px] text-text-muted font-mono">
											{t("settings.inventorySerial", { serial: cam.serial })}
										</div>
									)}
								</div>
							</div>
						))}
						{data.lenses.map((lens) => (
							<div key={lens.id} className="flex items-center gap-3">
								{lens.photo ? (
									<PhotoImg
										src={lens.photo}
										alt=""
										className="w-8 h-8 rounded-md object-cover shrink-0 border border-border"
									/>
								) : (
									<div className="w-8 h-8 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
										<Focus size={14} className="text-text-muted opacity-40" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="text-xs font-semibold text-text-primary font-body truncate">
										{lensDisplayName(lens)}
									</div>
									{lens.serial && (
										<div className="text-[10px] text-text-muted font-mono">
											{t("settings.inventorySerial", { serial: lens.serial })}
										</div>
									)}
								</div>
							</div>
						))}
						{data.backs.map((back) => (
							<div key={back.id} className="flex items-center gap-3">
								{back.photo ? (
									<PhotoImg
										src={back.photo}
										alt=""
										className="w-8 h-8 rounded-md object-cover shrink-0 border border-border"
									/>
								) : (
									<div className="w-8 h-8 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
										<CameraIcon size={14} className="text-text-muted opacity-40" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="text-xs font-semibold text-text-primary font-body truncate">
										{back.nickname ? `${back.nickname} (${back.name})` : back.name}
									</div>
									{back.serial && (
										<div className="text-[10px] text-text-muted font-mono">
											{t("settings.inventorySerial", { serial: back.serial })}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</Card>
			)}

			<Button
				variant="ghost"
				onClick={() => setScreen("legal")}
				className="w-full justify-center text-text-muted text-xs"
			>
				{t("settings.legalNotices")}
			</Button>

			<div className="flex flex-col gap-2.5">
				<Button variant="outline" onClick={() => exportData(data)} className="w-full justify-center">
					<Download size={16} /> {t("settings.exportData")}
				</Button>
				<Button variant="outline" onClick={handleImportClick} className="w-full justify-center">
					<Upload size={16} /> {t("settings.importData")}
				</Button>
				<input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
			</div>

			{/* Import error */}
			<Dialog open={!!importError} onOpenChange={(open) => !open && setImportError(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("settings.error")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-accent-soft border border-accent/20 rounded-xl p-3.5">
							<span className="text-xs font-body" style={{ color: T.accent }}>
								{importError}
							</span>
						</div>
						<Button variant="outline" onClick={() => setImportError(null)} className="w-full justify-center">
							{t("settings.close")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Import confirmation */}
			<Dialog open={!!importPreview} onOpenChange={(open) => !open && setImportPreview(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("settings.confirmImport")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{importPreview && (
						<div className="flex flex-col gap-4">
							<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5 flex items-start gap-2.5">
								<AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: T.amber }} />
								<span className="text-xs font-body" style={{ color: T.amber }}>
									{t("settings.importWarning")}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="bg-surface-alt rounded-xl p-3">
									<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
										{t("settings.currentData")}
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-xs text-text-sec font-body">
											{t("settings.film", { count: data.films.length })}
										</span>
										<span className="text-xs text-text-sec font-body">
											{t("settings.camera", { count: data.cameras.length })}
										</span>
										<span className="text-[10px] font-mono text-text-muted">v{data.version}</span>
									</div>
								</div>
								<div className="bg-surface-alt rounded-xl p-3">
									<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
										{t("settings.importedData")}
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-xs text-text-sec font-body">
											{t("settings.film", { count: importPreview.films.length })}
										</span>
										<span className="text-xs text-text-sec font-body">
											{t("settings.camera", { count: importPreview.cameras.length })}
										</span>
										<span className="text-[10px] font-mono text-text-muted">v{importPreview.version}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Button variant="destructive" onClick={confirmImport} className="w-full justify-center">
									{t("settings.confirmImportButton")}
								</Button>
								<Button variant="outline" onClick={() => setImportPreview(null)} className="w-full justify-center">
									{t("settings.cancel")}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
