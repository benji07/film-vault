import type { Page } from "@playwright/test";
import { createDemoData } from "../../src/tour/demo-data";

const STORAGE_KEY = "filmvault-data";

/** Seed localStorage with the demo dataset before the app boots. */
export async function seedDemoData(page: Page) {
	const data = createDemoData();
	await page.addInitScript(
		([key, payload]) => {
			window.localStorage.setItem(key as string, payload as string);
		},
		[STORAGE_KEY, JSON.stringify(data)],
	);
}

/** Boot the app with empty storage (used for the welcome / onboarding screen). */
export async function seedEmpty(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.clear();
	});
}
