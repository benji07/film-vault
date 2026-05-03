// Edge Function: submit-feedback
//
// Validates a feedback payload, inserts it into `public.feedback` (service
// role bypasses the table's locked-down RLS), and notifies the admin via
// Resend. Email failure is logged but does not fail the request — the row in
// the DB is the source of truth.
//
// Anti-abuse: honeypot field + per-IP throttle (5 inserts / 5 min).

// @ts-expect-error Deno-only import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

declare const Deno: {
	env: { get(key: string): string | undefined };
	serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const CATEGORIES = ["bug", "suggestion", "other"] as const;
type Category = (typeof CATEGORIES)[number];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 4000;

const ALLOWED_ORIGINS = new Set<string>([
	"https://benji07.github.io",
	"http://localhost:5173",
	"http://localhost:4173",
]);

const RATE_LIMIT_WINDOW_MIN = 5;
const RATE_LIMIT_MAX = 5;

function corsHeaders(origin: string): Record<string, string> {
	const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "";
	return {
		"Access-Control-Allow-Origin": allowed,
		"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		Vary: "Origin",
	};
}

interface FeedbackBody {
	category?: string;
	message?: string;
	contactEmail?: string | null;
	honeypot?: string | null;
	locale?: string | null;
	appVersion?: string | null;
	userAgent?: string | null;
}

function jsonResponse(body: unknown, status: number, origin: string): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
	});
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

async function sha256Hex(input: string): Promise<string> {
	const buf = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", buf);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function clientIp(req: Request): string | null {
	const forwarded = req.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() || null;
	return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip");
}

Deno.serve(async (req) => {
	const origin = req.headers.get("Origin") ?? "";

	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders(origin) });
	}
	if (req.method !== "POST") {
		return jsonResponse({ error: "method_not_allowed" }, 405, origin);
	}

	let body: FeedbackBody;
	try {
		body = await req.json();
	} catch {
		return jsonResponse({ error: "invalid_json" }, 400, origin);
	}

	// Honeypot: legitimate UI never fills this; bots usually do.
	if ((body.honeypot ?? "").trim().length > 0) {
		// Pretend success to avoid signalling the trap.
		return jsonResponse({ ok: true }, 200, origin);
	}

	const category = (body.category ?? "").trim();
	if (!CATEGORIES.includes(category as Category)) {
		return jsonResponse({ error: "invalid_category" }, 400, origin);
	}
	const message = (body.message ?? "").trim();
	if (message.length < 1 || message.length > MESSAGE_MAX) {
		return jsonResponse({ error: "invalid_message" }, 400, origin);
	}
	const contactEmailRaw = body.contactEmail?.trim() ?? "";
	const contactEmail = contactEmailRaw.length > 0 ? contactEmailRaw : null;
	if (contactEmail && !EMAIL_REGEX.test(contactEmail)) {
		return jsonResponse({ error: "invalid_email" }, 400, origin);
	}

	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
	if (!supabaseUrl || !serviceRoleKey) {
		return jsonResponse({ error: "server_misconfigured" }, 500, origin);
	}
	const admin = createClient(supabaseUrl, serviceRoleKey, {
		auth: { persistSession: false },
	});

	// Per-IP throttle. Salt is required — without it, the hash table would be
	// trivially reversible by hashing the IPv4 space.
	const ipSalt = Deno.env.get("FEEDBACK_IP_SALT") ?? "";
	const ip = clientIp(req);
	let ipHash: string | null = null;
	if (ip && ipSalt) {
		ipHash = await sha256Hex(`${ip}:${ipSalt}`);
		const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
		const { count: recentCount, error: throttleError } = await admin
			.from("feedback")
			.select("id", { count: "exact", head: true })
			.eq("ip_hash", ipHash)
			.gte("created_at", since);
		if (throttleError) {
			console.error("throttle lookup failed", throttleError);
		} else if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
			return jsonResponse({ error: "rate_limited" }, 429, origin);
		}
	} else if (!ipSalt) {
		console.warn("FEEDBACK_IP_SALT missing — throttle disabled");
	}

	let userId: string | null = null;
	const authHeader = req.headers.get("Authorization") ?? "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
	if (token) {
		const { data: userData } = await admin.auth.getUser(token);
		const authUid = userData?.user?.id;
		if (authUid) {
			const { data: profile } = await admin
				.from("user_profiles")
				.select("id")
				.eq("auth_uid", authUid)
				.maybeSingle();
			userId = profile?.id ?? null;
		}
	}

	const locale = body.locale?.toString().slice(0, 16) ?? null;
	const appVersion = body.appVersion?.toString().slice(0, 64) ?? null;
	const userAgent = body.userAgent?.toString().slice(0, 512) ?? null;

	const { data: inserted, error: insertError } = await admin
		.from("feedback")
		.insert({
			user_id: userId,
			category,
			message,
			contact_email: contactEmail,
			locale,
			app_version: appVersion,
			user_agent: userAgent,
			ip_hash: ipHash,
		})
		.select("id, created_at")
		.single();

	if (insertError) {
		console.error("feedback insert failed", insertError);
		return jsonResponse({ error: "insert_failed" }, 500, origin);
	}

	const resendKey = Deno.env.get("RESEND_API_KEY");
	const toEmail = Deno.env.get("FEEDBACK_TO_EMAIL");
	const fromEmail = Deno.env.get("FEEDBACK_FROM_EMAIL");
	if (resendKey && toEmail && fromEmail) {
		const summary = message.replace(/\s+/g, " ").trim().slice(0, 60);
		const subject = `[FilmVault feedback / ${category}] ${summary}`;
		const html = [
			`<p><strong>Catégorie :</strong> ${escapeHtml(category)}</p>`,
			contactEmail ? `<p><strong>Email :</strong> ${escapeHtml(contactEmail)}</p>` : "",
			userId ? `<p><strong>User ID :</strong> ${escapeHtml(userId)}</p>` : "<p><em>Utilisateur anonyme</em></p>",
			locale ? `<p><strong>Langue :</strong> ${escapeHtml(locale)}</p>` : "",
			appVersion ? `<p><strong>Version :</strong> ${escapeHtml(appVersion)}</p>` : "",
			userAgent ? `<p><strong>UA :</strong> ${escapeHtml(userAgent)}</p>` : "",
			"<hr/>",
			`<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
		]
			.filter(Boolean)
			.join("\n");

		try {
			const resendRes = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${resendKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from: fromEmail,
					to: toEmail,
					subject,
					html,
					reply_to: contactEmail ?? undefined,
				}),
			});
			if (!resendRes.ok) {
				console.error("resend send failed", resendRes.status, await resendRes.text());
			}
		} catch (err) {
			console.error("resend request threw", err);
		}
	} else {
		console.warn("Resend secrets missing — feedback stored but no email sent");
	}

	return jsonResponse({ ok: true, id: inserted?.id }, 200, origin);
});
