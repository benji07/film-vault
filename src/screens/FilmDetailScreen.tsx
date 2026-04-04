import {
	Aperture,
	Archive,
	ArrowLeft,
	Calendar,
	Camera,
	Check,
	CircleDot,
	Clock,
	Film,
	Hash,
	MessageSquare,
	Package,
	RotateCcw,
	Send,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { InfoLine } from "@/components/InfoLine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { STATES } from "@/constants/films";
import { T } from "@/constants/theme";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmIso, filmName, filmType } from "@/utils/film-helpers";
import { fmtDate, today } from "@/utils/helpers";

type ActionType = "load" | "finish" | "partial" | "reload" | "sendDev" | "develop" | null;

interface ActionData {
	cameraId?: string;
	backId?: string;
	shootIso?: string;
	startDate?: string;
	endDate?: string;
	comment?: string;
	posesShot?: string;
	lab?: string;
	devDate?: string;
}

interface FilmDetailScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	setScreen: (screen: ScreenName) => void;
	filmId: string | null;
}

export function FilmDetailScreen({ data, setData, setScreen, filmId }: FilmDetailScreenProps) {
	const film = data.films.find((f) => f.id === filmId);
	const [showAction, setShowAction] = useState<ActionType>(null);
	const [actionData, setActionData] = useState<ActionData>({});

	if (!film)
		return (
			<EmptyState
				icon={Film}
				title="Pellicule introuvable"
				action={<Button onClick={() => setScreen("stock")}>Retour</Button>}
			/>
		);

	const st = STATES[film.state];
	const cam = film.cameraId ? data.cameras.find((c) => c.id === film.cameraId) : null;
	const back = film.backId && cam ? cam.backs.find((b) => b.id === film.backId) : null;
	const fIso = filmIso(film);

	const updateFilm = (updates: Partial<FilmType>) => {
		const newFilms = data.films.map((f) => (f.id === filmId ? { ...f, ...updates } : f));
		setData({ ...data, films: newFilms });
		setShowAction(null);
		setActionData({});
	};

	const deleteFilm = () => {
		setData({ ...data, films: data.films.filter((f) => f.id !== filmId) });
		setScreen("stock");
	};

	const getAvailableCameras = () => {
		return data.cameras.filter((c) => {
			if (film.format === "120" && c.format !== "120") return false;
			if (film.format === "35mm" && c.format !== "35mm") return false;
			return true;
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => setScreen("stock")}
					className="bg-transparent border-none cursor-pointer p-1"
				>
					<ArrowLeft size={20} className="text-text-sec" />
				</button>
				<h2 className="font-display text-[22px] text-text-primary m-0 italic">{filmName(film)}</h2>
			</div>

			<Card>
				<div className="flex gap-2 mb-3 flex-wrap">
					<Badge style={{ color: st.color, background: `${st.color}18` }}>{st.label}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{film.format}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{filmType(film)}</Badge>
					<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>ISO {fIso}</Badge>
				</div>
				<div className="flex flex-col gap-2">
					{film.expDate && (
						<InfoLine
							icon={Calendar}
							label="Expiration"
							value={fmtDate(film.expDate)}
							warn={new Date(film.expDate) < new Date()}
						/>
					)}
					{film.price && <InfoLine icon={Hash} label="Prix" value={`${film.price.toFixed(2)} €`} />}
					{film.shootIso && <InfoLine icon={Aperture} label="ISO de prise de vue" value={film.shootIso} />}
					{cam && (
						<InfoLine
							icon={Camera}
							label="Appareil"
							value={`${cameraDisplayName(cam)}${back ? ` · ${back.name}` : ""}`}
						/>
					)}
					{film.startDate && <InfoLine icon={Calendar} label="Début" value={fmtDate(film.startDate)} />}
					{film.endDate && <InfoLine icon={Calendar} label="Fin" value={fmtDate(film.endDate)} />}
					{film.posesShot != null && (
						<InfoLine icon={CircleDot} label="Poses" value={`${film.posesShot} / ${film.posesTotal}`} />
					)}
					{film.lab && <InfoLine icon={Package} label="Labo" value={film.lab} />}
					{film.comment && <InfoLine icon={MessageSquare} label="Notes" value={film.comment} />}
				</div>
			</Card>

			{/* Actions by state */}
			<div className="flex flex-col gap-2">
				{film.state === "stock" && (
					<Button onClick={() => setShowAction("load")} className="w-full justify-center">
						<Camera size={16} /> Charger dans un appareil
					</Button>
				)}
				{film.state === "loaded" && (
					<>
						<Button onClick={() => setShowAction("finish")} className="w-full justify-center">
							<Check size={16} /> Marquer comme terminée
						</Button>
						{film.format === "35mm" && (
							<Button variant="secondary" onClick={() => setShowAction("partial")} className="w-full justify-center">
								<Clock size={16} /> Retirer (non terminée)
							</Button>
						)}
					</>
				)}
				{film.state === "partial" && (
					<>
						<Button onClick={() => setShowAction("reload")} className="w-full justify-center">
							<RotateCcw size={16} /> Recharger dans un appareil
						</Button>
						<Button variant="secondary" onClick={() => setShowAction("sendDev")} className="w-full justify-center">
							<Send size={16} /> Envoyer au développement
						</Button>
					</>
				)}
				{film.state === "exposed" && (
					<Button onClick={() => setShowAction("develop")} className="w-full justify-center">
						<Archive size={16} /> Marquer comme développée
					</Button>
				)}
				<Button variant="danger" onClick={deleteFilm} className="w-full justify-center">
					<Trash2 size={14} /> Supprimer
				</Button>
			</div>

			{/* History */}
			{film.history && film.history.length > 0 && (
				<div>
					<span className="text-[11px] font-bold text-text-muted font-body uppercase tracking-wide">Historique</span>
					<div className="mt-2.5 flex flex-col gap-0.5">
						{film.history.map((h, i) => (
							<div
								key={`${h.date}-${h.action}`}
								className="flex gap-2.5 py-2"
								style={{
									borderBottom: i < film.history.length - 1 ? "1px solid var(--color-border)" : "none",
								}}
							>
								<span className="text-[11px] text-text-muted font-mono whitespace-nowrap">{fmtDate(h.date)}</span>
								<span className="text-xs text-text-sec font-body">{h.action}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* MODALS */}
			<Sheet open={showAction === "load"} onClose={() => setShowAction(null)} title="Charger dans un appareil">
				<div className="flex flex-col gap-4">
					<Select
						label="Appareil"
						value={actionData.cameraId || ""}
						onChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
						placeholder="Choisir…"
						options={getAvailableCameras().map((c) => ({ value: c.id, label: cameraDisplayName(c) }))}
					/>
					{actionData.cameraId && (data.cameras.find((c) => c.id === actionData.cameraId)?.backs?.length ?? 0) > 0 && (
						<Select
							label="Dos"
							value={actionData.backId || ""}
							onChange={(v) => setActionData({ ...actionData, backId: v })}
							placeholder="Choisir un dos…"
							options={
								data.cameras
									.find((c) => c.id === actionData.cameraId)
									?.backs.map((b) => ({ value: b.id, label: b.name })) ?? []
							}
						/>
					)}
					<Input
						label="ISO de prise de vue"
						type="number"
						value={actionData.shootIso || String(fIso)}
						onChange={(v) => setActionData({ ...actionData, shootIso: v })}
						mono
					/>
					<Input
						label="Date de début"
						type="date"
						value={actionData.startDate || today()}
						onChange={(v) => setActionData({ ...actionData, startDate: v })}
						mono
					/>
					<Input
						label="Commentaire"
						value={actionData.comment || ""}
						onChange={(v) => setActionData({ ...actionData, comment: v })}
					/>
					<Button
						disabled={!actionData.cameraId}
						onClick={() => {
							const loadCam = data.cameras.find((c) => c.id === actionData.cameraId);
							updateFilm({
								state: "loaded",
								cameraId: actionData.cameraId,
								backId: actionData.backId || null,
								shootIso: Number.parseInt(actionData.shootIso || "", 10) || (typeof fIso === "number" ? fIso : 0),
								startDate: actionData.startDate || today(),
								comment: actionData.comment || film.comment,
								history: [
									...(film.history || []),
									{
										date: today(),
										action: `Chargée dans ${loadCam ? cameraDisplayName(loadCam) : "?"}`,
									},
								],
							});
						}}
						className="w-full justify-center"
					>
						<Camera size={16} /> Charger
					</Button>
				</div>
			</Sheet>

			<Sheet open={showAction === "finish"} onClose={() => setShowAction(null)} title="Pellicule terminée">
				<div className="flex flex-col gap-4">
					<Input
						label="Date de fin"
						type="date"
						value={actionData.endDate || today()}
						onChange={(v) => setActionData({ ...actionData, endDate: v })}
						mono
					/>
					<Input
						label="Commentaire"
						value={actionData.comment || ""}
						onChange={(v) => setActionData({ ...actionData, comment: v })}
					/>
					<Button
						onClick={() =>
							updateFilm({
								state: "exposed",
								endDate: actionData.endDate || today(),
								comment: actionData.comment || film.comment,
								cameraId: null,
								backId: null,
								history: [...(film.history || []), { date: today(), action: "Exposée — en attente de développement" }],
							})
						}
						className="w-full justify-center"
					>
						<Check size={16} /> Confirmer
					</Button>
				</div>
			</Sheet>

			<Sheet open={showAction === "partial"} onClose={() => setShowAction(null)} title="Retirer de l'appareil">
				<div className="flex flex-col gap-4">
					<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
						<span className="text-xs font-body" style={{ color: T.amber }}>
							La pellicule sera placée dans la section "partiellement exposées" de ton frigo.
						</span>
					</div>
					<Input
						label="Poses prises"
						type="number"
						value={actionData.posesShot || ""}
						onChange={(v) => setActionData({ ...actionData, posesShot: v })}
						placeholder={`Sur ${film.posesTotal}`}
						mono
					/>
					<Input
						label="Commentaire"
						value={actionData.comment || ""}
						onChange={(v) => setActionData({ ...actionData, comment: v })}
					/>
					<Button
						onClick={() =>
							updateFilm({
								state: "partial",
								posesShot: Number.parseInt(actionData.posesShot || "", 10) || 0,
								comment: actionData.comment || film.comment,
								cameraId: null,
								backId: null,
								history: [
									...(film.history || []),
									{
										date: today(),
										action: `Retirée partiellement (${actionData.posesShot || 0}/${film.posesTotal} poses)`,
									},
								],
							})
						}
						className="w-full justify-center"
					>
						<Clock size={16} /> Retirer
					</Button>
				</div>
			</Sheet>

			<Sheet open={showAction === "reload"} onClose={() => setShowAction(null)} title="Recharger la pellicule">
				<div className="flex flex-col gap-4">
					<div className="bg-amber-soft border border-amber/20 rounded-xl p-3.5">
						<span className="text-xs font-body font-semibold" style={{ color: T.amber }}>
							Avancer le film jusqu'à la pose {(film.posesShot || 0) + 1}
						</span>
					</div>
					<Select
						label="Appareil"
						value={actionData.cameraId || ""}
						onChange={(v) => setActionData({ ...actionData, cameraId: v, backId: "" })}
						placeholder="Choisir…"
						options={getAvailableCameras().map((c) => ({ value: c.id, label: cameraDisplayName(c) }))}
					/>
					<Input
						label="Date de reprise"
						type="date"
						value={actionData.startDate || today()}
						onChange={(v) => setActionData({ ...actionData, startDate: v })}
						mono
					/>
					<Button
						disabled={!actionData.cameraId}
						onClick={() => {
							const reloadCam = data.cameras.find((c) => c.id === actionData.cameraId);
							updateFilm({
								state: "loaded",
								cameraId: actionData.cameraId,
								backId: actionData.backId || null,
								startDate: actionData.startDate || today(),
								history: [
									...(film.history || []),
									{
										date: today(),
										action: `Rechargée dans ${reloadCam ? cameraDisplayName(reloadCam) : "?"}`,
									},
								],
							});
						}}
						className="w-full justify-center"
					>
						<RotateCcw size={16} /> Recharger
					</Button>
				</div>
			</Sheet>

			<Sheet open={showAction === "sendDev"} onClose={() => setShowAction(null)} title="Envoyer au développement">
				<div className="flex flex-col gap-4">
					<Input
						label="Date de fin"
						type="date"
						value={actionData.endDate || today()}
						onChange={(v) => setActionData({ ...actionData, endDate: v })}
						mono
					/>
					<Input
						label="Commentaire"
						value={actionData.comment || ""}
						onChange={(v) => setActionData({ ...actionData, comment: v })}
					/>
					<Button
						onClick={() =>
							updateFilm({
								state: "exposed",
								endDate: actionData.endDate || today(),
								comment: actionData.comment || film.comment,
								history: [...(film.history || []), { date: today(), action: "Envoyée au développement (partielle)" }],
							})
						}
						className="w-full justify-center"
					>
						<Send size={16} /> Envoyer
					</Button>
				</div>
			</Sheet>

			<Sheet open={showAction === "develop"} onClose={() => setShowAction(null)} title="Marquer comme développée">
				<div className="flex flex-col gap-4">
					<Input
						label="Labo"
						value={actionData.lab || ""}
						onChange={(v) => setActionData({ ...actionData, lab: v })}
						placeholder="Nom du labo…"
					/>
					<Input
						label="Date de développement"
						type="date"
						value={actionData.devDate || today()}
						onChange={(v) => setActionData({ ...actionData, devDate: v })}
						mono
					/>
					<Input
						label="Commentaire"
						value={actionData.comment || ""}
						onChange={(v) => setActionData({ ...actionData, comment: v })}
					/>
					<Button
						onClick={() =>
							updateFilm({
								state: "developed",
								lab: actionData.lab || null,
								devDate: actionData.devDate || today(),
								comment: actionData.comment || film.comment,
								history: [
									...(film.history || []),
									{
										date: today(),
										action: `Développée${actionData.lab ? ` chez ${actionData.lab}` : ""}`,
									},
								],
							})
						}
						className="w-full justify-center"
					>
						<Archive size={16} /> Confirmer
					</Button>
				</div>
			</Sheet>
		</div>
	);
}
