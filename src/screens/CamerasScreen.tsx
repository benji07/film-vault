import { Camera, Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { T } from "@/constants/theme";
import type { AppData, Back, Camera as CameraType } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmName } from "@/utils/film-helpers";
import { uid } from "@/utils/helpers";

interface CamerasScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
}

interface EditBackState {
	camId: string;
	back: Back;
}

export function CamerasScreen({ data, setData }: CamerasScreenProps) {
	const [showAdd, setShowAdd] = useState(false);
	const [newCam, setNewCam] = useState({
		brand: "",
		model: "",
		nickname: "",
		serial: "",
		format: "35mm",
		hasInterchangeableBack: false,
		photo: undefined as string | undefined,
	});
	const [showBackModal, setShowBackModal] = useState<string | null>(null);
	const [newBack, setNewBack] = useState({ name: "", ref: "", photo: undefined as string | undefined });
	const [editCam, setEditCam] = useState<CameraType | null>(null);
	const [editBack, setEditBack] = useState<EditBackState | null>(null);

	const addCamera = () => {
		if (!newCam.brand && !newCam.model) return;
		const camera: CameraType = {
			id: uid(),
			brand: newCam.brand,
			model: newCam.model,
			nickname: newCam.nickname,
			serial: newCam.serial,
			format: newCam.format,
			hasInterchangeableBack: newCam.hasInterchangeableBack || false,
			backs: [],
			photo: newCam.photo,
		};
		setData({ ...data, cameras: [...data.cameras, camera] });
		setShowAdd(false);
		setNewCam({
			brand: "",
			model: "",
			nickname: "",
			serial: "",
			format: "35mm",
			hasInterchangeableBack: false,
			photo: undefined,
		});
	};

	const saveEditCamera = () => {
		if (!editCam?.brand && !editCam?.model) return;
		const newCams = data.cameras.map((c) =>
			c.id === editCam.id
				? {
						...c,
						brand: editCam.brand,
						model: editCam.model,
						nickname: editCam.nickname,
						serial: editCam.serial,
						format: editCam.format,
						hasInterchangeableBack: editCam.hasInterchangeableBack || false,
						photo: editCam.photo,
					}
				: c,
		);
		setData({ ...data, cameras: newCams });
		setEditCam(null);
	};

	const addBack = (camId: string) => {
		if (!newBack.name) return;
		const back: Back = { id: uid(), name: newBack.name, ref: newBack.ref, photo: newBack.photo };
		const newCams = data.cameras.map((c) => (c.id === camId ? { ...c, backs: [...c.backs, back] } : c));
		setData({ ...data, cameras: newCams });
		setShowBackModal(null);
		setNewBack({ name: "", ref: "", photo: undefined });
	};

	const saveEditBack = () => {
		if (!editBack?.back?.name) return;
		const newCams = data.cameras.map((c) => {
			if (c.id !== editBack.camId) return c;
			return {
				...c,
				backs: c.backs.map((b) =>
					b.id === editBack.back.id
						? { ...b, name: editBack.back.name, ref: editBack.back.ref, photo: editBack.back.photo }
						: b,
				),
			};
		});
		setData({ ...data, cameras: newCams });
		setEditBack(null);
	};

	const deleteBack = (camId: string, backId: string) => {
		const newCams = data.cameras.map((c) => {
			if (c.id !== camId) return c;
			return { ...c, backs: c.backs.filter((b) => b.id !== backId) };
		});
		setData({ ...data, cameras: newCams });
		setEditBack(null);
	};

	const deleteCamera = (camId: string) => {
		setData({ ...data, cameras: data.cameras.filter((c) => c.id !== camId) });
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<h2 className="font-display text-2xl text-text-primary m-0 italic">Appareils</h2>
				<Button size="sm" onClick={() => setShowAdd(true)}>
					<Plus size={14} /> Ajouter
				</Button>
			</div>

			<div className="flex flex-col gap-2.5">
				{data.cameras.map((cam) => {
					const loadedFilms = data.films.filter((f) => f.state === "loaded" && f.cameraId === cam.id);
					return (
						<Card key={cam.id}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{cam.photo ? (
										<img
											src={cam.photo}
											alt=""
											className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
										/>
									) : (
										<div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
											<Camera size={20} className="text-text-muted opacity-40" />
										</div>
									)}
									<div>
										<div className="text-[15px] font-semibold text-text-primary font-body">
											{cameraDisplayName(cam)}
										</div>
										<div className="flex gap-1.5 mt-1.5">
											<Badge style={{ color: T.textMuted, background: `${T.textMuted}18` }}>{cam.format}</Badge>
											{cam.backs.length > 0 && (
												<Badge style={{ color: T.blue, background: `${T.blue}18` }}>{cam.backs.length} dos</Badge>
											)}
											{loadedFilms.length > 0 && (
												<Badge style={{ color: T.green, background: `${T.green}18` }}>
													{loadedFilms.length} chargée{loadedFilms.length > 1 ? "s" : ""}
												</Badge>
											)}
										</div>
									</div>
								</div>
								<div className="flex gap-1.5">
									<button
										type="button"
										onClick={() => setEditCam({ ...cam })}
										className="bg-surface-alt border border-border rounded-lg w-11 h-11 flex items-center justify-center cursor-pointer"
									>
										<Edit3 size={14} className="text-text-sec" />
									</button>
									{cam.hasInterchangeableBack && (
										<button
											type="button"
											onClick={() => setShowBackModal(cam.id)}
											className="bg-surface-alt border border-border rounded-lg w-11 h-11 flex items-center justify-center cursor-pointer"
										>
											<Plus size={14} className="text-text-sec" />
										</button>
									)}
									<button
										type="button"
										onClick={() => deleteCamera(cam.id)}
										className="bg-accent-soft border-none rounded-lg w-11 h-11 flex items-center justify-center cursor-pointer"
									>
										<Trash2 size={14} className="text-accent" />
									</button>
								</div>
							</div>
							{cam.backs.length > 0 && (
								<div className="mt-3 pt-3 border-t border-border">
									{cam.backs.map((b) => {
										const backFilm = data.films.find(
											(f) => f.state === "loaded" && f.cameraId === cam.id && f.backId === b.id,
										);
										return (
											<div key={b.id} className="flex items-center justify-between py-1.5">
												<div className="flex items-center gap-2 flex-1">
													{b.photo ? (
														<img
															src={b.photo}
															alt=""
															className="w-8 h-8 rounded-md object-cover shrink-0 border border-border"
														/>
													) : (
														<div className="w-8 h-8 rounded-md bg-surface-alt flex items-center justify-center shrink-0">
															<Camera size={14} className="text-text-muted opacity-40" />
														</div>
													)}
													<div>
														<span className="text-[13px] text-text-sec font-body">{b.name}</span>
														{b.ref && <span className="text-[11px] text-text-muted font-mono ml-2">{b.ref}</span>}
													</div>
												</div>
												<div className="flex items-center gap-1.5">
													{backFilm && (
														<Badge style={{ color: T.green, background: `${T.green}18` }}>{filmName(backFilm)}</Badge>
													)}
													<button
														type="button"
														onClick={() => setEditBack({ camId: cam.id, back: { ...b } })}
														className="bg-transparent border-none cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
													>
														<Edit3 size={12} className="text-text-muted" />
													</button>
												</div>
											</div>
										);
									})}
								</div>
							)}
							{loadedFilms.length > 0 && cam.backs.length === 0 && (
								<div className="mt-3 pt-3 border-t border-border">
									{loadedFilms.map((f) => (
										<div key={f.id} className="text-[13px] font-body" style={{ color: T.green }}>
											{filmName(f)} — ISO {f.shootIso}
										</div>
									))}
								</div>
							)}
						</Card>
					);
				})}
				{data.cameras.length === 0 && (
					<EmptyState icon={Camera} title="Aucun appareil" subtitle="Ajoute tes boîtiers pour commencer" />
				)}
			</div>

			{/* Add camera modal */}
			<Dialog open={showAdd} onOpenChange={(open) => !open && setShowAdd(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nouvel appareil</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<PhotoPicker
							photos={newCam.photo ? [newCam.photo] : []}
							onChange={(p) => setNewCam({ ...newCam, photo: p[0] || undefined })}
							max={1}
							size={48}
							placeholderIcon
							label="Photo"
						/>
						<FormField label="Marque">
							<Input
								value={newCam.brand}
								onChange={(e) => setNewCam({ ...newCam, brand: e.target.value })}
								placeholder="Ex: Canon"
							/>
						</FormField>
						<FormField label="Modèle">
							<Input
								value={newCam.model}
								onChange={(e) => setNewCam({ ...newCam, model: e.target.value })}
								placeholder="Ex: A-1"
							/>
						</FormField>
						<FormField label="Surnom (optionnel)">
							<Input
								value={newCam.nickname}
								onChange={(e) => setNewCam({ ...newCam, nickname: e.target.value })}
								placeholder="Ex: Mon Canon préféré"
							/>
						</FormField>
						<FormField label="N° de série (optionnel)">
							<Input
								value={newCam.serial}
								onChange={(e) => setNewCam({ ...newCam, serial: e.target.value })}
								placeholder="Ex: 123456"
							/>
						</FormField>
						<FormField label="Format">
							<Select value={newCam.format} onValueChange={(v) => setNewCam({ ...newCam, format: v })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="35mm">35mm</SelectItem>
									<SelectItem value="120">Moyen format (120)</SelectItem>
									<SelectItem value="Instant">Instant</SelectItem>
								</SelectContent>
							</Select>
						</FormField>
						<div className="flex items-center justify-between gap-3">
							<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
								Dos interchangeable
							</label>
							<Switch
								checked={newCam.hasInterchangeableBack}
								onCheckedChange={(v) => setNewCam({ ...newCam, hasInterchangeableBack: v })}
							/>
						</div>
						<Button onClick={addCamera} disabled={!newCam.brand && !newCam.model} className="w-full justify-center">
							<Plus size={16} /> Ajouter
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit camera modal */}
			<Dialog open={!!editCam} onOpenChange={(open) => !open && setEditCam(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Modifier l'appareil</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{editCam && (
						<div className="flex flex-col gap-4">
							<PhotoPicker
								photos={editCam.photo ? [editCam.photo] : []}
								onChange={(p) => setEditCam({ ...editCam, photo: p[0] || undefined })}
								max={1}
								size={48}
								placeholderIcon
								label="Photo"
							/>
							<FormField label="Marque">
								<Input value={editCam.brand} onChange={(e) => setEditCam({ ...editCam, brand: e.target.value })} />
							</FormField>
							<FormField label="Modèle">
								<Input value={editCam.model} onChange={(e) => setEditCam({ ...editCam, model: e.target.value })} />
							</FormField>
							<FormField label="Surnom (optionnel)">
								<Input
									value={editCam.nickname}
									onChange={(e) => setEditCam({ ...editCam, nickname: e.target.value })}
								/>
							</FormField>
							<FormField label="N° de série (optionnel)">
								<Input value={editCam.serial} onChange={(e) => setEditCam({ ...editCam, serial: e.target.value })} />
							</FormField>
							<FormField label="Format">
								<Select value={editCam.format} onValueChange={(v) => setEditCam({ ...editCam, format: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="35mm">35mm</SelectItem>
										<SelectItem value="120">Moyen format (120)</SelectItem>
										<SelectItem value="Instant">Instant</SelectItem>
									</SelectContent>
								</Select>
							</FormField>
							<div className="flex items-center justify-between gap-3">
								<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">
									Dos interchangeable
								</label>
								<Switch
									checked={editCam.hasInterchangeableBack || false}
									onCheckedChange={(v) => setEditCam({ ...editCam, hasInterchangeableBack: v })}
								/>
							</div>
							<Button
								onClick={saveEditCamera}
								disabled={!editCam.brand && !editCam.model}
								className="w-full justify-center"
							>
								<Check size={16} /> Enregistrer
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Add back modal */}
			<Dialog open={!!showBackModal} onOpenChange={(open) => !open && setShowBackModal(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ajouter un dos</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<PhotoPicker
							photos={newBack.photo ? [newBack.photo] : []}
							onChange={(p) => setNewBack({ ...newBack, photo: p[0] || undefined })}
							max={1}
							size={32}
							placeholderIcon
							label="Photo"
						/>
						<FormField label="Nom du dos">
							<Input
								value={newBack.name}
								onChange={(e) => setNewBack({ ...newBack, name: e.target.value })}
								placeholder="Ex: A12 — Couleur"
							/>
						</FormField>
						<FormField label="Référence">
							<Input
								value={newBack.ref}
								onChange={(e) => setNewBack({ ...newBack, ref: e.target.value })}
								placeholder="Ex: A12"
							/>
						</FormField>
						<Button
							onClick={() => showBackModal && addBack(showBackModal)}
							disabled={!newBack.name}
							className="w-full justify-center"
						>
							<Plus size={16} /> Ajouter le dos
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit back modal */}
			<Dialog open={!!editBack} onOpenChange={(open) => !open && setEditBack(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Modifier le dos</DialogTitle>
						<DialogCloseButton />
					</DialogHeader>
					{editBack && (
						<div className="flex flex-col gap-4">
							<PhotoPicker
								photos={editBack.back.photo ? [editBack.back.photo] : []}
								onChange={(p) => setEditBack({ ...editBack, back: { ...editBack.back, photo: p[0] || undefined } })}
								max={1}
								size={32}
								placeholderIcon
								label="Photo"
							/>
							<FormField label="Nom du dos">
								<Input
									value={editBack.back.name}
									onChange={(e) => setEditBack({ ...editBack, back: { ...editBack.back, name: e.target.value } })}
								/>
							</FormField>
							<FormField label="Référence">
								<Input
									value={editBack.back.ref || ""}
									onChange={(e) => setEditBack({ ...editBack, back: { ...editBack.back, ref: e.target.value } })}
								/>
							</FormField>
							<Button onClick={saveEditBack} disabled={!editBack.back.name} className="w-full justify-center">
								<Check size={16} /> Enregistrer
							</Button>
							<Button
								variant="destructive"
								onClick={() => deleteBack(editBack.camId, editBack.back.id)}
								className="w-full justify-center"
							>
								<Trash2 size={14} /> Supprimer ce dos
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
