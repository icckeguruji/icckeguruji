-- ==============================================================================
-- IDEAL COACHING CENTRE — BUSINESS LOGIC, FUNCTIONS & TRIGGERS
-- Server-Side Verification, Payment Approval, Exam Evaluation & Auto-Enrolls
-- ==============================================================================

-- ==============================================================================
-- 1. IDENTIFIER RESOLUTION & SECURE LOOKUP
-- ==============================================================================

-- Normalizes mobile, username, or email
CREATE OR REPLACE FUNCTION public.normalize_identifier(raw_input TEXT)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    cleaned TEXT;
    ret RECORD;
BEGIN
    cleaned := TRIM(raw_input);
    
    -- Check if Email
    IF cleaned LIKE '%@%' THEN
        SELECT 'email' AS id_type, LOWER(cleaned) AS normalized_val INTO ret;
        RETURN ret;
    END IF;

    -- Check if Indian Mobile Number (10 digits, +91, or leading 0)
    cleaned := REGEXP_REPLACE(cleaned, '[^0-9]', '', 'g');
    IF LENGTH(cleaned) = 12 AND cleaned LIKE '91%' THEN
        cleaned := SUBSTRING(cleaned FROM 3);
    ELSIF LENGTH(cleaned) = 11 AND cleaned LIKE '0%' THEN
        cleaned := SUBSTRING(cleaned FROM 2);
    END IF;

    IF LENGTH(cleaned) = 10 THEN
        SELECT 'mobile' AS id_type, cleaned AS normalized_val INTO ret;
        RETURN ret;
    END IF;

    -- Otherwise treat as Username
    SELECT 'username' AS id_type, LOWER(TRIM(raw_input)) AS normalized_val INTO ret;
    RETURN ret;
END;
$$;

-- Masks email for student confirmation without privacy leakage (e.g. s****k@gmail.com)
CREATE OR REPLACE FUNCTION public.mask_email(email_addr TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts TEXT[];
    local_part TEXT;
    domain_part TEXT;
    len INT;
BEGIN
    IF email_addr IS NULL OR email_addr NOT LIKE '%@%' THEN
        RETURN '****@****.com';
    END IF;
    
    parts := STRING_TO_ARRAY(email_addr, '@');
    local_part := parts[1];
    domain_part := parts[2];
    len := LENGTH(local_part);

    IF len <= 2 THEN
        RETURN SUBSTRING(local_part FROM 1 FOR 1) || '****@' || domain_part;
    ELSE
        RETURN SUBSTRING(local_part FROM 1 FOR 1) || '****' || SUBSTRING(local_part FROM len FOR 1) || '@' || domain_part;
    END IF;
END;
$$;

-- Secure Identifier Resolver (Called by Edge Function or Secure API)
-- NEVER exposes user lists or raw emails to unauthenticated clients
CREATE OR REPLACE FUNCTION public.resolve_identifier_for_auth(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_norm RECORD;
    v_profile RECORD;
    v_rate RECORD;
    v_masked_email TEXT;
BEGIN
    v_norm := public.normalize_identifier(p_identifier);

    -- 1. Check & Enforce Rate Limits (Max 5 attempts per 10 mins per identifier)
    SELECT * INTO v_rate FROM public.otp_rate_limits WHERE identifier = v_norm.normalized_val;
    IF FOUND THEN
        IF v_rate.last_request_at > (now() - INTERVAL '10 minutes') AND v_rate.request_count >= 5 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'RATE_LIMITED',
                'message', 'कृपया 10 मिनट प्रतीक्षा करें। बहुत अधिक अनुरोध किए गए हैं। (Too many attempts. Please wait 10 minutes.)'
            );
        END IF;

        IF v_rate.last_request_at <= (now() - INTERVAL '10 minutes') THEN
            UPDATE public.otp_rate_limits
            SET request_count = 1, first_request_at = now(), last_request_at = now()
            WHERE identifier = v_norm.normalized_val;
        ELSE
            UPDATE public.otp_rate_limits
            SET request_count = request_count + 1, last_request_at = now()
            WHERE identifier = v_norm.normalized_val;
        END IF;
    ELSE
        INSERT INTO public.otp_rate_limits (identifier, request_count)
        VALUES (v_norm.normalized_val, 1);
    END IF;

    -- 2. Query user profile safely
    IF v_norm.id_type = 'mobile' THEN
        SELECT id, email, username, is_active INTO v_profile FROM public.profiles WHERE mobile_number = v_norm.normalized_val;
    ELSIF v_norm.id_type = 'username' THEN
        SELECT id, email, username, is_active INTO v_profile FROM public.profiles WHERE username = v_norm.normalized_val;
    ELSE
        SELECT id, email, username, is_active INTO v_profile FROM public.profiles WHERE LOWER(email) = v_norm.normalized_val;
    END IF;

    IF NOT FOUND THEN
        -- Generic message prevents account enumeration
        RETURN jsonb_build_object(
            'success', true,
            'user_exists', false,
            'message', 'यदि यह खाता मौजूद है, तो ओटीपी पंजीकृत ईमेल पर भेजा गया है।'
        );
    END IF;

    IF v_profile.is_active = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ACCOUNT_DEACTIVATED',
            'message', 'आपका खाता निष्क्रिय है। कृपया कोचिंग प्रशासन से संपर्क करें। (Account deactivated. Contact administration.)'
        );
    END IF;

    v_masked_email := public.mask_email(v_profile.email);

    -- Return resolved data for server/edge function to dispatch Supabase Auth Email OTP
    RETURN jsonb_build_object(
        'success', true,
        'user_exists', true,
        'user_id', v_profile.id,
        'email', v_profile.email, -- Handled only server-side by Edge Function
        'masked_email', v_masked_email,
        'identifier_type', v_norm.id_type,
        'message', 'ओटीपी आपके पंजीकृत ईमेल पर भेजा गया है: ' || v_masked_email
    );
