import { Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilmFormatSelect, FilmTypeSelect } from "@/components/FilmTypeFormatFields";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilmLabel } from "@/components/ui/film-label";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FilmDevelopmentProcess } from "@/constants/film-catalog";
import type { FilmFormat, FilmType } from "@/types";
import {
	type AdminFilmStock,
	type AdminFilmStockInput,
	buildCatalogImagePath,
	deleteCatalogImage,
	uploadCatalogImage,
	upsertFilmStock,
} from "@/utils/admin-catalog";

interface AdminFilmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editing: AdminFilmStock | null;
	onSaved: () => void;
}

const DEV_PROCESSES: FilmDevelopmentProcess[] = ["C-41", "E-6", "B&W", "ECN-2", "K-14"];
const NONE = "__none__";

export function AdminFilmDialog({ open, onOpenChange, editing, onSaved }: AdminFilmDialogProps) {
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [brand, setBrand] = useState("");
	const [model, setModel] = useState("");
	const [iso, setIso] = useState("");
	const [type, setType] = useState<FilmType>("Couleur");
	const [format, setFormat] = useState<FilmFormat>("35mm");
	const [developmentProcess, setDevelopmentProcess] = useState<FilmDevelopmentProcess | "">("");
	const [imageUrl, setImageUrl] = useState("");
	const [imagePath, setImagePath] = useState("");
	const [active, setActive] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setBrand(editing?.brand ?? "");
		setModel(editing?.model ?? "");
		setIso(editing?.iso != null ? String(editing.iso) : "");
		setType((editing?.type as FilmType) ?? "Couleur");
		setFormat((editing?.format as FilmFormat) ?? "35mm");
		setDevelopmentProcess((editing?.development_process as FilmDevelopmentProcess) ?? "");
		setImageUrl(editing?.image_url ?? "");
		setImagePath(editing?.image_path ?? "");
		setActive(editing?.active ?? true);
	}, [open, editing]);

	const handlePickImage = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (!file) return;
		if (!brand.trim() || !model.trim()) {
			toast("Renseigne marque + modèle avant l'upload", "error");
			return;
		}

		setUploading(true);
		try {
			const path = buildCatalogImagePath(brand, model, format, file);
			const { publicUrl, path: storedPath } = await uploadCatalogImage(file, path);

			// Best-effort: drop the previous image if it lived in our bucket
			if (imagePath && imagePath !== storedPath) {
				deleteCatalogImage(imagePath).catch(() => {});
			}

			setImageUrl(publicUrl);
			setImagePath(storedPath);
			toast("Image téléversée", "success");
		} catch (err) {
			console.error(err);
			toast("Échec du téléversement", "error");
		} finally {
			setUploading(false);
		}
	};

	const handleClearImage = () => {
		if (imagePath) deleteCatalogImage(imagePath).catch(() => {});
		setImageUrl("");
		setImagePath("");
	};

	const handleSave = async () => {
		const isoValue = Number.parseInt(iso, 10);
		if (!brand.trim() || !model.trim() || !Number.isFinite(isoValue) || isoValue <= 0) {
			toast("Champs marque, modèle et ISO requis", "error");
			return;
		}

		const payload: AdminFilmStockInput = {
			id: editing?.id ?? null,
			brand: brand.trim(),
			model: model.trim(),
			iso: isoValue,
			type,
			format,
			development_process: developmentProcess || null,
			image_url: imageUrl.trim() || null,
			image_path: imagePath.trim() || null,
			active,
		};

		setSaving(true);
		try {
			await upsertFilmStock(payload);
			toast(editing ? "Pellicule mise à jour" : "Pellicule ajoutée", "success");
			onSaved();
			onOpenChange(false);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erreur inconnue";
			toast(`Échec : ${msg}`, "error");
		} finally {
			setSaving(false);
		}
	};

	const previewIso = iso.trim() ? iso : "—";

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editing ? "Modifier la pellicule" : "Ajouter une pellicule"}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>

				<div className="-mx-1 mb-4 h-32 rounded-xl overflow-hidden border border-border">
					<FilmLabel
						brand={brand || "—"}
						type={type}
						iso={previewIso}
						format={format}
						imageUrl={imageUrl || undefined}
						className="h-full"
					/>
				</div>

				<div className="flex flex-col gap-4">
					<FormField label="Marque">
						<Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Kodak" />
					</FormField>
					<FormField label="Modèle">
						<Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Portra 400" />
					</FormField>

					<div className="grid grid-cols-2 gap-3">
						<FormField label="ISO">
							<Input
								type="number"
								value={iso}
								onChange={(e) => setIso(e.target.value)}
								placeholder="400"
								className="font-mono"
							/>
						</FormField>
						<FilmTypeSelect value={type} onValueChange={(v) => setType(v as FilmType)} format={format} />
					</div>

					<FilmFormatSelect value={format} onValueChange={(v) => setFormat(v as FilmFormat)} />

					<FormField label="Procédé de développement">
						<Select
							value={developmentProcess || NONE}
							onValueChange={(v) => setDevelopmentProcess(v === NONE ? "" : (v as FilmDevelopmentProcess))}
						>
							<SelectTrigger>
								<SelectValue placeholder="—" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NONE}>—</SelectItem>
								{DEV_PROCESSES.map((p) => (
									<SelectItem key={p} value={p}>
										{p}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>

					<FormField label="URL de l'image (boîte)">
						<Input
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="https://… ou téléverse ci-dessous"
						/>
					</FormField>

					<div className="flex gap-2">
						<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
						<Button variant="outline" onClick={handlePickImage} disabled={uploading} className="flex-1 justify-center">
							{uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
							{uploading ? "Téléversement…" : "Téléverser"}
						</Button>
						{(imageUrl || imagePath) && (
							<Button variant="ghost" onClick={handleClearImage} className="justify-center">
								<ImageIcon size={16} /> Retirer
							</Button>
						)}
					</div>

					<FormField label="État">
						<Select value={active ? "active" : "archived"} onValueChange={(v) => setActive(v === "active")}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="archived">Archivée</SelectItem>
							</SelectContent>
						</Select>
					</FormField>

					<Button
						onClick={handleSave}
						disabled={saving || uploading || !brand.trim() || !model.trim()}
						className="w-full justify-center py-3.5 px-5"
					>
						{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
						{saving ? "Enregistrement…" : "Enregistrer"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
