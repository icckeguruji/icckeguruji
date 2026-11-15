-- ==============================================================================
-- IDEAL COACHING CENTRE (ICC) - PRODUCTION MASTER SCHEMA & REPAIRS
-- Migration: 06_production_master_schema.sql
-- Director: BADE SIR | Location: Sarotiya, Mahagama, Godda, Jharkhand
-- Education Boards: Strictly BSEB & JAC only
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean, bulletproof 3-way Identifier Resolution RPC
-- Allows login using:
--   a) 10-digit Mobile Number (with or without +91 / 0)
--   b) Username (case-insensitive)
--   c) Email Address
CREATE OR REPLACE FUNCTION public.get_email_by_identifier(p_identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_clean TEXT;
    v_digits TEXT;
    v_email TEXT;
BEGIN
    IF p_identifier IS NULL OR trim(p_identifier) = '' THEN
        RETURN NULL;
    END IF;

    v_clean := trim(p_identifier);

    -- 1. If it contains '@', it is already an email
    IF v_clean LIKE '%@%' THEN
        RETURN lower(v_clean);
    END IF;

    -- Extract pure digits
    v_digits := regexp_replace(v_clean, '\D', '', 'g');

    -- 2. Try match by mobile number (last 10 digits)
    IF length(v_digits) >= 10 THEN
        v_digits := right(v_digits, 10);
        SELECT email INTO v_email
        FROM public.profiles
        WHERE right(regexp_replace(coalesce(mobile_number, ''), '\D', '', 'g'), 10) = v_digits
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_email IS NOT NULL THEN
            RETURN v_email;
        END IF;

        -- Also check teachers table
        SELECT email INTO v_email
        FROM public.teachers
        WHERE right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10) = v_digits
        LIMIT 1;

        IF v_email IS NOT NULL THEN
            RETURN v_email;
        END IF;
    END IF;

    -- 3. Try match by username (case-insensitive)
    SELECT email INTO v_email
    FROM public.profiles
    WHERE lower(username) = lower(v_clean)
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_email IS NOT NULL THEN
        RETURN v_email;
    END IF;

    -- 4. Check platform hardcoded admin fallback if applicable
    IF lower(v_clean) = 'admin' OR v_digits = '9771350910' THEN
        RETURN 'icckeguruji@gmail.com';
    END IF;

    RETURN NULL;
END;
$$;

-- Alias for backwards compatibility with existing calls
CREATE OR REPLACE FUNCTION public.get_email_by_phone(phone_number TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.get_email_by_identifier(phone_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_identifier(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(TEXT) TO anon, authenticated;

-- 3. Ensure profiles table has all necessary fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS board_code TEXT DEFAULT 'BSEB';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Create index on username and mobile_number for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(lower(username));
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(lower(email));

-- 4. Ensure payments table has all columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utr_number TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS admin_remarks TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_phone TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS course_title TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_utr ON public.payments(upper(utr_number));
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 5. Ensure enrollments table has all columns
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- 6. RPC: Admin Approve Payment
-- Atomically:
--   1. Updates payment status to 'approved'
--   2. Sets reviewed_at timestamp
--   3. Activates student profile (is_active = true)
--   4. Activates enrollment (status = 'active')
--   5. Inserts a push/app notification for the student
CREATE OR REPLACE FUNCTION public.admin_approve_payment(p_payment_id UUID, p_admin_remarks TEXT DEFAULT 'Payment verified with bank statement')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_pay RECORD;
BEGIN
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment record not found');
    END IF;

    -- Update payment
    UPDATE public.payments
    SET status = 'approved',
        admin_remarks = p_admin_remarks,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- Activate student profile
    IF v_pay.student_id IS NOT NULL THEN
        UPDATE public.profiles
        SET is_active = true,
            updated_at = NOW()
        WHERE id = v_pay.student_id;

        -- Activate course enrollment
        UPDATE public.enrollments
        SET status = 'active'
        WHERE student_id = v_pay.student_id
          AND (course_id = v_pay.course_id OR v_pay.course_id IS NULL);

        -- If no enrollment existed, insert one
        IF NOT FOUND AND v_pay.course_id IS NOT NULL THEN
            INSERT INTO public.enrollments (student_id, course_id, status, enrolled_at)
            VALUES (v_pay.student_id, v_pay.course_id, 'active', NOW());
        END IF;

        -- Create congratulatory notification
        INSERT INTO public.notifications (user_id, title, message, type, is_read, created_at)
        VALUES (
            v_pay.student_id,
            'Enrollment Approved! 🎓',
            coalesce('Welcome to IDEAL COACHING CENTRE! Your enrollment has been verified by Director BADE SIR. You now have full access to classes and notes.', p_admin_remarks),
            'enrollment_approved',
            false,
            NOW()
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Payment approved and student account activated successfully.');
END;
$$;

-- 7. RPC: Admin Reject Payment
-- Rejects payment and purges pending profile so student can re-enroll cleanly with same phone/email
CREATE OR REPLACE FUNCTION public.admin_reject_payment(p_payment_id UUID, p_admin_remarks TEXT DEFAULT 'Invalid transaction reference')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_pay RECORD;
BEGIN
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment record not found');
    END IF;

    -- Mark payment rejected
    UPDATE public.payments
    SET status = 'rejected',
        admin_remarks = p_admin_remarks,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- Reject enrollment
    IF v_pay.student_id IS NOT NULL THEN
        UPDATE public.enrollments
        SET status = 'rejected'
        WHERE student_id = v_pay.student_id AND course_id = v_pay.course_id;

        -- If profile was still pending (not active), remove it so the student can re-enroll cleanly
        DELETE FROM public.profiles
        WHERE id = v_pay.student_id AND is_active = false;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Payment rejected. Student may re-enroll with the correct UTR.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_approve_payment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_payment(UUID, TEXT) TO authenticated;

-- 8. Safe Row Level Security (RLS) Grants
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read of published courses
CREATE POLICY "Public read published courses" ON public.courses
    FOR SELECT TO public USING (is_published = true);

-- Allow public read of active batches
CREATE POLICY "Public read active batches" ON public.batches
    FOR SELECT TO public USING (is_active = true);

-- Allow student enrollment creation (anon or authenticated)
CREATE POLICY "Allow anon insert pending profiles for enrollment" ON public.profiles
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon insert pending payments" ON public.payments
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon insert pending enrollments" ON public.enrollments
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow users to read and update their own profile
CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow students to read their own payments and enrollments
CREATE POLICY "Students read own payments" ON public.payments
    FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students read own enrollments" ON public.enrollments
    FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students read own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
