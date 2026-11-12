# IDEAL COACHING CENTRE — SECURITY SPECIFICATION & AUDIT

## 1. Zero-Trust Security Architecture
IDEAL COACHING CENTRE enforces strict security across all endpoints. Client applications (Android Student App, Public Website, Teacher Dashboard, Admin Dashboard) are never trusted for:
- Role assignments (`student`, `teacher`, `admin`, `super_admin`)
- Payment approvals or course activation
- Examination evaluations and mark calculations
- Access to private PDF documents

---

## 2. Identifier Resolution & Account Enumeration Defense
Students log in by entering their **Mobile Number, Username, or Email Address**.
- **No SMS Gateways**: Under the Strict Zero-Paid-Service Policy, SMS OTP is completely forbidden.
- **Email-Only Delivery**: Regardless of whether the student enters a mobile number, username, or email, the 6-digit OTP is delivered **strictly to their registered email address**.
- **Defense Against Account Harvesting**:
  The PostgreSQL function `resolve_identifier_for_auth` is marked `SECURITY DEFINER` and its execution is restricted strictly to the service role.
  When an identifier is submitted:
  - If the account does not exist, the API returns a generic message:
    `{"success": true, "message": "यदि यह खाता पंजीकृत है, तो ओटीपी ईमेल पर भेजा गया है।"}`
  - If the account does exist, the email address is masked (e.g. `r****r@example.com`) so that the student knows which inbox to open, while preventing third parties from scraping email addresses.
  - Rate limiting is enforced via `otp_rate_limits` table: maximum 5 requests per 10-minute window per identifier.

---

## 3. Row-Level Security (RLS) Matrix

| Table | Anonymous Access | Student Access | Teacher Access | Admin Access |
| :--- | :--- | :--- | :--- | :--- |
| `academic_boards` | SELECT | SELECT | SELECT | ALL (Write) |
| `classes` & `subjects` | SELECT | SELECT | SELECT | ALL (Write) |
| `courses` | SELECT (Published) | SELECT (Published) | SELECT | ALL (Write) |
| `profiles` | NONE | SELECT/UPDATE (Own) | SELECT (Enrolled) | ALL (Write) |
| `user_roles` | NONE | SELECT (Own) | SELECT (Own) | ALL (Write) |
| `enrollments` | NONE | SELECT (Own) | SELECT (Assigned) | ALL (Write) |
| `payments` | NONE | SELECT/INSERT (Own) | NONE | ALL (Approve/Reject) |
| `payment_audit_logs` | NONE | NONE | NONE | SELECT (Audit Trail) |
| `study_materials` | SELECT (If Free) | SELECT (If Enrolled) | SELECT/INSERT | ALL (Write) |
| `live_classes` | NONE | SELECT (If Enrolled) | SELECT/INSERT | ALL (Write) |
| `recorded_lectures` | SELECT (If Preview) | SELECT (If Enrolled) | SELECT/INSERT | ALL (Write) |
| `examinations` | NONE | SELECT (Published) | SELECT/INSERT | ALL (Write) |
| `questions` | NONE | SELECT (Active Exam) | SELECT/INSERT | ALL (Write) |
| `exam_attempts` | NONE | SELECT/INSERT (Own) | SELECT | ALL (Write) |
| `assignment_submissions` | NONE | SELECT/INSERT (Own) | ALL (Grading) | ALL (Write) |

---

## 4. Automatic PDF Assignment Security
Study materials are stored in a **Private Supabase Storage Bucket** (`study-materials`).
- Direct public URLs are disabled.
- Short-lived signed URLs (15 minutes expiry) are generated only after confirming that:
  ```sql
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = auth.uid()
      AND e.status = 'active'
      AND e.valid_until >= now()
      AND c.board_id = study_materials.board_id
      AND c.class_id = study_materials.class_id
  ) OR study_materials.is_free = true
  ```
- This ensures that when an admin uploads a PDF mapped to BSEB Class 10 Science, any student enrolled in a BSEB Class 10 course gains access automatically, while students from other boards or expired subscriptions are blocked.

---

## 5. Server-Side Examination Integrity
To prevent client-side answer inspection and cheating:
1. `questions.correct_answer` is never transmitted to the mobile client during an active examination session.
2. The student's answers are submitted to `submit_and_evaluate_exam` PostgreSQL function.
3. The server computes the score, checks for single choice, multiple choice, and true/false, applies negative marking (e.g. -0.25 per incorrect answer), and commits the result in a single atomic transaction.
