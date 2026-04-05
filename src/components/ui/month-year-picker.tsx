import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 46 }, (_, i) => currentYear - 40 + i);

interface MonthYearPickerProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function MonthYearPicker({ value, onChange, className }: MonthYearPickerProps) {
	const { t } = useTranslation();
	const months = t("months", { returnObjects: true }) as string[];
	const [yearStr, monthStr] = value ? value.split("-") : ["", ""];

	const handleMonthChange = (m: string) => {
		if (yearStr) {
			onChange(`${yearStr}-${m}`);
		} else {
			onChange(`${currentYear}-${m}`);
		}
	};

	const handleYearChange = (y: string) => {
		if (monthStr) {
			onChange(`${y}-${monthStr}`);
		} else {
			onChange(`${y}-01`);
		}
	};

	return (
		<div className={cn("grid grid-cols-2 gap-2", className)}>
			<Select value={monthStr || undefined} onValueChange={handleMonthChange}>
				<SelectTrigger className="font-mono">
					<SelectValue placeholder={t("monthPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					{months.map((label, i) => {
						const val = String(i + 1).padStart(2, "0");
						return (
							<SelectItem key={val} value={val}>
								{label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
			<Select value={yearStr || undefined} onValueChange={handleYearChange}>
				<SelectTrigger className="font-mono">
					<SelectValue placeholder={t("yearPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					{YEARS.map((y) => (
						<SelectItem key={y} value={String(y)}>
							{y}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
