import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import type { StockFilters } from "@/utils/use-stock-filters";

interface StockFilterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: StockFilters;
	availableFormats: string[];
	availableTypes: string[];
	availableBrands: string[];
	availableIsoValues: number[];
	availableTags: string[];
	onSetFormat: (v: string) => void;
	onSetType: (v: string) => void;
	onToggleBrand: (brand: string) => void;
	onToggleIso: (iso: number) => void;
	onToggleTag: (tag: string) => void;
	onReset: () => void;
}

export function StockFilterDialog({
	open,
	onOpenChange,
	filters,
	availableFormats,
	availableTypes,
	availableBrands,
	availableIsoValues,
	availableTags,
	onSetFormat,
	onSetType,
	onToggleBrand,
	onToggleIso,
	onToggleTag,
	onReset,
}: StockFilterDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("stock.filters")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{availableFormats.length > 0 && (
						<FormField label={t("addFilm.format")}>
							<div className="flex flex-wrap gap-1.5">
								<Chip active={filters.format === "all"} onClick={() => onSetFormat("all")}>
									{t("stock.all")}
								</Chip>
								{availableFormats.map((f) => (
									<Chip key={f} active={filters.format === f} onClick={() => onSetFormat(f)}>
										{t(`filmFormats.${f}`)}
									</Chip>
								))}
							</div>
						</FormField>
					)}

					{availableTypes.length > 0 && (
						<FormField label={t("addFilm.type")}>
							<div className="flex flex-wrap gap-1.5">
								<Chip active={filters.type === "all"} onClick={() => onSetType("all")}>
									{t("stock.all")}
								</Chip>
								{availableTypes.map((tp) => (
									<Chip key={tp} active={filters.type === tp} onClick={() => onSetType(tp)}>
										{t(`filmTypes.${tp}`)}
									</Chip>
								))}
							</div>
						</FormField>
					)}

					{availableBrands.length > 0 && (
						<FormField label={t("stock.brand")}>
							<div className="flex flex-wrap gap-1.5">
								{availableBrands.map((brand) => (
									<Chip key={brand} active={filters.brands.includes(brand)} onClick={() => onToggleBrand(brand)}>
										{brand}
									</Chip>
								))}
							</div>
						</FormField>
					)}

					{availableIsoValues.length > 0 && (
						<FormField label={t("stock.iso")}>
							<div className="flex flex-wrap gap-1.5">
								{availableIsoValues.map((iso) => (
									<Chip key={iso} active={filters.isoValues.includes(iso)} onClick={() => onToggleIso(iso)}>
										{iso}
									</Chip>
								))}
							</div>
						</FormField>
					)}

					{availableTags.length > 0 && (
						<FormField label={t("stock.tags")}>
							<div className="flex flex-wrap gap-1.5">
								{availableTags.map((tag) => (
									<Chip key={tag} active={filters.tags.includes(tag)} onClick={() => onToggleTag(tag)}>
										{tag}
									</Chip>
								))}
							</div>
						</FormField>
					)}

					<div className="flex gap-3 pt-2">
						<Button variant="ghost" className="flex-1" onClick={onReset}>
							{t("stock.reset")}
						</Button>
						<Button className="flex-1" onClick={() => onOpenChange(false)}>
							{t("stock.apply")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
