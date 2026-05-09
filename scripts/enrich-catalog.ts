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

// --- CSV parsing -----------------------------------------------------------

/**
 * Minimal CSV parser handling quoted fields and embedded delimiters / newlines.
 * Delimiter is auto-detected from the header line (dxdatabase uses `;`).
 */
function detectDelimiter(firstLine: string): string {
	const commas = (firstLine.match(/,/g) ?? []).length;
	const semis = (firstLine.match(/;/g) ?? []).length;
	return semis > commas ? ";" : ",";
}

function parseCsv(text: string, delimiter: string): string[][] {
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
			} else if (c === delimiter) {
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
	const firstLine = text.split("\n", 1)[0] ?? "";
	const delimiter = detectDelimiter(firstLine);
	const rows = parseCsv(text, delimiter);
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

// --- Dedup --------------------------------------------------------------

interface DekuProduct {
	brand: string;
	product: string;
	iso: string;
	process: string;
	uuid: string;
	filename: string;
}

interface DxProduct {
	manufacturer: string;
	name: string;
	pic: string;
}

/**
 * Collapse multiple deku rows for the same (brand, product) into a single
 * canonical entry. Image priority: film_box_outside > film_box_inside > any.
 */
function dedupDekuRows(rows: Record<string, string>[]): DekuProduct[] {
	const itemTypeRank = (t: string): number => {
		if (t === "film_box_outside") return 0;
		if (t === "film_box_inside") return 1;
		return 2;
	};
	const groups = new Map<string, Record<string, string>[]>();
	for (const r of rows) {
		const brand = r["brand"] ?? "";
		const product = r["product"] ?? "";
		if (!brand || !product) continue;
		const key = `${normalizeBrand(brand)}|${normalize(product)}`;
		const list = groups.get(key);
		if (list) list.push(r);
		else groups.set(key, [r]);
	}
	const out: DekuProduct[] = [];
	for (const list of groups.values()) {
		// Sort: best image first, then prefer rows with non-empty filename
		list.sort((a, b) => {
			const ra = itemTypeRank(a["item_type"] ?? "");
			const rb = itemTypeRank(b["item_type"] ?? "");
			if (ra !== rb) return ra - rb;
			const fa = (a["filename"] ?? "") ? 0 : 1;
			const fb = (b["filename"] ?? "") ? 0 : 1;
			return fa - fb;
		});
		const best = list[0];
		if (!best) continue;
		out.push({
			brand: best["brand"] ?? "",
			product: best["product"] ?? "",
			iso: best["film_speed_iso"] ?? "",
			process: best["process"] ?? "",
			uuid: best["uuid"] ?? "",
			filename: best["filename"] ?? "",
		});
	}
	return out;
}

/**
 * Collapse dxdatabase rows by Name, keeping rows with a non-empty Pic in priority.
 */
function dedupDxRows(rows: Record<string, string>[]): DxProduct[] {
	const groups = new Map<string, DxProduct>();
	for (const r of rows) {
		const name = r["Name"] ?? "";
		if (!name) continue;
		const key = normalize(name);
		const candidate: DxProduct = {
			manufacturer: r["Manufacturer"] ?? "",
			name,
			pic: r["Pic"] ?? "",
		};
		const existing = groups.get(key);
		if (!existing) {
			groups.set(key, candidate);
		} else if (!existing.pic && candidate.pic) {
			groups.set(key, candidate);
		}
	}
	return Array.from(groups.values());
}

// --- Token-inclusion matching ----------------------------------------------

/**
 * Score a deku row against a catalog entry. Returns -1 for hard miss.
 *
 * Match rule: the source row's brand must equal the catalog brand (with
 * alias mapping), and the source product tokens must be a superset of the
 * catalog model tokens. ISO match adds a bonus; extra tokens add a penalty
 * so "Lady Grey" in the catalog prefers "Lady Grey 400" over "Lady Grey 400
 * Special Edition".
 */
function scoreDekuMatch(row: DekuProduct, brand: string, model: string, iso: number): number {
	if (normalizeBrand(row.brand) !== normalizeBrand(brand)) return -1;
	const cat = tokens(model);
	const src = tokens(row.product);
	for (const t of cat) if (!src.has(t)) return -1;
	const isoBonus = row.iso === String(iso) ? 10 : 0;
	const extra = src.size - cat.size;
	return 100 + isoBonus - extra;
}

/**
 * Score a dx row against a catalog entry. dxdatabase concatenates brand+model
 * in the Name column, so we require all tokens of (brand + " " + model) to be
 * present in tokens(Name). ISO bonus applies if the catalog ISO appears as a
 * token in the Name.
 */
function scoreDxMatch(row: DxProduct, brand: string, model: string, iso: number): number {
	const brandToks = tokens(brand);
	const modelToks = tokens(model);
	const catToks = new Set([...brandToks, ...modelToks]);
	const nameToks = tokens(row.name);
	for (const t of catToks) if (!nameToks.has(t)) return -1;
	const isoBonus = nameToks.has(String(iso)) ? 10 : 0;
	const extra = nameToks.size - catToks.size;
	return 100 + isoBonus - extra;
}

function bestDekuMatch(rows: DekuProduct[], brand: string, model: string, iso: number): DekuProduct | undefined {
	let best: DekuProduct | undefined;
	let bestScore = -1;
	for (const r of rows) {
		const s = scoreDekuMatch(r, brand, model, iso);
		if (s > bestScore) {
			bestScore = s;
			best = r;
		}
	}
	return bestScore >= 0 ? best : undefined;
}

function bestDxMatch(rows: DxProduct[], brand: string, model: string, iso: number): DxProduct | undefined {
	let best: DxProduct | undefined;
	let bestScore = -1;
	for (const r of rows) {
		const s = scoreDxMatch(r, brand, model, iso);
		if (s > bestScore) {
			bestScore = s;
			best = r;
		}
	}
	return bestScore >= 0 ? best : undefined;
}

// --- Brand grouping (for candidate suggestions in the report) --------------

function groupDekuByBrand(rows: DekuProduct[]): Map<string, DekuProduct[]> {
	const out = new Map<string, DekuProduct[]>();
	for (const r of rows) {
		const key = normalizeBrand(r.brand);
		const list = out.get(key);
		if (list) list.push(r);
		else out.set(key, [r]);
	}
	return out;
}

/**
 * Find dx rows whose Name contains all tokens of `brand` (e.g. all rows
 * starting with "Lomography" for the Lomography brand). Used to surface
 * near-matches in the report.
 */
function dxRowsForBrand(rows: DxProduct[], brand: string): DxProduct[] {
	const brandToks = tokens(brand);
	if (brandToks.size === 0) return [];
	return rows.filter((r) => {
		const nameToks = tokens(r.name);
		for (const t of brandToks) if (!nameToks.has(t)) return false;
		return true;
	});
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

	const dekuProducts = dedupDekuRows(dekuRows);
	const dxProducts = dedupDxRows(dxRows);
	console.log(`  after dedup: dekuNukem ${dekuProducts.length} products, dxdatabase ${dxProducts.length} products`);
	const dekuByBrand = groupDekuByBrand(dekuProducts);

	const enrichment: Record<string, EnrichmentEntry> = {};
	const noImage: FilmCatalogEntry[] = [];
	let withImage = 0;
	let withProcess = 0;

	for (const entry of FILM_CATALOG) {
		const deku = bestDekuMatch(dekuProducts, entry.brand, entry.model, entry.iso);
		const dx = bestDxMatch(dxProducts, entry.brand, entry.model, entry.iso);

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

			// Did we actually match a source row, just one with no image?
			const matchedDeku = bestDekuMatch(dekuProducts, ref.brand, ref.model, ref.iso);
			const matchedDx = bestDxMatch(dxProducts, ref.brand, ref.model, ref.iso);
			if (matchedDeku && !matchedDeku.filename) {
				reportLines.push(
					`- ✓ matched in dekuNukem as \`${matchedDeku.brand} — ${matchedDeku.product}\`, but source has no image file`,
				);
				reportLines.push("");
			}
			if (matchedDx && !matchedDx.pic) {
				reportLines.push(`- ✓ matched in dxdatabase as \`${matchedDx.name}\`, but source has no \`Pic\``);
				reportLines.push("");
			}

			// Suggest brand-overlap candidates only when no exact match was found in that source.
			const brandKey = normalizeBrand(ref.brand);
			const dekuBrandList = dekuByBrand.get(brandKey);
			const dxBrandList = dxRowsForBrand(dxProducts, ref.brand);
			const dekuCandidates = topCandidates(dekuBrandList, (p) => p.product, ref.model, 5);
			const dxCandidates = topCandidates(dxBrandList, (p) => p.name, ref.model, 5);

			if (!matchedDeku) {
				reportLines.push("**dekuNukem candidates**:");
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
			}

			if (!matchedDx) {
				reportLines.push("**dxdatabase candidates**:");
				if (dxBrandList.length === 0) {
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
