-- =========================================================================
-- LAKSHYA COACHING PLATFORM - SUPABASE DATABASE SCHEMA (100% Free Tier Ready)
-- =========================================================================

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT DEFAULT 'Competitive Exams',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  thumbnail TEXT,
  instructor_name TEXT,
  instructor_role TEXT,
  language TEXT DEFAULT 'Hinglish',
  duration TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Memberships / Enrollments Table (Access Control Paywall)
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- 4. Direct UPI Payments Table (UTR Verification Flow)
CREATE TABLE IF NOT EXISTS public.upi_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_email TEXT,
  course_id TEXT REFERENCES public.courses(id),
  course_title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  utr_number TEXT NOT NULL UNIQUE,
  upi_id_used TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT
);

-- 5. Lessons & YouTube Live Classes Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  is_live BOOLEAN DEFAULT false,
  scheduled_at TEXT,
  duration TEXT,
  chapter_number INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PDF Notes Table
CREATE TABLE IF NOT EXISTS public.pdf_notes (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size TEXT,
  page_count INT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Row Level Security (RLS) Policy Example
-- Only enrolled students or admins can view lessons and notes
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can view lessons"
ON public.lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memberships
    WHERE public.memberships.course_id = public.lessons.course_id
      AND public.memberships.user_id = auth.uid()
      AND public.memberships.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);
