import { Camera, Check, Clock, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { T } from "@/constants/theme";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";
import { today } from "@/utils/helpers";
import { lensDisplayName } from "@/utils/lens-helpers";
import type { ModalBaseProps } from "./types";

export function TransitionModals({
	film,
	data,
	showAction,
	closeAction,
	actionData,
	setActionData,
	updateFilm,
	availableCameras,
	compatibleBacks,
	fIso,
}: ModalBaseProps) {
	const { t } = useTranslation();
	const activeLenses = data.lenses.filter((l) => !l.soldAt);

	return (
		<>
			{/* Load modal */}
			<Dialog open={showAction === "load"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.loadModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<FormField label={t("filmDetail.cameraField")}>
							<Select
								value={actionData.cameraId || ""}
								onValueChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{availableCameras.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						{compatibleBacks.length > 0 && (
							<FormField label={t("filmDetail.backField")}>
								<Select
									value={actionData.backId || ""}
									onValueChange={(v) => setActionData({ ...actionData, backId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										{compatibleBacks.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{backDisplayName(b)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
						)}
						<FormField label={t("filmDetail.lensField")}>
							{activeLenses.length > 0 ? (
								<>
									<Select
										value={actionData.lensId || "__other__"}
										onValueChange={(v) => {
											if (v === "__other__") {
												setActionData({ ...actionData, lensId: undefined, lens: "" });
											} else {
												const lens = data.lenses.find((l) => l.id === v);
												setActionData({
													...actionData,
													lensId: v,
													lens: lens ? lensDisplayName(lens) : "",
												});
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{activeLenses.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{lensDisplayName(l)}
												</SelectItem>
											))}
											<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
										</SelectContent>
									</Select>
									{!actionData.lensId && (
										<Input
											value={actionData.lens || ""}
											onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
											className="mt-2"
										/>
									)}
								</>
							) : (
								<Input
									value={actionData.lens || ""}
									onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
									placeholder={t("filmDetail.lensPlaceholder")}
								/>
							)}
						</FormField>
						<FormField label={t("filmDetail.shootIsoField")}>
							<Input
								type="number"
								value={actionData.shootIso || String(fIso)}
								onChange={(e) => setActionData({ ...actionData, shootIso: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<FormField label={t("filmDetail.startDateField")}>
							<Input
								type="date"
								value={actionData.startDate || today()}
								onChange={(e) => setActionData({ ...actionData, startDate: e.target.value })}
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
							disabled={!actionData.cameraId}
							onClick={() => {
								const loadCam = data.cameras.find((c) => c.id === actionData.cameraId);
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "loaded",
										cameraId: actionData.cameraId,
										backId: actionData.backId || null,
										lensId: actionData.lensId || null,
										lens: actionData.lens?.trim() || null,
										shootIso: Number.parseInt(actionData.shootIso || "", 10) || (typeof fIso === "number" ? fIso : 0),
										startDate: actionData.startDate || today(),
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "loaded",
												params: { camera: loadCam ? cameraDisplayName(loadCam) : "?" },
												photos,
											},
										],
									},
									t("filmDetail.filmLoaded"),
								);
							}}
							className="w-full justify-center"
						>
							<Camera size={16} /> {t("filmDetail.loadButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Finish modal */}
			<Dialog open={showAction === "finish"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.finishedModalTitle")}</DialogTitle>
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
										history: [...(film.history || []), { date: today(), action: "", actionCode: "exposed", photos }],
									},
									t("filmDetail.filmExposed"),
								);
							}}
							className="w-full justify-center"
						>
							<Check size={16} /> {t("filmDetail.confirmButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Partial modal */}
			<Dialog open={showAction === "partial"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.removeModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
							<span className="text-xs font-body" style={{ color: T.amber }}>
								{t("filmDetail.partialInfo")}
							</span>
						</div>
						<FormField label={t("filmDetail.posesField")}>
							<Input
								type="number"
								value={actionData.posesShot || ""}
								onChange={(e) => setActionData({ ...actionData, posesShot: e.target.value })}
								placeholder={t("filmDetail.posesPlaceholder", { total: film.posesTotal })}
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
										state: "partial",
										posesShot: Number.parseInt(actionData.posesShot || "", 10) || 0,
										comment: actionData.comment?.trim() || film.comment,
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "removed_partial",
												params: {
													posesShot: actionData.posesShot || 0,
													posesTotal: film.posesTotal,
												},
												photos,
											},
										],
									},
									t("filmDetail.filmRemoved"),
								);
							}}
							className="w-full justify-center"
						>
							<Clock size={16} /> {t("filmDetail.removeButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reload modal */}
			<Dialog open={showAction === "reload"} onOpenChange={(open) => !open && closeAction()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("filmDetail.reloadModalTitle")}</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
							<span className="text-xs font-body font-semibold" style={{ color: T.amber }}>
								{t("filmDetail.advanceFilm", { pose: (film.posesShot || 0) + 1 })}
							</span>
						</div>
						<FormField label={t("filmDetail.cameraField")}>
							<Select
								value={actionData.cameraId || ""}
								onValueChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("filmDetail.choosePlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{availableCameras.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{cameraDisplayName(c)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormField>
						{compatibleBacks.length > 0 && (
							<FormField label={t("filmDetail.backField")}>
								<Select
									value={actionData.backId || ""}
									onValueChange={(v) => setActionData({ ...actionData, backId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("filmDetail.chooseBackPlaceholder")} />
									</SelectTrigger>
									<SelectContent>
										{compatibleBacks.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{backDisplayName(b)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormField>
						)}
						<FormField label={t("filmDetail.lensField")}>
							{activeLenses.length > 0 ? (
								<>
									<Select
										value={actionData.lensId || "__other__"}
										onValueChange={(v) => {
											if (v === "__other__") {
												setActionData({ ...actionData, lensId: undefined, lens: "" });
											} else {
												const lens = data.lenses.find((l) => l.id === v);
												setActionData({
													...actionData,
													lensId: v,
													lens: lens ? lensDisplayName(lens) : "",
												});
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("filmDetail.chooseLensPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{activeLenses.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{lensDisplayName(l)}
												</SelectItem>
											))}
											<SelectItem value="__other__">{t("filmDetail.otherLens")}</SelectItem>
										</SelectContent>
									</Select>
									{!actionData.lensId && (
										<Input
											value={actionData.lens || ""}
											onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
											placeholder={t("filmDetail.lensPlaceholder")}
											className="mt-2"
										/>
									)}
								</>
							) : (
								<Input
									value={actionData.lens || ""}
									onChange={(e) => setActionData({ ...actionData, lens: e.target.value })}
									placeholder={t("filmDetail.lensPlaceholder")}
								/>
							)}
						</FormField>
						<FormField label={t("filmDetail.resumeDateField")}>
							<Input
								type="date"
								value={actionData.startDate || today()}
								onChange={(e) => setActionData({ ...actionData, startDate: e.target.value })}
								className="font-mono"
							/>
						</FormField>
						<PhotoPicker
							photos={actionData.photos || []}
							onChange={(p) => setActionData({ ...actionData, photos: p })}
							max={3}
							label={t("filmDetail.photos", { count: (actionData.photos || []).length, max: 3 })}
						/>
						<Button
							disabled={!actionData.cameraId}
							onClick={() => {
								const reloadCam = data.cameras.find((c) => c.id === actionData.cameraId);
								const photos = actionData.photos?.length ? actionData.photos : undefined;
								updateFilm(
									{
										state: "loaded",
										cameraId: actionData.cameraId,
										backId: actionData.backId || null,
										lensId: "lensId" in actionData ? (actionData.lensId ?? null) : (film.lensId ?? null),
										lens: actionData.lens?.trim() || film.lens || null,
										startDate: actionData.startDate || today(),
										history: [
											...(film.history || []),
											{
												date: today(),
												action: "",
												actionCode: "reloaded",
												params: { camera: reloadCam ? cameraDisplayName(reloadCam) : "?" },
												photos,
											},
										],
									},
									t("filmDetail.filmReloaded"),
								);
							}}
							className="w-full justify-center"
						>
							<RotateCcw size={16} /> {t("filmDetail.reloadButton")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
