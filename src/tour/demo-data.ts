import type { AppData, Back, Camera, Film, Lens } from "@/types";

function daysAgo(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString().split("T")[0]!;
}

// Deterministic IDs so tour steps can reference specific items
const CAM_FM2 = "demo-cam-fm2";
const CAM_HASSY = "demo-cam-hassy";
const BACK_A12 = "demo-back-a12";
const LENS_NIKKOR = "demo-lens-nikkor";
const LENS_PLANAR = "demo-lens-planar";
export const DEMO_FILM_DEVELOPED = "demo-film-developed";

export function createDemoData(): AppData {
	const cameras: Camera[] = [
		{
			id: CAM_FM2,
			brand: "Nikon",
			model: "FM2",
			nickname: "",
			serial: "N7512345",
			format: "35mm",
			hasInterchangeableBack: false,
			mount: "Nikon F",
		},
		{
			id: CAM_HASSY,
			brand: "Hasselblad",
			model: "500C/M",
			nickname: "",
			serial: "UH123456",
			format: "120",
			hasInterchangeableBack: true,
			mount: "Hasselblad V",
		},
	];

	const backs: Back[] = [
		{
			id: BACK_A12,
			name: "A12",
			nickname: "",
			format: "120",
			compatibleCameraIds: [CAM_HASSY],
		},
	];

	const lenses: Lens[] = [
		{
			id: LENS_NIKKOR,
			brand: "Nikon",
			model: "Nikkor 50mm f/1.4 AI-S",
			mount: "Nikon F",
			focalLengthMin: 50,
			maxApertureAtMin: "f/1.4",
			isZoom: false,
		},
		{
			id: LENS_PLANAR,
			brand: "Carl Zeiss",
			model: "Planar 80mm f/2.8",
			mount: "Hasselblad V",
			focalLengthMin: 80,
			maxApertureAtMin: "f/2.8",
			isZoom: false,
		},
	];

	const films: Film[] = [
		// 1. Kodak Portra 400 35mm — stock
		{
			id: "demo-film-stock-1",
			brand: "Kodak",
			model: "Portra 400",
			iso: 400,
			type: "Couleur",
			format: "35mm",
			state: "stock",
			price: 14.9,
			addedDate: daysAgo(30),
			posesTotal: 36,
			history: [{ date: daysAgo(30), action: "", actionCode: "added" }],
		},
		// 2. Kodak Portra 160 120 — stock
		{
			id: "demo-film-stock-2",
			brand: "Kodak",
			model: "Portra 160",
			iso: 160,
			type: "Couleur",
			format: "120",
			state: "stock",
			price: 10.5,
			addedDate: daysAgo(25),
			posesTotal: 12,
			history: [{ date: daysAgo(25), action: "", actionCode: "added" }],
		},
		// 3. Ilford HP5 Plus 35mm — loaded in Nikon FM2
		{
			id: "demo-film-loaded-1",
			brand: "Ilford",
			model: "HP5 Plus",
			iso: 400,
			type: "N&B",
			format: "35mm",
			state: "loaded",
			price: 10.5,
			addedDate: daysAgo(28),
			cameraId: CAM_FM2,
			lensId: LENS_NIKKOR,
			startDate: daysAgo(21),
			posesShot: 24,
			posesTotal: 36,
			history: [
				{ date: daysAgo(28), action: "", actionCode: "added" },
				{ date: daysAgo(21), action: "", actionCode: "loaded", params: { camera: "Nikon FM2" } },
			],
		},
		// 4. Kodak Tri-X 400 120 — loaded in Hasselblad
		{
			id: "demo-film-loaded-2",
			brand: "Kodak",
			model: "Tri-X 400",
			iso: 400,
			type: "N&B",
			format: "120",
			state: "loaded",
			price: 11.0,
			addedDate: daysAgo(14),
			cameraId: CAM_HASSY,
			backId: BACK_A12,
			lensId: LENS_PLANAR,
			startDate: daysAgo(7),
			posesShot: 6,
			posesTotal: 12,
			history: [
				{ date: daysAgo(14), action: "", actionCode: "added" },
				{ date: daysAgo(7), action: "", actionCode: "loaded", params: { camera: "Hasselblad 500C/M" } },
			],
		},
		// 5. Fujifilm Superia 400 35mm — exposed
		{
			id: "demo-film-exposed",
			brand: "Fujifilm",
			model: "Superia 400",
			iso: 400,
			type: "Couleur",
			format: "35mm",
			state: "exposed",
			price: 8.5,
			addedDate: daysAgo(45),
			cameraId: CAM_FM2,
			lensId: LENS_NIKKOR,
			startDate: daysAgo(35),
			endDate: daysAgo(14),
			posesShot: 36,
			posesTotal: 36,
			history: [
				{ date: daysAgo(45), action: "", actionCode: "added" },
				{ date: daysAgo(35), action: "", actionCode: "loaded", params: { camera: "Nikon FM2" } },
				{ date: daysAgo(14), action: "", actionCode: "exposed" },
			],
		},
		// 6. Kodak Portra 800 35mm — developed (used for filmDetail tour step)
		{
			id: DEMO_FILM_DEVELOPED,
			brand: "Kodak",
			model: "Portra 800",
			iso: 800,
			type: "Couleur",
			format: "35mm",
			state: "developed",
			price: 18.0,
			devCost: 8.5,
			addedDate: daysAgo(60),
			cameraId: CAM_FM2,
			lensId: LENS_NIKKOR,
			startDate: daysAgo(50),
			endDate: daysAgo(30),
			devDate: daysAgo(7),
			posesShot: 36,
			posesTotal: 36,
			lab: "Labo Argentique",
			labRef: "DEV-2026-042",
			history: [
				{ date: daysAgo(60), action: "", actionCode: "added" },
				{ date: daysAgo(50), action: "", actionCode: "loaded", params: { camera: "Nikon FM2" } },
				{ date: daysAgo(30), action: "", actionCode: "exposed" },
				{ date: daysAgo(7), action: "", actionCode: "developed", params: { lab: "Labo Argentique" } },
			],
		},
		// 7. Ilford Delta 100 35mm — scanned
		{
			id: "demo-film-scanned",
			brand: "Ilford",
			model: "Delta 100",
			iso: 100,
			type: "N&B",
			format: "35mm",
			state: "scanned",
			price: 11.5,
			devCost: 7.0,
			scanCost: 12.0,
			addedDate: daysAgo(90),
			cameraId: CAM_FM2,
			lensId: LENS_NIKKOR,
			startDate: daysAgo(80),
			endDate: daysAgo(60),
			devDate: daysAgo(21),
			posesShot: 36,
			posesTotal: 36,
			lab: "Labo Argentique",
			labRef: "DEV-2026-031",
			scanRef: "SC-2026-001",
			history: [
				{ date: daysAgo(90), action: "", actionCode: "added" },
				{ date: daysAgo(80), action: "", actionCode: "loaded", params: { camera: "Nikon FM2" } },
				{ date: daysAgo(60), action: "", actionCode: "exposed" },
				{ date: daysAgo(21), action: "", actionCode: "developed", params: { lab: "Labo Argentique" } },
				{ date: daysAgo(14), action: "", actionCode: "scanned", params: { ref: "SC-2026-001" } },
			],
		},
	];

	return {
		films,
		cameras,
		backs,
		lenses,
		settings: { expirationMode: "date" as const },
		version: 17,
	};
}
