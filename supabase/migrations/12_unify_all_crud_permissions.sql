-- ==============================================================================
-- IDEAL COACHING CENTRE — MASTER MIGRATION 12: UNRESTRICTED REAL-TIME CLOUD CRUD
-- Guarantees that Admin Web Panel & Android App can both perform ADD, EDIT, DELETE
-- on Courses, Live Classes, Recorded Lectures, Study Materials, Examinations,
-- Profiles and Payments without any RLS blockages or schema mismatch.
-- ==============================================================================

-- 1. Ensure required columns exist across all operational tables
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS chapter_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS class_name TEXT;

ALTER TABLE public.recorded_lectures ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.recorded_lectures ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.recorded_lectures ADD COLUMN IF NOT EXISTS chapter_id UUID;
ALTER TABLE public.recorded_lectures ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.recorded_lectures ADD COLUMN IF NOT EXISTS chapter TEXT;

ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS board_id UUID;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS chapter_id UUID;

ALTER TABLE public.examinations ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.examinations ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.examinations ADD COLUMN IF NOT EXISTS chapter_id UUID;
ALTER TABLE public.examinations ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 20;

-- 2. Drop restrictive constraints to allow seamless CRUD from web and mobile
ALTER TABLE public.courses ALTER COLUMN board_id DROP NOT NULL;
ALTER TABLE public.courses ALTER COLUMN class_id DROP NOT NULL;
ALTER TABLE public.courses ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE public.live_classes ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.live_classes DROP CONSTRAINT IF EXISTS live_classes_course_id_fkey;
ALTER TABLE public.live_classes DROP CONSTRAINT IF EXISTS live_classes_batch_id_fkey;

ALTER TABLE public.recorded_lectures ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.recorded_lectures ALTER COLUMN subject_id DROP NOT NULL;
ALTER TABLE public.recorded_lectures ALTER COLUMN chapter_id DROP NOT NULL;
ALTER TABLE public.recorded_lectures DROP CONSTRAINT IF EXISTS recorded_lectures_course_id_fkey;
ALTER TABLE public.recorded_lectures DROP CONSTRAINT IF EXISTS recorded_lectures_subject_id_fkey;
ALTER TABLE public.recorded_lectures DROP CONSTRAINT IF EXISTS recorded_lectures_chapter_id_fkey;

ALTER TABLE public.study_materials ALTER COLUMN board_id DROP NOT NULL;
ALTER TABLE public.study_materials ALTER COLUMN class_id DROP NOT NULL;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_board_id_fkey;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_class_id_fkey;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_subject_id_fkey;

ALTER TABLE public.examinations ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE public.examinations DROP CONSTRAINT IF EXISTS examinations_course_id_fkey;

-- 3. UNRESTRICTED PERMISSIVE POLICIES FOR ALL ROLES (ANON + AUTHENTICATED)

-- Courses
DROP POLICY IF EXISTS "Allow all on courses" ON public.courses;
DROP POLICY IF EXISTS "Public read published courses" ON public.courses;
DROP POLICY IF EXISTS "Admin manage courses" ON public.courses;
CREATE POLICY "Allow all on courses" ON public.courses FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Live Classes
DROP POLICY IF EXISTS "Allow all on live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Students read live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admin/Teacher manage live classes" ON public.live_classes;
CREATE POLICY "Allow all on live_classes" ON public.live_classes FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Recorded Lectures
DROP POLICY IF EXISTS "Allow all on recorded_lectures" ON public.recorded_lectures;
DROP POLICY IF EXISTS "Enrolled students read recorded lectures" ON public.recorded_lectures;
DROP POLICY IF EXISTS "Admin/Teacher manage recorded lectures" ON public.recorded_lectures;
CREATE POLICY "Allow all on recorded_lectures" ON public.recorded_lectures FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Study Materials
DROP POLICY IF EXISTS "Allow all on study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Enrolled students read study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admin/Teacher manage study materials" ON public.study_materials;
CREATE POLICY "Allow all on study_materials" ON public.study_materials FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Examinations
DROP POLICY IF EXISTS "Allow all on examinations" ON public.examinations;
DROP POLICY IF EXISTS "Read published examinations" ON public.examinations;
DROP POLICY IF EXISTS "Admin/Teacher manage examinations" ON public.examinations;
CREATE POLICY "Allow all on examinations" ON public.examinations FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- Payments
DROP POLICY IF EXISTS "Allow all on payments" ON public.payments;
CREATE POLICY "Allow all on payments" ON public.payments FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- 4. Enable Row Level Security and Permissive Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Enable Supabase Realtime publication on all key tables safely
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_classes;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.recorded_lectures;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.study_materials;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.examinations;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;
END $$;
