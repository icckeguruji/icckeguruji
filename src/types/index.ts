export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: UserRole;
  enrolledCourseIds: string[];
  joinedDate?: string;
  avatar?: string;
  streakDays?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeId: string; // YouTube Video or Live Stream ID
  isLive: boolean;
  scheduledAt?: string;
  duration?: string;
  chapterNumber: number;
}

export interface PdfNote {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  pageCount?: number;
  uploadedAt: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  instructorName: string;
  instructorRole: string;
  language: string;
  duration: string;
  features: string[];
  lessonsCount: number;
  notesCount: number;
  isPopular?: boolean;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  utrNumber: string; // 12-digit UPI reference number
  upiIdUsed: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  adminNote?: string;
}

// =========================================================================
// QUIZ & MOCK TEST INTERFACES
// =========================================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  chapter: string;
  durationMinutes: number;
  totalMarks: number;
  questions: QuizQuestion[];
}

// =========================================================================
// TIMETABLE & FLASHCARD INTERFACES
// =========================================================================

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
  topic: string;
  faculty: string;
  isLiveNow?: boolean;
  courseId: string;
}

export interface Flashcard {
  id: string;
  courseId: string;
  chapter: string;
  front: string; // Question or Formula Name
  back: string;  // Derivation, Formula, Concept
}

// =========================================================================
// CMS (CONTENT MANAGEMENT SYSTEM) INTERFACES
// =========================================================================

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'live_class' | 'notes_alert' | 'exam_alert' | 'general';
  date: string;
  isPinned?: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  date: string;
  category: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  examRank: string;
  examName: string;
  review: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CoachingConfig {
  coachingName: string;
  tagline: string;
  upiId: string;
  merchantName: string;
  whatsappNumber: string;
  telegramGroupLink: string;
  telegramBotUsername: string;
  contactEmail: string;
  googleAppsScriptEmailUrl?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  admissionBadgeText?: string;
  marqueeNotice?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat4Value?: string;
  stat4Label?: string;
  homeQuizQuestion?: string;
  homeQuizOptions?: string[];
  homeQuizCorrectIndex?: number;
  homeQuizExplanation?: string;
}

// =========================================================================
// DPP (DAILY PRACTICE PROBLEMS) & ASSIGNMENTS
// =========================================================================

export interface DppAssignment {
  id: string;
  courseId: string;
  title: string;
  chapter: string;
  dueDate: string;
  totalMarks: number;
  pdfUrl?: string;
  description: string;
  questionCount: number;
}

export interface DppSubmission {
  id: string;
  dppId: string;
  courseId: string;
  userId: string;
  userName: string;
  userPhone: string;
  submittedAt: string;
  answerText: string;
  status: 'pending' | 'graded';
  marksAwarded?: number;
  feedback?: string;
  attachmentName?: string;
}

// =========================================================================
// PYQ (PREVIOUS YEARS QUESTIONS) REPOSITORY
// =========================================================================

export interface PyqPaper {
  id: string;
  title: string;
  exam: string; // 'Class 10 Board' | 'Class 12 Board' | 'JEE Mains' | 'NEET' | 'SSC'
  year: string; // e.g. '2025', '2024', '2023'
  subject: string;
  pdfUrl: string;
  solutionPdfUrl?: string;
  downloadsCount: number;
  fileSize: string;
}

// =========================================================================
// COMMUNITY DOUBT DISCUSSION FORUM
// =========================================================================

export interface CommunityAnswer {
  id: string;
  authorName: string;
  authorRole: 'student' | 'guruji';
  text: string;
  createdAt: string;
  upvotes: number;
}

export interface CommunityPost {
  id: string;
  courseId?: string;
  courseTitle?: string;
  authorName: string;
  authorPhone: string;
  title: string;
  question: string;
  tags: string[];
  createdAt: string;
  upvotes: number;
  isResolved: boolean;
  answers: CommunityAnswer[];
}

// =========================================================================
// CERTIFICATE OF COMPLETION
// =========================================================================

export interface CertificateRecord {
  certificateId: string;
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  grade: 'A+' | 'A' | 'B+';
  scorePercent: number;
  instructorName: string;
}

