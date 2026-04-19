import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const SCREENSHOT_DIR = resolve(__dirname, "screenshots");

interface SeedFilm {
	id: string;
	brand: string;
	model: string;
	iso: number;
	type: string;
	format: string;
	state: "stock" | "loaded" | "partial" | "exposed" | "developed" | "scanned";
	totalExposures: number;
	usedExposures?: number;
	addedDate: string;
	loadedDate?: string;
	camera?: string;
	cameraId?: string;
	history: { date: string; action: string; actionCode: string; params?: Record<string, string | number> }[];
}

interface SeedCamera {
	id: string;
	brand: string;
	model: string;
	nickname: string;
	serial: string;
	format: string;
	hasInterchangeableBack: boolean;
}

const SEED: {
	version: number;
	films: SeedFilm[];
	cameras: SeedCamera[];
	backs: [];
	lenses: [];
} = {
	version: 17,
	backs: [],
	lenses: [],
	films: [
		{
			id: "f-loaded-01",
			brand: "Kodak",
			model: "Portra 400",
			iso: 400,
			type: "Couleur",
			format: "35mm",
			state: "loaded",
			totalExposures: 36,
			usedExposures: 14,
			addedDate: "2026-03-02",
			loadedDate: "2026-04-10",
			camera: "Canon AE-1",
			cameraId: "c-canon",
			history: [
				{ date: "2026-03-02", action: "Ajoutée", actionCode: "added" },
				{
					date: "2026-04-10",
					action: "Chargée dans Canon AE-1",
					actionCode: "loaded",
					params: { camera: "Canon AE-1" },
				},
			],
		},
		{
			id: "f-partial-01",
			brand: "Ilford",
			model: "HP5 Plus",
			iso: 400,
			type: "N&B",
			format: "35mm",
			state: "partial",
			totalExposures: 36,
			usedExposures: 22,
			addedDate: "2026-02-14",
			history: [
				{ date: "2026-02-14", action: "Ajoutée", actionCode: "added" },
				{ date: "2026-03-05", action: "Chargée", actionCode: "loaded", params: { camera: "Pentax K1000" } },
				{ date: "2026-04-02", action: "Retirée partielle", actionCode: "removed_partial" },
			],
		},
		{
			id: "f-exposed-01",
			brand: "Fujifilm",
			model: "Velvia 50",
			iso: 50,
			type: "Diapo",
			format: "120",
			state: "exposed",
			totalExposures: 12,
			usedExposures: 12,
			addedDate: "2026-01-20",
			history: [
				{ date: "2026-01-20", action: "Ajoutée", actionCode: "added" },
				{ date: "2026-02-18", action: "Chargée", actionCode: "loaded", params: { camera: "Mamiya RZ67" } },
				{ date: "2026-03-30", action: "Exposée", actionCode: "exposed" },
			],
		},
		{
			id: "f-developed-01",
			brand: "Kodak",
			model: "Vision3 500T",
			iso: 500,
			type: "ECN-2",
			format: "35mm",
			state: "developed",
			totalExposures: 36,
			usedExposures: 36,
			addedDate: "2025-11-02",
			history: [
				{ date: "2025-11-02", action: "Ajoutée", actionCode: "added" },
				{ date: "2025-12-05", action: "Exposée", actionCode: "exposed" },
				{ date: "2026-01-10", action: "Envoyée au labo", actionCode: "sent_dev", params: { lab: "Carmencita Film Lab" } },
				{ date: "2026-02-02", action: "Développée", actionCode: "developed" },
			],
		},
		{
			id: "f-scanned-01",
			brand: "Cinestill",
			model: "800T",
			iso: 800,
			type: "Couleur",
			format: "35mm",
			state: "scanned",
			totalExposures: 36,
			usedExposures: 36,
			addedDate: "2025-09-15",
			history: [
				{ date: "2025-09-15", action: "Ajoutée", actionCode: "added" },
				{ date: "2025-11-04", action: "Exposée", actionCode: "exposed" },
				{ date: "2025-12-20", action: "Développée", actionCode: "developed" },
				{ date: "2026-01-18", action: "Scannée", actionCode: "scanned" },
			],
		},
		{
			id: "f-stock-01",
			brand: "Kodak",
			model: "Gold 200",
			iso: 200,
			type: "Couleur",
			format: "35mm",
			state: "stock",
			totalExposures: 24,
			addedDate: "2026-04-01",
			history: [{ date: "2026-04-01", action: "Ajoutée", actionCode: "added" }],
		},
		{
			id: "f-stock-02",
			brand: "Kodak",
			model: "Tri-X 400",
			iso: 400,
			type: "N&B",
			format: "35mm",
			state: "stock",
			totalExposures: 36,
			addedDate: "2026-04-05",
			history: [{ date: "2026-04-05", action: "Ajoutée", actionCode: "added" }],
		},
	],
	cameras: [
		{
			id: "c-canon",
			brand: "Canon",
			model: "AE-1 Program",
			nickname: "La fidèle",
			serial: "1234567",
			format: "35mm",
			hasInterchangeableBack: false,
		},
		{
			id: "c-pentax",
			brand: "Pentax",
			model: "K1000",
			nickname: "",
			serial: "",
			format: "35mm",
			hasInterchangeableBack: false,
		},
		{
			id: "c-mamiya",
			brand: "Mamiya",
			model: "RZ67 Pro II",
			nickname: "Le monstre",
			serial: "",
			format: "120",
			hasInterchangeableBack: true,
		},
	],
};

