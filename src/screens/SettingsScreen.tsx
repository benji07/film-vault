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
	Loader2,
	RefreshCw,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { T } from "@/constants/theme";
import type { AppData } from "@/types";
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
	onSyncNow: () => void;
}

export function SettingsScreen({
	data,
	setData,
	syncing,
	recoveryCode,
	onRecoveryCodeChange,
	onSyncNow,
}: SettingsScreenProps) {
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

		const result = await parseImportFile(file);
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
		setRecoveryCode(code);
		onRecoveryCodeChange(code);
		await pushToCloud(code, data);
	};

	const handleRestore = async () => {
		const code = restoreCode.trim().toUpperCase();
		if (!code) return;
		setRestoring(true);
		try {
			const cloudData = await pullFromCloud(code);
			if (cloudData) {
				setRecoveryCode(code);
				onRecoveryCodeChange(code);
				setData(cloudData);
				setRestoreCode("");
			} else {
				setImportError("Aucune donnée trouvée pour ce code. Vérifiez qu'il est correct.");
			}
		} catch {
			setImportError("Erreur lors de la récupération des données.");
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

	const lastSync = getLastSync();

	return (
		<div className="flex flex-col gap-5">
			{/* Cloud backup section */}
			{isSupabaseConfigured && (
				<Card>
					<div className="flex items-center gap-3 mb-4">
						<Cloud size={18} className="text-accent" />
						<span className="text-sm font-bold text-text-primary font-body">Sauvegarde cloud</span>
					</div>

					{recoveryCode ? (
						<div className="flex flex-col gap-3">
							<div className="flex flex-col gap-1.5">
								<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide">
									Code de récupération
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
								<span className="text-[11px] text-text-muted font-body">
									Notez ce code pour récupérer vos données sur un autre appareil.
								</span>
							</div>

							{lastSync && (
								<div className="flex items-center justify-between">
									<span className="text-xs text-text-sec font-body">Dernière sync</span>
									<span className="text-xs font-mono text-text-primary">
										{new Date(lastSync).toLocaleString("fr-FR", {
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
									{syncing ? "Synchronisation…" : "Synchroniser"}
								</Button>
								<Button variant="outline" onClick={handleDisconnect} className="w-full justify-center">
									<CloudOff size={16} /> Dissocier
								</Button>
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<span className="text-xs text-text-sec font-body">
								Activez la sauvegarde cloud pour protéger vos données et les récupérer sur un autre appareil.
							</span>

							<Button variant="outline" onClick={handleActivateCloud} className="w-full justify-center">
								<Cloud size={16} /> Activer la sauvegarde cloud
							</Button>

							<div className="border-t border-border pt-3">
								<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
									J'ai déjà un code
								</span>
								<div className="flex gap-2">
									<Input
										value={restoreCode}
										onChange={(e) => setRestoreCode(e.target.value)}
										placeholder="FILM-XXXX-XXXX"
										className="flex-1 font-mono uppercase text-xs"
									/>
									<Button
										variant="outline"
										onClick={handleRestore}
										disabled={restoring || !restoreCode.trim()}
										className="shrink-0"
									>
										{restoring ? <Loader2 size={16} className="animate-spin" /> : "Récupérer"}
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
					<span className="text-sm font-bold text-text-primary font-body">Mes données</span>
				</div>
				<div className="flex flex-col gap-2.5">
					<div className="flex items-center justify-between">
						<span className="text-xs text-text-sec font-body">Version du schéma</span>
						<span className="text-xs font-mono text-text-primary">v{data.version}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Film size={14} className="text-text-muted" />
							<span className="text-xs text-text-sec font-body">Pellicules</span>
						</div>
						<span className="text-xs font-mono text-text-primary">{data.films.length}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<CameraIcon size={14} className="text-text-muted" />
							<span className="text-xs text-text-sec font-body">Appareils</span>
						</div>
						<span className="text-xs font-mono text-text-primary">{data.cameras.length}</span>
					</div>
				</div>
			</Card>

			<div className="flex flex-col gap-2.5">
				<Button variant="outline" onClick={() => exportData(data)} className="w-full justify-center">
					<Download size={16} /> Exporter mes données
				</Button>
				<Button variant="outline" onClick={handleImportClick} className="w-full justify-center">
					<Upload size={16} /> Importer des données
				</Button>
				<input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
			</div>

			{/* Import error */}
			<Dialog open={!!importError} onOpenChange={(open) => !open && setImportError(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Erreur</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-accent-soft border border-accent/20 rounded-xl p-3.5">
							<span className="text-xs font-body" style={{ color: T.accent }}>
								{importError}
							</span>
						</div>
						<Button variant="outline" onClick={() => setImportError(null)} className="w-full justify-center">
							Fermer
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Import confirmation */}
			<Dialog open={!!importPreview} onOpenChange={(open) => !open && setImportPreview(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmer l'import</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{importPreview && (
						<div className="flex flex-col gap-4">
							<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5 flex items-start gap-2.5">
								<AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: T.amber }} />
								<span className="text-xs font-body" style={{ color: T.amber }}>
									L'import remplacera toutes vos données actuelles. Cette action est irréversible.
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="bg-surface-alt rounded-xl p-3">
									<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
										Données actuelles
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-xs text-text-sec font-body">
											{data.films.length} pellicule{data.films.length > 1 ? "s" : ""}
										</span>
										<span className="text-xs text-text-sec font-body">
											{data.cameras.length} appareil{data.cameras.length > 1 ? "s" : ""}
										</span>
										<span className="text-[10px] font-mono text-text-muted">v{data.version}</span>
									</div>
								</div>
								<div className="bg-surface-alt rounded-xl p-3">
									<span className="text-[10px] font-bold text-text-muted font-body uppercase tracking-wide block mb-2">
										Données importées
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-xs text-text-sec font-body">
											{importPreview.films.length} pellicule{importPreview.films.length > 1 ? "s" : ""}
										</span>
										<span className="text-xs text-text-sec font-body">
											{importPreview.cameras.length} appareil{importPreview.cameras.length > 1 ? "s" : ""}
										</span>
										<span className="text-[10px] font-mono text-text-muted">v{importPreview.version}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Button variant="destructive" onClick={confirmImport} className="w-full justify-center">
									Confirmer l'import
								</Button>
								<Button variant="outline" onClick={() => setImportPreview(null)} className="w-full justify-center">
									Annuler
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
