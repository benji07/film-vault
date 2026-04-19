import { Archive, Camera, Clock, Eye, Plus, RotateCcw, ScanLine, Send } from "lucide-react";
import type { HistoryAction, LucideIcon } from "@/types";

export const HISTORY_ACTION_ICONS: Record<HistoryAction, LucideIcon> = {
	added: Plus,
	loaded: Camera,
	reloaded: RotateCcw,
	removed_partial: Clock,
	exposed: Eye,
	sent_dev: Send,
	developed: Archive,
	scanned: ScanLine,
	modified: Plus,
	duplicated: Plus,
};

type Params = Record<string, string | number | null | undefined>;

export const HISTORY_ACTION_KEYS: Record<HistoryAction, string | ((params?: Params) => string)> = {
	added: "filmDetail.historyAdded",
	loaded: "filmDetail.historyLoaded",
	reloaded: "filmDetail.historyReloaded",
	removed_partial: "filmDetail.historyPartial",
	exposed: "filmDetail.historyExposed",
	sent_dev: "filmDetail.historySentDev",
	developed: (params) => (params?.lab ? "filmDetail.historyDevelopedAt" : "filmDetail.historyDeveloped"),
	scanned: (params) => (params?.ref ? "filmDetail.historyScannedRef" : "filmDetail.historyScanned"),
	modified: "filmDetail.historyModified",
	duplicated: "filmDetail.historyDuplicated",
};

/** Actions where the film physically interacts with the camera. */
export const CAMERA_HISTORY_ACTIONS = new Set<HistoryAction>(["loaded", "reloaded", "removed_partial", "exposed"]);
