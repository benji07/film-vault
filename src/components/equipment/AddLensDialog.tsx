import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppData } from "@/types";
import { uid } from "@/utils/helpers";
import { emptyLensForm, formToLens, LensForm, type LensFormData } from "./LensForm";

interface AddLensDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: AppData;
	setData: (data: AppData) => void;
	mountSuggestions?: string[];
}

export function AddLensDialog({ open, onOpenChange, data, setData, mountSuggestions }: AddLensDialogProps) {
	const { t } = useTranslation();
	const [newLens, setNewLens] = useState<LensFormData>(emptyLensForm);

	useEffect(() => {
		if (!open) setNewLens(emptyLensForm);
	}, [open]);

	const addLens = () => {
		if (!newLens.brand && !newLens.model) return;
		const lens = formToLens(newLens, uid());
		setData({ ...data, lenses: [...data.lenses, lens] });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("lenses.newLens")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				<LensForm
					form={newLens}
					setForm={setNewLens}
					onSave={addLens}
					isEdit={false}
					mountSuggestions={mountSuggestions}
				/>
			</DialogContent>
		</Dialog>
	);
}
