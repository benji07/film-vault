import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { type FilmFormat, type FilmType as FilmTypeEnum, INSTANT_FORMATS } from "@/types";
import type { StockFilters } from "@/utils/use-stock-filters";

const FORMATS: FilmFormat[] = ["35mm", "120", ...INSTANT_FORMATS];
const TYPES: FilmTypeEnum[] = ["Couleur", "N&B", "Diapo", "ECN-2"];

interface StockFilterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: StockFilters;
	stateFilter: string;
	stateTabs: { key: string; label: string; count: number }[];
	availableBrands: string[];
	availableIsoValues: number[];
	onSetStateFilter: (v: string) => void;
	onSetFormat: (v: string) => void;
	onSetType: (v: string) => void;
	onToggleBrand: (brand: string) => void;
	onToggleIso: (iso: number) => void;
	onReset: () => void;
}

export function StockFilterDialog({
	open,
	onOpenChange,
	filters,
	stateFilter,
	stateTabs,
	availableBrands,
	availableIsoValues,
	onSetStateFilter,
	onSetFormat,
	onSetType,
	onToggleBrand,
	onToggleIso,
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
					<FormField label={t("stock.stateLabel")}>
						<div className="flex flex-wrap gap-1.5">
							{stateTabs.map((tab) => (
								<Chip key={tab.key} active={stateFilter === tab.key} onClick={() => onSetStateFilter(tab.key)}>
									{tab.label} <span className="opacity-70">({tab.count})</span>
								</Chip>
							))}
						</div>
					</FormField>

					<FormField label={t("addFilm.format")}>
						<div className="flex flex-wrap gap-1.5">
							<Chip active={filters.format === "all"} onClick={() => onSetFormat("all")}>
								{t("stock.all")}
							</Chip>
							{FORMATS.map((f) => (
								<Chip key={f} active={filters.format === f} onClick={() => onSetFormat(f)}>
									{t(`filmFormats.${f}`)}
								</Chip>
							))}
						</div>
					</FormField>

					<FormField label={t("addFilm.type")}>
						<div className="flex flex-wrap gap-1.5">
							<Chip active={filters.type === "all"} onClick={() => onSetType("all")}>
								{t("stock.all")}
							</Chip>
							{TYPES.map((tp) => (
								<Chip key={tp} active={filters.type === tp} onClick={() => onSetType(tp)}>
									{t(`filmTypes.${tp}`)}
								</Chip>
							))}
						</div>
					</FormField>

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
