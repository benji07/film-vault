import { AlertTriangle, ArrowLeft, Camera as CameraIcon, Database, Download, Film, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { T } from "@/constants/theme";
import type { AppData, ScreenName } from "@/types";
import { exportData, parseImportFile } from "@/utils/storage";

interface SettingsScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
}

export function SettingsScreen({ data, setData, setScreen }: SettingsScreenProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importPreview, setImportPreview] = useState<AppData | null>(null);
	const [importError, setImportError] = useState<string | null>(null);

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

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => setScreen("home")}
					className="bg-transparent border-none cursor-pointer p-1"
				>
					<ArrowLeft size={20} className="text-text-sec" />
				</button>
				<h2 className="font-display text-2xl text-text-primary m-0 italic">Réglages</h2>
			</div>

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
				<Button variant="secondary" onClick={() => exportData(data)} className="w-full justify-center">
					<Download size={16} /> Exporter mes données
				</Button>
				<Button variant="secondary" onClick={handleImportClick} className="w-full justify-center">
					<Upload size={16} /> Importer des données
				</Button>
				<input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
			</div>

			{/* Import error */}
			<Sheet open={!!importError} onClose={() => setImportError(null)} title="Erreur d'import">
				<div className="flex flex-col gap-4">
					<div className="bg-accent-soft border border-accent/20 rounded-xl p-3.5">
						<span className="text-xs font-body" style={{ color: T.accent }}>
							{importError}
						</span>
					</div>
					<Button variant="secondary" onClick={() => setImportError(null)} className="w-full justify-center">
						Fermer
					</Button>
				</div>
			</Sheet>

			{/* Import confirmation */}
			<Sheet open={!!importPreview} onClose={() => setImportPreview(null)} title="Confirmer l'import">
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
							<Button variant="danger" onClick={confirmImport} className="w-full justify-center">
								Confirmer l'import
							</Button>
							<Button variant="secondary" onClick={() => setImportPreview(null)} className="w-full justify-center">
								Annuler
							</Button>
						</div>
					</div>
				)}
			</Sheet>
		</div>
	);
}
