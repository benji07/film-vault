import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface ActiveFilterChipsProps {
	filters: { key: string; label: string }[];
	onRemove: (key: string) => void;
	onReset: () => void;
}

export function ActiveFilterChips({ filters, onRemove, onReset }: ActiveFilterChipsProps) {
	const { t } = useTranslation();

	if (filters.length === 0) return null;

	return (
		<div className="flex gap-1.5 overflow-x-auto pb-1">
			{filters.map((filter) => (
				<Chip key={filter.key} active className="bg-accent/15 text-accent gap-1" onClick={() => onRemove(filter.key)}>
					{filter.label}
					<X size={12} />
				</Chip>
			))}
			{filters.length >= 2 && (
				<Button variant="ghost" size="sm" onClick={onReset}>
					{t("stock.clearAll")}
				</Button>
			)}
		</div>
	);
}
