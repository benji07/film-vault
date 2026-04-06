import { expect, test } from "@playwright/test";

test.describe("Select inside Dialog", () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage to start fresh each test
		await page.goto("/");
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test("camera creation dialog: format select displays options and allows selection", async ({ page }) => {
		// Navigate to cameras tab
		await page.getByRole("button", { name: /appareils/i }).click();

		// Open the add camera dialog
		await page.getByRole("button", { name: /ajouter/i }).click();

		// Verify the dialog is open
		await expect(page.getByText("Nouvel appareil")).toBeVisible();

		// Click the format select trigger (Radix Select uses role="combobox")
		const formatTrigger = page.getByRole("combobox").first();
		await formatTrigger.click();

		// Verify that select options are visible (rendered above the dialog)
		await expect(page.getByRole("option", { name: "35mm" })).toBeVisible();
		await expect(page.getByRole("option", { name: /moyen format/i })).toBeVisible();
		await expect(page.getByRole("option", { name: "Instant" })).toBeVisible();

		// Select an option
		await page.getByRole("option", { name: /moyen format/i }).click();

		// Verify the selected value is displayed in the trigger
		await expect(formatTrigger).toHaveText(/moyen format/i);
	});

	test("add film dialog: format and type selects work inside dialog", async ({ page }) => {
		// Open the add film dialog — on empty state, use the dashboard button
		await page.getByRole("button", { name: /ajouter une pellicule/i }).click();

		// Verify dialog is open
		await expect(page.getByText(/ajouter une pellicule/i).first()).toBeVisible();

		// Click the format select
		const selects = page.getByRole("combobox");
		const formatSelect = selects.first();
		await formatSelect.click();

		// Verify format options are visible
		await expect(page.getByRole("option", { name: "35mm" })).toBeVisible();
		await expect(page.getByRole("option", { name: /moyen format/i })).toBeVisible();
		await expect(page.getByRole("option", { name: "Instant" })).toBeVisible();

		// Select 35mm
		await page.getByRole("option", { name: "35mm" }).click();
		await expect(formatSelect).toHaveText(/35mm/);

		// Now open the type select
		const typeSelect = selects.nth(1);
		await typeSelect.click();

		// Verify type options are visible
		await expect(page.getByRole("option", { name: /couleur/i })).toBeVisible();
		await expect(page.getByRole("option", { name: /n&b/i })).toBeVisible();

		// Select a type
		await page.getByRole("option", { name: /couleur/i }).click();
		await expect(typeSelect).toHaveText(/couleur/i);
	});

	test("select dropdown is not hidden behind dialog overlay", async ({ page }) => {
		// Navigate to cameras tab
		await page.getByRole("button", { name: /appareils/i }).click();

		// Open add camera dialog
		await page.getByRole("button", { name: /ajouter/i }).click();

		// Click format select
		const formatTrigger = page.getByRole("combobox").first();
		await formatTrigger.click();

		// The select content should be visible and clickable
		const option35mm = page.getByRole("option", { name: "35mm" });
		await expect(option35mm).toBeVisible();

		// Verify we can actually click the option (it's not behind the dialog)
		await option35mm.click();

		// If the click worked, the select should now show "35mm"
		await expect(formatTrigger).toHaveText(/35mm/);
	});
});
