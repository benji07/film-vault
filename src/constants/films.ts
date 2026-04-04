import { Archive, Camera, Clock, Eye, Snowflake } from "lucide-react";
import type { FilmState, StateConfig } from "@/types";
import { T } from "./theme";

export const STATES: Record<FilmState, StateConfig> = {
	stock: { label: "En stock", color: T.blue, icon: Snowflake },
	loaded: { label: "Chargée", color: T.green, icon: Camera },
	partial: { label: "Partielle", color: T.amber, icon: Clock },
	exposed: { label: "Exposée", color: T.accent, icon: Eye },
	developed: { label: "Développée", color: T.textSec, icon: Archive },
};
