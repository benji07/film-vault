import type { TFunction } from "i18next";
import { Archive, Camera, Clock, Eye, ScanLine, Snowflake } from "lucide-react";
import type { FilmState, StateConfig } from "@/types";
import { T } from "./theme";

export function getStates(t: TFunction): Record<FilmState, StateConfig> {
	return {
		stock: { label: t("states.stock"), color: T.blue, icon: Snowflake },
		loaded: { label: t("states.loaded"), color: T.green, icon: Camera },
		partial: { label: t("states.partial"), color: T.amber, icon: Clock },
		exposed: { label: t("states.exposed"), color: T.accent, icon: Eye },
		developed: { label: t("states.developed"), color: T.textSec, icon: Archive },
		scanned: { label: t("states.scanned"), color: T.orange, icon: ScanLine },
	};
}
