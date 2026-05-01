import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { FilmLabel } from "@/components/ui/film-label";
import { KodakBadge } from "@/components/ui/kodak-badge";
import { WashiTape } from "@/components/ui/washi-tape";
import { filmTypeToVariant } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { Camera, Film } from "@/types";
import { cameraDisplayName } from "@/utils/camera-helpers";

interface CarnetFilmCardProps {
	film: Film;
	camera?: Camera | null;
	onClick: () => void;
	index?: number;
	className?: string;
}

const ROTATIONS = ["-rotate-[0.3deg]", "rotate-[0.25deg]", "rotate-[0.5deg]", "-rotate-[0.4deg]", "rotate-[0.3deg]"];
const WASHI_VARIANTS: Array<{ color: "w1" | "w2" | "w3" | "w4"; left: string; rotate: number }> = [
	{ color: "w1", left: "left-[30px]", rotate: -2 },
	{ color: "w3", left: "right-[30px]", rotate: 2 },
	{ color: "w2", left: "left-1/2", rotate: -1 },
	{ color: "w4", left: "left-[60px]", rotate: 3 },
	{ color: "w1", left: "left-[30px]", rotate: -2 },
];

const STATE_BG: Record<string, string> = {
	loaded: "bg-kodak-red text-paper",
	partial: "bg-kodak-yellow-deep text-ink",
	exposed: "bg-ink text-kodak-yellow",
	atLab: "bg-kodak-teal text-paper",
	developed: "bg-kodak-gold text-ink",
};

interface StateInfo {
	key: keyof typeof STATE_BG;
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
			description: camName ? (
				<>
					{t("dashboard.state.loadedIn", { camera: camName })}
				</>
			) : (
				t("dashboard.state.noCamera")
			),
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
		// Detect "au labo" via last sent_dev actionCode without subsequent developed entry
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
	return {
		state: { key: "exposed", label: film.state },
		description: "",
	};
}

export function CarnetFilmCard({ film, camera, onClick, index = 0, className }: CarnetFilmCardProps) {
	const { t } = useTranslation();
	const variant = filmTypeToVariant(film.type);
	const rotation = ROTATIONS[index % ROTATIONS.length] ?? "";
	const washi = WASHI_VARIANTS[index % WASHI_VARIANTS.length] ?? WASHI_VARIANTS[0]!;
	const { state, description } = describeState(film, camera, t);

	const total = film.posesTotal ?? 36;
	const shot = film.posesShot ?? 0;
	const pct = total > 0 ? Math.min(100, (shot / total) * 100) : 0;

	const displayName = film.customName || `${film.brand ?? ""} ${film.model ?? ""}`.trim() || "—";
	const ref = film.id.slice(-4).toUpperCase();
	const sub = film.type ? `${film.type.toLowerCase()}` : "";

	return (
		<article
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			role="button"
			tabIndex={0}
			className={cn(
				"relative grid bg-paper-card overflow-hidden cursor-pointer transition-transform",
				"shadow-[0_1px_0_rgba(60,40,20,0.05),0_8px_16px_-8px_rgba(50,35,15,0.18),0_2px_4px_-2px_rgba(50,35,15,0.18)]",
				"min-h-[128px]",
				"grid-cols-[88px_1fr]",
				"active:scale-[.98]",
				rotation,
				className,
			)}
		>
			<WashiTape
				color={washi.color}
				rotate={washi.rotate}
				width={64}
				className={cn("-top-[7px]", washi.left)}
				style={washi.left.includes("right") ? { right: 30, left: "auto" } : undefined}
			/>
			<FilmLabel iso={film.iso ?? "—"} format={film.format ?? ""} variant={variant} typeLabel={sub} />

			<div className="px-4 py-3.5 flex flex-col justify-between min-w-0">
				<div className="flex items-start justify-between gap-2.5">
					<div className="font-cormorant text-[20px] font-semibold leading-[1.05] text-ink tracking-[-0.2px] min-w-0">
						{displayName}
						{sub && (
							<em className="block italic font-normal text-[13px] text-ink-faded mt-0.5">{sub} · neg</em>
						)}
					</div>
					<div className="font-typewriter text-[9px] tracking-[0.12em] text-ink-faded text-right leading-tight flex-shrink-0">
						REF
						<KodakBadge size="xs" className="block mt-0.5">
							{ref}
						</KodakBadge>
					</div>
				</div>

				{description && (
					<div className="font-caveat text-[17px] leading-[1.3] text-ink-soft mt-2">{description}</div>
				)}

				<div className="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-dashed border-ink-faded/35">
					<span
						className={cn(
							"inline-flex items-center font-archivo font-extrabold text-[9px] uppercase tracking-[0.15em] px-2 py-1 leading-none flex-shrink-0",
							STATE_BG[state.key],
						)}
					>
						● {state.label}
					</span>
					<div className="flex-1 h-2 bg-ink relative overflow-hidden">
						{shot > 0 && (
							<div
								className="absolute left-0 top-0 bottom-0 bg-kodak-yellow"
								style={{ width: `${pct}%` }}
							>
								<div
									className="absolute inset-0"
									style={{
										backgroundImage:
											"repeating-linear-gradient(90deg, transparent 0 8px, rgba(0,0,0,0.18) 8px 9px)",
									}}
								/>
							</div>
						)}
					</div>
					<span className="font-archivo-black text-[13px] text-ink tracking-[-0.3px] flex-shrink-0">
						{shot > 0 ? shot : total}
						<span className="font-archivo font-normal text-[11px] text-ink-faded">
							{shot > 0 ? `/${total}` : " poses"}
						</span>
					</span>
				</div>
			</div>
		</article>
	);
}
