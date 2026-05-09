import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { invalidateAdminCache, isAdminUser } from "@/utils/admin-catalog";

/**
 * Returns whether the current authenticated user is flagged as admin in
 * `user_profiles.is_admin`. Re-checks whenever the session changes.
 */
export function useIsAdmin(session: Session | null): boolean {
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		if (!session) {
			invalidateAdminCache();
			setIsAdmin(false);
			return;
		}

		let cancelled = false;
		invalidateAdminCache();
		isAdminUser().then((value) => {
			if (!cancelled) setIsAdmin(value);
		});
		return () => {
			cancelled = true;
		};
	}, [session]);

	return isAdmin;
}
