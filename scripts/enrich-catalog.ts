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
const REPORT_PATH = resolve(here, "../enrichment-report.md");

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

// --- Similarity ------------------------------------------------------------

function tokens(s: string): Set<string> {
	return new Set(normalize(s).split(" ").filter(Boolean));
}

function jaccard(a: string, b: string): number {
	const ta = tokens(a);
	const tb = tokens(b);
	if (ta.size === 0 || tb.size === 0) return 0;
	let inter = 0;
	for (const t of ta) if (tb.has(t)) inter++;
	return inter / (ta.size + tb.size - inter);
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

// --- Brand-grouped indexes (for candidate suggestions) ---------------------

interface DekuProduct {
	brand: string;
	product: string;
	process: string;
	filename: string;
}

interface DxProduct {
	manufacturer: string;
	name: string;
	pic: string;
}

function indexDekuByBrand(dekuByKey: Map<string, DekuRow[]>): Map<string, DekuProduct[]> {
	const out = new Map<string, DekuProduct[]>();
	for (const [key, rows] of dekuByKey) {
		const brandKey = key.split("|")[0] ?? "";
		const pick = pickDekuRow(rows);
		if (!pick) continue;
		const product: DekuProduct = {
			brand: pick.brand,
			product: pick.product,
			process: pick.process,
			filename: pick.filename,
		};
		const list = out.get(brandKey);
		if (list) list.push(product);
		else out.set(brandKey, [product]);
	}
	return out;
}

function indexDxByBrand(dxByKey: Map<string, DxRow>): Map<string, DxProduct[]> {
	const out = new Map<string, DxProduct[]>();
	for (const [key, row] of dxByKey) {
		const brandKey = key.split("|")[0] ?? "";
		const product: DxProduct = {
			manufacturer: row.manufacturer,
			name: row.name,
			pic: row.pic,
		};
		const list = out.get(brandKey);
		if (list) list.push(product);
		else out.set(brandKey, [product]);
	}
	return out;
}

interface ScoredCandidate<T> {
	score: number;
	item: T;
}

function topCandidates<T>(
	items: T[] | undefined,
	modelOf: (t: T) => string,
	target: string,
	max = 5,
): ScoredCandidate<T>[] {
	if (!items) return [];
	const scored = items
		.map((item) => ({ score: jaccard(modelOf(item), target), item }))
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score);
	return scored.slice(0, max);
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
	const dekuByBrand = indexDekuByBrand(dekuIndex);
	const dxByBrand = indexDxByBrand(dxIndex);

	const enrichment: Record<string, EnrichmentEntry> = {};
	const noImage: FilmCatalogEntry[] = [];
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

		if (Object.keys(out).length > 0) {
			const enrichmentKey = `${entry.brand.toLowerCase()}|${entry.model.toLowerCase()}|${entry.format.toLowerCase()}`;
			enrichment[enrichmentKey] = out;
			if (out.imageUrl) withImage++;
			if (out.developmentProcess) withProcess++;
		}

		if (!imageUrl) noImage.push(entry);
	}

	// Sort keys for stable diffs
	const sorted: Record<string, EnrichmentEntry> = {};
	for (const k of Object.keys(enrichment).sort()) {
		const v = enrichment[k];
		if (v) sorted[k] = v;
	}

	writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, "\t")}\n`, "utf8");

	// --- Markdown report ---
	const reportLines: string[] = [];
	reportLines.push("# Film catalog enrichment");
	reportLines.push("");
	reportLines.push(`Generated ${new Date().toISOString()}.`);
	reportLines.push("");
	reportLines.push("## Summary");
	reportLines.push("");
	reportLines.push(`- Catalog entries: **${FILM_CATALOG.length}**`);
	reportLines.push(`- With image: **${withImage}** (${Math.round((100 * withImage) / FILM_CATALOG.length)}%)`);
	reportLines.push(`- With process: **${withProcess}**`);
	reportLines.push(`- Without image: **${noImage.length}**`);
	reportLines.push("");

	// Group "no image" entries by brand+model so we don't duplicate per format
	const noImageByBrandModel = new Map<string, FilmCatalogEntry[]>();
	for (const e of noImage) {
		const k = `${e.brand}|${e.model}`;
		const list = noImageByBrandModel.get(k);
		if (list) list.push(e);
		else noImageByBrandModel.set(k, [e]);
	}

	if (noImageByBrandModel.size > 0) {
		reportLines.push("## Entries without image");
		reportLines.push("");
		reportLines.push(
			"For each entry, candidates with the same brand are listed, ranked by Jaccard token overlap on the model name. " +
				"If a candidate looks like the same product under another name, align the catalog entry to pick up enrichment on the next run.",
		);
		reportLines.push("");

		for (const [, entries] of noImageByBrandModel) {
			const ref = entries[0];
			if (!ref) continue;
			const formats = entries.map((e) => e.format).join(", ");
			reportLines.push(`### ${ref.brand} — ${ref.model} _(${formats})_`);
			reportLines.push("");

			const brandKey = normalizeBrand(ref.brand);
			const dekuBrandList = dekuByBrand.get(brandKey);
			const dxBrandList = dxByBrand.get(brandKey);
			const dekuCandidates = topCandidates(dekuBrandList, (p) => p.product, ref.model, 5);
			const dxCandidates = topCandidates(dxBrandList, (p) => p.name, ref.model, 5);

			reportLines.push("**dekuNukem**:");
			if (!dekuBrandList || dekuBrandList.length === 0) {
				reportLines.push("- _brand absent from source_");
			} else if (dekuCandidates.length === 0) {
				reportLines.push(`- _brand has ${dekuBrandList.length} entries but none with overlapping model tokens_`);
			} else {
				for (const c of dekuCandidates) {
					const meta = [c.item.process && `process=${c.item.process}`, c.item.filename && "image=yes"]
						.filter(Boolean)
						.join(", ");
					reportLines.push(`- _score ${c.score.toFixed(2)}_ — \`${c.item.product}\`${meta ? ` (${meta})` : ""}`);
				}
			}
			reportLines.push("");

			reportLines.push("**dxdatabase**:");
			if (!dxBrandList || dxBrandList.length === 0) {
				reportLines.push("- _brand absent from source_");
			} else if (dxCandidates.length === 0) {
				reportLines.push(`- _brand has ${dxBrandList.length} entries but none with overlapping model tokens_`);
			} else {
				for (const c of dxCandidates) {
					const meta = c.item.pic ? "image=yes" : "no image";
					reportLines.push(`- _score ${c.score.toFixed(2)}_ — \`${c.item.name}\` (${meta})`);
				}
			}
			reportLines.push("");
		}
	}

	writeFileSync(REPORT_PATH, `${reportLines.join("\n")}\n`, "utf8");

	// --- Stdout summary ---
	console.log("");
	console.log(`Catalog entries: ${FILM_CATALOG.length}`);
	console.log(`  with image:    ${withImage}`);
	console.log(`  with process:  ${withProcess}`);
	console.log(`  without image: ${noImage.length}`);
	console.log("");
	console.log(`Wrote ${OUTPUT_PATH}`);
	console.log(`Wrote ${REPORT_PATH}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
