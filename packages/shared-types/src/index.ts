// IDEAL COACHING CENTRE — SHARED TYPE DEFINITIONS

export type BoardCode = 'BSEB' | 'JAC';
export type AppLanguage = 'hi' | 'en';
export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin';

export interface AcademicBoard {
  id: string;
  code: BoardCode;
  name: string;
  name_hi: string;
  description?: string;
  description_hi?: string;
  is_active: boolean;
  created_at: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  name_hi: string;
  numeric_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SubjectItem {
  id: string;
  board_id: string;
  class_id: string;
  name: string;
  name_hi: string;
  code: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ChapterItem {
  id: string;
  subject_id: string;
  chapter_number: number;
  title: string;
  title_hi: string;
  description?: string;
  description_hi?: string;
  display_order: number;
  created_at: string;
}

export interface TopicItem {
  id: string;
  chapter_id: string;
  topic_number: number;
  title: string;
  title_hi: string;
  display_order: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  mobile_number: string;
  email: string;
  board_code: BoardCode;
  class_id?: string;
  district: string;
  school_name?: string;
  preferred_language: AppLanguage;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_hi?: string;
  qualification?: string;
  bio?: string;
  bio_hi?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  title_hi: string;
  description?: string;
  description_hi?: string;
  thumbnail_url?: string;
  board_id: string;
  class_id: string;
  session_id?: string;
  is_free: boolean;
  price: number;
  discount_price?: number;
  validity_days: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  board?: AcademicBoard;
  class?: ClassItem;
  subjects?: SubjectItem[];
  lecture_count?: number;
  material_count?: number;
}

export interface Batch {
  id: string;
  course_id: string;
  teacher_id?: string;
  name: string;
  name_hi?: string;
  schedule_info?: string;
  start_date?: string;
  is_active: boolean;
  created_at: string;
  teacher?: TeacherProfile;
}

export type EnrollmentStatus = 'pending' | 'active' | 'expired' | 'cancelled';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  batch_id?: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  valid_until: string;
  course?: Course;
}

export type PaymentStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'refunded';

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  upi_ref_number: string;
  screenshot_url?: string;
  status: PaymentStatus;
  admin_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  student?: UserProfile;
  course?: Course;
}

export type MaterialType =
  | 'chapter_notes'
  | 'topic_notes'
  | 'revision_notes'
  | 'worksheet'
  | 'pyq'
  | 'formula_sheet'
  | 'answer_key';

export interface StudyMaterial {
  id: string;
  board_id: string;
  class_id: string;
  subject_id: string;
  chapter_id: string;
  topic_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  file_path: string;
  file_size_bytes: number;
  material_type: MaterialType;
  is_free: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  subject?: SubjectItem;
  chapter?: ChapterItem;
}

export interface LiveClass {
  id: string;
  course_id: string;
  batch_id?: string;
  teacher_id?: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  youtube_video_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  teacher?: TeacherProfile;
  subject?: SubjectItem;
}

export interface RecordedLecture {
  id: string;
  course_id: string;
  subject_id: string;
  chapter_id: string;
  topic_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  youtube_video_id: string;
  duration_seconds: number;
  lecture_order: number;
  is_free_preview: boolean;
  created_at: string;
  progress?: {
    watched_seconds: number;
    is_completed: boolean;
  };
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface QuestionOption {
  id: string;
  text: string;
  text_hi?: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_text_hi?: string;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_answer?: string | string[]; // hidden from students during test
  explanation?: string;
  explanation_hi?: string;
  marks: number;
  question_order: number;
  created_at: string;
}

export interface Examination {
  id: string;
  course_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  pass_marks: number;
  negative_marking: number;
  exam_type: 'chapter_test' | 'subject_test' | 'mock_test' | 'full_syllabus' | 'pyq';
  start_time?: string;
  end_time?: string;
  is_published: boolean;
  created_at: string;
  questions?: Question[];
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  start_time: string;
  submit_time?: string;
  score: number;
  total_marks: number;
  is_passed: boolean;
  status: 'in_progress' | 'submitted' | 'evaluated';
  created_at: string;
  exam?: Examination;
}

export interface Assignment {
  id: string;
  course_id: string;
  batch_id?: string;
  teacher_id?: string;
  title: string;
  title_hi?: string;
  instructions?: string;
  attachment_url?: string;
  due_date: string;
  max_marks: number;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_url: string;
  status: 'submitted' | 'graded' | 'returned';
  marks?: number;
  teacher_remarks?: string;
  submitted_at: string;
  graded_at?: string;
}

export interface Doubt {
  id: string;
  student_id: string;
  course_id: string;
  subject_id?: string;
  title: string;
  description: string;
  attachment_url?: string;
  status: 'open' | 'resolved';
  answer?: string;
  answered_by?: string;
  created_at: string;
  answered_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  title_hi?: string;
  message: string;
  message_hi?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformConfig {
  institution_profile: {
    name: string;
    tagline: string;
    tagline_en: string;
    address: string;
    contact_phone: string;
    contact_email: string;
    whatsapp_number?: string;
    website_url: string;
    established_year: number;
  };
  payment_config: {
    upi_id: string;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    qr_code_url: string;
    instructions_hi: string;
    instructions_en: string;
  };
  academic_config: {
    supported_boards: BoardCode[];
    default_language: AppLanguage;
    supported_languages: AppLanguage[];
    currency: string;
    currency_symbol: string;
    timezone: string;
  };
}
