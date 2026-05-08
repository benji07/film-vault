import path from "node:path";
import { test } from "@playwright/test";
import { seedDemoData, seedEmpty } from "./fixtures/seed";

const OUT_DIR = path.join(process.cwd(), "docs", "screenshots", "pr-2");

function shotPath(project: string, name: string) {
	return path.join(OUT_DIR, project, `${name}.png`);
}

test.describe("Theme screenshots — PR 2 (bespoke components refonte)", () => {
	test("welcome (empty storage)", async ({ page }, testInfo) => {
		await seedEmpty(page);
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.screenshot({
			path: shotPath(testInfo.project.name, "welcome"),
			fullPage: true,
		});
	});

	test.describe("with demo data", () => {
		test.beforeEach(async ({ page }) => {
			await seedDemoData(page);
			await page.goto("/");
			// Skip the welcome screen by clicking "continue locally" if it shows up.
			const continueBtn = page.getByRole("button", { name: /continuer|locale|sans/i });
			if (await continueBtn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
				await continueBtn.first().click();
			}
			await page.waitForLoadState("networkidle");
		});

		test("dashboard (home)", async ({ page }, testInfo) => {
			await page.getByRole("button", { name: /accueil|home/i }).first().click();
			await page.waitForTimeout(300);
			await page.screenshot({
				path: shotPath(testInfo.project.name, "dashboard"),
				fullPage: true,
			});
		});

		test("stock list", async ({ page }, testInfo) => {
			await page.getByRole("button", { name: /pellicules|films/i }).first().click();
			await page.waitForTimeout(300);
			await page.screenshot({
				path: shotPath(testInfo.project.name, "stock"),
				fullPage: true,
			});
		});

		test("film detail (developed)", async ({ page }, testInfo) => {
			await page.getByRole("button", { name: /pellicules|films/i }).first().click();
			await page.waitForTimeout(300);
			// Click the first FilmRow to open the detail screen.
			const firstFilm = page.locator("button").filter({ hasText: /Portra|Tri-X|HP5|Delta|Superia/i }).first();
			await firstFilm.click();
			await page.waitForTimeout(400);
			await page.screenshot({
				path: shotPath(testInfo.project.name, "film-detail"),
				fullPage: true,
			});
		});

		test("cameras", async ({ page }, testInfo) => {
			await page.getByRole("button", { name: /appareils|cameras/i }).first().click();
			await page.waitForTimeout(300);
			await page.screenshot({
				path: shotPath(testInfo.project.name, "cameras"),
				fullPage: true,
			});
		});

		test("stats", async ({ page }, testInfo) => {
			await page.getByRole("button", { name: /stats|statistiques/i }).first().click();
			await page.waitForTimeout(300);
			await page.screenshot({
				path: shotPath(testInfo.project.name, "stats"),
				fullPage: true,
			});
		});

		test("settings", async ({ page }, testInfo) => {
			// Settings is reachable via a settings/cog button on the home page header.
			const settings = page
				.getByRole("button", { name: /(réglages|settings|paramètres|profil)/i })
				.first();
			if (await settings.isVisible({ timeout: 1500 }).catch(() => false)) {
				await settings.click();
				await page.waitForTimeout(300);
				await page.screenshot({
					path: shotPath(testInfo.project.name, "settings"),
					fullPage: true,
				});
			} else {
				testInfo.skip(true, "Settings entry point not found in current build");
			}
		});
	});
});
