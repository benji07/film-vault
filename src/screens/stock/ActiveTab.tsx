import { Camera as CameraIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { getStates } from "@/constants/films";
import type { Back, Camera, Film, FilmState } from "@/types";

interface ActiveTabProps {
	films: Film[];
	cameras: Camera[];
	backs: Back[];
	onOpenFilm: (id: string) => void;
	openSection?: FilmState | null;
}

const ACTIVE_STATE_ORDER: FilmState[] = ["partial", "loaded", "exposed", "developed"];

export function ActiveTab({ films, cameras, backs, onOpenFilm, openSection }: ActiveTabProps) {
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

	if (grouped.length === 0) {
		return <EmptyState icon={CameraIcon} title={t("stock.emptyActive")} subtitle={t("stock.emptyActiveSubtitle")} />;
	}

	return (
		<div className="flex flex-col gap-2">
			{grouped.map(({ state, items }) => {
				const config = states[state];
				const isInitiallyOpen = openSection ? state === openSection : true;
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
