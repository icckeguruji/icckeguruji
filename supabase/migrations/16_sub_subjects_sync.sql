-- ============================================================
-- Migration 16: Cloud Sync for Sub-Subjects (Science -> Physics/Chem/Bio, SST -> History/Geo/Civics/Eco)
-- ============================================================

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS has_sub_subjects BOOLEAN DEFAULT FALSE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS sub_subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS sub_subject_id TEXT;

CREATE INDEX IF NOT EXISTS idx_chapters_sub_subject_id ON chapters(sub_subject_id);
