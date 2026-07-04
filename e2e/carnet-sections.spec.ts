import { expect, test } from "@playwright/test";
import type { Film } from "../src/types";
import { createDemoData } from "../src/tour/demo-data";

function daysAgoISO(n: number) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString();
}

/** Demo data plus an exposed film already sent to the lab (sent_dev history + lab set). */
function buildData() {
	const data = createDemoData();
	data.films.push({
		id: "test-film-atlab",
		brand: "Fujifilm",
		model: "Velvia 50",
		iso: 50,
		type: "Diapo",
		format: "120",
		state: "exposed",
		lab: "Nation Photo",
		labRef: "NP-2214",
		addedDate: daysAgoISO(40),
		posesShot: 12,
		posesTotal: 12,
		history: [
			{ date: daysAgoISO(40), action: "", actionCode: "added" },
			{ date: daysAgoISO(20), action: "", actionCode: "exposed" },
			{ date: daysAgoISO(10), action: "", actionCode: "sent_dev", params: { lab: "Nation Photo" } },
		],
	});
	return data;
}

async function seedAndOpen(page: import("@playwright/test").Page, films?: Film[]) {
	const data = buildData();
	if (films) data.films = films;
	await page.addInitScript(
		([payload]) => {
			window.localStorage.setItem("filmvault-data", payload as string);
		},
		[JSON.stringify(data)],
	);
	await page.goto("/");
	const continueBtn = page.getByRole("button", { name: /continuer|locale|sans/i });
	if (
		await continueBtn
			.first()
			.isVisible({ timeout: 2500 })
			.catch(() => false)
	) {
		await continueBtn.first().click();
	}
	await page.waitForLoadState("networkidle");
	return data;
}

test.describe("carnet status sections", () => {
	test("shows the three sections with counts and state badges", async ({ page }) => {
		await seedAndOpen(page);

		const activeBtn = page.getByRole("button", { name: /^Pellicules actives/ }).first();
		const devBtn = page.getByRole("button", { name: /^À développer/ }).first();
		const scanBtn = page.getByRole("button", { name: /^À numériser/ }).first();
		await expect(activeBtn).toBeVisible();
		await expect(activeBtn).toContainText("2");
		await expect(devBtn).toBeVisible();
		await expect(devBtn).toContainText("2");
		await expect(scanBtn).toBeVisible();
		await expect(scanBtn).toContainText("1");

		// The "À développer" section mixes both variants: exposed (to drop off) and at the lab (sent_dev).
		const mainText = (await page.locator("main").last().innerText()).toLowerCase();
		expect(mainText).toContain("exposée");
		expect(mainText).toContain("au labo");
		expect(mainText).toContain("développée");

		// Films still appear in the year journal below (chronological log keeps everything).
		expect((mainText.match(/superia 400/g) || []).length).toBeGreaterThanOrEqual(2);
	});

	test("collapses, persists across reload, and re-expands", async ({ page }) => {
		await seedAndOpen(page);

		const devBtn = page.getByRole("button", { name: /^À développer/ }).first();
		await expect(devBtn).toHaveAttribute("aria-expanded", "true");
		await devBtn.click();
		await expect(devBtn).toHaveAttribute("aria-expanded", "false");

		// The collapsible panel actually closes (clipped to zero height).
		const panelId = await devBtn.getAttribute("aria-controls");
		await expect
			.poll(async () => page.evaluate((id) => document.getElementById(id as string)?.clientHeight ?? -1, panelId))
			.toBe(0);

		await page.reload();
		await page.waitForLoadState("networkidle");
		const devBtn2 = page.getByRole("button", { name: /^À développer/ }).first();
		await expect(devBtn2).toHaveAttribute("aria-expanded", "false");
		const stored = await page.evaluate(() => window.localStorage.getItem("filmvault-carnet-collapsed"));
		expect(stored).toBe('{"dev":true}');

		await devBtn2.click();
		await expect(devBtn2).toHaveAttribute("aria-expanded", "true");
	});

	test("hides empty sections", async ({ page }) => {
		const data = buildData();
		await seedAndOpen(
			page,
			data.films.filter((f) => f.state === "developed"),
		);

		await expect(page.getByRole("button", { name: /^À numériser/ }).first()).toBeVisible();
		await expect(page.getByRole("button", { name: /^Pellicules actives/ })).toHaveCount(0);
		await expect(page.getByRole("button", { name: /^À développer/ })).toHaveCount(0);
	});
});