END;
$$;

-- Revoke public execution of raw resolver; grant only to service role & postgres
REVOKE EXECUTE ON FUNCTION public.resolve_identifier_for_auth(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.resolve_identifier_for_auth(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_identifier_for_auth(TEXT) TO postgres;

-- ==============================================================================
-- 2. MANUAL UPI PAYMENT APPROVAL & ENROLLMENT ACTIVATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_approve_payment(
    p_payment_id UUID,
    p_admin_remarks TEXT DEFAULT 'Payment verified and enrollment approved'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_payment RECORD;
    v_course RECORD;
    v_valid_until TIMESTAMPTZ;
BEGIN
    -- Verify caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can approve payments.';
    END IF;

    -- Fetch payment
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found.';
    END IF;

    IF v_payment.status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Payment is already approved.');
    END IF;

    -- Fetch course validity
    SELECT * INTO v_course FROM public.courses WHERE id = v_payment.course_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated course not found.';
    END IF;

    v_valid_until := now() + (COALESCE(v_course.validity_days, 365) || ' days')::INTERVAL;

    -- 1. Update Payment status
    UPDATE public.payments
    SET status = 'approved',
        admin_remarks = p_admin_remarks,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_payment_id;

    -- 2. Insert or Activate Enrollment
    INSERT INTO public.enrollments (
        student_id,
        course_id,
        status,
        enrolled_at,
        valid_until
    )
    VALUES (
        v_payment.student_id,
        v_payment.course_id,
        'active',
        now(),
        v_valid_until
    )
    ON CONFLICT (student_id, course_id)
    DO UPDATE SET
        status = 'active',
        valid_until = GREATEST(enrollments.valid_until, v_valid_until);

    -- 3. Write immutable audit log
    INSERT INTO public.payment_audit_logs (
        payment_id,
        admin_id,
        previous_status,
        new_status,
        remarks
    )
    VALUES (
        p_payment_id,
        auth.uid(),
        v_payment.status,
        'approved',
        p_admin_remarks
    );

    -- 4. Send student notification
    INSERT INTO public.notifications (
        user_id,
        title,
        title_hi,
        message,
        message_hi,
        link
    )
    VALUES (
        v_payment.student_id,
        'Payment Approved!',
        'भुगतान स्वीकृत!',
        'Your payment for ' || v_course.title || ' has been approved. You now have full access.',
        'आपके कोर्स ' || v_course.title_hi || ' का भुगतान स्वीकृत हो गया है। अध्ययन प्रारंभ करें।',
        '/courses/' || v_course.id
    );

    RETURN jsonb_build_object('success', true, 'message', 'Payment approved and enrollment activated.');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_payment(
    p_payment_id UUID,
    p_admin_remarks TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_payment RECORD;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can reject payments.';
    END IF;

    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found.';
    END IF;

    UPDATE public.payments
    SET status = 'rejected',
        admin_remarks = p_admin_remarks,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_payment_id;

    INSERT INTO public.payment_audit_logs (
        payment_id,
        admin_id,
        previous_status,
        new_status,
        remarks
    )
    VALUES (
        p_payment_id,
        auth.uid(),
        v_payment.status,
        'rejected',
        p_admin_remarks
    );

    INSERT INTO public.notifications (
        user_id,
        title,
        title_hi,
        message,
        message_hi
    )
    VALUES (
        v_payment.student_id,
        'Payment Verification Rejected',
        'भुगतान सत्यापन अस्वीकृत',
        'Your payment reference could not be verified: ' || p_admin_remarks,
        'आपका भुगतान सत्यापित नहीं हो सका: ' || p_admin_remarks
    );

    RETURN jsonb_build_object('success', true, 'message', 'Payment rejected.');
END;
$$;

-- ==============================================================================
-- 3. SERVER-SIDE EXAMINATION EVALUATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_and_evaluate_exam(
    p_attempt_id UUID,
    p_answers JSONB -- Array of { question_id: UUID, selected_answer: JSONB }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_attempt RECORD;
    v_exam RECORD;
    v_answer_item JSONB;
    v_qid UUID;
    v_selected JSONB;
    v_question RECORD;
    v_is_correct BOOLEAN;
    v_item_marks NUMERIC(5, 2);
    v_total_score NUMERIC(6, 2) := 0.00;
    v_is_passed BOOLEAN := false;
BEGIN
    -- Verify attempt belongs to current user
    SELECT * INTO v_attempt FROM public.exam_attempts WHERE id = p_attempt_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exam attempt not found.';
    END IF;

    IF v_attempt.student_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized attempt submission.';
    END IF;

    IF v_attempt.status = 'evaluated' THEN
        RETURN jsonb_build_object('success', false, 'message', 'This attempt has already been evaluated.');
    END IF;

    SELECT * INTO v_exam FROM public.examinations WHERE id = v_attempt.exam_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exam not found.';
    END IF;

    -- Process each answer
    FOR v_answer_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_qid := (v_answer_item->>'question_id')::UUID;
        v_selected := v_answer_item->'selected_answer';

        SELECT * INTO v_question FROM public.questions WHERE id = v_qid AND exam_id = v_exam.id;
        IF FOUND THEN
            -- Check answer equality
            -- For single_choice and true_false: options match exact value
            -- For multiple_choice: json arrays match
            IF v_question.correct_answer = v_selected THEN
                v_is_correct := true;
                v_item_marks := v_question.marks;
                v_total_score := v_total_score + v_item_marks;
            ELSIF v_selected IS NOT NULL AND v_selected <> 'null'::jsonb AND v_selected <> '[]'::jsonb THEN
                v_is_correct := false;
                v_item_marks := -1.0 * COALESCE(v_exam.negative_marking, 0.00);
                v_total_score := v_total_score + v_item_marks;
            ELSE
                v_is_correct := NULL;
                v_item_marks := 0.00;
            END IF;

            -- Record individual answer
            INSERT INTO public.exam_answers (
                attempt_id,
                question_id,
                selected_answer,
                is_correct,
                marks_awarded
            )
            VALUES (
                p_attempt_id,
                v_qid,
                v_selected,
                v_is_correct,
                v_item_marks
            )
            ON CONFLICT (attempt_id, question_id)
            DO UPDATE SET
                selected_answer = v_selected,
                is_correct = v_is_correct,
                marks_awarded = v_item_marks;
        END IF;
    END LOOP;

    -- Ensure score does not drop below 0
    IF v_total_score < 0 THEN
        v_total_score := 0.00;
    END IF;

    v_is_passed := (v_total_score >= v_exam.pass_marks);

    -- Update attempt status
    UPDATE public.exam_attempts
    SET score = v_total_score,
        submit_time = now(),
        is_passed = v_is_passed,
        status = 'evaluated'
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'score', v_total_score,
        'total_marks', v_exam.total_marks,
        'is_passed', v_is_passed,
        'pass_marks', v_exam.pass_marks
    );
END;
$$;

-- ==============================================================================
-- 4. PROFILE AUTO-CREATION TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_raw_meta JSONB;
    v_username TEXT;
    v_full_name TEXT;
    v_mobile TEXT;
    v_board TEXT;
    v_district TEXT;
    v_class_id UUID;
    v_pref_lang TEXT;
BEGIN
    v_raw_meta := NEW.raw_user_meta_data;
    
    v_username := COALESCE(v_raw_meta->>'username', 'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    v_full_name := COALESCE(v_raw_meta->>'full_name', 'Student');
    v_mobile := COALESCE(v_raw_meta->>'mobile_number', '0000000000');
    v_board := COALESCE(v_raw_meta->>'board_code', 'BSEB');
    v_district := COALESCE(v_raw_meta->>'district', 'Patna');
    v_pref_lang := COALESCE(v_raw_meta->>'preferred_language', 'hi');

    -- Insert profile
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        mobile_number,
        email,
        board_code,
        district,
        preferred_language
    )
    VALUES (
        NEW.id,
        v_username,
        v_full_name,
        v_mobile,
        NEW.email,
        v_board,
        v_district,
        v_pref_lang
    )
    ON CONFLICT (id) DO NOTHING;

    -- Assign default student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
