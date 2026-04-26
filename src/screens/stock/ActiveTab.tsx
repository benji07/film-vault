import { Camera as CameraIcon, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { Chip } from "@/components/ui/chip";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { getStates } from "@/constants/films";
import type { Back, Camera, Film, FilmState } from "@/types";

interface ActiveTabProps {
	films: Film[];
	cameras: Camera[];
	backs: Back[];
	onOpenFilm: (id: string) => void;
	stateFilter?: FilmState | null;
	onClearStateFilter?: () => void;
}

const ACTIVE_STATE_ORDER: FilmState[] = ["partial", "loaded", "exposed", "developed"];

export function ActiveTab({ films, cameras, backs, onOpenFilm, stateFilter, onClearStateFilter }: ActiveTabProps) {
	const { t } = useTranslation();
	const states = getStates(t);

	const grouped = useMemo(() => {
		const map = new Map<FilmState, Film[]>();
		for (const f of films) {
			if (!ACTIVE_STATE_ORDER.includes(f.state)) continue;
			const list = map.get(f.state);
			if (list) list.push(f);
			else map.set(f.state, [f]);
		}
		return ACTIVE_STATE_ORDER.map((state) => ({ state, items: map.get(state) ?? [] })).filter(
			(g) => g.items.length > 0,
		);
	}, [films]);

	const filterChip =
		stateFilter && onClearStateFilter ? (
			<Chip
				active
				onClick={onClearStateFilter}
				className="bg-accent/15 text-accent gap-1 self-start text-[11px] py-1.5 px-3 min-h-[32px]"
			>
				{states[stateFilter].label}
				<X size={12} />
			</Chip>
		) : null;

	if (grouped.length === 0) {
		return (
			<>
				{filterChip}
				<EmptyState icon={CameraIcon} title={t("stock.emptyActive")} subtitle={t("stock.emptyActiveSubtitle")} />
			</>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{filterChip}
			{grouped.map(({ state, items }) => {
				const config = states[state];
				const isInitiallyOpen = stateFilter ? state === stateFilter : true;
				return (
					<CollapsibleSection
						key={state}
						icon={config.icon}
						title={config.label}
						count={items.length}
						defaultOpen={isInitiallyOpen}
					>
						<div className="flex flex-col gap-2">
							{items.map((f) => (
								<FilmRow key={f.id} film={f} cameras={cameras} backs={backs} onClick={() => onOpenFilm(f.id)} />
							))}
						</div>
					</CollapsibleSection>
				);
			})}
		</div>
	);
}
