/**
 * Enrich the film catalog from two open-source databases.
 *
 * Sources:
 *   - dekuNukem/Film-Packaging  → developmentProcess (process), uuid, filename
 *   - dxdatabase/Open-source-film-database → image (Pic column)
 *
 * Joined on normalized (brand, product). Output is a sidecar JSON consumed
 * at runtime by getFilmCatalog() — never overwrites the canonical FILM_CATALOG.
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FILM_CATALOG, type FilmCatalogEntry, type FilmDevelopmentProcess } from "../src/constants/film-catalog.ts";

// --- Sources ---------------------------------------------------------------

const DEKU_CSV_URL = "https://raw.githubusercontent.com/dekuNukem/Film-Packaging/master/film_packaging/database.csv";
const DEKU_FILE_BASE_URL = "https://raw.githubusercontent.com/dekuNukem/Film-Packaging/master/film_packaging/";

const DX_CSV_URL = "https://raw.githubusercontent.com/dxdatabase/Open-source-film-database/main/film_database.csv";
const DX_IMAGE_BASE_URL = "https://raw.githubusercontent.com/dxdatabase/Open-source-film-database/main/Images/";

// --- Output ----------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(here, "../src/constants/film-catalog-enrichment.json");

// --- Types -----------------------------------------------------------------

interface EnrichmentEntry {
	imageUrl?: string;
	developmentProcess?: FilmDevelopmentProcess;
	sourceUrl?: string;
	sourceUuid?: string;
}

interface DekuRow {
	brand: string;
	product: string;
	process: string;
	itemType: string;
	uuid: string;
	filename: string;
}

interface DxRow {
	manufacturer: string;
	name: string;
	pic: string;
}

// --- CSV parsing -----------------------------------------------------------

/**
 * Minimal CSV parser handling quoted fields and embedded commas / newlines.
 * Both source files are well-formed CSV so a hand-rolled parser is enough
 * and saves a runtime dependency.
 */
function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += c;
			}
		} else {
			if (c === '"') {
				inQuotes = true;
			} else if (c === ",") {
				row.push(field);
				field = "";
			} else if (c === "\n") {
				row.push(field);
				field = "";
				rows.push(row);
				row = [];
			} else if (c === "\r") {
				// Skip CR, will be handled by following LF
			} else {
				field += c;
			}
		}
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

function csvToObjects(text: string): Record<string, string>[] {
	const rows = parseCsv(text);
	const headerRow = rows[0];
	if (!headerRow) return [];
	const headers = headerRow.map((h) => h.trim());
	const result: Record<string, string>[] = [];
	for (let r = 1; r < rows.length; r++) {
		const row = rows[r];
		if (!row || row.every((v) => v === "")) continue;
		const obj: Record<string, string> = {};
		for (let i = 0; i < headers.length; i++) {
			const h = headers[i];
			if (h !== undefined) obj[h] = (row[i] ?? "").trim();
		}
		result.push(obj);
	}
	return result;
}

// --- Normalization ---------------------------------------------------------

const BRAND_ALIASES: Record<string, string> = {
	fuji: "fujifilm",
	"fuji film": "fujifilm",
	eastman: "kodak",
	"eastman kodak": "kodak",
	"polaroid originals": "polaroid",
	impossible: "polaroid",
	"the impossible project": "polaroid",
};

function normalize(s: string): string {
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.replace(/\s+/g, " ");
}

function normalizeBrand(s: string): string {
	const n = normalize(s);
	return BRAND_ALIASES[n] ?? n;
}

function joinKey(brand: string, model: string): string {
	return `${normalizeBrand(brand)}|${normalize(model)}`;
}

// --- Process mapping -------------------------------------------------------

function mapDekuProcess(raw: string): FilmDevelopmentProcess | undefined {
	const v = raw.trim().toUpperCase();
	if (!v) return undefined;
	if (v === "C-41" || v === "C41") return "C-41";
	if (v === "E-6" || v === "E6") return "E-6";
	if (v === "BW" || v === "B&W" || v === "B+W" || v === "B/W") return "B&W";
	if (v === "ECN-2" || v === "ECN2") return "ECN-2";
	if (v === "K-14" || v === "K14") return "K-14";
	return undefined;
}

function fallbackProcessFromType(type: string): FilmDevelopmentProcess | undefined {
	switch (type) {
		case "Couleur":
			return "C-41";
		case "N&B":
			return "B&W";
		case "Diapo":
			return "E-6";
		case "ECN-2":
			return "ECN-2";
		default:
			return undefined;
	}
}

// --- Indexing --------------------------------------------------------------

