import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// --- Auth helpers ---

export type OAuthProvider = "apple" | "google";

export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
	if (!supabase) return;
	await supabase.auth.signInWithOAuth({
		provider,
		options: { redirectTo: window.location.origin + window.location.pathname },
	});
}

export async function signOutUser(): Promise<void> {
	if (!supabase) return;
	await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
	if (!supabase) return null;
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
	if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
	return supabase.auth.onAuthStateChange(callback);
}
