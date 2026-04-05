import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			includeAssets: ["icon-192.png", "icon-512.png"],
			manifest: {
				name: "FilmVault",
				short_name: "FilmVault",
				description: "Gestionnaire de pellicules argentiques",
				start_url: "./",
				display: "standalone",
				background_color: "#0D0D0D",
				theme_color: "#0D0D0D",
				icons: [
					{
						src: "icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "gstatic-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
