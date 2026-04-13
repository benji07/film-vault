import { Archive, Camera, Clock, Eye, Film, ListTodo, Plus, ScanLine, Snowflake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActiveRollCard } from "@/components/ActiveRollCard";
import { EmptyState } from "@/components/EmptyState";
import { EquipmentCard } from "@/components/EquipmentCard";
import { StatChip } from "@/components/StatChip";
import { TodoItem } from "@/components/TodoItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { alpha, T } from "@/constants/theme";
import type { AppData, Back, Camera as CameraType, Film as FilmType, ScreenName } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";

interface DashboardScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	onAddFilm: () => void;
	setAutoOpenShotNote?: (open: boolean) => void;
	onNavigateToStock: (stateFilter: string) => void;
}

interface EquipmentItem {
	key: string;
	label: string;
	sublabel?: string;
	icon: "camera" | "back";
	loadedFilm: FilmType | null;
}

function buildEquipmentItems(cameras: CameraType[], backs: Back[], activeFilms: FilmType[]): EquipmentItem[] {
	const items: EquipmentItem[] = [];

	for (const cam of cameras) {
		if (!cam.hasInterchangeableBack) {
			const film = activeFilms.find((f) => f.state === "loaded" && f.cameraId === cam.id) || null;
			items.push({
				key: `cam-${cam.id}`,
				label: cameraDisplayName(cam),
				icon: "camera",
				loadedFilm: film,
			});
		}
	}

	for (const back of backs) {
		const film = activeFilms.find((f) => f.state === "loaded" && f.backId === back.id) || null;
		const cam = film?.cameraId ? cameras.find((c) => c.id === film.cameraId) : null;
		items.push({
			key: `back-${back.id}`,
			label: backDisplayName(back),
			sublabel: cam ? cameraDisplayName(cam) : undefined,
			icon: "back",
			loadedFilm: film,
		});
	}

	for (const cam of cameras) {
		if (cam.hasInterchangeableBack) {
			const compatibleBacks = backs.filter((b) => b.compatibleCameraIds.includes(cam.id));
			const hasLoadedBack = activeFilms.some(
				(f) => f.state === "loaded" && f.cameraId === cam.id && compatibleBacks.some((b) => b.id === f.backId),
			);
			if (!hasLoadedBack) {
				items.push({
					key: `cam-${cam.id}`,
					label: cameraDisplayName(cam),
					icon: "camera",
					loadedFilm: null,
				});
			}
		}
	}

	items.sort((a, b) => {
		if (a.loadedFilm && !b.loadedFilm) return -1;
		if (!a.loadedFilm && b.loadedFilm) return 1;
		if (a.loadedFilm && b.loadedFilm) {
			const dateA = a.loadedFilm.startDate || "";
			const dateB = b.loadedFilm.startDate || "";
			return dateB.localeCompare(dateA);
		}
		return 0;
	});

	return items;
}

