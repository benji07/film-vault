import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, Film } from "@/types";
import { currentMonthYear, today, uid } from "@/utils/helpers";
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
				history: [{ date: today(), action: "", actionCode: "added" }],
			});
		}
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
						<FormField label={t("addFilm.type")}>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Couleur">{t("filmTypes.Couleur")}</SelectItem>
									<SelectItem value="N&B">{t("filmTypes.N&B")}</SelectItem>
									<SelectItem value="Diapo">{t("filmTypes.Diapo")}</SelectItem>
									<SelectItem value="ECN-2">{t("filmTypes.ECN-2")}</SelectItem>
									<SelectItem value="Instant">{t("filmTypes.Instant")}</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
					</div>

					<FormField label={t("addFilm.format")}>
						<Select value={format} onValueChange={setFormat}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="35mm">{t("filmFormats.35mm")}</SelectItem>
								<SelectItem value="120">{t("filmFormats.120")}</SelectItem>
								<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
							</SelectContent>
						</Select>
					</FormField>

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

					<FormField label={t("addFilm.expirationDate")}>
						<MonthYearPicker value={expDate} onChange={setExpDate} />
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
