import { Save } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { FilmFormatSelect, FilmTypeSelect } from "@/components/FilmTypeFormatFields";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { alpha, T } from "@/constants/theme";
import { type AppData, type Back, type Camera, type Film, isInstantFormat } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { collectAllTags } from "@/utils/film-helpers";
import { today } from "@/utils/helpers";
import { filterLensesByMount, lensDisplayName } from "@/utils/lens-helpers";
import type { ActionType, EditData } from "./types";

interface EditModalProps {
	showAction: ActionType;
	closeAction: () => void;
	film: Film;
	data: AppData;
	editData: EditData;
	setEditData: Dispatch<SetStateAction<EditData>>;
	updateFilm: (updates: Partial<Film>, toastMessage?: string) => void;
	availableCameras: Camera[];
	editCompatibleBacks: Back[];
	showLoading: boolean;
	showExposure: boolean;
	showEndDate: boolean;
	showDev: boolean;
	showScan: boolean;
	brands: string[];
	modelsForBrand: (brand: string) => string[];
	filmDataFor: (brand: string, model: string) => { iso: number; type: string; format: string } | undefined;
}

export function EditModal({
	showAction,
	closeAction,
	film,
	data,
	editData,
	setEditData,
	updateFilm,
	availableCameras,
	editCompatibleBacks,
	showLoading,
	showExposure,
	showEndDate,
	showDev,
	showScan,
	brands,
	modelsForBrand,
	filmDataFor,
}: EditModalProps) {
	const { t } = useTranslation();

	const selectedCamera = editData.cameraId ? data.cameras.find((c) => c.id === editData.cameraId) : null;
	const showLensField = selectedCamera?.hasInterchangeableLens ?? true;

	// Include the currently-selected lens even if sold, so editing a film that references
	// an archived lens still shows the correct Select value (instead of rendering blank).
	// Filter by camera mount when both camera and lenses have a mount defined.
	const visibleLenses = filterLensesByMount(data.lenses, selectedCamera).filter(
		(l) => !l.soldAt || l.id === editData.lensId,
	);

	return (
		<Dialog open={showAction === "edit"} onOpenChange={(open) => !open && closeAction()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("filmDetail.editModalTitle")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				<div className="flex flex-col gap-4">
					{/* === General section === */}
					<AutocompleteInput
						label={t("addFilm.brand")}
						value={editData.brand}
						onChange={(v) => setEditData({ ...editData, brand: v })}
						suggestions={brands}
						placeholder={t("addFilm.brandPlaceholder")}
					/>
					<AutocompleteInput
						label={t("addFilm.model")}
						value={editData.model}
						onChange={(v) => setEditData({ ...editData, model: v })}
						onSelect={(selectedModel) => {
							const fd = filmDataFor(editData.brand, selectedModel);
							if (fd) {
								setEditData((prev) => ({
									...prev,
									model: selectedModel,
									iso: String(fd.iso),
									type: fd.type,
									format: fd.format,
								}));
							}
						}}
						suggestions={modelsForBrand(editData.brand)}
						placeholder={t("addFilm.modelPlaceholder")}
					/>
					<FilmFormatSelect
						value={editData.format}
						onValueChange={(v) => {
							const typeReset =
								isInstantFormat(v) && editData.type !== "Couleur" && editData.type !== "N&B" ? { type: "Couleur" } : {};
							setEditData({ ...editData, format: v, ...typeReset });
						}}
						disabled={film.state !== "stock"}
					/>
					<div className="grid grid-cols-2 gap-3">
						<FormField label={t("addFilm.iso")}>
							<Input
								type="number"
								value={editData.iso}
								onChange={(e) => setEditData({ ...editData, iso: e.target.value })}
								placeholder="400"
								className="font-mono"
							/>
						</FormField>
						<FilmTypeSelect
							value={editData.type}
							onValueChange={(v) => setEditData({ ...editData, type: v })}
							format={editData.format}
						/>
					</div>
					<FormField label={t("addFilm.expirationDate")}>
						<MonthYearPicker value={editData.expDate} onChange={(v) => setEditData({ ...editData, expDate: v })} />
					</FormField>
					{film.state === "stock" && (
						<FormField label={t("addFilm.storageLocation")}>
							<Input
								value={editData.storageLocation}
								onChange={(e) => setEditData({ ...editData, storageLocation: e.target.value })}
								placeholder={t("addFilm.storageLocationPlaceholder")}
							/>
						</FormField>
					)}
					<FormField label={t("filmDetail.purchasePrice")}>
						<Input
							type="number"
							value={editData.price}
							onChange={(e) => setEditData({ ...editData, price: e.target.value })}
							placeholder={t("addFilm.pricePlaceholder")}
							className="font-mono"
							step="0.01"
							min="0"
						/>
					</FormField>
					<FormField label={t("filmDetail.commentField")}>
						<Input
							value={editData.comment}
							onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
							placeholder={t("addFilm.notesPlaceholder")}
						/>
					</FormField>
					<TagInput
						label={t("addFilm.tags")}
						value={editData.tags}
						onChange={(tags) => setEditData({ ...editData, tags })}
						suggestions={collectAllTags(data.films)}
						placeholder={t("addFilm.tagsPlaceholder")}
					/>

					{/* === Loading section === */}
					{showLoading && (
						<>
							<div className="border-t border-border pt-4 mt-1">
								<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
									{t("filmDetail.editSectionLoading")}
								</span>
							</div>
							<FormField label={t("filmDetail.cameraField")}>
								<Select
									value={editData.cameraId || ""}
									onValueChange={(v) => setEditData({ ...editData, cameraId: v, backId: "" })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										{availableCameras.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{cameraDisplayName(c)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
							{editCompatibleBacks.length > 0 && (
								<FormField label={t("filmDetail.backField")}>
									<Select value={editData.backId || ""} onValueChange={(v) => setEditData({ ...editData, backId: v })}>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{editCompatibleBacks.map((b) => (
												<SelectItem key={b.id} value={b.id}>
													{backDisplayName(b)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormField>
							)}
							{showLensField && (
								<FormField label={t("filmDetail.lensField")}>
									{visibleLenses.length > 0 ? (
										<>
											<Select
												value={editData.lensId || "__other__"}
												onValueChange={(v) => {
													if (v === "__other__") {
														setEditData({ ...editData, lensId: "", lens: "" });
													} else {
														const lens = data.lenses.find((l) => l.id === v);
														setEditData({
															...editData,
															lensId: v,
															lens: lens ? lensDisplayName(lens) : "",
														});
													}
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
												</SelectTrigger>
												<SelectContent>
													{visibleLenses.map((l) => (
														<SelectItem key={l.id} value={l.id}>
															{lensDisplayName(l)}
														</SelectItem>
													))}
													<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
												</SelectContent>
											</Select>
											{!editData.lensId && (
												<Input
													value={editData.lens}
													onChange={(e) => setEditData({ ...editData, lens: e.target.value })}
													placeholder={t("filmDetail.lensPlaceholder")}
													className="mt-2"
												/>
											)}
										</>
									) : (
										<Input
											value={editData.lens}
											onChange={(e) => setEditData({ ...editData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
										/>
									)}
								</FormField>
							)}
							<FormField label={t("filmDetail.shootIsoField")}>
								<Input
									type="number"
									value={editData.shootIso}
									onChange={(e) => setEditData({ ...editData, shootIso: e.target.value })}
									className="font-mono"
								/>
							</FormField>
							<FormField label={t("filmDetail.startDateField")}>
								<Input
									type="date"
									value={editData.startDate}
									onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
									className="font-mono"
								/>
							</FormField>
							<FormField label={t("filmDetail.posesTotalField")}>
								<Input
									type="number"
									value={editData.posesTotal}
									onChange={(e) => setEditData({ ...editData, posesTotal: e.target.value })}
									className="font-mono"
									min="1"
								/>
							</FormField>
						</>
					)}

					{/* === Exposure section === */}
					{showExposure && (
						<>
							<div className="border-t border-border pt-4 mt-1">
								<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
									{t("filmDetail.editSectionExposure")}
								</span>
							</div>
							{showEndDate && (
								<FormField label={t("filmDetail.endDateField")}>
									<Input
										type="date"
										value={editData.endDate}
										onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
										className="font-mono"
									/>
								</FormField>
							)}
							<FormField label={t("filmDetail.posesField")}>
								<Input
									type="number"
									value={editData.posesShot}
									onChange={(e) => setEditData({ ...editData, posesShot: e.target.value })}
									className="font-mono"
									min="0"
								/>
							</FormField>
						</>
					)}

					{/* === Development section === */}
					{showDev && (
						<>
							<div className="border-t border-border pt-4 mt-1">
								<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
									{t("filmDetail.editSectionDevelopment")}
								</span>
							</div>
							<FormField label={t("filmDetail.labField")}>
								<Input
									value={editData.lab}
									onChange={(e) => setEditData({ ...editData, lab: e.target.value })}
									placeholder={t("filmDetail.labPlaceholder")}
								/>
							</FormField>
							<FormField label={t("filmDetail.labRefField")}>
								<Input
									value={editData.labRef}
									onChange={(e) => setEditData({ ...editData, labRef: e.target.value })}
									placeholder={t("filmDetail.labRefPlaceholder")}
								/>
							</FormField>
							<FormField label={t("filmDetail.devDateField")}>
								<Input
									type="date"
									value={editData.devDate}
									onChange={(e) => setEditData({ ...editData, devDate: e.target.value })}
									className="font-mono"
								/>
							</FormField>
							<FormField
								label={
									editData.devScanPackage ? `${t("filmDetail.devScanPackageCost")} (€)` : t("filmDetail.devCostField")
								}
							>
								<Input
									type="number"
									value={editData.devCost}
									onChange={(e) => setEditData({ ...editData, devCost: e.target.value })}
									placeholder={t("filmDetail.costPlaceholder")}
									className="font-mono"
									step="0.01"
									min="0"
								/>
							</FormField>
							<label className="flex items-center justify-between gap-3 cursor-pointer">
								<span className="text-sm text-text-primary">{t("filmDetail.devScanPackage")}</span>
								<Switch
									checked={editData.devScanPackage}
									onCheckedChange={(v) => setEditData({ ...editData, devScanPackage: v })}
								/>
							</label>
							{editData.devScanPackage && (
								<div
									className="rounded-xl p-3.5"
									style={{
										background: alpha(T.amber, 0.09),
										border: `1px solid ${alpha(T.amber, 0.2)}`,
									}}
								>
									<span className="text-xs font-body" style={{ color: T.amber }}>
										{t("filmDetail.devScanPackageInfo")}
									</span>
								</div>
							)}
						</>
					)}

					{/* === Scanning section === */}
					{showScan && (
						<>
							<div className="border-t border-border pt-4 mt-1">
								<span className="text-[11px] font-semibold text-text-sec uppercase tracking-wide">
									{t("filmDetail.editSectionScanning")}
								</span>
							</div>
							<FormField label={t("filmDetail.scanRefField")}>
								<Input
									value={editData.scanRef}
									onChange={(e) => setEditData({ ...editData, scanRef: e.target.value })}
									placeholder={t("filmDetail.scanRefPlaceholder")}
								/>
							</FormField>
							{!editData.devScanPackage && (
								<FormField label={t("filmDetail.scanCostField")}>
									<Input
										type="number"
										value={editData.scanCost}
										onChange={(e) => setEditData({ ...editData, scanCost: e.target.value })}
										placeholder={t("filmDetail.costPlaceholder")}
										className="font-mono"
										step="0.01"
										min="0"
									/>
								</FormField>
							)}
							{editData.devScanPackage && (
								<div
									className="rounded-xl p-3.5"
									style={{
										background: alpha(T.amber, 0.09),
										border: `1px solid ${alpha(T.amber, 0.2)}`,
									}}
								>
									<span className="text-xs font-body" style={{ color: T.amber }}>
										{t("filmDetail.scanCostIncluded")}
									</span>
								</div>
							)}
						</>
					)}

					{/* === Save button === */}
					<Button
						disabled={!editData.brand || !editData.model}
						onClick={() => {
							const safeInt = (v: string) => {
								const n = Number.parseInt(v, 10);
								return Number.isFinite(n) ? n : null;
							};
							const safeFloat = (v: string) => {
								const n = Number.parseFloat(v);
								return Number.isFinite(n) ? n : null;
							};
							const editUpdate: Partial<Film> = {
								brand: editData.brand.trim(),
								model: editData.model.trim(),
								iso: safeInt(editData.iso) ?? 0,
								type: editData.type,
								format: film.state !== "stock" ? film.format : editData.format,
								expDate: editData.expDate || null,
								storageLocation: editData.storageLocation.trim() || null,
								price: editData.price.trim() ? safeFloat(editData.price) : null,
								comment: editData.comment.trim() || null,
								tags: editData.tags.length > 0 ? editData.tags : undefined,
								history: [...(film.history || []), { date: today(), action: "", actionCode: "modified" }],
							};
							if (showLoading) {
								editUpdate.cameraId = editData.cameraId || null;
								editUpdate.backId = editData.backId || null;
								editUpdate.lensId = showLensField ? editData.lensId || null : null;
								editUpdate.lens = showLensField ? editData.lens.trim() || null : null;
								editUpdate.shootIso = editData.shootIso.trim() ? safeInt(editData.shootIso) : null;
								editUpdate.startDate = editData.startDate || null;
								editUpdate.posesTotal = editData.posesTotal.trim() ? safeInt(editData.posesTotal) : null;
							}
							if (showExposure) {
								if (showEndDate) {
									editUpdate.endDate = editData.endDate || null;
								}
								editUpdate.posesShot = editData.posesShot.trim() ? safeInt(editData.posesShot) : null;
							}
							if (showDev) {
								editUpdate.lab = editData.lab.trim() || null;
								editUpdate.labRef = editData.labRef.trim() || null;
								editUpdate.devDate = editData.devDate || null;
								editUpdate.devCost = editData.devCost.trim() ? safeFloat(editData.devCost) : null;
								editUpdate.devScanPackage = editData.devScanPackage;
							}
							if (showScan) {
								editUpdate.scanRef = editData.scanRef.trim() || null;
								editUpdate.scanCost = editData.devScanPackage
									? null
									: editData.scanCost.trim()
										? safeFloat(editData.scanCost)
										: null;
							}
							updateFilm(editUpdate, t("filmDetail.filmModified"));
						}}
						className="w-full justify-center"
					>
						<Save size={16} /> {t("filmDetail.saveButton")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
