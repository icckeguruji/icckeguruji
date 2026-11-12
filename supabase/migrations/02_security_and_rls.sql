-- ==============================================================================
-- IDEAL COACHING CENTRE — ROW LEVEL SECURITY & AUTHORIZATION
-- Enforces Zero-Trust Security, Automatic PDF Assignment & Role Isolation
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.academic_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- HELPER FUNCTIONS FOR RLS CHECKS (SECURITY DEFINER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'teacher' THEN 3
      ELSE 4
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_active_enrollment(target_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE student_id = auth.uid()
      AND course_id = target_course_id
      AND status = 'active'
      AND valid_until >= now()
  );
$$;

-- AUTOMATIC PDF PERMISSION CHECK:
-- Grants access if material is free OR student has an active enrollment in a course
-- matching the material's board and class.
CREATE OR REPLACE FUNCTION public.can_access_material(mat_board_id UUID, mat_class_id UUID, mat_is_free BOOLEAN)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    mat_is_free = true
    OR public.is_admin()
    OR public.is_teacher()
    OR EXISTS (
      SELECT 1 
      FROM public.enrollments e
      JOIN public.courses c ON e.course_id = c.id
      WHERE e.student_id = auth.uid()
        AND e.status = 'active'
        AND e.valid_until >= now()
        AND c.board_id = mat_board_id
        AND c.class_id = mat_class_id
    )
  );
$$;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- 1. Academic Structures (Boards, Sessions, Classes, Subjects, Chapters, Topics)
-- Read: Everyone (Anonymous and Authenticated)
-- Write: Admins only
CREATE POLICY "Public read academic boards" ON public.academic_boards FOR SELECT USING (true);
CREATE POLICY "Admin write academic boards" ON public.academic_boards FOR ALL USING (public.is_admin());

CREATE POLICY "Public read academic sessions" ON public.academic_sessions FOR SELECT USING (true);
CREATE POLICY "Admin write academic sessions" ON public.academic_sessions FOR ALL USING (public.is_admin());

CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admin write classes" ON public.classes FOR ALL USING (public.is_admin());

CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admin write subjects" ON public.subjects FOR ALL USING (public.is_admin());

CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admin write chapters" ON public.chapters FOR ALL USING (public.is_admin());

CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Admin write topics" ON public.topics FOR ALL USING (public.is_admin());

-- 2. Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin() OR public.is_teacher());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin full manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- 3. User Roles
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- 4. Teachers
CREATE POLICY "Public read active teachers" ON public.teachers FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin manage teachers" ON public.teachers FOR ALL USING (public.is_admin());
CREATE POLICY "Teacher update own profile" ON public.teachers FOR UPDATE USING (user_id = auth.uid());

-- 5. Courses and Course Subjects
CREATE POLICY "Public read published courses" ON public.courses FOR SELECT USING (is_published = true OR public.is_admin() OR public.is_teacher());
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL USING (public.is_admin());

CREATE POLICY "Public read course subjects" ON public.course_subjects FOR SELECT USING (true);
CREATE POLICY "Admin manage course subjects" ON public.course_subjects FOR ALL USING (public.is_admin());

-- 6. Batches & Batch Students
CREATE POLICY "Read batches" ON public.batches FOR SELECT USING (
    is_active = true OR public.is_admin() OR public.is_teacher()
);
CREATE POLICY "Admin manage batches" ON public.batches FOR ALL USING (public.is_admin());

CREATE POLICY "Read batch students" ON public.batch_students FOR SELECT USING (
    student_id = auth.uid() OR public.is_admin() OR public.is_teacher()
);
CREATE POLICY "Admin manage batch students" ON public.batch_students FOR ALL USING (public.is_admin());

-- 7. Enrollments
CREATE POLICY "Students read own enrollments" ON public.enrollments FOR SELECT USING (student_id = auth.uid() OR public.is_admin() OR public.is_teacher());
CREATE POLICY "Admin manage enrollments" ON public.enrollments FOR ALL USING (public.is_admin());

-- 8. Payments & Payment Audit Logs
CREATE POLICY "Students read own payments" ON public.payments FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students insert own payments" ON public.payments FOR INSERT WITH CHECK (student_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL USING (public.is_admin());

CREATE POLICY "Admin read payment audit logs" ON public.payment_audit_logs FOR SELECT USING (public.is_admin());

-- 9. Live Classes & Attendance
CREATE POLICY "Students read live classes" ON public.live_classes FOR SELECT USING (
    public.is_admin() 
    OR public.is_teacher() 
    OR public.has_active_enrollment(course_id)
);
CREATE POLICY "Admin/Teacher manage live classes" ON public.live_classes FOR ALL USING (public.is_admin() OR public.is_teacher());

