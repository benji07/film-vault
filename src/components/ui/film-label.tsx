import { monogram, tileColor, typeColor } from "@/constants/theme";
import { cn } from "@/lib/utils";

export type FilmLabelVariant = "color" | "bw" | "slide" | "tungsten";

interface FilmLabelProps {
	iso: number | string;
	format: string;
	brand?: string;
	type?: string;
	variant?: FilmLabelVariant;
	size?: "sm" | "md";
	typeLabel?: string;
	className?: string;
}

/**
 * Vignette monogramme dérivée de la marque. Le carré prend la teinte
 * earth-tone du type de pellicule (`typeColor(type)`) ou retombe sur un
 * gris déterministe via `tileColor(brand)` quand le type est inconnu.
 * Le monogramme reste basé sur la marque pour identifier d'un coup d'œil.
 */
export function FilmLabel({ iso, format, brand, type, size = "md", className }: FilmLabelProps) {
	const isSm = size === "sm";
	const bg = type ? typeColor(type) : tileColor(brand);
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
