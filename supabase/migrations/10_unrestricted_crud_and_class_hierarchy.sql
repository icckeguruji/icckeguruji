-- ==============================================================================
-- IDEAL COACHING CENTRE — MIGRATION 10: UNRESTRICTED CLOUD CRUD & CLASS HIERARCHY
-- Removes all restrictive RLS policies so mobile app & admin can directly
-- perform INSERT, UPDATE, DELETE on Courses, Live Classes, Study Materials,
-- Subjects & Chapters without authentication mismatch or silent reverts.
-- ==============================================================================

-- 1. ADD CLASS_NAME & SAFE COLUMNS TO ACADEMIC TABLES
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS sub_subject_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS chapter_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS class_name TEXT;

-- 2. DROP RESTRICTIVE FOREIGN KEYS TO PREVENT INSERTION FAILURES
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

-- 3. PERMISSIVE POLICIES FOR COURSES
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
