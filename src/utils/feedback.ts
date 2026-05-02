import i18n from "@/utils/i18n";
import { supabase } from "@/utils/supabase";

export type FeedbackCategory = "bug" | "suggestion" | "other";

export interface FeedbackPayload {
	category: FeedbackCategory;
	message: string;
	contactEmail?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<{ ok: boolean }> {
	if (!supabase) return { ok: false };

	const { error } = await supabase.functions.invoke("submit-feedback", {
		body: {
			category: payload.category,
			message: payload.message,
			contactEmail: payload.contactEmail?.trim() || null,
			locale: i18n.language ?? null,
			userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
		},
	});

	return { ok: !error };
}
