import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AppData, Film, ScreenName } from "@/types";
import { today, uid } from "@/utils/helpers";

interface AddFilmScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
}

export function AddFilmScreen({ data, setData, setScreen }: AddFilmScreenProps) {
	const [brand, setBrand] = useState("");
	const [model, setModel] = useState("");
	const [iso, setIso] = useState("");
	const [type, setType] = useState("Couleur");
	const [format, setFormat] = useState("35mm");
	const [expDate, setExpDate] = useState("");
	const [quantity, setQuantity] = useState("1");
	const [comment, setComment] = useState("");
	const [price, setPrice] = useState("");

	const handleSave = () => {
		const qty = Number.parseInt(quantity, 10) || 1;
		const newFilms: Film[] = [];
		for (let i = 0; i < qty; i++) {
			newFilms.push({
				id: uid(),
				catalogId: null,
				brand,
				model,
				iso: Number.parseInt(iso, 10) || 0,
				type,
				format,
				state: "stock",
				expDate: expDate || null,
				comment: comment || null,
				price: price ? Number.parseFloat(price) : null,
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
		setScreen("stock");
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => setScreen("stock")}
					className="bg-transparent border-none cursor-pointer p-1"
				>
					<ArrowLeft size={20} className="text-text-sec" />
				</button>
				<h2 className="font-display text-[22px] text-text-primary m-0 italic">Ajouter une pellicule</h2>
			</div>

			<Input label="Marque" value={brand} onChange={setBrand} placeholder="Ex : Kodak, Ilford, Fujifilm…" />
			<Input label="Modèle" value={model} onChange={setModel} placeholder="Ex : Portra 400, HP5 Plus…" />

			<div className="grid grid-cols-2 gap-3">
				<Input label="ISO" type="number" value={iso} onChange={setIso} placeholder="400" mono />
				<Select
					label="Type"
					value={type}
					onChange={setType}
					options={[
						{ value: "Couleur", label: "Couleur" },
						{ value: "N&B", label: "N&B" },
						{ value: "Diapo", label: "Diapo" },
						{ value: "ECN-2", label: "ECN-2" },
						{ value: "Instant", label: "Instant" },
					]}
				/>
			</div>

			<Select
				label="Format"
				value={format}
				onChange={setFormat}
				options={[
					{ value: "35mm", label: "35mm" },
					{ value: "120", label: "Moyen format (120)" },
					{ value: "Instant", label: "Instant" },
				]}
			/>

			<div className="grid grid-cols-2 gap-3">
				<Input label="Quantité" type="number" value={quantity} onChange={setQuantity} min="1" max="50" mono />
				<Input label="Prix unitaire (€)" type="number" value={price} onChange={setPrice} placeholder="0.00" mono />
			</div>

			<Input label="Date d'expiration" type="date" value={expDate} onChange={setExpDate} mono />
			<Input label="Commentaire" value={comment} onChange={setComment} placeholder="Notes…" />

			<Button onClick={handleSave} disabled={!brand || !model} className="w-full justify-center py-3.5 px-5">
				<Plus size={16} /> Ajouter {Number.parseInt(quantity, 10) > 1 ? `${quantity} pellicules` : "la pellicule"}
			</Button>
		</div>
	);
}
