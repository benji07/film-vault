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
export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
	if (!supabase) return { error: "supabase_not_configured" };
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
	return { error: error?.message ?? null };
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
