-- ============================================================
-- Migration 15: Field Sync, Missing Columns & Thumbnail Support
-- Aligns all code-side fields with live Supabase schema
-- ============================================================

-- 1. Add dob to profiles (used in enrollment form)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;

-- 2. Add role to profiles (admin vs student differentiation)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'teacher'));

-- 3. Add updated_at to live_classes
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Auto-update live_classes.updated_at trigger
CREATE OR REPLACE FUNCTION update_live_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_live_classes_updated_at ON live_classes;
CREATE TRIGGER trg_live_classes_updated_at
  BEFORE UPDATE ON live_classes
  FOR EACH ROW EXECUTE FUNCTION update_live_classes_updated_at();

-- 4. Ensure enrollments table has all needed columns
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'suspended')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS on enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "enrollments_all" ON enrollments;
CREATE POLICY "enrollments_all" ON enrollments FOR ALL USING (true) WITH CHECK (true);

-- 5. Ensure study_materials table is complete
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT,
  board_id UUID,
  class_id UUID,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  file_path TEXT,
  file_url TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  material_type TEXT DEFAULT 'chapter_notes',
  is_free BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_materials_all" ON study_materials;
CREATE POLICY "study_materials_all" ON study_materials FOR ALL USING (true) WITH CHECK (true);

-- 6. Ensure notifications table is complete
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_all" ON notifications;
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 7. Add thumbnail_url helper column to live_classes (computed on read in app, but store if needed)
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN youtube_video_id IS NOT NULL AND youtube_video_id != ''
    THEN 'https://img.youtube.com/vi/' || youtube_video_id || '/hqdefault.jpg'
    ELSE NULL 
  END
) STORED;

-- 8. Add thumbnail_url to recorded_lectures
ALTER TABLE recorded_lectures ADD COLUMN IF NOT EXISTS thumbnail_url TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN youtube_video_id IS NOT NULL AND youtube_video_id != ''
    THEN 'https://img.youtube.com/vi/' || youtube_video_id || '/hqdefault.jpg'
    ELSE NULL 
  END
) STORED;

-- 9. Grant full permissions for all tables
GRANT ALL ON enrollments TO anon, authenticated, service_role;
GRANT ALL ON study_materials TO anon, authenticated, service_role;
GRANT ALL ON notifications TO anon, authenticated, service_role;
GRANT ALL ON live_classes TO anon, authenticated, service_role;
GRANT ALL ON profiles TO anon, authenticated, service_role;
