# IDEAL COACHING CENTRE — DATABASE SCHEMA DOCUMENTATION

## Overview
The IDEAL COACHING CENTRE database runs on PostgreSQL (Supabase Free Tier) using strict Row Level Security (RLS), full schema normalization, UUID primary keys, and Indian localization standards for **BSEB** (Bihar Board) and **JAC** (Jharkhand Board).

---

## 1. Core Tables

### `academic_boards`
Restricted strictly to Bihar and Jharkhand state boards.
- `id` (UUID, PK)
- `code` (TEXT, UNIQUE, CHECK `code IN ('BSEB', 'JAC')`)
- `name` (TEXT)
- `name_hi` (TEXT)
- `description` (TEXT)
- `description_hi` (TEXT)
- `is_active` (BOOLEAN, DEFAULT true)

### `classes`
Standard state board classes.
- `id` (UUID, PK)
- `name` (TEXT) — e.g. "Class 10"
- `name_hi` (TEXT) — e.g. "कक्षा 10"
- `numeric_order` (INTEGER)

### `subjects`
- `id` (UUID, PK)
- `board_id` (UUID, FK -> `academic_boards.id`)
- `class_id` (UUID, FK -> `classes.id`)
- `name` (TEXT) — e.g. "Mathematics"
- `name_hi` (TEXT) — e.g. "गणित"
- `code` (TEXT) — e.g. "BSEB10-MATH"
- `icon_name` (TEXT)
- `display_order` (INTEGER)

### `chapters` & `topics`
Academic hierarchy for organizing syllabus, lectures, and study notes.
- `chapters`: `id`, `subject_id` (FK), `chapter_number`, `title`, `title_hi`, `description`, `description_hi`.
- `topics`: `id`, `chapter_id` (FK), `topic_number`, `title`, `title_hi`.

---

## 2. User & Security Tables

### `profiles`
Linked directly to `auth.users.id`.
- `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE)
- `username` (TEXT, UNIQUE)
- `full_name` (TEXT)
- `mobile_number` (TEXT, UNIQUE) — Indian 10-digit mobile format
- `email` (TEXT, UNIQUE) — Single destination for all login OTPs
- `board_code` (TEXT, CHECK `IN ('BSEB', 'JAC')`)
- `class_id` (UUID, FK -> `classes.id`)
- `district` (TEXT) — e.g. Patna, Ranchi, Gaya, Dhanbad, etc.
- `school_name` (TEXT, NULLABLE)
- `preferred_language` (TEXT, CHECK `IN ('hi', 'en')`, DEFAULT 'hi')
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN, DEFAULT true)

### `user_roles`
Separates role management from user authentication.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `auth.users.id` ON DELETE CASCADE)
- `role` (TEXT, CHECK `IN ('student', 'teacher', 'admin', 'super_admin')`)
- UNIQUE (`user_id`, `role`)

### `otp_rate_limits`
Internal server table protecting identifier lookup from enumeration and brute-force attacks.
- `identifier` (TEXT, PK) — normalized mobile, username, or email
- `request_count` (INTEGER, DEFAULT 1)
- `first_request_at` (TIMESTAMPTZ)
- `last_request_at` (TIMESTAMPTZ)
- `is_blocked` (BOOLEAN, DEFAULT false)

---

## 3. Course, Batch & Payment Tables

### `courses`
- `id` (UUID, PK)
- `title` / `title_hi` (TEXT)
- `description` / `description_hi` (TEXT)
- `thumbnail_url` (TEXT)
- `board_id` (UUID, FK -> `academic_boards.id`)
- `class_id` (UUID, FK -> `classes.id`)
- `session_id` (UUID, FK -> `academic_sessions.id`)
- `is_free` (BOOLEAN, DEFAULT false)
- `price` (NUMERIC, DEFAULT 0.00)
- `discount_price` (NUMERIC)
- `validity_days` (INTEGER, DEFAULT 365)
- `is_published` (BOOLEAN, DEFAULT true)

### `enrollments`
Course access source of truth.
- `id` (UUID, PK)
- `student_id` (UUID, FK -> `auth.users.id`)
- `course_id` (UUID, FK -> `courses.id`)
- `batch_id` (UUID, FK -> `batches.id`, NULLABLE)
- `status` (TEXT, CHECK `IN ('pending', 'active', 'expired', 'cancelled')`)
- `enrolled_at` (TIMESTAMPTZ)
- `valid_until` (TIMESTAMPTZ)
- UNIQUE (`student_id`, `course_id`)

### `payments` & `payment_audit_logs`
Manual UPI payment workflow without paid gateways.
- `payments`: `id`, `student_id`, `course_id`, `amount`, `upi_ref_number` (UNIQUE), `screenshot_url`, `status` (`pending`, `under_review`, `approved`, `rejected`, `refunded`), `admin_remarks`, `reviewed_by`, `reviewed_at`.
- `payment_audit_logs`: Immutable log containing `payment_id`, `admin_id`, `previous_status`, `new_status`, `remarks`, `created_at`.

---

## 4. Academic Delivery Tables

### `live_classes`
YouTube Live streaming integration (Zero server cost).
- `id` (UUID, PK)
- `course_id`, `batch_id`, `teacher_id`, `subject_id`, `chapter_id` (FKs)
- `title` / `title_hi`
- `youtube_video_id` (TEXT) — YouTube Live stream ID
- `scheduled_at` (TIMESTAMPTZ)
- `duration_minutes` (INTEGER)
- `status` (`scheduled`, `live`, `completed`, `cancelled`)

### `study_materials` (Automatic PDF Assignment)
- `id` (UUID, PK)
- `board_id`, `class_id`, `subject_id`, `chapter_id`, `topic_id`
- `title` / `title_hi`
- `file_path` (TEXT) — Private bucket key in `study-materials`
- `file_size_bytes` (BIGINT)
- `material_type` (`chapter_notes`, `topic_notes`, `revision_notes`, `worksheet`, `pyq`, `formula_sheet`, `answer_key`)
- `is_free` (BOOLEAN)
- `version` (INTEGER)

### `examinations` & `questions`
Server-evaluated online test platform.
- `examinations`: `id`, `course_id`, `title`, `duration_minutes`, `total_marks`, `pass_marks`, `negative_marking`, `exam_type`, `is_published`.
- `questions`: `id`, `exam_id`, `question_text`, `question_text_hi`, `question_type` (`single_choice`, `multiple_choice`, `true_false`), `options` (JSONB), `correct_answer` (JSONB), `explanation`, `explanation_hi`, `marks`.
- `exam_attempts` & `exam_answers`: Stores student submissions with server-side calculated scores.
