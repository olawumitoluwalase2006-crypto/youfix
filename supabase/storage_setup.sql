-- ==============================================================================
-- Supabase Storage Bucket Setup for YouFix
-- ==============================================================================

-- 1. Create a public bucket for diagnosis uploaded images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'diagnosis-images',
    'diagnosis-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- 2. Setup Storage Policies
-- Allow public viewing of images
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'diagnosis-images');

-- Allow backend / anon upload
CREATE POLICY "Public Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'diagnosis-images');
