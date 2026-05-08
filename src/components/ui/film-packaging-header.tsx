import { Badge } from "@/components/ui/badge";
import type { FilmLabelVariant } from "@/components/ui/film-label";
import { monogram, tileColor } from "@/constants/theme";
import { cn } from "@/lib/utils";

interface FilmPackagingHeaderProps {
	brand: string;
	model: string;
	iso: number | string;
	format: string;
	type?: string;
	variant?: FilmLabelVariant;
	refCode?: string;
	exposures?: number | string;
	className?: string;
	rotate?: number;
}

/**
 * En-tête de pellicule épuré : tile monogramme déterministe (gris dérivé
 * de la marque) + métadonnées en typo claire. Le packaging Kodak Gold a
 * été retiré au profit d'une mise en page minimaliste.
 */
export function FilmPackagingHeader({
	brand,
	model,
	iso,
	format,
	type,
	refCode,
	exposures,
	className,
}: FilmPackagingHeaderProps) {
	const initials = monogram(brand);
	const bg = tileColor(brand);

	return (
		<section className={cn("flex items-stretch gap-4 bg-surface rounded-[14px] p-4", className)}>
			<div
				className="flex flex-col items-center justify-center text-white shrink-0 rounded-[10px] w-[88px] h-[88px]"
				style={{ backgroundColor: bg }}
			>
				<div className="text-3xl font-semibold leading-none tracking-tight">{initials}</div>
				<div className="text-[10px] font-medium text-white/75 leading-none mt-1.5">{format}</div>
			</div>

			<div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
				<div className="flex items-start justify-between gap-3 min-w-0">
					<div className="min-w-0">
						<div className="text-xs uppercase tracking-wider text-text-3 leading-none">{brand}</div>
						<div className="text-xl font-semibold text-text leading-tight mt-1 truncate">{model}</div>
						{type && <div className="text-sm text-text-2 mt-0.5">{type.toLowerCase()}</div>}
					</div>
					<div className="text-right leading-none shrink-0">
						<div className="text-3xl font-semibold text-text tracking-tight">{iso}</div>
						<div className="text-[10px] text-text-3 mt-1 tracking-wider">ISO</div>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					{exposures != null && <Badge variant="default">{exposures} poses</Badge>}
					{refCode && <Badge variant="outline">{refCode}</Badge>}
				</div>
			</div>
		</section>
	);
}
