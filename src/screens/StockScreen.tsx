import { ChevronDown, Film, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppData, Film as FilmType, ScreenName } from "@/types";
import { fmtExpDate } from "@/utils/expiration";
import { filmName } from "@/utils/film-helpers";

interface FilmGroup {
	key: string;
	label: string;
	expLabel: string;
	films: FilmType[];
}

function groupFilms(films: FilmType[], locale: string): FilmGroup[] {
	const map = new Map<string, FilmType[]>();

	for (const f of films) {
		const name = filmName(f);
		const exp = f.expDate || "";
		const key = `${name}||${exp}`;
		const group = map.get(key);
		if (group) {
			group.push(f);
		} else {
			map.set(key, [f]);
		}
	}

	return Array.from(map.entries()).map(([key, groupFilms]) => {
		const sep = key.indexOf("||");
		const name = key.slice(0, sep);
		const exp = key.slice(sep + 2);
		return {
			key,
			label: name,
			expLabel: exp ? fmtExpDate(exp, locale) : "",
			films: groupFilms,
		};
	});
}

interface StockScreenProps {
	data: AppData;
	setScreen: (screen: ScreenName) => void;
	setSelectedFilm: (id: string) => void;
	onAddFilm: () => void;
}

export function StockScreen({ data, setScreen, setSelectedFilm, onAddFilm }: StockScreenProps) {
	const { t } = useTranslation();
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const { films, cameras } = data;

	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

	const toggleGroup = (key: string) => {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const filtered = films.filter((f) => {
		if (filter !== "all" && f.state !== filter) return false;
		if (search) {
			const name = filmName(f);
			return name.toLowerCase().includes(search.toLowerCase());
		}
		return true;
	});

	const groups = groupFilms(filtered, t("dateLocale"));

	const tabs = [
		{ key: "all", label: t("stock.all"), count: films.length },
		{ key: "stock", label: t("stock.stockTab"), count: films.filter((f) => f.state === "stock").length },
		{ key: "loaded", label: t("stock.loadedTab"), count: films.filter((f) => f.state === "loaded").length },
		{ key: "partial", label: t("stock.partialTab"), count: films.filter((f) => f.state === "partial").length },
		{ key: "exposed", label: t("stock.exposedTab"), count: films.filter((f) => f.state === "exposed").length },
		{ key: "developed", label: t("stock.developedTab"), count: films.filter((f) => f.state === "developed").length },
		{ key: "scanned", label: t("stock.scannedTab"), count: films.filter((f) => f.state === "scanned").length },
	];

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<h2 className="font-display text-2xl text-text-primary m-0 italic">{t("stock.title")}</h2>
				<Button size="sm" onClick={onAddFilm}>
					<Plus size={14} /> {t("stock.add")}
				</Button>
			</div>

			<div className="relative">
				<Search size={16} className="text-text-muted absolute left-3 top-3" />
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t("stock.search")}
					className="w-full bg-surface-alt border border-border rounded-xl py-2.5 pr-3.5 pl-9 text-text-primary text-sm font-body outline-none"
				/>
			</div>

			<div className="flex gap-1.5 overflow-x-auto pb-1">
				{tabs.map((tab) => (
					<button
						type="button"
						key={tab.key}
						onClick={() => setFilter(tab.key)}
						className={`py-2.5 px-4 rounded-full border-none cursor-pointer text-xs font-semibold font-body whitespace-nowrap transition-all min-h-[44px] ${
							filter === tab.key ? "bg-accent text-white" : "bg-surface-alt text-text-sec"
						}`}
					>
						{tab.label} <span className="opacity-70">({tab.count})</span>
					</button>
				))}
			</div>

			<div className="flex flex-col gap-2">
				{groups.map((group) => {
					const isSingle = group.films.length === 1;
					const isCollapsed = collapsedGroups.has(group.key);

					if (isSingle) {
						const f = group.films[0]!;
						return (
							<FilmRow
								key={f.id}
								film={f}
								cameras={cameras}
								onClick={() => {
									setSelectedFilm(f.id);
									setScreen("filmDetail");
								}}
							/>
						);
					}

					return (
						<div key={group.key} className="flex flex-col gap-1.5">
							<button
								type="button"
								onClick={() => toggleGroup(group.key)}
								className="flex items-center gap-2 px-3 py-2 bg-surface-alt border border-border rounded-xl cursor-pointer w-full text-left min-h-[44px]"
							>
								<ChevronDown
									size={14}
									className={cn("text-text-muted transition-transform", isCollapsed && "-rotate-90")}
								/>
								<span className="text-sm font-semibold text-text-primary font-body">{group.label}</span>
								<span className="text-xs text-text-sec font-body">&times; {group.films.length}</span>
								{group.expLabel && (
									<span className="text-xs text-text-muted font-body ml-auto">Exp&nbsp;: {group.expLabel}</span>
								)}
							</button>

							{!isCollapsed && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
									{group.films.map((f, i) => (
										<div
											key={f.id}
											className="animate-stagger-item"
											style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
										>
											<FilmRow
												film={f}
												cameras={cameras}
												onClick={() => {
													setSelectedFilm(f.id);
													setScreen("filmDetail");
												}}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
				{filtered.length === 0 && (
					<EmptyState icon={Film} title={t("stock.nothingFound")} subtitle={t("stock.noMatch")} />
				)}
			</div>
		</div>
	);
}
