import { FilmRow } from "@/components/FilmRow";
import type { Back, Camera } from "@/types";
import type { FilmGroup } from "@/utils/stock-hierarchy";

interface InventoryGroupProps {
	groups: FilmGroup[];
	cameras: Camera[];
	backs: Back[];
	onOpenFilm: (id: string) => void;
}

export function InventoryGroup({ groups, cameras, backs, onOpenFilm }: InventoryGroupProps) {
	return (
		<div className="flex flex-col gap-2">
			{groups.map((group) => {
				const representative = group.films[0];
				if (!representative) return null;
				return (
					<FilmRow
						key={group.key}
						film={representative}
						cameras={cameras}
						backs={backs}
						groupCount={group.films.length}
						onClick={() => onOpenFilm(representative.id)}
					/>
				);
			})}
		</div>
	);
}
