import { Archive, Loader2, Pencil, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminFilmDialog } from "@/components/AdminFilmDialog";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilmLabel } from "@/components/ui/film-label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { type AdminFilmStock, archiveFilmStock, fetchAdminCatalog } from "@/utils/admin-catalog";

export function AdminCatalogScreen() {
	const { toast } = useToast();
	const [stocks, setStocks] = useState<AdminFilmStock[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [showArchived, setShowArchived] = useState(false);
	const [editing, setEditing] = useState<AdminFilmStock | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [archiveTarget, setArchiveTarget] = useState<AdminFilmStock | null>(null);

	const reload = useCallback(async () => {
		setLoading(true);
		try {
			const rows = await fetchAdminCatalog();
			setStocks(rows);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erreur inconnue";
			toast(`Chargement impossible : ${msg}`, "error");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		reload();
	}, [reload]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return stocks.filter((s) => {
			if (!showArchived && !s.active) return false;
			if (!q) return true;
			return (
				s.brand.toLowerCase().includes(q) || s.model.toLowerCase().includes(q) || s.format.toLowerCase().includes(q)
			);
		});
	}, [stocks, search, showArchived]);

	const groups = useMemo(() => {
		const map = new Map<string, AdminFilmStock[]>();
		for (const s of filtered) {
			const list = map.get(s.brand) ?? [];
			list.push(s);
			map.set(s.brand, list);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [filtered]);

	const handleAdd = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const handleEdit = (stock: AdminFilmStock) => {
		setEditing(stock);
		setDialogOpen(true);
	};

	const handleArchive = async () => {
		if (!archiveTarget) return;
		try {
			await archiveFilmStock(archiveTarget.id);
			toast("Pellicule archivée", "success");
			await reload();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erreur inconnue";
			toast(`Échec : ${msg}`, "error");
		} finally {
			setArchiveTarget(null);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold text-text tracking-tight">Catalogue</h1>
					<p className="text-xs text-text-3 mt-0.5">{filtered.length} pellicules</p>
				</div>
				<Button onClick={handleAdd}>
					<Plus size={16} /> Ajouter
				</Button>
			</div>

			<div className="flex flex-col gap-3 rounded-xl bg-surface p-3.5 border border-border">
				<div className="relative">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Marque, modèle, format…"
						className="pl-9"
					/>
				</div>
				<label className="flex items-center justify-between gap-3 cursor-pointer">
					<span className="text-sm text-text-2">Inclure les pellicules archivées</span>
					<Switch checked={showArchived} onCheckedChange={setShowArchived} />
				</label>
			</div>

			{loading && (
				<div className="flex items-center justify-center py-12 text-text-3">
					<Loader2 size={20} className="animate-spin" />
				</div>
			)}

			{!loading && filtered.length === 0 && (
				<div className="rounded-xl bg-surface p-6 text-center text-sm text-text-3 border border-border">
					Aucune pellicule
				</div>
			)}

			{!loading &&
				groups.map(([brand, items]) => (
					<section key={brand} className="flex flex-col gap-2">
						<h2 className="text-xs font-semibold uppercase tracking-wide text-text-3 px-1">{brand}</h2>
						<div className="flex flex-col gap-1.5">
							{items.map((stock) => (
								<AdminFilmRow
									key={stock.id}
									stock={stock}
									onEdit={() => handleEdit(stock)}
									onArchive={() => setArchiveTarget(stock)}
								/>
							))}
						</div>
					</section>
				))}

			<AdminFilmDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSaved={reload} />

			<ConfirmDialog
				open={!!archiveTarget}
				onOpenChange={(v) => !v && setArchiveTarget(null)}
				title="Archiver cette pellicule ?"
				description={
					archiveTarget
						? `${archiveTarget.brand} ${archiveTarget.model} (${archiveTarget.format}) ne sera plus proposée dans l'autocomplétion. Tu pourras la réactiver depuis ce même écran.`
						: undefined
				}
				confirmLabel="Archiver"
				destructive
				onConfirm={handleArchive}
			/>
		</div>
	);
}

interface AdminFilmRowProps {
	stock: AdminFilmStock;
	onEdit: () => void;
	onArchive: () => void;
}

function AdminFilmRow({ stock, onEdit, onArchive }: AdminFilmRowProps) {
	return (
		<div
			className={cn(
				"flex items-stretch gap-3 rounded-xl bg-surface border border-border overflow-hidden",
				!stock.active && "opacity-60",
			)}
		>
			<div className="w-16 shrink-0">
				<FilmLabel
					brand={stock.brand}
					type={stock.type}
					iso={stock.iso}
					format={stock.format}
					imageUrl={stock.image_url ?? undefined}
					size="sm"
					className="h-full"
				/>
			</div>
			<div className="flex-1 min-w-0 py-2.5 flex flex-col justify-center">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-sm font-medium text-text truncate">{stock.model}</span>
					{!stock.active && (
						<span className="text-[10px] uppercase tracking-wide text-text-3 font-semibold shrink-0">archivée</span>
					)}
				</div>
				<span className="text-xs text-text-3 truncate">
					ISO {stock.iso} · {stock.format} · {stock.type}
					{stock.development_process ? ` · ${stock.development_process}` : ""}
				</span>
			</div>
			<div className="flex items-center gap-1 pr-2">
				<Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Modifier">
					<Pencil size={15} className="text-text-2" />
				</Button>
				{stock.active && (
					<Button variant="ghost" size="icon-sm" onClick={onArchive} aria-label="Archiver">
						<Archive size={15} className="text-text-2" />
					</Button>
				)}
			</div>
		</div>
	);
}
