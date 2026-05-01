import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

const LOCAL_ONLY_KEY = "filmvault-local-only";

/**
 * Get the current Supabase session (null if signed out or Supabase not configured).
 */
export async function getCurrentSession(): Promise<Session | null> {
	if (!supabase) return null;
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
	const session = await getCurrentSession();
	return session?.user ?? null;
}

/**
 * Send a Magic Link to the given email. The user clicks the link and is
 * redirected back to the app with a session in the URL fragment, which
 * supabase-js auto-detects.
 */
export type SignInErrorCode = "rate_limit" | "invalid_email" | "not_configured" | "unknown";

export interface SignInError {
	code: SignInErrorCode;
	retryAfterSeconds?: number;
}

export type VerifyOtpErrorCode = "invalid_code" | "expired" | "rate_limit" | "not_configured" | "unknown";

export interface VerifyOtpError {
	code: VerifyOtpErrorCode;
	retryAfterSeconds?: number;
}

/**
 * Verify a 6-digit OTP code (the token Supabase sends alongside the Magic Link).
 * Used so installed PWAs can sign in even though the email link opens in the
 * default browser (a separate auth context that wouldn't reach the PWA).
 */
export async function verifyEmailOtp(email: string, token: string): Promise<{ error: VerifyOtpError | null }> {
	if (!supabase) return { error: { code: "not_configured" } };
	const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
	if (!error) return { error: null };

	const code = error.code ?? "";
	if (code === "otp_expired") return { error: { code: "expired" } };
	if (code === "over_request_rate_limit") {
		const match = error.message.match(/(\d+)\s*second/i);
		const retryAfterSeconds = match?.[1] ? Number.parseInt(match[1], 10) : undefined;
		return { error: { code: "rate_limit", retryAfterSeconds } };
	}
	// Wrong code or any other validation failure: treat as invalid code.
	return { error: { code: "invalid_code" } };
}

export function verifyOtpErrorMessage(
	t: (key: string, options?: Record<string, unknown>) => string,
	error: VerifyOtpError,
): string {
	switch (error.code) {
		case "expired":
			return t("account.codeErrorExpired");
		case "invalid_code":
			return t("account.codeErrorInvalid");
		case "rate_limit":
			return error.retryAfterSeconds != null
				? t("account.sendErrorRateLimit", { seconds: error.retryAfterSeconds })
				: t("account.sendErrorRateLimitGeneric");
		default:
			return t("account.codeErrorGeneric");
	}
}

/**
 * Map a SignInError to a localized message via the i18next `t` function.
 * Kept here so callers can stay simple — they pass `t` and the error.
 */
export function signInErrorMessage(
	t: (key: string, options?: Record<string, unknown>) => string,
	error: SignInError,
): string {
	switch (error.code) {
		case "rate_limit":
			return error.retryAfterSeconds != null
				? t("account.sendErrorRateLimit", { seconds: error.retryAfterSeconds })
				: t("account.sendErrorRateLimitGeneric");
		case "invalid_email":
			return t("account.sendErrorInvalidEmail");
		default:
			return t("account.sendError");
	}
}

export async function signInWithEmail(email: string): Promise<{ error: SignInError | null }> {
	if (!supabase) return { error: { code: "not_configured" } };
	// Redirect back to the exact app URL (origin + current pathname) so the
	// Magic Link works on GitHub Pages where the app is served under a
	// sub-path (e.g. /film-vault/). import.meta.env.BASE_URL is unreliable
	// here because vite's `base: './'` resolves it to a relative value that
	// doesn't combine cleanly with origin.
	const path = window.location.pathname.endsWith("/")
		? window.location.pathname
		: window.location.pathname.replace(/\/[^/]*$/, "/");
	const redirectTo = `${window.location.origin}${path}`;
	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: { emailRedirectTo: redirectTo },
	});
	if (!error) return { error: null };

	const code = error.code ?? "";
	if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
		// Message looks like: "For security purposes, you can only request this after 12 seconds."
		const match = error.message.match(/(\d+)\s*second/i);
		const retryAfterSeconds = match?.[1] ? Number.parseInt(match[1], 10) : undefined;
		return { error: { code: "rate_limit", retryAfterSeconds } };
	}
	if (code === "email_address_invalid" || code === "validation_failed") {
		return { error: { code: "invalid_email" } };
	}
	return { error: { code: "unknown" } };
}

/**
 * Sign the current user out. Clears the local session.
 */
export async function signOut(): Promise<void> {
	if (!supabase) return;
	await supabase.auth.signOut();
}

// --- Local-only mode ---
//
// User chose "Continue without an account" on the welcome screen. Persisted
// so we don't show the welcome screen again on this device.

export function isLocalOnly(): boolean {
	try {
		return localStorage.getItem(LOCAL_ONLY_KEY) === "1";
	} catch {
		return false;
	}
}

export function setLocalOnly(value: boolean): void {
	try {
		if (value) localStorage.setItem(LOCAL_ONLY_KEY, "1");
		else localStorage.removeItem(LOCAL_ONLY_KEY);
	} catch {
		// ignore
	}
}
