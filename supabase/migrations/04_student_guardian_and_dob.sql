-- IDEAL COACHING CENTRE (ICC)
-- Migration 04: Add DOB and Guardian Details to Student Profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;

COMMENT ON COLUMN public.profiles.dob IS 'Student Date of Birth';
COMMENT ON COLUMN public.profiles.guardian_name IS 'Parent / Guardian Full Name';
COMMENT ON COLUMN public.profiles.guardian_phone IS 'Parent / Guardian 10-digit Mobile Number';