async function seed(page: Page, theme: "dark" | "light") {
	await page.goto("/");
	await page.evaluate(
		({ data, theme }) => {
			localStorage.clear();
			localStorage.setItem("filmvault-data", JSON.stringify(data));
			localStorage.setItem("filmvault-theme", theme);
			localStorage.setItem("filmvault-lang", "fr");
			localStorage.setItem("filmvault-guide-done", "1");
		},
		{ data: SEED, theme },
	);
	await page.reload();
	// Let fonts + grain render
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(800);
}

async function shoot(page: Page, name: string, theme: "dark" | "light", viewport: string) {
	const path = resolve(SCREENSHOT_DIR, `${name}-${theme}-${viewport}.png`);
	mkdirSync(dirname(path), { recursive: true });
	await page.screenshot({ path, fullPage: true });
}

for (const theme of ["dark", "light"] as const) {
	test.describe(`Theme screenshots — ${theme}`, () => {
		test(`home / dashboard — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			await expect(page.locator("h1").first()).toBeVisible();
			await shoot(page, "01-dashboard", theme, viewport);
		});

		test(`stock — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			await page.getByRole("button", { name: /pellicules/i }).first().click();
			await page.waitForTimeout(400);
			await shoot(page, "02-stock", theme, viewport);
		});

		test(`cameras — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			await page.getByRole("button", { name: /appareils/i }).first().click();
			await page.waitForTimeout(400);
			await shoot(page, "03-cameras", theme, viewport);
		});

		test(`stats — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			await page.getByRole("button", { name: /stats/i }).first().click();
			await page.waitForTimeout(500);
			await shoot(page, "04-stats", theme, viewport);
		});

		test(`settings — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			await page.getByRole("button", { name: /réglages|paramètres|settings/i }).first().click();
			await page.waitForTimeout(400);
			await shoot(page, "05-settings", theme, viewport);
		});

		test(`add-film dialog — ${theme}`, async ({ page }, testInfo) => {
			await seed(page, theme);
			const viewport = testInfo.project.name.replace(/\s+/g, "-").toLowerCase();
			const addBtn = page.getByRole("button", { name: /ajouter/i }).first();
			if (await addBtn.isVisible()) {
				await addBtn.click();
				await page.waitForTimeout(500);
			}
			await shoot(page, "06-dialog-add", theme, viewport);
		});
	});
}
