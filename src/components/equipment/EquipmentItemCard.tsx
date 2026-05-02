import type { ReactNode } from "react";
import { PhotoImg } from "@/components/ui/photo-img";
import { WashiTape } from "@/components/ui/washi-tape";
import { cn } from "@/lib/utils";

export type EquipmentVignette = "default" | "silver" | "red" | "lens" | "back";

interface EquipmentItemCardProps {
	name: string;
	year?: string;
	formatLabel?: string;
	stats: { value: string | number; label: string }[];
	loadedSummary?: string | null;
	photo?: string | null;
	vignette?: EquipmentVignette;
	washi?: "w1" | "w2" | "w3" | "w4";
	index?: number;
	actions?: ReactNode;
	onClick?: () => void;
	className?: string;
}

const VIGNETTE_BG: Record<EquipmentVignette, string> = {
	default: "linear-gradient(180deg, #4a3f30 0%, #2a221a 100%)",
	silver: "linear-gradient(180deg, #c4b8a0 0%, #8a7e6a 100%)",
	red: "linear-gradient(180deg, #8a3024 0%, #5a1810 100%)",
	lens: "linear-gradient(180deg, #2d3a44 0%, #16202a 100%)",
	back: "linear-gradient(180deg, #5e4e3a 0%, #312618 100%)",
};

const VIGNETTE_RING: Record<EquipmentVignette, string> = {
	default: "#2a2520",
	silver: "#1a1612",
	red: "#1a1612",
	lens: "#0a0a12",
	back: "#1a1410",
};

const ROTATIONS = ["-rotate-[0.3deg]", "rotate-[0.2deg]", "rotate-[0.4deg]", "-rotate-[0.25deg]"];
const WASHI_POS = [
	{ left: "left-[30px]", rotate: -2 },
	{ left: "right-[30px]", rotate: 2 },
	{ left: "left-[60%]", rotate: -1 },
	{ left: "left-6", rotate: 3 },
];

/**
 * Carte équipement façon prototype : 110px gauche pour la vignette /
 * photo, 1fr droite pour le nom + année + grille de stats + bandeau
 * "chargée" si film actif. Rotation légère + washi tape déco.
 */
export function EquipmentItemCard({
	name,
	year,
	formatLabel,
	stats,
	loadedSummary,
	photo,
	vignette = "default",
	washi = "w1",
	index = 0,
	actions,
	onClick,
	className,
}: EquipmentItemCardProps) {
	const rotation = ROTATIONS[index % ROTATIONS.length] ?? "";
	const washiPos = WASHI_POS[index % WASHI_POS.length] ?? WASHI_POS[0]!;

	const innerClasses = cn(
		"grid w-full text-left grid-cols-[110px_1fr]",
		onClick && "cursor-pointer transition-transform active:scale-[.99]",
	);

	const inner = (
		<>
			{/* Vignette / photo */}
			<div className="bg-ink relative overflow-hidden flex items-center justify-center min-h-[124px]">
				{photo ? (
					<PhotoImg src={photo} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
				) : (
					<div
						className="w-[70px] h-[50px] rounded-[4px] relative"
						style={{
							background: `radial-gradient(circle at 50% 60%, ${VIGNETTE_RING[vignette]} 0 16px, var(--color-ink) 16px 18px, transparent 18px), ${VIGNETTE_BG[vignette]}`,
							boxShadow: "inset 0 -8px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,200,100,0.15)",
						}}
					>
						<span
							className="absolute top-1.5 left-1/2 w-6 h-1.5 bg-ink rounded-sm"
							style={{ transform: "translateX(-50%)" }}
						/>
					</div>
				)}
				{formatLabel && (
					<div className="absolute bottom-2 left-2 right-2 bg-kodak-yellow border border-ink text-ink font-archivo-black text-[9px] tracking-[0.15em] text-center px-1 py-0.5 uppercase">
						{formatLabel}
					</div>
				)}
			</div>

			{/* Body */}
			<div className="px-3.5 py-3 flex flex-col gap-1.5 min-w-0">
				<div className="font-archivo-black text-[16px] tracking-[-0.3px] uppercase leading-[0.95] text-ink">
					{name}
					{year && (
						<em className="block font-cormorant not-italic-fix italic text-[12px] text-ink-faded mt-1 font-normal normal-case tracking-normal">
							{year}
						</em>
					)}
				</div>

				{stats.length > 0 && (
					<div className="flex border border-ink-faded mt-1.5">
						{stats.map((s, i) => (
							<div
								key={s.label}
								className={cn("flex-1 px-1.5 py-1 text-center", i < stats.length - 1 && "border-r border-ink-faded")}
							>
								<div className="font-archivo-black text-[13px] text-ink leading-none">{s.value}</div>
								<div className="font-archivo font-bold text-[8px] tracking-[0.15em] uppercase text-ink-faded mt-1">
									{s.label}
								</div>
							</div>
						))}
					</div>
				)}

				{loadedSummary ? (
					<div className="flex items-center gap-2 mt-1.5 px-2 py-1.5 bg-kodak-red border-[1.5px] border-ink text-paper">
						<span className="font-archivo-black text-[9px] tracking-[0.15em] bg-paper text-kodak-red px-1.5 py-0.5">
							●
						</span>
						<span className="font-caveat text-[15px] leading-none flex-1 truncate">{loadedSummary}</span>
					</div>
				) : (
					<div className="flex items-center gap-1.5 mt-1.5 font-caveat text-[14px] text-ink-faded italic">
						<span className="w-2 h-2 bg-ink-faded inline-block" />
						<span>—</span>
					</div>
				)}
			</div>
		</>
	);

	return (
		<article
			className={cn(
				"relative bg-paper-card border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] overflow-hidden",
				rotation,
				className,
			)}
		>
			<WashiTape
				color={washi}
				rotate={washiPos.rotate}
				width={54}
				className={cn("-top-[7px]", washiPos.left)}
				style={washiPos.left.includes("right") ? { right: 30, left: "auto" } : undefined}
			/>

			{onClick ? (
				<button type="button" onClick={onClick} className={innerClasses}>
					{inner}
				</button>
			) : (
				<div className={innerClasses}>{inner}</div>
			)}

			{/* Actions floated top-right so they live outside the main button. */}
			{actions && <div className="absolute top-2 right-2 flex gap-1.5 z-10">{actions}</div>}
		</article>
	);
}
