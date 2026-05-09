import { useState } from "react";
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
	imageUrl?: string;
	className?: string;
}

/**
 * Vignette monogramme dérivée de la marque. Le carré prend la teinte
 * earth-tone du type de pellicule (`typeColor(type)`) ou retombe sur un
 * gris déterministe via `tileColor(brand)` quand le type est inconnu.
 * Le monogramme reste basé sur la marque pour identifier d'un coup d'œil.
 *
 * Quand `imageUrl` est fourni et chargeable, l'image de boîte remplace le
 * monogramme et l'ISO/format s'affiche en surimpression sur un dégradé
 * sombre en bas pour rester lisible. Tombe sur le monogramme si l'image
 * échoue (onError) — utile pour les URL externes (raw GitHub) qui peuvent
 * 404 ou être bloquées.
 */
export function FilmLabel({ iso, format, brand, type, size = "md", imageUrl, className }: FilmLabelProps) {
	const isSm = size === "sm";
	const bg = type ? typeColor(type) : tileColor(brand);
	const initials = monogram(brand);

	const [failedUrl, setFailedUrl] = useState<string | null>(null);
	const showImage = Boolean(imageUrl) && imageUrl !== failedUrl;

	if (showImage) {
		return (
			<div className={cn("relative w-full h-full overflow-hidden bg-surface-2", className)}>
				<img
					src={imageUrl}
					alt={brand ?? ""}
					onError={() => setFailedUrl(imageUrl ?? null)}
					className="w-full h-full object-cover"
				/>
				<div
					className={cn(
						"absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent",
						"text-white text-center font-medium leading-none",
						isSm ? "text-[9px] pt-3 pb-1" : "text-[10px] pt-4 pb-1.5",
					)}
				>
					{iso} · {format}
				</div>
			</div>
		);
	}

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
