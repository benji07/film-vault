-- ============================================================================
-- Migration: Feedback module
-- Adds a `feedback` table written exclusively by the `submit-feedback` Edge
-- Function (service role). RLS is enabled with no policies so anon and
-- authenticated roles cannot read or write directly — they go through the
-- Edge Function, which validates input and also notifies the admin via
-- Resend before returning.
-- ============================================================================

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('bug', 'suggestion', 'other')),
    message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 4000),
    contact_email TEXT CHECK (contact_email IS NULL OR contact_email ~* '^[^@]+@[^@]+\.[^@]+$'),
    locale TEXT,
    app_version TEXT,
    user_agent TEXT,
    -- SHA-256(ip + FEEDBACK_IP_SALT) — used for per-IP rate limiting without storing the raw IP.
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_created_at_idx ON public.feedback (created_at DESC);
CREATE INDEX feedback_category_idx ON public.feedback (category);
CREATE INDEX feedback_ip_hash_recent_idx ON public.feedback (ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- No policies: only service_role (Edge Function) can read/write.
REVOKE ALL ON public.feedback FROM PUBLIC;
REVOKE ALL ON public.feedback FROM anon;
REVOKE ALL ON public.feedback FROM authenticated;
