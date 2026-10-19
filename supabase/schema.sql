-- ==============================================================================
-- YouFix Database Schema for Supabase (PostgreSQL)
-- Capstone Project: AI-Powered Fault Diagnosis & Repair Platform
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing table if recreating (safe idempotent setup)
-- DROP TABLE IF EXISTS public.diagnoses;

-- 3. Create the diagnoses table
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'Leaking pipe',
            'Clogged drain',
            'Damaged electrical socket',
            'Flat tire',
            'Overheating engine'
        )
    ),
    cause TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (
        risk_level IN ('Low', 'Medium', 'High')
    ),
    recommended_action TEXT NOT NULL,
    is_diy BOOLEAN NOT NULL DEFAULT true,
    professional_required BOOLEAN NOT NULL DEFAULT false,
    safety_warning TEXT,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create performance indexes for querying and history filtering
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON public.diagnoses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_category ON public.diagnoses (category);
CREATE INDEX IF NOT EXISTS idx_diagnoses_risk_level ON public.diagnoses (risk_level);
CREATE INDEX IF NOT EXISTS idx_diagnoses_is_diy ON public.diagnoses (is_diy);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies
-- Allow anyone (including anonymous clients) to read diagnosis history
CREATE POLICY "Allow public read access to diagnoses"
    ON public.diagnoses
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow backend service role (or anon clients with API key) to insert diagnoses
CREATE POLICY "Allow public insert access to diagnoses"
    ON public.diagnoses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Optional: Allow delete by id if needed for cleanup
CREATE POLICY "Allow service role full access"
    ON public.diagnoses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Comment on table and columns for documentation
COMMENT ON TABLE public.diagnoses IS 'Stores AI-generated fault diagnoses for home and automotive maintenance.';
COMMENT ON COLUMN public.diagnoses.category IS 'Strictly restricted to 5 core problem domains.';
COMMENT ON COLUMN public.diagnoses.instructions IS 'JSON array of string instructions detailing the step-by-step fix.';
COMMENT ON COLUMN public.diagnoses.safety_warning IS 'Mandatory safety warning displayed when hazards or high risk are detected.';
