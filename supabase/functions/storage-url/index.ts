import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const BUCKET = "user-photos";

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

function corsHeaders(origin: string | null) {
	return {
		"Access-Control-Allow-Origin": origin ?? "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

	// Resolve recovery code to user_id using anon client (via RPC)
	const anonClient = createClient(supabaseUrl, supabaseAnonKey);
	const { data: userId, error: resolveError } = await anonClient.rpc("resolve_user_id", {
		p_recovery_code: recovery_code,
	});

	if (resolveError || !userId) {
		return Response.json({ error: "invalid_recovery_code" }, { status: 401, headers });
	}

	const fullPath = `${userId}/${path}`;

	// Use service role client for storage operations
	const adminClient = createClient(supabaseUrl, supabaseServiceKey);

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
