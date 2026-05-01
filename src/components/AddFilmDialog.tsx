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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { type AppData, type FilmState, isInstantFormat } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { createNewFilm } from "@/utils/film-factory";
import { collectAllTags } from "@/utils/film-helpers";
import { today } from "@/utils/helpers";
import { useFilmSuggestions } from "@/utils/use-film-suggestions";

interface AddFilmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
}

const STATE_OPTIONS: FilmState[] = ["stock", "loaded", "partial", "exposed", "developed", "scanned"];

function isAfterStock(state: FilmState): boolean {
	return state !== "stock";
}

function hasEndDate(state: FilmState): boolean {
	return state === "exposed" || state === "developed" || state === "scanned";
}

function hasDevFields(state: FilmState): boolean {
	return state === "developed" || state === "scanned";
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
	const [expDate, setExpDate] = useState("");
	const [quantity, setQuantity] = useState("1");
	const [storageLocation, setStorageLocation] = useState("");
	const [price, setPrice] = useState("");
	const [comment, setComment] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [state, setState] = useState<FilmState>("stock");
	const [cameraId, setCameraId] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [shootIso, setShootIso] = useState("");
	const [posesShot, setPosesShot] = useState("");
	const [lab, setLab] = useState("");
	const [devDate, setDevDate] = useState("");
	const [scanRef, setScanRef] = useState("");

	const advanced = isAfterStock(state);
	const availableCameras = data.cameras.filter((c) => !c.soldAt);

	useEffect(() => {
		if (!open) {
			setBrand("");
			setModel("");
			setIso("");
			setType("Couleur");
			setFormat("35mm");
			setExpDate("");
			setQuantity("1");
			setPrice("");
			setStorageLocation("");
			setComment("");
			setTags([]);
			setState("stock");
			setCameraId("");
			setStartDate("");
			setEndDate("");
			setShootIso("");
			setPosesShot("");
			setLab("");
			setDevDate("");
			setScanRef("");
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

	const handleStateChange = (next: FilmState) => {
		setState(next);
		if (next !== "stock") setQuantity("1");
	};

	const handleSave = () => {
		const qty = advanced ? 1 : Number.parseInt(quantity, 10) || 1;
		const camera = cameraId ? (data.cameras.find((c) => c.id === cameraId) ?? null) : null;
		const isoValue = Number.parseInt(iso, 10) || 0;
		const shootIsoValue = shootIso.trim() ? Number.parseInt(shootIso, 10) || isoValue : null;
		const params = {
			brand: brand.trim(),
			model: model.trim(),
			iso: isoValue,
			type,
			format,
			expDate: expDate || null,
			comment: comment.trim() || null,
			price: price.trim() ? Number.parseFloat(price) : null,
			storageLocation: storageLocation.trim() || null,
			tags: tags.length > 0 ? tags : undefined,
			state,
			cameraId: advanced && cameraId ? cameraId : null,
			startDate: advanced ? startDate || today() : null,
			endDate: advanced && hasEndDate(state) ? endDate || startDate || today() : null,
			shootIso: advanced ? shootIsoValue : null,
			posesShot: state === "partial" && posesShot.trim() ? Number.parseInt(posesShot, 10) || 0 : null,
			lab: advanced && hasDevFields(state) ? lab.trim() || null : null,
			devDate: advanced && hasDevFields(state) ? devDate || endDate || today() : null,
			scanRef: state === "scanned" ? scanRef.trim() || null : null,
			camera,
		};
		const newFilms = Array.from({ length: qty }, () => createNewFilm(params));
		const updated = { ...data, films: [...data.films, ...newFilms] };
		setData(updated);
		toast(qty > 1 ? t("addFilm.filmsAdded", { count: qty }) : t("addFilm.filmAdded"));
		onOpenChange(false);
	};

	const qty = advanced ? 1 : Number.parseInt(quantity, 10) || 1;

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

					<FormField label={t("addFilm.initialState")}>
						<Select value={state} onValueChange={(v) => handleStateChange(v as FilmState)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{STATE_OPTIONS.map((s) => (
									<SelectItem key={s} value={s}>
										{t(`states.${s}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>

					{!advanced && (
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
					)}

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

					<TagInput
						label={t("addFilm.tags")}
						value={tags}
						onChange={setTags}
						suggestions={collectAllTags(data.films)}
						placeholder={t("addFilm.tagsPlaceholder")}
					/>

					{advanced && (
						<div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-3.5">
							<span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
								{t("addFilm.contextualSection")}
							</span>
							<FormField label={t("filmDetail.cameraField")}>
								<Select value={cameraId || "__none__"} onValueChange={(v) => setCameraId(v === "__none__" ? "" : v)}>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__none__">{t("addFilm.noInfo")}</SelectItem>
										{availableCameras.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{cameraDisplayName(c)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
							<FormField label={t("filmDetail.shootIsoField")}>
								<Input
									type="number"
									value={shootIso}
									onChange={(e) => setShootIso(e.target.value)}
									placeholder={iso || "400"}
									className="font-mono"
								/>
							</FormField>
							<FormField label={t("filmDetail.startDateField")}>
								<Input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="font-mono"
								/>
							</FormField>
							{state === "partial" && (
								<FormField label={t("filmDetail.posesField")}>
									<Input
										type="number"
										value={posesShot}
										onChange={(e) => setPosesShot(e.target.value)}
										placeholder="0"
										className="font-mono"
									/>
								</FormField>
							)}
							{hasEndDate(state) && (
								<FormField label={t("filmDetail.endDateField")}>
									<Input
										type="date"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										className="font-mono"
									/>
								</FormField>
							)}
							{hasDevFields(state) && (
								<>
									<FormField label={t("filmDetail.labField")}>
										<Input
											value={lab}
											onChange={(e) => setLab(e.target.value)}
											placeholder={t("filmDetail.labPlaceholder")}
										/>
									</FormField>
									<FormField label={t("filmDetail.devDateField")}>
										<Input
											type="date"
											value={devDate}
											onChange={(e) => setDevDate(e.target.value)}
											className="font-mono"
										/>
									</FormField>
								</>
							)}
							{state === "scanned" && (
								<FormField label={t("filmDetail.scanRefField")}>
									<Input
										value={scanRef}
										onChange={(e) => setScanRef(e.target.value)}
										placeholder={t("filmDetail.scanRefPlaceholder")}
									/>
								</FormField>
							)}
						</div>
					)}

					<Button onClick={handleSave} disabled={!brand || !model} className="w-full justify-center py-3.5 px-5">
						<Plus size={16} /> {t("addFilm.addButton", { count: qty })}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
