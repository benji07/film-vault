import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration dédiée à la génération de screenshots manuels du thème.
 * Utiliser via `npm run screenshots`. Les artefacts sont écrits dans
 * `docs/screenshots/<pr-N>/<viewport>/<screen>.png` (voir e2e/screenshots.spec.ts).
 */
export default defineConfig({
	testDir: "./e2e",
	testMatch: ["**/screenshots.spec.ts"],
	fullyParallel: true,
	retries: 0,
	workers: 1,
	reporter: "list",
	use: {
		baseURL: "http://localhost:5173",
	},
	projects: [
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile",
			use: { ...devices["Pixel 5"] },
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
});
