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

interface IdenticalGroup {
	key: string;
	representative: Film;
	count: number;
}

interface BrandGroup {
	brand: string;
	identicals: IdenticalGroup[];
	totalCost: number;
	totalQty: number;
}

function identityKey(f: Film): string {
	return [
		(f.brand || "").toLowerCase(),
		(f.model || "").toLowerCase(),
		f.format || "",
		f.iso ?? "",
		f.expDate ?? "",
		f.price ?? "",
	].join("|");
}

function groupByBrand(films: Film[]): BrandGroup[] {
	const brandMap = new Map<string, BrandGroup>();
	for (const film of films) {
		const brand = filmBrand(film) || "—";
		let group = brandMap.get(brand);
		if (!group) {
			group = { brand, identicals: [], totalQty: 0, totalCost: 0 };
			brandMap.set(brand, group);
		}
		const key = identityKey(film);
		const existing = group.identicals.find((g) => g.key === key);
		if (existing) {
			existing.count += 1;
		} else {
			group.identicals.push({ key, representative: film, count: 1 });
		}
		group.totalQty += 1;
		group.totalCost += film.price ?? 0;
	}
	return Array.from(brandMap.values()).sort((a, b) => b.totalQty - a.totalQty);
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
						<span className="font-archivo-black text-[13px] tracking-[0.15em] uppercase text-ink">★ {group.brand}</span>
						<em className="not-italic font-typewriter text-[10px] tracking-[0.12em] text-ink-faded">
							{t("stock.resultCount", { count: group.totalQty })}
							{group.totalCost > 0 && ` · ${group.totalCost.toFixed(0)} €`}
						</em>
					</header>
					{group.identicals.map((g, i) => (
						<FilmRow
							key={g.key}
							film={g.representative}
							cameras={cameras}
							backs={backs}
							groupCount={g.count}
							index={i}
							onClick={() => onOpenFilm(g.representative.id)}
						/>
					))}
				</section>
			))}
		</div>
	);
}
