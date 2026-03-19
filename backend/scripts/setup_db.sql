-- backend/scripts/setup_db.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Run this in the Supabase SQL Editor to create the history tracker table.

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    language TEXT,
    history JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS (Row Level Security) but allow anonymous insert/update for our loose API prototype
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON public.chat_sessions FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON public.chat_sessions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
ON public.chat_sessions FOR UPDATE
TO anon
USING (true);
