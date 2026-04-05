export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = (): string => new Date().toISOString().split("T")[0]!;

export const fmtDate = (d: string | null | undefined): string =>
	d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

export const currentMonthYear = (): string => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
