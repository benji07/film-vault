export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = (): string => new Date().toISOString().split("T")[0]!;

export const fmtDate = (d: string | null | undefined): string =>
	d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

export const fmtPrice = (amount: number, locale?: string, currency = "EUR"): string =>
	new Intl.NumberFormat(locale ?? navigator.language ?? "fr-FR", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);

export const currentMonthYear = (): string => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const nowDateTimeLocal = (): string => {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};
