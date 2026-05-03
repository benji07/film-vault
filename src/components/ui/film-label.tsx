import { cn } from "@/lib/utils";

export type FilmLabelVariant = "color" | "bw" | "slide" | "tungsten";

interface FilmLabelProps {
	iso: number | string;
	format: string;
	variant?: FilmLabelVariant;
	size?: "sm" | "md";
	typeLabel?: string;
	className?: string;
}

const VARIANT_BG: Record<FilmLabelVariant, string> = {
	color: "bg-kodak-yellow",
	bw: "bg-paper-dark",
	slide: "bg-kodak-teal",
	tungsten: "bg-kodak-red",
};

const VARIANT_FG: Record<FilmLabelVariant, string> = {
	color: "text-ink",
	bw: "text-ink",
	slide: "text-paper",
	tungsten: "text-paper",
};

const VARIANT_STRIPE: Record<FilmLabelVariant, string> = {
	color: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_6px,var(--color-kodak-yellow)_6px_9px)]",
	bw: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_6px,var(--color-paper-dark)_6px_9px)]",
	slide: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_6px,var(--color-kodak-teal)_6px_9px)]",
	tungsten: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_6px,var(--color-kodak-red)_6px_9px)]",
};

/**
 * Étiquette de pellicule façon packaging Kodak.
 * Couleur de fond selon `variant`, rayures noires top/bot (perforations
 * stylisées), ISO en gros chiffre Archivo Black, format en bandeau séparé.
 */
export function FilmLabel({ iso, format, variant = "color", size = "md", typeLabel, className }: FilmLabelProps) {
	const isSm = size === "sm";

	return (
		<div
			className={cn(
				"relative flex flex-col items-center justify-center text-center overflow-hidden",
				"border-r-2 border-ink",
				isSm ? "py-2 px-1" : "pt-3.5 pb-3 px-1.5 border-r-[3px]",
				VARIANT_BG[variant],
				VARIANT_FG[variant],
				className,
			)}
		>
			{/* Bandes rayées top/bot */}
			<div className={cn("absolute left-0 right-0 top-0 h-2", VARIANT_STRIPE[variant])} />
			<div className={cn("absolute left-0 right-0 bottom-0 h-2", VARIANT_STRIPE[variant])} />

			{/* ISO */}
			<div className={cn("font-archivo-black leading-[0.9] tracking-tight", isSm ? "text-[22px]" : "text-[32px] mt-1")}>
				{iso}
			</div>

			{/* ISO suffix */}
			{!isSm && <div className="font-archivo text-[10px] font-extrabold tracking-[0.15em] mt-0.5">ISO</div>}

			{/* Format separator + label */}
			<div
				className={cn(
					"font-archivo font-extrabold tracking-[0.15em] uppercase border-t-[1.5px] border-current",
					isSm ? "text-[9px] mt-1.5 pt-[3px]" : "text-[11px] mt-2 pt-1.5",
				)}
			>
				{format}
			</div>

			{/* Type label (only md) */}
			{!isSm && typeLabel && (
				<div className="font-typewriter text-[8px] tracking-[0.18em] mt-1 opacity-75">{typeLabel}</div>
			)}
		</div>
	);
}
