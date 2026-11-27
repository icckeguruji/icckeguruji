-- ============================================================
-- IDEAL COACHING CENTRE — Migration 14: Live Quiz History & Anti-Repeat
-- Run in Supabase SQL Editor if student_quiz_history is not yet created
-- ============================================================

CREATE TABLE IF NOT EXISTS public.student_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT,
  course_id UUID,
  subject_id TEXT,
  chapter_id TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_quiz_history_student_correct
  ON public.student_quiz_history(student_id, is_correct, question_id);

ALTER TABLE public.student_quiz_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all quiz history read" ON public.student_quiz_history;
CREATE POLICY "Allow all quiz history read"
  ON public.student_quiz_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all quiz history insert" ON public.student_quiz_history;
CREATE POLICY "Allow all quiz history insert"
  ON public.student_quiz_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all quiz history update" ON public.student_quiz_history;
CREATE POLICY "Allow all quiz history update"
  ON public.student_quiz_history FOR UPDATE USING (true);

-- Ensure profiles has quiz_points and badges columns for leaderboard & rewards
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiz_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges TEXT[] NOT NULL DEFAULT '{}';
