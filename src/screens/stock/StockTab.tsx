import { Package } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import type { Back, Camera, Film } from "@/types";
import { filmBrand } from "@/utils/film-helpers";

interface StockTabProps {
	films: Film[];
	filteredFilms: Film[];
	cameras: Camera[];
	backs: Back[];
	onOpenFilm: (id: string) => void;
	searchActive: boolean;
}

interface BrandGroup {
	brand: string;
	films: Film[];
	totalCost: number;
	totalQty: number;
}

function groupByBrand(films: Film[]): BrandGroup[] {
	const map = new Map<string, BrandGroup>();
	for (const film of films) {
		const brand = filmBrand(film) || "—";
		const existing = map.get(brand);
		const qty = film.quantity ?? 1;
		const cost = (film.price ?? 0) * qty;
		if (existing) {
			existing.films.push(film);
			existing.totalQty += qty;
			existing.totalCost += cost;
		} else {
			map.set(brand, { brand, films: [film], totalQty: qty, totalCost: cost });
		}
	}
	return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
}

export function StockTab({ films, filteredFilms, cameras, backs, onOpenFilm, searchActive }: StockTabProps) {
	const { t } = useTranslation();
	const list = searchActive ? filteredFilms : films;
	const groups = useMemo(() => groupByBrand(list), [list]);

	if (films.length === 0) {
		return <EmptyState icon={Package} title={t("stock.emptyStock")} subtitle={t("stock.emptyStockSubtitle")} />;
	}

	if (groups.length === 0) {
		return <EmptyState icon={Package} title={t("stock.nothingFound")} subtitle={t("stock.noMatch")} />;
	}

	return (
		<div className="flex flex-col gap-2" data-tour="stock-list">
			{groups.map((group) => (
				<section key={group.brand} className="flex flex-col gap-2">
					<header className="flex items-center justify-between border-b-2 border-ink pt-3 pb-1.5">
						<span className="font-archivo-black text-[13px] tracking-[0.15em] uppercase text-ink">
							★ {group.brand}
						</span>
						<em className="not-italic font-typewriter text-[10px] tracking-[0.12em] text-ink-faded">
							{t("stock.resultCount", { count: group.totalQty })}
							{group.totalCost > 0 && ` · ${group.totalCost.toFixed(0)} €`}
						</em>
					</header>
					{group.films.map((f) => (
						<FilmRow key={f.id} film={f} cameras={cameras} backs={backs} onClick={() => onOpenFilm(f.id)} />
					))}
				</section>
			))}
		</div>
	);
}
