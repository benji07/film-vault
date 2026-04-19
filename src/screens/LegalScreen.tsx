import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenTitle } from "@/components/ui/screen-title";

interface LegalScreenProps {
	onBack: () => void;
}

export function LegalScreen({ onBack }: LegalScreenProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4 p-4 pb-24 max-w-lg mx-auto">
			<div className="flex items-start gap-3 mb-1">
				<Button variant="ghost" size="icon" onClick={onBack} aria-label={t("legal.back")} className="mt-1">
					<ArrowLeft size={20} className="text-text-primary" />
				</Button>
				<ScreenTitle title={t("legal.title")} size="md" className="mb-0" />
			</div>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.publisherTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.publisherContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.hostingTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.hostingContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.dataCollectedTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.dataCollectedContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.localStorageTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.localStorageContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.cloudStorageTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.cloudStorageContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.noTrackingTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.noTrackingContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.gdprTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.gdprContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.retentionTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.retentionContent")}</p>
			</Card>

			<Card className="p-4 flex flex-col gap-3">
				<h2 className="text-sm font-bold text-text-primary font-body">{t("legal.contactTitle")}</h2>
				<p className="text-xs text-text-sec font-body leading-relaxed">{t("legal.contactContent")}</p>
			</Card>
		</div>
	);
}
