-- ==============================================================================
-- IDEAL COACHING CENTRE — MASTER MIGRATION 13:
-- 1. Add course_id to subjects and chapters for manual, per-course curriculum
-- 2. Create public storage bucket for course thumbnails
-- 3. Configure unrestricted RLS and Realtime sync
-- ==============================================================================

-- 1. Update subjects table
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ALTER COLUMN board_id DROP NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN class_id DROP NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN code DROP NOT NULL;
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_board_id_class_id_code_key;

-- 2. Update chapters table
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.chapters ALTER COLUMN subject_id DROP NOT NULL;
ALTER TABLE public.chapters ALTER COLUMN chapter_number DROP NOT NULL;
ALTER TABLE public.chapters DROP CONSTRAINT IF EXISTS chapters_subject_id_chapter_number_key;

-- 3. Update courses table (ensure all columns exist)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 4. Enable Row Level Security and Unrestricted Permissive Policies
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on subjects" ON public.subjects;
CREATE POLICY "Allow all on subjects" ON public.subjects FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on chapters" ON public.chapters;
CREATE POLICY "Allow all on chapters" ON public.chapters FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- 5. Create public storage bucket for course thumbnails and files
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage object policies for course-thumbnails
DROP POLICY IF EXISTS "Allow public read on course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public read on course-thumbnails" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow public insert on course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public insert on course-thumbnails" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow public update on course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public update on course-thumbnails" ON storage.objects
FOR UPDATE TO public USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow public delete on course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public delete on course-thumbnails" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'course-thumbnails');

-- 6. Add subjects and chapters to Supabase Realtime safely
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;
END $$;
