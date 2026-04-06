import type { TFunction } from "i18next";
import { alpha, T } from "@/constants/theme";

export type ExpirationStatus = "expired" | "expiring" | "ok";

export interface ExpirationInfo {
	status: ExpirationStatus;
	label: string;
	color: string;
	bgColor: string;
}

/**
 * Determine expiration status from an expDate string ("YYYY-MM").
 * Expiration is interpreted as end-of-month: "2026-04" means the film
 * expires at the end of April 2026.
 * Returns null when no date is provided.
 */
export function getExpirationStatus(expDate: string | null | undefined, t?: TFunction): ExpirationInfo | null {
	if (!expDate) return null;

	const [y, m] = expDate.split("-").map(Number);
	if (!y || !m) return null;

	// Last moment of the expiration month
	const expEnd = new Date(y, m, 0, 23, 59, 59);
	const now = new Date();

	const expiredLabel = t ? t("expiration.expired") : "Périmée";
	const expiringLabel = t ? t("expiration.expiringSoon") : "Expire bientôt";

	if (expEnd < now) {
		return { status: "expired", label: expiredLabel, color: T.accent, bgColor: alpha(T.accent, 0.09) };
	}

	// Months remaining (approximate)
	const diffMonths = (expEnd.getFullYear() - now.getFullYear()) * 12 + (expEnd.getMonth() - now.getMonth());

	if (diffMonths < 3) {
		return { status: "expiring", label: expiringLabel, color: T.orange, bgColor: alpha(T.orange, 0.09) };
	}

	return { status: "ok", label: "", color: "", bgColor: "" };
}

/** Format "YYYY-MM" as localized short month + year */
export function fmtExpDate(d: string | null | undefined, locale?: string): string {
	if (!d) return "";
	const [y, m] = d.split("-").map(Number);
	if (!y || !m) return "";
	const date = new Date(y, m - 1);
	return date.toLocaleDateString(locale || "fr-FR", { month: "short", year: "numeric" });
}
