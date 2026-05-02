import { Focus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { EquipmentItemCard } from "@/components/equipment/EquipmentItemCard";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoImg } from "@/components/ui/photo-img";
import { alpha, T } from "@/constants/theme";
import type { AppData, Lens } from "@/types";
import { collectMounts, lensApertureLabel, lensDisplayName, lensFocalLabel } from "@/utils/lens-helpers";
import { emptyLensForm, formToLens, LensForm, type LensFormData, lensToForm } from "./LensForm";

interface LensesTabProps {
	data: AppData;
	setData: (data: AppData) => void;
}

export function LensesTab({ data, setData }: LensesTabProps) {
	const { t } = useTranslation();
	const [editLensId, setEditLensId] = useState<string | null>(null);
	const [editLens, setEditLens] = useState<LensFormData>(emptyLensForm);
	const [viewerPhoto, setViewerPhoto] = useState<string | null>(null);
	const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);

	const activeLenses = data.lenses.filter((l) => !l.soldAt);
	const soldLenses = data.lenses.filter((l) => l.soldAt);
	const mountSuggestions = collectMounts(data.cameras, data.lenses);

	const saveEditLens = () => {
		if (!editLensId || (!editLens.brand && !editLens.model)) return;
		const updated = formToLens(editLens, editLensId);
		const newLenses = data.lenses.map((l) => (l.id === editLensId ? updated : l));
		setData({ ...data, lenses: newLenses });
		setEditLensId(null);
	};

	const sellLens = (lensId: string) => {
		const newLenses = data.lenses.map((l) => (l.id === lensId ? { ...l, soldAt: new Date().toISOString() } : l));
		setData({ ...data, lenses: newLenses });
		setEditLensId(null);
	};

	const unarchiveLens = (lensId: string) => {
		const newLenses = data.lenses.map((l) => (l.id === lensId ? { ...l, soldAt: null } : l));
		setData({ ...data, lenses: newLenses });
	};

	const hardDeleteLens = (lensId: string) => {
		const newFilms = data.films.map((f) => {
			let film = f;
			if (film.lensId === lensId) {
				film = { ...film, lensId: null };
			}
			if (film.shotNotes?.some((n) => n.lensId === lensId)) {
				film = {
					...film,
					shotNotes: film.shotNotes?.map((n) => (n.lensId === lensId ? { ...n, lensId: null } : n)),
				};
			}
			return film;
		});
		setData({ ...data, lenses: data.lenses.filter((l) => l.id !== lensId), films: newFilms });
	};

	const openEdit = (lens: Lens) => {
		setEditLensId(lens.id);
		setEditLens(lensToForm(lens));
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4">
					{activeLenses.map((lens, idx) => {
						const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.lensId === lens.id);
						const focal = lensFocalLabel(lens);
						const aperture = lensApertureLabel(lens);
						const totalShots = data.films.filter((f) => f.lensId === lens.id).length;
						return (
							<EquipmentItemCard
								key={lens.id}
								name={lensDisplayName(lens)}
								year={lens.mount ? `monture ${lens.mount}` : undefined}
								photo={lens.photo}
								vignette="lens"
								index={idx}
								washi={(["w2", "w4", "w1", "w3"][idx % 4] as "w1" | "w2" | "w3" | "w4") ?? "w2"}
								onClick={() => openEdit(lens)}
								stats={[
									{ value: focal || "—", label: t("lenses.focalLabel", { defaultValue: "focale" }) },
									{ value: aperture || "—", label: t("lenses.apertureLabel", { defaultValue: "ouv." }) },
									{ value: totalShots, label: t("lenses.usesLabel", { defaultValue: "utilis." }) },
								]}
								loadedSummary={loadedFilms.length > 0 ? t("lenses.loaded", { count: loadedFilms.length }) : null}
							/>
						);
					})}
					{activeLenses.length === 0 && (
						<EmptyState icon={Focus} title={t("lenses.noLenses")} subtitle={t("lenses.noLensesSubtitle")} />
					)}
				</div>

				{soldLenses.length > 0 && (
					<CollapsibleSection title={t("lenses.soldSection")} count={soldLenses.length}>
						<div className="flex flex-col gap-2.5">
							{soldLenses.map((lens) => {
								const associatedFilms = data.films.filter(
									(f) => f.lensId === lens.id || f.shotNotes?.some((n) => n.lensId === lens.id),
								).length;
								const soldDate = lens.soldAt ? new Date(lens.soldAt).toLocaleDateString() : "";
								return (
									<Card key={lens.id} className="opacity-70">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{lens.photo ? (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setViewerPhoto(lens.photo!);
														}}
														aria-label={t("aria.openPhoto", { index: 1 })}
														className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
													>
														<PhotoImg
															src={lens.photo}
															alt=""
															aria-hidden="true"
															className="w-full h-full object-cover border border-border cursor-pointer grayscale"
														/>
													</button>
												) : (
													<div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
														<Focus size={20} className="text-text-muted opacity-40" />
													</div>
												)}
												<div>
													<div className="text-[15px] font-semibold text-text-primary font-body">
														{lensDisplayName(lens)}
													</div>
													<div className="flex gap-1.5 mt-1.5 flex-wrap">
														{soldDate && (
															<Badge style={{ color: T.textMuted, background: alpha(T.textMuted, 0.09) }}>
																{t("equipment.soldOn", { date: soldDate })}
															</Badge>
														)}
														{associatedFilms > 0 && (
															<Badge style={{ color: T.blue, background: alpha(T.blue, 0.09) }}>
																{t("equipment.associatedFilms", { count: associatedFilms })}
															</Badge>
														)}
													</div>
												</div>
											</div>
											<div className="flex gap-1.5">
												<Button
													variant="outline"
													size="icon"
													onClick={() => unarchiveLens(lens.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.unarchiveLens")}
												>
													<RotateCcw size={14} className="text-text-sec" />
												</Button>
												<Button
													variant="destructive"
													size="icon"
													onClick={() => setPendingHardDeleteId(lens.id)}
													className="w-11 h-11 rounded-lg"
													aria-label={t("aria.hardDeleteLens")}
												>
													<Trash2 size={14} className="text-accent" />
												</Button>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</CollapsibleSection>
				)}
			</div>

			{/* Edit lens modal */}
			<Dialog open={!!editLensId} onOpenChange={(open) => !open && setEditLensId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("lenses.editLens")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<LensForm
						form={editLens}
						setForm={setEditLens}
						onSave={saveEditLens}
						isEdit={true}
						onSell={editLensId ? () => sellLens(editLensId) : undefined}
						mountSuggestions={mountSuggestions}
					/>
				</DialogContent>
			</Dialog>

			{viewerPhoto && <PhotoViewer photos={[viewerPhoto]} initialIndex={0} onClose={() => setViewerPhoto(null)} />}

			<ConfirmDialog
				open={pendingHardDeleteId !== null}
				onOpenChange={(open) => !open && setPendingHardDeleteId(null)}
				title={t("equipment.hardDelete")}
				description={t("lenses.hardDeleteConfirm")}
				confirmLabel={t("equipment.hardDelete")}
				destructive
				onConfirm={() => {
					if (pendingHardDeleteId) hardDeleteLens(pendingHardDeleteId);
				}}
			/>
		</>
	);
}