function indexDeku(rows: Record<string, string>[]): Map<string, DekuRow[]> {
	const index = new Map<string, DekuRow[]>();
	for (const r of rows) {
		const brand = r["brand"] ?? "";
		const product = r["product"] ?? "";
		if (!brand || !product) continue;
		const key = joinKey(brand, product);
		const entry: DekuRow = {
			brand,
			product,
			process: r["process"] ?? "",
			itemType: r["item_type"] ?? "",
			uuid: r["uuid"] ?? "",
			filename: r["filename"] ?? "",
		};
		const list = index.get(key);
		if (list) list.push(entry);
		else index.set(key, [entry]);
	}
	return index;
}

function indexDx(rows: Record<string, string>[]): Map<string, DxRow> {
	const index = new Map<string, DxRow>();
	for (const r of rows) {
		const manufacturer = r["Manufacturer"] ?? "";
		const name = r["Name"] ?? "";
		if (!manufacturer || !name) continue;
		const key = joinKey(manufacturer, name);
		// First match wins; the CSV has duplicates for variants, we just need an image
		if (!index.has(key)) {
			index.set(key, {
				manufacturer,
				name,
				pic: r["Pic"] ?? "",
			});
		}
	}
	return index;
}

function pickDekuRow(rows: DekuRow[]): DekuRow | undefined {
	// Prefer outside box; fallback to inside; then any with a non-empty filename.
	const outside = rows.find((r) => r.itemType === "film_box_outside");
	if (outside) return outside;
	const inside = rows.find((r) => r.itemType === "film_box_inside");
	if (inside) return inside;
	return rows.find((r) => r.filename) ?? rows[0];
}

// --- Pipeline --------------------------------------------------------------

async function fetchText(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
	return await res.text();
}

async function main(): Promise<void> {
	console.log("Fetching dekuNukem CSV...");
	const dekuCsv = await fetchText(DEKU_CSV_URL);
	console.log("Fetching dxdatabase CSV...");
	const dxCsv = await fetchText(DX_CSV_URL);

	const dekuRows = csvToObjects(dekuCsv);
	const dxRows = csvToObjects(dxCsv);
	console.log(`  dekuNukem: ${dekuRows.length} rows, dxdatabase: ${dxRows.length} rows`);

	const dekuIndex = indexDeku(dekuRows);
	const dxIndex = indexDx(dxRows);

	const enrichment: Record<string, EnrichmentEntry> = {};
	const unmatched: FilmCatalogEntry[] = [];
	let withImage = 0;
	let withProcess = 0;

	for (const entry of FILM_CATALOG) {
		const key = joinKey(entry.brand, entry.model);
		const dekuMatches = dekuIndex.get(key);
		const dx = dxIndex.get(key);
		const deku = dekuMatches ? pickDekuRow(dekuMatches) : undefined;

		// Image: dxdatabase first, dekuNukem fallback
		let imageUrl: string | undefined;
		let sourceUrl: string | undefined;
		if (dx?.pic) {
			imageUrl = DX_IMAGE_BASE_URL + encodeURIComponent(dx.pic);
			sourceUrl = "https://github.com/dxdatabase/Open-source-film-database";
		} else if (deku?.filename) {
			imageUrl = DEKU_FILE_BASE_URL + encodeURIComponent(deku.filename);
			sourceUrl = "https://github.com/dekuNukem/Film-Packaging";
		}

		// Process: dekuNukem first, fallback heuristic from type
		const developmentProcess = (deku ? mapDekuProcess(deku.process) : undefined) ?? fallbackProcessFromType(entry.type);

		const out: EnrichmentEntry = {};
		if (imageUrl) out.imageUrl = imageUrl;
		if (developmentProcess) out.developmentProcess = developmentProcess;
		if (sourceUrl) out.sourceUrl = sourceUrl;
		if (deku?.uuid) out.sourceUuid = deku.uuid;

		if (Object.keys(out).length === 0) {
			unmatched.push(entry);
			continue;
		}

		const enrichmentKey = `${entry.brand.toLowerCase()}|${entry.model.toLowerCase()}|${entry.format.toLowerCase()}`;
		enrichment[enrichmentKey] = out;
		if (out.imageUrl) withImage++;
		if (out.developmentProcess) withProcess++;
	}

	// Sort keys for stable diffs
	const sorted: Record<string, EnrichmentEntry> = {};
	for (const k of Object.keys(enrichment).sort()) {
		const v = enrichment[k];
		if (v) sorted[k] = v;
	}

	writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, "\t")}\n`, "utf8");

	// --- Report ---
	console.log("");
	console.log(`Catalog entries: ${FILM_CATALOG.length}`);
	console.log(`  with image:    ${withImage}`);
	console.log(`  with process:  ${withProcess}`);
	console.log(`  unmatched:     ${unmatched.length}`);
	if (unmatched.length > 0) {
		console.log("");
		console.log("Unmatched entries:");
		for (const u of unmatched) {
			console.log(`  - ${u.brand} ${u.model} (${u.format})`);
		}
	}
	console.log("");
	console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
