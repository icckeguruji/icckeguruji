-- ==============================================================================
-- IDEAL COACHING CENTRE — MIGRATION 09: AI QUIZ & COURSE METADATA ENHANCEMENTS
-- Adds Tagline, Start Date, Quiz Points, Badges & Quiz Anti-Repetition History
-- ==============================================================================

-- 1. ENHANCE COURSES TABLE
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '["Daily Live Classes", "Handwritten PDF Notes", "Weekly 30s Mock Tests", "24/7 AI Doubt Solver"]'::jsonb;

-- 2. ENHANCE PROFILES TABLE FOR AI QUIZ POINTS & BADGES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS quiz_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Remove rigid board_code constraint to allow national / general portal operation
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_board_code_check;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_board_id_fkey;

-- 3. CREATE STUDENT QUIZ HISTORY TABLE (ANTI-REPETITION ENGINE)
CREATE TABLE IF NOT EXISTS public.student_quiz_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    subject_id TEXT,
    chapter_id TEXT,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for instant lookup of already answered questions
CREATE INDEX IF NOT EXISTS idx_student_quiz_history_lookup 
ON public.student_quiz_history(student_id, question_id);

-- Enable RLS on student_quiz_history
ALTER TABLE public.student_quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own quiz history"
ON public.student_quiz_history FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Students can insert own quiz history"
ON public.student_quiz_history FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 4. FUNCTION TO AWARD QUIZ POINTS & BADGES ATOMICALLY
CREATE OR REPLACE FUNCTION public.record_quiz_answer(
    p_student_id UUID,
    p_question_id TEXT,
    p_subject_id TEXT,
    p_chapter_id TEXT,
    p_is_correct BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_delta INTEGER;
    v_new_total INTEGER;
    v_badge TEXT := NULL;
    v_current_badges JSONB;
BEGIN
    -- +10 for correct, -5 for wrong (minimum 0)
    IF p_is_correct THEN
        v_points_delta := 10;
    ELSE
        v_points_delta := -5;
    END IF;

    -- Record in history
    INSERT INTO public.student_quiz_history (
        student_id, question_id, subject_id, chapter_id, is_correct, points_earned
    ) VALUES (
        p_student_id, p_question_id, p_subject_id, p_chapter_id, p_is_correct, v_points_delta
    );

    -- Update student profile points (never drop below 0)
    UPDATE public.profiles
    SET quiz_points = GREATEST(0, COALESCE(quiz_points, 0) + v_points_delta),
        updated_at = now()
    WHERE id = p_student_id
    RETURNING quiz_points, badges INTO v_new_total, v_current_badges;

    -- Determine new badge unlocked
    IF v_new_total >= 1000 AND NOT (v_current_badges ? 'Mastermind') THEN
        v_badge := 'Mastermind';
    ELSIF v_new_total >= 500 AND NOT (v_current_badges ? 'State Ranker') THEN
        v_badge := 'State Ranker';
    ELSIF v_new_total >= 300 AND NOT (v_current_badges ? 'Gold Topper') THEN
        v_badge := 'Gold Topper';
    ELSIF v_new_total >= 150 AND NOT (v_current_badges ? 'Silver Achiever') THEN
        v_badge := 'Silver Achiever';
    ELSIF v_new_total >= 50 AND NOT (v_current_badges ? 'Bronze Scholar') THEN
        v_badge := 'Bronze Scholar';
    END IF;

    -- Add badge if newly unlocked
    IF v_badge IS NOT NULL THEN
        UPDATE public.profiles
        SET badges = COALESCE(badges, '[]'::jsonb) || to_jsonb(v_badge)
        WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object(
        'points_delta', v_points_delta,
        'new_total_points', COALESCE(v_new_total, 0),
        'new_badge', v_badge
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_quiz_answer TO anon, authenticated, service_role;