CREATE POLICY "Students manage own attendance" ON public.class_attendance FOR ALL USING (student_id = auth.uid() OR public.is_admin());

-- 10. Recorded Lectures & Progress
CREATE POLICY "Read recorded lectures" ON public.recorded_lectures FOR SELECT USING (
    is_free_preview = true
    OR public.is_admin()
    OR public.is_teacher()
    OR public.has_active_enrollment(course_id)
);
CREATE POLICY "Admin/Teacher manage recorded lectures" ON public.recorded_lectures FOR ALL USING (public.is_admin() OR public.is_teacher());

CREATE POLICY "Students manage own lecture progress" ON public.lecture_progress FOR ALL USING (student_id = auth.uid() OR public.is_admin());

-- 11. Study Materials (AUTOMATIC ASSIGNMENT POLICY)
CREATE POLICY "Automatic study material access" ON public.study_materials FOR SELECT USING (
    public.can_access_material(board_id, class_id, is_free)
);
CREATE POLICY "Admin/Teacher manage study materials" ON public.study_materials FOR ALL USING (public.is_admin() OR public.is_teacher());

-- 12. Bookmarks
CREATE POLICY "Students manage bookmarks" ON public.bookmarks FOR ALL USING (student_id = auth.uid());

-- 13. Examinations & Questions
CREATE POLICY "Read published examinations" ON public.examinations FOR SELECT USING (
    public.is_admin() 
    OR public.is_teacher() 
    OR (is_published = true AND public.has_active_enrollment(course_id))
);
CREATE POLICY "Admin/Teacher manage examinations" ON public.examinations FOR ALL USING (public.is_admin() OR public.is_teacher());

-- Questions: Accessible during active exam or to admin/teacher.
CREATE POLICY "Read exam questions" ON public.questions FOR SELECT USING (
    public.is_admin() 
    OR public.is_teacher() 
    OR EXISTS (
        SELECT 1 FROM public.examinations e
        WHERE e.id = questions.exam_id
          AND e.is_published = true
          AND public.has_active_enrollment(e.course_id)
    )
);
CREATE POLICY "Admin/Teacher manage questions" ON public.questions FOR ALL USING (public.is_admin() OR public.is_teacher());

-- 14. Exam Attempts & Answers
CREATE POLICY "Students manage own exam attempts" ON public.exam_attempts FOR ALL USING (
    student_id = auth.uid() OR public.is_admin() OR public.is_teacher()
);

CREATE POLICY "Students manage own exam answers" ON public.exam_answers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.exam_attempts a
        WHERE a.id = exam_answers.attempt_id
          AND (a.student_id = auth.uid() OR public.is_admin() OR public.is_teacher())
    )
);

-- 15. Assignments & Submissions
CREATE POLICY "Students read assignments" ON public.assignments FOR SELECT USING (
    public.is_admin() OR public.is_teacher() OR public.has_active_enrollment(course_id)
);
CREATE POLICY "Admin/Teacher manage assignments" ON public.assignments FOR ALL USING (public.is_admin() OR public.is_teacher());

CREATE POLICY "Students manage own submissions" ON public.assignment_submissions FOR ALL USING (
    student_id = auth.uid() OR public.is_admin() OR public.is_teacher()
);

-- 16. Notifications & Announcements
CREATE POLICY "Read notifications" ON public.notifications FOR SELECT USING (
    user_id = auth.uid() OR user_id IS NULL OR public.is_admin()
);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin manage notifications" ON public.notifications FOR ALL USING (public.is_admin());

CREATE POLICY "Read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin/Teacher manage announcements" ON public.announcements FOR ALL USING (public.is_admin() OR public.is_teacher());

-- 17. Doubts & Support
CREATE POLICY "Students manage own doubts" ON public.doubts FOR ALL USING (
    student_id = auth.uid() OR public.is_admin() OR public.is_teacher()
);

CREATE POLICY "Students manage own support tickets" ON public.support_tickets FOR ALL USING (
    student_id = auth.uid() OR public.is_admin()
);

-- 18. Admin Activity Logs
CREATE POLICY "Admin read activity logs" ON public.admin_activity_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin insert activity logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (public.is_admin());

-- 19. Platform Settings
CREATE POLICY "Public read platform settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage platform settings" ON public.platform_settings FOR ALL USING (public.is_admin());

-- 20. OTP Rate Limits (Internal only - no public access)
CREATE POLICY "Admin read rate limits" ON public.otp_rate_limits FOR SELECT USING (public.is_admin());
