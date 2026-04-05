import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, Film, ScreenName } from "@/types";
import { currentMonthYear, today, uid } from "@/utils/helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";

interface AddFilmScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
}

export function AddFilmScreen({ data, setData, setScreen }: AddFilmScreenProps) {
	const { toast } = useToast();
	const { brands, modelsForBrand, filmDataFor } = useFilmSuggestions(data.films);
	const [brand, setBrand] = useState("");
	const [model, setModel] = useState("");
	const [iso, setIso] = useState("");
	const [type, setType] = useState("Couleur");
	const [format, setFormat] = useState("35mm");
	const [expDate, setExpDate] = useState(currentMonthYear());
	const [quantity, setQuantity] = useState("1");
	const [comment, setComment] = useState("");

	const handleModelSelect = (selectedModel: string) => {
		const data = filmDataFor(brand, selectedModel);
		if (data) {
			setIso(String(data.iso));
			setType(data.type);
			setFormat(data.format);
		}
	};

	const handleSave = () => {
		const qty = Number.parseInt(quantity, 10) || 1;
		const newFilms: Film[] = [];
		for (let i = 0; i < qty; i++) {
			newFilms.push({
				id: uid(),
				brand: brand.trim(),
				model: model.trim(),
				iso: Number.parseInt(iso, 10) || 0,
				type,
				format,
				state: "stock",
				expDate: expDate || null,
				comment: comment.trim() || null,
				addedDate: today(),
				shootIso: null,
				cameraId: null,
				backId: null,
				startDate: null,
				endDate: null,
				posesShot: null,
				posesTotal: format === "120" ? 12 : format === "Instant" ? 10 : 36,
				lab: null,
				devDate: null,
				history: [{ date: today(), action: "Ajoutée au stock" }],
			});
		}
		const updated = { ...data, films: [...data.films, ...newFilms] };
		setData(updated);
		toast(qty > 1 ? `${qty} pellicules ajoutées` : "Pellicule ajoutée");
		setScreen("stock");
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => setScreen("stock")}
					className="bg-transparent border-none cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
				>
					<ArrowLeft size={20} className="text-text-sec" />
				</button>
				<h2 className="font-display text-[22px] text-text-primary m-0 italic">Ajouter une pellicule</h2>
			</div>

			<AutocompleteInput
				label="Marque"
				value={brand}
				onChange={setBrand}
				suggestions={brands}
				placeholder="Ex : Kodak, Ilford, Fujifilm…"
			/>
			<AutocompleteInput
				label="Modèle"
				value={model}
				onChange={setModel}
				onSelect={handleModelSelect}
				suggestions={modelsForBrand(brand)}
				placeholder="Ex : Portra 400, HP5 Plus…"
			/>

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
				<FormField label="Type">
					<Select value={type} onValueChange={setType}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Couleur">Couleur</SelectItem>
							<SelectItem value="N&B">N&B</SelectItem>
							<SelectItem value="Diapo">Diapo</SelectItem>
							<SelectItem value="ECN-2">ECN-2</SelectItem>
							<SelectItem value="Instant">Instant</SelectItem>
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField label="Format">
				<Select value={format} onValueChange={setFormat}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="35mm">35mm</SelectItem>
						<SelectItem value="120">Moyen format (120)</SelectItem>
						<SelectItem value="Instant">Instant</SelectItem>
					</SelectContent>
				</Select>
			</FormField>

			<FormField label="Quantité">
				<Input
					type="number"
					value={quantity}
					onChange={(e) => setQuantity(e.target.value)}
					min="1"
					max="50"
					className="font-mono"
				/>
			</FormField>

			<FormField label="Date d'expiration">
				<MonthYearPicker value={expDate} onChange={setExpDate} />
			</FormField>
			<FormField label="Commentaire">
				<Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notes…" />
			</FormField>

			<Button onClick={handleSave} disabled={!brand || !model} className="w-full justify-center py-3.5 px-5">
				<Plus size={16} /> Ajouter {Number.parseInt(quantity, 10) > 1 ? `${quantity} pellicules` : "la pellicule"}
			</Button>
		</div>
	);
}
