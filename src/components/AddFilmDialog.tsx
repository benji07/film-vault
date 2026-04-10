import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilmFormatSelect, FilmTypeSelect } from "@/components/FilmTypeFormatFields";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { type AppData, isInstantFormat } from "@/types";
import { createNewFilm } from "@/utils/film-factory";
import { currentMonthYear } from "@/utils/helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";

interface AddFilmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
}

export function AddFilmDialog({ open, onOpenChange, data, setData }: AddFilmDialogProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { brands, modelsForBrand, filmDataFor } = useFilmSuggestions(data.films);
	const [brand, setBrand] = useState("");
	const [model, setModel] = useState("");
	const [iso, setIso] = useState("");
	const [type, setType] = useState("Couleur");
	const [format, setFormat] = useState("35mm");
	const [expDate, setExpDate] = useState(currentMonthYear());
	const [quantity, setQuantity] = useState("1");
	const [storageLocation, setStorageLocation] = useState("");
	const [price, setPrice] = useState("");
	const [comment, setComment] = useState("");

	useEffect(() => {
		if (!open) {
			setBrand("");
			setModel("");
			setIso("");
			setType("Couleur");
			setFormat("35mm");
			setExpDate(currentMonthYear());
			setQuantity("1");
			setPrice("");
			setStorageLocation("");
			setComment("");
		}
	}, [open]);

	const handleModelSelect = (selectedModel: string) => {
		const info = filmDataFor(brand, selectedModel);
		if (info) {
			setIso(String(info.iso));
			setType(info.type);
			setFormat(info.format);
		}
	};

	const handleSave = () => {
		const qty = Number.parseInt(quantity, 10) || 1;
		const params = {
			brand: brand.trim(),
			model: model.trim(),
			iso: Number.parseInt(iso, 10) || 0,
			type,
			format,
			expDate: expDate || null,
			comment: comment.trim() || null,
			price: price.trim() ? Number.parseFloat(price) : null,
			storageLocation: storageLocation.trim() || null,
		};
		const newFilms = Array.from({ length: qty }, () => createNewFilm(params));
		const updated = { ...data, films: [...data.films, ...newFilms] };
		setData(updated);
		toast(qty > 1 ? t("addFilm.filmsAdded", { count: qty }) : t("addFilm.filmAdded"));
		onOpenChange(false);
	};

	const qty = Number.parseInt(quantity, 10) || 1;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("addFilm.title")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<AutocompleteInput
						label={t("addFilm.brand")}
						value={brand}
						onChange={setBrand}
						suggestions={brands}
						placeholder={t("addFilm.brandPlaceholder")}
					/>
					<AutocompleteInput
						label={t("addFilm.model")}
						value={model}
						onChange={setModel}
						onSelect={handleModelSelect}
						suggestions={modelsForBrand(brand)}
						placeholder={t("addFilm.modelPlaceholder")}
					/>

					<FilmFormatSelect
						value={format}
						onValueChange={(v) => {
							setFormat(v);
							if (isInstantFormat(v) && type !== "Couleur" && type !== "N&B") setType("Couleur");
						}}
					/>

					<div className="grid grid-cols-2 gap-3">
						<FormField label={t("addFilm.iso")}>
							<Input
								type="number"
								value={iso}
								onChange={(e) => setIso(e.target.value)}
								placeholder="400"
								className="font-mono"
							/>
						</FormField>
						<FilmTypeSelect value={type} onValueChange={setType} format={format} />
					</div>

					<FormField label={t("addFilm.quantity")}>
						<Input
							type="number"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							min="1"
							max="50"
							className="font-mono"
						/>
					</FormField>

					<FormField label={t("addFilm.price")}>
						<Input
							type="number"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							placeholder={t("addFilm.pricePlaceholder")}
							className="font-mono"
							step="0.01"
							min="0"
						/>
					</FormField>
					<FormField label={t("addFilm.expirationDate")}>
						<MonthYearPicker value={expDate} onChange={setExpDate} />
					</FormField>
					<FormField label={t("addFilm.storageLocation")}>
						<Input
							value={storageLocation}
							onChange={(e) => setStorageLocation(e.target.value)}
							placeholder={t("addFilm.storageLocationPlaceholder")}
						/>
					</FormField>
					<FormField label={t("addFilm.comment")}>
						<Input
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder={t("addFilm.notesPlaceholder")}
						/>
					</FormField>

					<Button onClick={handleSave} disabled={!brand || !model} className="w-full justify-center py-3.5 px-5">
						<Plus size={16} /> {t("addFilm.addButton", { count: qty })}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
