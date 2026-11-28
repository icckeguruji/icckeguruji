-- Migration 18: YouTube OAuth sync & Live Classes visibility/thumbnail columns
-- Safe, idempotent migration

ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'unlisted',
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS subject_id UUID,
  ADD COLUMN IF NOT EXISTS chapter_id UUID;

ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS course_id UUID;

-- Allow platform_settings upsert for youtube_oauth_config so Web & Android App stay synced
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'platform_settings' AND policyname = 'Allow youtube_oauth_config write'
  ) THEN
    CREATE POLICY "Allow youtube_oauth_config write"
      ON public.platform_settings FOR ALL
      TO public, anon, authenticated
      USING (key = 'youtube_oauth_config')
      WITH CHECK (key = 'youtube_oauth_config');
  END IF;
END $$;