export function DashboardScreen({
	data,
	setScreen,
	setSelectedFilm,
	onAddFilm,
	setAutoOpenShotNote,
	onNavigateToStock,
}: DashboardScreenProps) {
	const { t } = useTranslation();
	const { films, cameras, backs } = data;

	const counts: Record<string, number> = {};
	const activeFilms: FilmType[] = [];

	for (const f of films) {
		counts[f.state] = (counts[f.state] || 0) + 1;
		if (f.state === "loaded" || f.state === "partial") {
			activeFilms.push(f);
		}
	}

	const stockCount = counts.stock || 0;
	const loadedCount = counts.loaded || 0;
	const exposedCount = counts.exposed || 0;
	const developedCount = counts.developed || 0;
	const partialCount = counts.partial || 0;
	const scannedCount = counts.scanned || 0;

	const equipmentItems = buildEquipmentItems(cameras, backs, activeFilms);
	const hasEquipment = equipmentItems.length > 0;

	const hasTodos = exposedCount > 0 || developedCount > 0;

	return (
		<div className="flex flex-col gap-6">
			{/* Barre de stats compacte */}
			<div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" data-tour="stat-cards">
				<StatChip
					icon={Snowflake}
					label={t("dashboard.inStock")}
					value={stockCount}
					color={T.blue}
					onClick={() => onNavigateToStock("stock")}
				/>
				<StatChip
					icon={Camera}
					label={t("dashboard.loaded")}
					value={loadedCount}
					color={T.green}
					onClick={() => onNavigateToStock("loaded")}
				/>
				<StatChip
					icon={Eye}
					label={t("dashboard.exposed")}
					value={exposedCount}
					color={T.accent}
					onClick={() => onNavigateToStock("exposed")}
				/>
				<StatChip
					icon={Archive}
					label={t("dashboard.developed")}
					value={developedCount}
					color={T.textSec}
					onClick={() => onNavigateToStock("developed")}
				/>
				{scannedCount > 0 && (
					<StatChip
						icon={ScanLine}
						label={t("dashboard.scanned")}
						value={scannedCount}
						color={T.orange}
						onClick={() => onNavigateToStock("scanned")}
					/>
				)}
			</div>

			{partialCount > 0 && (
				<Card style={{ borderColor: alpha(T.amber, 0.27) }}>
					<div className="flex items-center gap-2.5">
						<Clock size={16} color={T.amber} />
						<span className="text-[13px] font-body font-semibold" style={{ color: T.amber }}>
							{t("dashboard.partiallyExposed", { count: partialCount })}
						</span>
					</div>
				</Card>
			)}

			{/* Pellicules actives en PREMIER */}
			{activeFilms.length > 0 && (
				<div data-tour="active-rolls">
					<div className="flex items-center gap-2 mb-3">
						<Film size={14} color={T.textSec} />
						<span className="text-[13px] font-bold text-text-sec font-body">{t("dashboard.activeRolls")}</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
						{activeFilms.map((f, i) => {
							const cam = f.cameraId ? cameras.find((c) => c.id === f.cameraId) : null;
							const back = f.backId ? backs.find((b) => b.id === f.backId) : null;
							return (
								<div key={f.id} className="animate-stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
									<ActiveRollCard
										film={f}
										camera={cam}
										back={back}
										onShotClick={() => {
											setAutoOpenShotNote?.(true);
											setSelectedFilm(f.id);
											setScreen("filmDetail");
										}}
										onClick={() => {
											setSelectedFilm(f.id);
											setScreen("filmDetail");
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Section "A faire" */}
			{hasTodos && (
				<div>
					<div className="flex items-center gap-2 mb-3">
						<ListTodo size={14} color={T.textSec} />
						<span className="text-[13px] font-bold text-text-sec font-body">{t("dashboard.todoSection")}</span>
					</div>
					<div className="flex flex-col gap-2">
						{exposedCount > 0 && (
							<TodoItem
								icon={Eye}
								label={t("dashboard.awaitingDev", { count: exposedCount })}
								color={T.accent}
								onClick={() => setScreen("stock")}
							/>
						)}
						{developedCount > 0 && (
							<TodoItem
								icon={Archive}
								label={t("dashboard.awaitingScan", { count: developedCount })}
								color={T.textSec}
								onClick={() => setScreen("stock")}
							/>
						)}
					</div>
				</div>
			)}

			{/* Equipement en grille compacte */}
			{hasEquipment && (
				<div data-tour="equipment-section">
					<div className="flex items-center gap-2 mb-3">
						<Camera size={14} color={T.textSec} />
						<span className="text-[13px] font-bold text-text-sec font-body">{t("dashboard.myEquipment")}</span>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
						{equipmentItems.map((item) => (
							<EquipmentCard
								key={item.key}
								label={item.label}
								sublabel={item.sublabel}
								loadedFilm={item.loadedFilm}
								icon={item.icon}
								onClick={() => setScreen("cameras")}
								className="w-full"
							/>
						))}
					</div>
				</div>
			)}

			{films.length === 0 && (
				<EmptyState
					icon={Film}
					title={t("dashboard.noFilms")}
					subtitle={t("dashboard.noFilmsSubtitle")}
					action={
						<Button onClick={onAddFilm}>
							<Plus size={14} /> {t("dashboard.addFilm")}
						</Button>
					}
				/>
			)}
		</div>
	);
}
