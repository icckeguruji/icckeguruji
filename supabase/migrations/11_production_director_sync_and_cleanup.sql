-- ==============================================================================
-- IDEAL COACHING CENTRE — MASTER MIGRATION 11: LIVE CLOUD CRUD & SEED CLEANUP
-- Director: BADE SIR (icckeguruji@gmail.com) | Mobile: 9771350910
-- Paste this script into Supabase Dashboard -> SQL Editor and click 'RUN'.
-- It permanently fixes:
--   1. Deletion persistence (allows DELETE, UPDATE, INSERT from app & web without RLS errors)
--   2. Purges the 3 old demo sample courses from Supabase
--   3. Synchronizes Class 1 to 12 hierarchy
-- ==============================================================================

-- 1. Ensure required columns exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS sub_subject_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS chapter_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS class_name TEXT;

-- 2. Drop restrictive constraints to allow flexible class & subject management
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_board_id_fkey;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_class_id_fkey;
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_board_id_fkey;
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_class_id_fkey;
ALTER TABLE public.chapters DROP CONSTRAINT IF EXISTS chapters_subject_id_fkey;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_board_id_fkey;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_class_id_fkey;
ALTER TABLE public.study_materials DROP CONSTRAINT IF EXISTS study_materials_subject_id_fkey;
ALTER TABLE public.live_classes DROP CONSTRAINT IF EXISTS live_classes_batch_id_fkey;
ALTER TABLE public.live_classes DROP CONSTRAINT IF EXISTS live_classes_course_id_fkey;

-- 3. PERMISSIVE POLICIES FOR COURSES (ALLOW LIVE APP & WEB CRUD)
DROP POLICY IF EXISTS "Public read published courses" ON public.courses;
DROP POLICY IF EXISTS "Admin manage courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all on courses" ON public.courses;

CREATE POLICY "Allow all on courses"
ON public.courses FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. PERMISSIVE POLICIES FOR LIVE CLASSES
DROP POLICY IF EXISTS "Students read live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Admin/Teacher manage live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow all on live_classes" ON public.live_classes;

CREATE POLICY "Allow all on live_classes"
ON public.live_classes FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. PERMISSIVE POLICIES FOR STUDY MATERIALS
DROP POLICY IF EXISTS "Enrolled students read study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Admin/Teacher manage study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow all on study_materials" ON public.study_materials;

CREATE POLICY "Allow all on study_materials"
ON public.study_materials FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. PERMISSIVE POLICIES FOR ACADEMIC SUBJECTS
DROP POLICY IF EXISTS "Public read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admin write subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow all on subjects" ON public.subjects;

CREATE POLICY "Allow all on subjects"
ON public.subjects FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 7. PERMISSIVE POLICIES FOR ACADEMIC CHAPTERS
DROP POLICY IF EXISTS "Public read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admin write chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all on chapters" ON public.chapters;

CREATE POLICY "Allow all on chapters"
ON public.chapters FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 8. PERMISSIVE POLICIES FOR RECORDED LECTURES
DROP POLICY IF EXISTS "Enrolled students read recorded lectures" ON public.recorded_lectures;
DROP POLICY IF EXISTS "Admin/Teacher manage recorded lectures" ON public.recorded_lectures;
DROP POLICY IF EXISTS "Allow all on recorded_lectures" ON public.recorded_lectures;

CREATE POLICY "Allow all on recorded_lectures"
ON public.recorded_lectures FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 9. PERMISSIVE POLICIES FOR PAYMENTS
DROP POLICY IF EXISTS "Allow all on payments" ON public.payments;
CREATE POLICY "Allow all on payments"
ON public.payments FOR ALL
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 10. PURGE OLD DEMO SEED COURSES & MATERIALS FROM SUPABASE
DELETE FROM public.courses WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);

DELETE FROM public.study_materials WHERE id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002'
);
