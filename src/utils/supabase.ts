import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

/**
 * Ensure an anonymous auth session exists.
 * Called once at app startup when Supabase is configured.
 * If a session already exists (persisted by supabase-js in localStorage), this is a no-op.
 */
export async function ensureAnonSession(): Promise<void> {
	if (!supabase) return;

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) return;

	const { error } = await supabase.auth.signInAnonymously();
	if (error) {
		console.error("Anonymous sign-in failed:", error.message);
	}
}
