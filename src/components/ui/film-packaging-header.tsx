import { useTranslation } from "react-i18next";
import type { FilmLabelVariant } from "@/components/ui/film-label";
import { KodakBadge } from "@/components/ui/kodak-badge";
import { cn } from "@/lib/utils";

interface FilmPackagingHeaderProps {
	brand: string;
	model: string;
	iso: number | string;
	format: string;
	type?: string;
	variant: FilmLabelVariant;
	refCode?: string;
	exposures?: number | string;
	className?: string;
	rotate?: number;
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
	color: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_8px,var(--color-kodak-yellow)_8px_11px)]",
	bw: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_8px,var(--color-paper-dark)_8px_11px)]",
	slide: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_8px,var(--color-kodak-teal)_8px_11px)]",
	tungsten: "bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_8px,var(--color-kodak-red)_8px_11px)]",
};

/**
 * Bandeau d'en-tête façon packaging Kodak (utilisé dans le détail d'une
 * pellicule et la modal d'ajout). Bandes noires top/bot, code marque
 * abrégé en KodakBadge, modèle en gros chiffres archivo-black, ISO
 * proéminent sur la droite.
 */
export function FilmPackagingHeader({
	brand,
	model,
	iso,
	format,
	type,
	variant,
	refCode,
	exposures,
	className,
	rotate = -0.5,
}: FilmPackagingHeaderProps) {
	const { t } = useTranslation();
	const negativeLabel = t("filmPackaging.subline");
	const brandCode = brand.slice(0, 2).toUpperCase();
	const subline = type ? type.toLowerCase() : negativeLabel;
	const modelLine = model.split(" ")[0]?.toUpperCase() || model.toUpperCase();

	return (
		<section
			className={cn(
				"relative overflow-hidden border-[3px] border-ink shadow-[5px_5px_0_var(--color-ink)]",
				VARIANT_BG[variant],
				VARIANT_FG[variant],
				className,
			)}
			style={{ transform: `rotate(${rotate}deg)` }}
		>
			{/* Bandes top/bot */}
			<div className={cn("absolute left-0 right-0 top-0 h-2.5", VARIANT_STRIPE[variant])} />
			<div className={cn("absolute left-0 right-0 bottom-0 h-2.5", VARIANT_STRIPE[variant])} />

			<div className="px-4 pt-5 pb-1 flex items-start justify-between">
				<div className="font-archivo-black text-[11px] tracking-[0.22em] uppercase">
					<KodakBadge size="sm" className="mr-1.5">
						{brandCode}
					</KodakBadge>
					{brand}
				</div>
				{refCode && (
					<div className="font-typewriter text-[9px] tracking-[0.12em] text-right leading-tight">
						REF
						<KodakBadge size="sm" className="block mt-0.5">
							{refCode}
						</KodakBadge>
					</div>
				)}
			</div>

			<div className="px-4 pt-2 pb-1 grid grid-cols-[1fr_auto] gap-3 items-end">
				<div className="font-archivo-black text-[28px] leading-[0.92] tracking-[-1px] uppercase">
					{modelLine}
					<em className="block font-archivo not-italic font-bold text-[12px] tracking-[0.15em] mt-1.5 normal-case">
						{subline} · {negativeLabel}
					</em>
				</div>
				<div className="text-right leading-[0.85]">
					<span className="font-archivo-black text-[52px] tracking-[-3px] block">{iso}</span>
					<span className="font-archivo font-black text-[10px] tracking-[0.2em]">ISO / ASA</span>
				</div>
			</div>

			<div className="px-4 pt-2.5 pb-4 mt-2 border-t-2 border-ink flex items-center justify-between gap-3">
				<div className="font-archivo font-extrabold text-[10px] tracking-[0.18em] uppercase flex gap-2">
					<KodakBadge>{format}</KodakBadge>
					{exposures != null && <KodakBadge>{exposures} EXP</KodakBadge>}
				</div>
				{/* Frise jaune décorative (motif "barcode") */}
				<div className="h-5 flex items-center bg-ink px-1.5 py-1">
					{[1, 3, 1, 2, 1, 4, 2, 1, 3, 1].map((w, i) => (
						<i
							key={`bar-${
								// biome-ignore lint/suspicious/noArrayIndexKey: static decorative pattern
								i
							}`}
							className="inline-block h-full bg-kodak-yellow"
							style={{ width: w * 1.5, marginRight: i < 9 ? 2 : 0 }}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
