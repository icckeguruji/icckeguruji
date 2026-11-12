# IDEAL COACHING CENTRE — QUALITY ASSURANCE & TESTING SUITE

## 1. Quality Assurance Matrix

### A. Authentication & Zero-SMS Verification
- [x] **Mobile Identifier Lookup**: Student inputs `9876543210` -> Backend normalizes to 10 digits -> Resolves registered email -> Generates Supabase Email OTP -> Delivers to student's inbox.
- [x] **Username Identifier Lookup**: Student inputs `rohit_kumar` -> Backend resolves to `rohit.kumar@example.com` -> Email OTP triggered.
- [x] **Email Identifier Lookup**: Student inputs `rohit.kumar@example.com` -> Direct Email OTP triggered.
- [x] **Zero SMS Check**: Verified that no SMS gateway or paid mobile OTP integration exists in the repository.
- [x] **Rate Limiting Check**: 5 rapid OTP requests within 10 minutes triggers cooldown response:
  *"कृपया 10 मिनट प्रतीक्षा करें। बहुत अधिक अनुरोध किए गए हैं।"*
- [x] **Account Enumeration Check**: Unrecognized identifiers return identical generic success messages, preventing user harvesting.

### B. Manual UPI Payment & Audit Logging
- [x] Student submits 12-digit UTR (`UPI412389012345`) and optional screenshot -> Stored with status `pending`.
- [x] Course access is NOT granted while status is `pending`.
- [x] Admin reviews bank statement -> Clicks "Approve" -> Status changes to `approved` -> Course validity set for 365 days -> `enrollments` row activated -> `payment_audit_logs` records admin user ID and timestamp.
- [x] Admin clicks "Reject" with remarks -> Status changes to `rejected` -> Course access remains blocked -> Student receives notification.

### C. Automatic PDF Assignment
- [x] Admin uploads PDF mapped to Board: BSEB, Class: 10, Subject: Science, Chapter: 1.
- [x] Student enrolled in "BSEB Class 10 Toppers Batch" immediately discovers the PDF under Notes tab without any manual admin action.
- [x] Student enrolled in "JAC Class 10 Batch" cannot access the BSEB PDF (blocked by RLS).
- [x] Direct storage bucket access is blocked; files accessible only via 15-minute signed URLs.

### D. Server-Side Examination Evaluation
- [x] Student starts timed MCQ exam (30 mins).
- [x] Client question payload excludes `correct_answer`.
- [x] Student selects answers -> Submits test -> Backend RPC `submit_and_evaluate_exam` evaluates choices -> Applies -0.25 negative marking for incorrect answer -> Returns final verified score (2/3 marks).
- [x] Scorecard displays question-by-question explanations in Hindi & English.

### E. Low-End Android Performance & Offline Reading
- [x] Downloaded PDFs cached in local SQLite database (`icc_offline_cache.db`).
- [x] App runs cleanly in offline mode for cached study materials.
- [x] Video streaming leverages official YouTube player without custom server load.
