import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilmTypeSelectProps {
	value: string;
	onValueChange: (v: string) => void;
}

export function FilmTypeSelect({ value, onValueChange }: FilmTypeSelectProps) {
	const { t } = useTranslation();
	return (
		<FormField label={t("addFilm.type")}>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Couleur">{t("filmTypes.Couleur")}</SelectItem>
					<SelectItem value="N&B">{t("filmTypes.N&B")}</SelectItem>
					<SelectItem value="Diapo">{t("filmTypes.Diapo")}</SelectItem>
					<SelectItem value="ECN-2">{t("filmTypes.ECN-2")}</SelectItem>
					<SelectItem value="Instant">{t("filmTypes.Instant")}</SelectItem>
				</SelectContent>
			</Select>
		</FormField>
	);
}

interface FilmFormatSelectProps {
	value: string;
	onValueChange: (v: string) => void;
	disabled?: boolean;
}

export function FilmFormatSelect({ value, onValueChange, disabled }: FilmFormatSelectProps) {
	const { t } = useTranslation();
	return (
		<FormField label={t("addFilm.format")}>
			<Select value={value} onValueChange={onValueChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="35mm">{t("filmFormats.35mm")}</SelectItem>
					<SelectItem value="120">{t("filmFormats.120")}</SelectItem>
					<SelectItem value="Instant">{t("filmFormats.Instant")}</SelectItem>
				</SelectContent>
			</Select>
		</FormField>
	);
}
