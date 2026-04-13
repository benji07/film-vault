import { Archive, ScanLine, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { alpha, T } from "@/constants/theme";
import { today } from "@/utils/helpers";
import type { ModalBaseProps } from "./types";

export function DevScanModals({
	film,
	showAction,
	closeAction,
	actionData,
	setActionData,
	updateFilm,
}: ModalBaseProps) {
	const { t } = useTranslation();

	return (
		<>
			{/* Send to dev modal */}
			<Dialog open={showAction === "sendDev"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.sendDevModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.endDateField")}>
							<Input
								type="date"
								value={actionData.endDate || today()}
								onChange={(e) => setActionData({ ...actionData, endDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "exposed",
										endDate: actionData.endDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										history: [...(film.history || []), { date: today(), action: "", actionCode: "sent_dev", photos }],
									},
									t("filmDetail.sendToDev"),
								);
							}}
							className="w-full justify-center"
						>
							<Send size={16} /> {t("filmDetail.sendButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Develop modal */}
			<Dialog open={showAction === "develop"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.developModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.labField")}>
							<Input
								value={actionData.lab || ""}
								onChange={(e) => setActionData({ ...actionData, lab: e.target.value })}
								placeholder={t("filmDetail.labPlaceholder")}
							/>
						</FormField>
						<FormField label={t("filmDetail.labRefField")}>
							<Input
								value={actionData.labRef || ""}
								onChange={(e) => setActionData({ ...actionData, labRef: e.target.value })}
								placeholder={t("filmDetail.labRefPlaceholder")}
							/>
						</FormField>
						<FormField label={t("filmDetail.devDateField")}>
							<Input
								type="date"
								value={actionData.devDate || today()}
								onChange={(e) => setActionData({ ...actionData, devDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField
							label={
								actionData.devScanPackage ? `${t("filmDetail.devScanPackageCost")} (€)` : t("filmDetail.devCostField")
							}
						>
							<Input
								type="number"
								value={actionData.devCost || ""}
								onChange={(e) => setActionData({ ...actionData, devCost: e.target.value })}
								placeholder={t("filmDetail.costPlaceholder")}
								className="font-mono"
								step="0.01"
								min="0"
							/>
						</FormField>
						<label className="flex items-center justify-between gap-3 cursor-pointer">
							<span className="text-sm text-text-primary">{t("filmDetail.devScanPackage")}</span>
							<Switch
								checked={actionData.devScanPackage || false}
								onCheckedChange={(v) => setActionData({ ...actionData, devScanPackage: v })}
							/>
						</label>
						{actionData.devScanPackage && (
							<div
								className="rounded-xl p-3.5"
								style={{ background: alpha(T.amber, 0.09), border: `1px solid ${alpha(T.amber, 0.2)}` }}
							>
								<span className="text-xs font-body" style={{ color: T.amber }}>
									{t("filmDetail.devScanPackageInfo")}
								</span>
							</div>
						)}
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "developed",
										lab: actionData.lab?.trim() || null,
										labRef: actionData.labRef?.trim() || null,
										devDate: actionData.devDate || today(),
										devCost: actionData.devCost?.trim() ? Number.parseFloat(actionData.devCost) : null,
										devScanPackage: actionData.devScanPackage || false,
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "developed",
												params: { lab: actionData.lab?.trim() || null },
												photos,
											},
										],
									},
									t("filmDetail.filmDeveloped"),
								);
							}}
							className="w-full justify-center"
						>
							<Archive size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Scan modal */}
			<Dialog open={showAction === "scan"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.scanModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.labRefField")}>
							<Input
								value={actionData.scanRef || ""}
								onChange={(e) => setActionData({ ...actionData, scanRef: e.target.value })}
								placeholder={t("filmDetail.scanRefPlaceholder")}
							/>
						</FormField>
						{!film.devScanPackage && (
							<FormField label={t("filmDetail.scanCostField")}>
								<Input
									type="number"
									value={actionData.scanCost || ""}
									onChange={(e) => setActionData({ ...actionData, scanCost: e.target.value })}
									placeholder={t("filmDetail.costPlaceholder")}
									className="font-mono"
									step="0.01"
									min="0"
								/>
							</FormField>
						)}
						{film.devScanPackage && (
							<div
								className="rounded-xl p-3.5"
								style={{
									background: alpha(T.amber, 0.09),
									border: `1px solid ${alpha(T.amber, 0.2)}`,
								}}
							>
								<span className="text-xs font-body" style={{ color: T.amber }}>
									{t("filmDetail.scanCostIncluded")}
								</span>
							</div>
						)}
						<FormField label={t("filmDetail.commentField")}>
							<Input
								value={actionData.comment || ""}
								onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							onClick={() => {
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "scanned",
										scanRef: actionData.scanRef?.trim() || null,
										scanCost: film.devScanPackage
											? null
											: actionData.scanCost?.trim()
												? Number.parseFloat(actionData.scanCost)
												: null,
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "scanned",
												params: { ref: actionData.scanRef?.trim() || null },
												photos,
											},
										],
									},
									t("filmDetail.filmScanned"),
								);
							}}
							className="w-full justify-center"
						>
							<ScanLine size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
