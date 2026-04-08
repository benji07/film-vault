import {
	AlertTriangle,
	Camera as CameraIcon,
	Check,
	Cloud,
	CloudOff,
	Copy,
	Database,
	Download,
	Film,
	Globe,
	HardDriveDownload,
	HardDriveUpload,
	Loader2,
	LogOut,
	RefreshCw,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { T } from "@/constants/theme";
import type { AppData } from "@/types";
import {
	type GoogleUser,
	getLastBackup,
	googleSignIn,
	googleSignOut,
	isGoogleDriveConfigured,
	loadFromDrive,
	saveToDrive,
} from "@/utils/google-drive";
import { exportData, parseImportFile } from "@/utils/storage";
import { isSupabaseConfigured } from "@/utils/supabase";
import {
	clearRecoveryCode,
	generateRecoveryCode,
	getLastSync,
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
	googleUser: GoogleUser | null;
	onGoogleUserChange: (user: GoogleUser | null) => void;
	onSyncNow: () => void;
}

export function SettingsScreen({
	data,
	setData,
	syncing,
	recoveryCode,
	onRecoveryCodeChange,
	googleUser,
	onGoogleUserChange,
	onSyncNow,
}: SettingsScreenProps) {
	const { t, i18n } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importPreview, setImportPreview] = useState<AppData | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [restoreCode, setRestoreCode] = useState("");
	const [restoring, setRestoring] = useState(false);
	const [copied, setCopied] = useState(false);
	const [driveBusy, setDriveBusy] = useState(false);

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

	// --- Recovery code handlers ---

	const handleActivateCloud = async () => {
		const code = generateRecoveryCode();
		const success = await pushToCloud(code, data);
		if (success) {
			setRecoveryCode(code);
			onRecoveryCodeChange(code);
		} else {
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

	// --- Google Drive handlers ---

	const handleGoogleSignIn = async () => {
		setDriveBusy(true);
		try {
			const user = await googleSignIn();
			onGoogleUserChange(user);
		} catch {
			setImportError(t("settings.driveError"));
		} finally {
			setDriveBusy(false);
		}
	};

	const handleGoogleSignOut = async () => {
		await googleSignOut();
		onGoogleUserChange(null);
	};

	const handleSaveToDrive = async () => {
		setDriveBusy(true);
		try {
			await saveToDrive(data);
		} catch {
			setImportError(t("settings.driveError"));
		} finally {
			setDriveBusy(false);
		}
	};

	const handleLoadFromDrive = async () => {
		setDriveBusy(true);
		try {
			const restored = await loadFromDrive();
			if (restored) {
				setData(restored);
			} else {
				setImportError(t("settings.driveNoBackup"));
			}
		} catch {
			setImportError(t("settings.driveError"));
		} finally {
			setDriveBusy(false);
		}
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

	const lastSync = getLastSync();
	const lastBackup = getLastBackup();
	const currentLang = i18n.language;

	return (
		<div className="flex flex-col gap-5">
			{/* Language section */}
			<Card>
				<div className="flex items-center gap-3 mb-4">
					<Globe size={18} className="text-accent" />
					<span className="text-sm font-bold text-text-primary font-body">{t("settings.language")}</span>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => i18n.changeLanguage("fr")}
						className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-body font-medium cursor-pointer transition-all border ${
							currentLang === "fr"
								? "bg-accent text-white border-accent"
								: "bg-surface-alt text-text-sec border-border hover:bg-surface"
						}`}
					>
						{t("settings.languageFr")}
					</button>
					<button
						type="button"
						onClick={() => i18n.changeLanguage("en")}
						className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-body font-medium cursor-pointer transition-all border ${
							currentLang === "en"
								? "bg-accent text-white border-accent"
								: "bg-surface-alt text-text-sec border-border hover:bg-surface"
						}`}
					>
						{t("settings.languageEn")}
					</button>
				</div>
			</Card>

			{/* Google Drive backup section */}
			{isGoogleDriveConfigured && (
				<Card>
					<div className="flex items-center gap-3 mb-4">
						<svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
							<path d="M8.01 18.28l2.44-4.24h10.55l-2.44 4.24z" fill="#3777E3" />
							<path d="M15.84 14.04L8.44 1h4.88l7.4 13.04z" fill="#FFCF63" />
							<path d="M3 14.04L5.44 18.28 13.32 4.24 10.88 0z" fill="#11A861" />
						</svg>
						<span className="text-sm font-bold text-text-primary font-body">{t("settings.googleDrive")}</span>
					</div>

					{googleUser ? (
						<div className="flex flex-col gap-3">
							<div className="flex flex-col gap-1.5">
								<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide">
									{t("settings.connectedAs")}
								</span>
								<span className="text-sm font-body text-accent">{googleUser.email}</span>
							</div>

							{lastBackup && (
								<div className="flex items-center justify-between">
									<span className="text-xs text-text-sec font-body">{t("settings.lastBackup")}</span>
									<span className="text-xs font-mono text-text-primary">
										{new Date(lastBackup).toLocaleString(t("dateLocale"), {
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
								<Button
									variant="outline"
									onClick={handleSaveToDrive}
									disabled={driveBusy}
									className="w-full justify-center"
								>
									{driveBusy ? <Loader2 size={16} className="animate-spin" /> : <HardDriveUpload size={16} />}
									{t("settings.saveToGoogleDrive")}
								</Button>
								<Button
									variant="outline"
									onClick={handleLoadFromDrive}
									disabled={driveBusy}
									className="w-full justify-center"
								>
									{driveBusy ? <Loader2 size={16} className="animate-spin" /> : <HardDriveDownload size={16} />}
									{t("settings.restoreFromGoogleDrive")}
								</Button>
								<Button variant="outline" onClick={handleGoogleSignOut} className="w-full justify-center">
									<LogOut size={16} /> {t("settings.logout")}
								</Button>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<span className="text-xs text-text-sec font-body">{t("settings.driveInfo")}</span>
							<Button
								variant="outline"
								onClick={handleGoogleSignIn}
								disabled={driveBusy}
								className="w-full justify-center"
							>
								{driveBusy ? (
									<Loader2 size={16} className="animate-spin" />
								) : (
									<svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
								)}
								{t("settings.signInGoogle")}
							</Button>
						</div>
					)}
				</Card>
			)}

			{/* Cloud backup section (Supabase recovery code) */}
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
									<button
										type="button"
										onClick={handleCopyCode}
										className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
									>
										{copied ? (
											<Check size={14} className="text-green" />
										) : (
											<Copy size={14} className="text-text-muted" />
										)}
									</button>
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
				</div>
			</Card>

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
