import { ChevronRight, Film as FilmIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { getStates } from "@/constants/films";
import { alpha } from "@/constants/theme";
import type { Film, FilmState } from "@/types";
import { filmName } from "@/utils/film-helpers";
import { fmtDate } from "@/utils/helpers";

interface CameraFilmsListProps {
	films: Film[];
	onFilmClick: (filmId: string) => void;
}

const STATE_ORDER: FilmState[] = ["loaded", "partial", "exposed", "developed", "scanned", "stock"];

export function CameraFilmsList({ films, onFilmClick }: CameraFilmsListProps) {
	const { t } = useTranslation();
	const states = getStates(t);

	if (films.length === 0) {
		return (
			<EmptyState icon={FilmIcon} title={t("cameraDetail.noFilms")} subtitle={t("cameraDetail.noFilmsSubtitle")} />
		);
	}

	const groups = STATE_ORDER.map((state) => ({
		state,
		items: films.filter((f) => f.state === state),
	})).filter((g) => g.items.length > 0);

	return (
		<div className="flex flex-col gap-4">
			{groups.map(({ state, items }) => {
				const config = states[state];
				const Icon = config.icon;
				return (
					<div key={state} className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Icon size={14} color={config.color} />
							<span className="text-[11px] font-bold font-body uppercase tracking-wide" style={{ color: config.color }}>
								{config.label}
							</span>
							<Badge style={{ color: config.color, background: alpha(config.color, 0.09) }}>{items.length}</Badge>
						</div>
						{items.map((f) => {
							const dateLabel = f.endDate || f.startDate || f.addedDate;
							return (
								<button
									key={f.id}
									type="button"
									onClick={() => onFilmClick(f.id)}
									className="flex items-center gap-3 w-full rounded-[12px] border border-border bg-card hover:bg-card-hover transition-colors p-3 text-left cursor-pointer"
								>
									<div className="flex-1 min-w-0">
										<div className="text-[13px] font-semibold text-text-primary font-body truncate">{filmName(f)}</div>
										<div className="text-[11px] font-mono text-text-muted truncate">
											{f.shootIso != null ? `ISO ${f.shootIso} · ` : ""}
											{fmtDate(dateLabel)}
											{f.posesShot != null && f.posesTotal != null ? ` · ${f.posesShot}/${f.posesTotal}` : ""}
										</div>
									</div>
									<ChevronRight size={14} className="text-text-muted shrink-0" />
								</button>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}
