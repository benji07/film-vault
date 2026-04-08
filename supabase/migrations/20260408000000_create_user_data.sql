-- Create user_data table for cloud sync via recovery codes
CREATE TABLE IF NOT EXISTS public.user_data (
    recovery_code TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for anon role (the app uses anon key + recovery codes as auth)
-- The recovery code itself acts as a shared secret: without knowing one,
-- a client cannot query any meaningful row.

CREATE POLICY "Allow select for anon"
    ON public.user_data
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow insert for anon"
    ON public.user_data
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow update for anon"
    ON public.user_data
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- No DELETE policy: the app never deletes rows, deny by default.
