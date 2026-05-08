import { monogram, tileColor } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type FilmLabelVariant = "color" | "bw" | "slide" | "tungsten";

interface FilmLabelProps {
	iso: number | string;
	format: string;
	brand?: string;
	variant?: FilmLabelVariant;
	size?: "sm" | "md";
	typeLabel?: string;
	className?: string;
}

/**
 * Vignette monogramme dérivée de la marque. Le carré est teinté d'un gris
 * neutre déterministe via `tileColor(brand)`. ISO et format sont affichés
 * en métadonnée discrète sous le monogramme. `variant` est conservé pour
 * compat ascendante mais n'a plus d'effet visuel.
 */
export function FilmLabel({ iso, format, brand, size = "md", className }: FilmLabelProps) {
	const isSm = size === "sm";
	const bg = tileColor(brand);
	const initials = monogram(brand);

	return (
		<div
			className={cn(
				"relative flex flex-col items-center justify-center text-center text-white",
				isSm ? "py-2 px-1 gap-0.5" : "py-3 px-1.5 gap-1",
				className,
			)}
			style={{ backgroundColor: bg }}
		>
			<div className={cn("font-semibold leading-none tracking-tight", isSm ? "text-[20px]" : "text-[26px]")}>
				{initials}
			</div>
			<div className={cn("font-medium leading-none text-white/75", isSm ? "text-[10px]" : "text-[11px]")}>
				{iso} · {format}
			</div>
		</div>
	);
}
