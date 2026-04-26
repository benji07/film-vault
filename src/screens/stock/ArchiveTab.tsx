import { Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { FilmRow } from "@/components/FilmRow";
import type { Back, Camera, Film } from "@/types";

interface ArchiveTabProps {
	films: Film[];
	cameras: Camera[];
	backs: Back[];
	onOpenFilm: (id: string) => void;
}

export function ArchiveTab({ films, cameras, backs, onOpenFilm }: ArchiveTabProps) {
	const { t } = useTranslation();

	if (films.length === 0) {
		return <EmptyState icon={Archive} title={t("stock.emptyArchive")} subtitle={t("stock.emptyArchiveSubtitle")} />;
	}

	return (
		<div className="flex flex-col gap-2">
			{films.map((f) => (
				<FilmRow key={f.id} film={f} cameras={cameras} backs={backs} onClick={() => onOpenFilm(f.id)} />
			))}
		</div>
	);
}
