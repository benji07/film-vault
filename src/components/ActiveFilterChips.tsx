import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
				<button
					key={filter.key}
					type="button"
					onClick={() => onRemove(filter.key)}
					className={cn(
						"inline-flex items-center gap-1 py-1.5 px-3 rounded-full border-none cursor-pointer",
						"text-xs font-semibold font-body whitespace-nowrap",
						"bg-accent/15 text-accent",
					)}
				>
					{filter.label}
					<X size={12} />
				</button>
			))}
			{filters.length >= 2 && (
				<button
					type="button"
					onClick={onReset}
					className="py-1.5 px-3 rounded-full border-none cursor-pointer text-xs font-semibold font-body whitespace-nowrap bg-transparent text-text-muted"
				>
					{t("stock.clearAll")}
				</button>
			)}
		</div>
	);
}
