import { useState } from "react";
import { Plus, Search, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilmRow } from "@/components/FilmRow";
import { EmptyState } from "@/components/EmptyState";
import { filmName } from "@/utils/film-helpers";

export function StockScreen({ data, setScreen, setSelectedFilm }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { films, cameras } = data;

  const filtered = films.filter(f => {
    if (filter !== "all" && f.state !== filter) return false;
    if (search) {
      const name = filmName(f);
      return name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const tabs = [
    { key: "all", label: "Toutes", count: films.length },
    { key: "stock", label: "Stock", count: films.filter(f => f.state === "stock").length },
    { key: "loaded", label: "Chargées", count: films.filter(f => f.state === "loaded").length },
    { key: "partial", label: "Partielles", count: films.filter(f => f.state === "partial").length },
    { key: "exposed", label: "Exposées", count: films.filter(f => f.state === "exposed").length },
    { key: "developed", label: "Dév.", count: films.filter(f => f.state === "developed").length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-text-primary m-0 italic">Pellicules</h2>
        <Button small onClick={() => setScreen("addFilm")}><Plus size={14} /> Ajouter</Button>
      </div>

      <div className="relative">
        <Search size={16} className="text-text-muted absolute left-3 top-3" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full bg-surface-alt border border-border rounded-xl py-2.5 pr-3.5 pl-9 text-text-primary text-sm font-body outline-none"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`py-1.5 px-3 rounded-full border-none cursor-pointer text-xs font-semibold font-body whitespace-nowrap transition-all ${
              filter === t.key
                ? "bg-accent text-white"
                : "bg-surface-alt text-text-sec"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(f => (
          <FilmRow key={f.id} film={f} cameras={cameras} onClick={() => { setSelectedFilm(f.id); setScreen("filmDetail"); }} />
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={Film} title="Rien trouvé" subtitle="Aucune pellicule ne correspond à ta recherche" />
        )}
      </div>
    </div>
  );
}
