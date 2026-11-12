// IDEAL COACHING CENTRE — SHARED VALIDATION SCHEMAS (ZOD)

import { z } from 'zod';

// Regex for Indian 10-digit mobile number
export const indianMobileRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

// 1. Student Registration Schema
export const studentRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'पूरा नाम कम से कम 3 अक्षरों का होना चाहिए (Name must be at least 3 characters)' })
    .max(80),
  username: z
    .string()
    .min(3, { message: 'यूज़रनेम कम से कम 3 अक्षरों का होना चाहिए (Username must be at least 3 characters)' })
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'यूज़रनेम में केवल अक्षर, अंक और _ मान्य हैं (Only alphanumeric & underscore)' })
    .transform((val) => val.toLowerCase()),
  mobileNumber: z
    .string()
    .regex(indianMobileRegex, { message: 'मान्य 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile)' })
    .transform((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.slice(-10);
    }),
  email: z
    .string()
    .email({ message: 'मान्य ईमेल पता दर्ज करें (Enter valid email address)' })
    .transform((val) => val.toLowerCase().trim()),
  boardCode: z.enum(['BSEB', 'JAC'], {
    errorMap: () => ({ message: 'कृपया बिहार बोर्ड (BSEB) या झारखंड बोर्ड (JAC) चुनें (Select BSEB or JAC)' }),
  }),
  classId: z.string().uuid({ message: 'कक्षा चुनें (Select Class)' }),
  district: z.string().min(2, { message: 'ज़िला का नाम दर्ज करें (Enter District)' }),
  schoolName: z.string().optional(),
  preferredLanguage: z.enum(['hi', 'en']).default('hi'),
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;

// 2. Login Identifier Schema (Accepts Mobile / Username / Email)
export const loginIdentifierSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: 'कृपया मोबाइल नंबर, यूज़रनेम या ईमेल दर्ज करें (Enter mobile, username or email)' })
    .trim(),
});

export type LoginIdentifierInput = z.infer<typeof loginIdentifierSchema>;

// 3. OTP Verification Schema
export const otpVerificationSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, { message: 'ओटीपी 6 अंकों का होना चाहिए (OTP must be 6 digits)' })
    .regex(/^\d+$/, { message: 'ओटीपी में केवल अंक होने चाहिए (Digits only)' }),
});

export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;

// 4. Payment Submission Schema
export const paymentSubmissionSchema = z.object({
  courseId: z.string().uuid(),
  amount: z.number().positive(),
  upiRefNumber: z
    .string()
    .min(8, { message: 'मान्य 12 अंकों का UPI/UTR रेफरेंस नंबर दर्ज करें (Enter valid UPI Reference number)' })
    .max(30)
    .trim(),
  screenshotUrl: z.string().url({ message: 'रसीद का स्क्रीनशॉट अपलोड करें (Upload screenshot)' }).optional(),
});

export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;

// 5. Course Creation / Update Schema
export const courseSchema = z.object({
  title: z.string().min(3),
  titleHi: z.string().min(3),
  description: z.string().optional(),
  descriptionHi: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  boardId: z.string().uuid(),
  classId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  isFree: z.boolean().default(false),
  price: z.number().min(0).default(0),
  discountPrice: z.number().min(0).optional(),
  validityDays: z.number().int().positive().default(365),
  isPublished: z.boolean().default(true),
});

export type CourseInput = z.infer<typeof courseSchema>;

// 6. Study Material Upload & Academic Mapping Schema
export const studyMaterialSchema = z.object({
  boardId: z.string().uuid({ message: 'बोर्ड चुनें (Select Board)' }),
  classId: z.string().uuid({ message: 'कक्षा चुनें (Select Class)' }),
  subjectId: z.string().uuid({ message: 'विषय चुनें (Select Subject)' }),
  chapterId: z.string().uuid({ message: 'अध्याय चुनें (Select Chapter)' }),
  topicId: z.string().uuid().optional(),
  title: z.string().min(3, { message: 'शीर्षक दर्ज करें (Enter Title)' }),
  titleHi: z.string().min(3, { message: 'हिंदी शीर्षक दर्ज करें (Enter Hindi Title)' }),
  description: z.string().optional(),
  filePath: z.string().min(1, { message: 'फ़ाइल पथ आवश्यक है (File path is required)' }),
  fileSizeBytes: z.number().nonnegative(),
  materialType: z.enum([
    'chapter_notes',
    'topic_notes',
    'revision_notes',
    'worksheet',
    'pyq',
    'formula_sheet',
    'answer_key',
  ]),
  isFree: z.boolean().default(false),
});

export type StudyMaterialInput = z.infer<typeof studyMaterialSchema>;

// 7. Live Class Scheduling Schema
export const liveClassSchema = z.object({
  courseId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  chapterId: z.string().uuid().optional(),
  title: z.string().min(3),
  titleHi: z.string().optional(),
  description: z.string().optional(),
  youtubeVideoId: z
    .string()
    .min(5, { message: 'मान्य यूट्यूब वीडियो आईडी दर्ज करें (Enter valid YouTube Video ID)' }),
  scheduledAt: z.string(), // ISO String
  durationMinutes: z.number().int().positive().default(60),
});

export type LiveClassInput = z.infer<typeof liveClassSchema>;

// 8. Question & Examination Schema
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  textHi: z.string().optional(),
});

export const questionSchema = z.object({
  questionText: z.string().min(3),
  questionTextHi: z.string().optional(),
  questionType: z.enum(['single_choice', 'multiple_choice', 'true_false']),
  options: z.array(questionOptionSchema).min(2),
  correctAnswer: z.any(), // string or string[]
  explanation: z.string().optional(),
  explanationHi: z.string().optional(),
  marks: z.number().positive().default(1),
  questionOrder: z.number().int().default(1),
});

export const examinationSchema = z.object({
  courseId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  chapterId: z.string().uuid().optional(),
  title: z.string().min(3),
  titleHi: z.string().optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().default(60),
  totalMarks: z.number().positive().default(100),
  passMarks: z.number().positive().default(33),
  negativeMarking: z.number().min(0).default(0),
  examType: z.enum(['chapter_test', 'subject_test', 'mock_test', 'full_syllabus', 'pyq']),
  isPublished: z.boolean().default(false),
});
