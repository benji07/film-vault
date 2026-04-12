import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS (comma-separated env var, fallback to GitHub Pages)
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

const BUCKET = "user-photos";

// Reuse clients across invocations (no per-request state)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
	recovery_code: string;
	path: string;
	action: "upload" | "download" | "delete";
}

function validatePath(path: string): string | null {
	if (!path || path.length === 0) return "path must not be empty";
	if (path.startsWith("/")) return "path must be relative (no leading /)";
	if (path.includes("..")) return "path must not contain .. segments";
	return null;
}

function isOriginAllowed(origin: string | null): boolean {
	if (!origin) return false;
	if (ALLOWED_ORIGINS.length === 0) return true; // no restriction if not configured
	return ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
	const allowed = isOriginAllowed(origin);
	return {
		"Access-Control-Allow-Origin": allowed && origin ? origin : "null",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
		"Vary": "Origin",
	};
}

Deno.serve(async (req) => {
	const origin = req.headers.get("origin");
	const headers = corsHeaders(origin);

	// Handle CORS preflight
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers });
	}

	if (req.method !== "POST") {
		return Response.json({ error: "method_not_allowed" }, { status: 405, headers });
	}

	let body: RequestBody;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "invalid_json" }, { status: 400, headers });
	}

	const { recovery_code, path, action } = body;

	if (!recovery_code || !path || !action) {
		return Response.json({ error: "missing_fields" }, { status: 400, headers });
	}

	// Validate path
	const pathError = validatePath(path);
	if (pathError) {
		return Response.json({ error: pathError }, { status: 400, headers });
	}

	if (!["upload", "download", "delete"].includes(action)) {
		return Response.json({ error: "invalid_action" }, { status: 400, headers });
	}

	// Resolve recovery code to user_id (service role bypasses RLS)
	const { data: rows, error: resolveError } = await adminClient
		.from("user_profiles")
		.select("id")
		.eq("recovery_code", recovery_code)
		.limit(1);

	if (resolveError || !rows || rows.length === 0) {
		return Response.json({ error: "invalid_recovery_code" }, { status: 401, headers });
	}

	const userId = rows[0].id as string;
	const fullPath = `${userId}/${path}`;

	try {
		if (action === "upload") {
			const { data, error } = await adminClient.storage
				.from(BUCKET)
				.createSignedUploadUrl(fullPath);

			if (error) {
				return Response.json({ error: error.message }, { status: 500, headers });
			}

			return Response.json({ url: data.signedUrl, token: data.token }, { headers });
		}

		if (action === "download") {
			const { data, error } = await adminClient.storage
				.from(BUCKET)
				.createSignedUrl(fullPath, 3600); // 1 hour TTL

			if (error) {
				return Response.json({ error: error.message }, { status: 500, headers });
			}

			return Response.json({ url: data.signedUrl }, { headers });
		}

		if (action === "delete") {
			const { error } = await adminClient.storage
				.from(BUCKET)
				.remove([fullPath]);

			if (error) {
				return Response.json({ error: error.message }, { status: 500, headers });
			}

			return Response.json({ ok: true }, { headers });
		}
	} catch (e) {
		return Response.json({ error: String(e) }, { status: 500, headers });
	}

	return Response.json({ error: "unknown_action" }, { status: 400, headers });
});
