import { T } from "@/constants/theme";

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
export function getExpirationStatus(expDate: string | null | undefined): ExpirationInfo | null {
	if (!expDate) return null;

	const [y, m] = expDate.split("-").map(Number);
	if (!y || !m) return null;

	// Last moment of the expiration month
	const expEnd = new Date(y, m, 0, 23, 59, 59);
	const now = new Date();

	if (expEnd < now) {
		return { status: "expired", label: "Périmée", color: T.accent, bgColor: `${T.accent}18` };
	}

	// Months remaining (approximate)
	const diffMonths = (expEnd.getFullYear() - now.getFullYear()) * 12 + (expEnd.getMonth() - now.getMonth());

	if (diffMonths < 3) {
		return { status: "expiring", label: "Expire bientôt", color: T.orange, bgColor: `${T.orange}18` };
	}

	return { status: "ok", label: "", color: "", bgColor: "" };
}

/** Format "YYYY-MM" as "avr. 2026" (French short month + year) */
export function fmtExpDate(d: string | null | undefined): string {
	if (!d) return "";
	const [y, m] = d.split("-").map(Number);
	if (!y || !m) return "";
	const date = new Date(y, m - 1);
	return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}
