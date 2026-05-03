import { Focus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { EquipmentItemCard } from "@/components/equipment/EquipmentItemCard";
import { SoldEquipmentCard } from "@/components/equipment/SoldEquipmentCard";
import { PhotoViewer } from "@/components/PhotoViewer";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
								washiOffset={1}
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
								const soldDate = lens.soldAt ? new Date(lens.soldAt).toLocaleDateString() : null;
								return (
									<SoldEquipmentCard
										key={lens.id}
										name={lensDisplayName(lens)}
										photo={lens.photo}
										fallbackIcon={Focus}
										soldDate={soldDate}
										associatedFilmsCount={associatedFilms}
										onPhotoClick={() => lens.photo && setViewerPhoto(lens.photo)}
										onUnarchive={() => unarchiveLens(lens.id)}
										onHardDelete={() => setPendingHardDeleteId(lens.id)}
										unarchiveLabel={t("aria.unarchiveLens")}
										hardDeleteLabel={t("aria.hardDeleteLens")}
									/>
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
