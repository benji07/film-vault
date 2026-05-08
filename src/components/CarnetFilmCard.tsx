import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { FilmLabel } from "@/components/ui/film-label";
import { cn } from "@/lib/utils";
import type { Camera, Film } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";
import { filmLastActionDate } from "@/utils/film-helpers";

interface CarnetFilmCardProps {
	film: Film;
	camera?: Camera | null;
	onClick: () => void;
	index?: number;
	className?: string;
}

type StateKey = "loaded" | "partial" | "exposed" | "atLab" | "developed" | "scanned";

const STATE_BADGE: Record<StateKey, { className: string; dot: "accent" | "terracotta" | "none" }> = {
	loaded: { className: "bg-text text-bg", dot: "none" },
	partial: { className: "bg-amber-soft text-amber", dot: "none" },
	exposed: { className: "bg-text text-bg", dot: "accent" },
	atLab: { className: "bg-terracotta-soft text-terracotta", dot: "terracotta" },
	developed: { className: "bg-sage-soft text-sage", dot: "none" },
	scanned: { className: "bg-smoke-soft text-smoke", dot: "none" },
};

interface StateInfo {
	key: StateKey;
	label: string;
}

function describeState(
	film: Film,
	camera: Camera | null | undefined,
	t: TFunction,
): {
	state: StateInfo;
	description: React.ReactNode;
} {
	const camName = camera ? cameraDisplayName(camera) : null;

	if (film.state === "loaded") {
		return {
			state: { key: "loaded", label: t("states.loaded") || "chargée" },
			description: camName ? t("dashboard.state.loadedIn", { camera: camName }) : t("dashboard.state.noCamera"),
		};
	}
	if (film.state === "partial") {
		return {
			state: { key: "partial", label: t("states.partial") || "partielle" },
			description: camName
				? t("dashboard.state.partial", { camera: camName })
				: t("dashboard.state.partial", { camera: "—" }),
		};
	}
	if (film.state === "exposed") {
		const sentDev = [...(film.history || [])].reverse().find((h) => h.actionCode === "sent_dev");
		const labName = film.lab || (sentDev?.params?.lab as string | undefined);
		if (labName || sentDev) {
			return {
				state: { key: "atLab", label: t("states.atLab") || "au labo" },
				description: t("dashboard.state.atLab", { lab: labName || "labo" }),
			};
		}
		return {
			state: { key: "exposed", label: t("states.exposed") || "exposée" },
			description: t("dashboard.state.exposed"),
		};
	}
	if (film.state === "developed") {
		return {
			state: { key: "developed", label: t("states.developed") || "développée" },
			description: t("dashboard.state.toScan"),
		};
	}
	if (film.state === "scanned") {
		return {
			state: { key: "scanned", label: t("states.scanned") },
			description: t("dashboard.state.scanned"),
		};
	}
	return {
		state: { key: "exposed", label: film.state },
		description: "",
	};
}

export function CarnetFilmCard({ film, camera, onClick, className }: CarnetFilmCardProps) {
	const { t, i18n } = useTranslation();
	const { state, description } = describeState(film, camera, t);

	const total = film.posesTotal ?? 36;
	const shot = film.posesShot ?? 0;
	const pct = total > 0 ? Math.min(100, (shot / total) * 100) : 0;

	const displayName = film.customName || `${film.brand ?? ""} ${film.model ?? ""}`.trim() || "—";
	const labRef = film.labRef?.trim() || null;
	const sub = film.type ? `${film.type.toLowerCase()}` : "";

	const lastActionISO = filmLastActionDate(film);
	const lastActionLabel = lastActionISO
		? new Date(lastActionISO).toLocaleDateString(i18n.language.startsWith("fr") ? "fr-FR" : "en-US", {
				day: "numeric",
				month: "short",
			})
		: null;

	const badge = STATE_BADGE[state.key];

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative grid bg-surface rounded-[14px] overflow-hidden cursor-pointer text-left w-full",
				"min-h-[128px] grid-cols-[88px_1fr] transition-colors hover:bg-surface-2",
				className,
			)}
		>
			<FilmLabel iso={film.iso ?? "—"} format={film.format ?? ""} brand={film.brand} type={film.type} typeLabel={sub} />

			<div className="px-4 py-3.5 flex flex-col justify-between min-w-0">
				<div className="flex items-start justify-between gap-2.5">
					<div className="text-base font-semibold leading-tight text-text min-w-0">
						<div className="truncate">{displayName}</div>
						{sub && <div className="text-xs font-normal text-text-3 mt-0.5">{sub}</div>}
					</div>
					{labRef && (
						<div className="text-[10px] text-text-3 text-right leading-tight flex-shrink-0">
							<div className="uppercase tracking-wider">REF</div>
							<div className="font-medium text-text-2">{labRef}</div>
						</div>
					)}
				</div>

				{(description || lastActionLabel) && (
					<div className="mt-2">
						{description && <div className="text-sm leading-snug text-text-2">{description}</div>}
						{lastActionLabel && <div className="text-[11px] text-text-3 mt-1">{lastActionLabel}</div>}
					</div>
				)}

				<div className="flex items-center gap-2.5 mt-2.5">
					<span
						className={cn(
							"inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 leading-none rounded-full flex-shrink-0",
							badge.className,
						)}
					>
						{badge.dot === "accent" && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
						{badge.dot === "terracotta" && <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />}
						{state.label}
					</span>
					<div className="flex-1 h-1.5 bg-fill-1 rounded-full relative overflow-hidden">
						{shot > 0 && (
							<div className="absolute left-0 top-0 bottom-0 bg-text rounded-full" style={{ width: `${pct}%` }} />
						)}
					</div>
					<span className="text-sm font-medium text-text flex-shrink-0">
						{shot > 0 ? shot : total}
						<span className="text-text-3 font-normal">{shot > 0 ? `/${total}` : ` ${t("dashboard.posesUnit")}`}</span>
					</span>
				</div>
			</div>
		</button>
	);
}
