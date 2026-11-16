// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Comprehensive Curriculum for Class 1 to Class 12 (BSEB, JAC & CBSE)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Direct persistent local storage (never reverts) + Cloud Sync + Deletion Blacklist

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Course, LiveClass, StudyMaterial } from '@icc/shared-types';
import { initialCourses as baseInitialCourses } from '../../../admin-web/src/lib/sample-data';

export interface SubSubject {
  id: string;
  subject_id: string;
  name: string;
  name_hi: string;
  icon_name?: string;
  display_order: number;
}

export interface AcademicSubject {
  id: string;
  course_id?: string;
  class_id?: string;
  class_name?: string;
  name: string;
  name_hi: string;
  code: string;
  icon_name: string;
  has_sub_subjects: boolean;
  sub_subjects?: SubSubject[];
  display_order: number;
}

export interface AcademicChapter {
  id: string;
  subject_id: string;
  sub_subject_id?: string;
  course_id?: string;
  class_name?: string;
  chapter_number: number;
  title: string;
  title_hi: string;
  description?: string;
  description_hi?: string;
  live_count?: number;
  lecture_count?: number;
  material_count?: number;
}

export interface RecordedLecture {
  id: string;
  course_id: string;
  subject_id: string;
  sub_subject_id?: string;
  chapter_id: string;
  title: string;
  title_hi?: string;
  description?: string;
  youtube_video_id: string;
  duration_seconds: number;
  is_free_preview: boolean;
  lecture_order: number;
}

// -------------------------------------------------------------
// SEED COURSES FOR ALL CLASSES (CLASS 1 TO 12)
// -------------------------------------------------------------

export const allInitialCourses: Course[] = [
  ...baseInitialCourses,
  // Add foundation courses for Class 6 down to Class 1 if not in base
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Batch B-6: Umeed - Class 6 Foundation Batch',
    title_hi: 'बैच B-6: उम्मीद - कक्षा 6 आधारशिला बैच',
    tagline: 'Complete Class 6 NCERT / JCERT syllabus with BADE SIR',
    description: 'Special foundation preparation for Class 6 covering Mathematics, Science, Social Science, Hindi & English.',
    description_hi: 'कक्षा 6वीं के सभी विषयों (गणित, विज्ञान, सामाजिक विज्ञान, हिंदी, अंग्रेज़ी) की संपूर्ण तैयारी।',
    thumbnail_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000006',
    is_free: false,
    price: 1999,
    discount_price: 599,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 35,
    material_count: 20,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Batch B-5: Prathmik - Class 5 Primary Excellence',
    title_hi: 'बैच B-5: प्राथमिक - कक्षा 5 संपूर्ण तैयारी',
    tagline: 'Primary school foundation for Class 5 students',
    description: 'Fundamental concepts, mental math, reading & writing skills for Class 5.',
    description_hi: 'कक्षा 5वीं के बच्चों के लिए गणित, पर्यावरण, हिंदी और अंग्रेज़ी की मजबूत नींव।',
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000005',
    is_free: false,
    price: 1499,
    discount_price: 499,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 30,
    material_count: 15,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Batch B-4: Prathmik - Class 4 Primary Excellence',
    title_hi: 'बैच B-4: प्राथमिक - कक्षा 4 संपूर्ण तैयारी',
    tagline: 'Class 4 foundational learning with personal attention',
    description: 'Core concepts in Math, EVS, Hindi, English and Urdu for Class 4.',
    description_hi: 'कक्षा 4 के छात्रों के लिए बेसिक गणित और भाषा कौशल।',
    thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000004',
    is_free: false,
    price: 1499,
    discount_price: 499,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 25,
    material_count: 12,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Batch B-3: Prathmik - Class 3 Primary Foundation',
    title_hi: 'बैच B-3: प्राथमिक - कक्षा 3 आधारशिला',
    tagline: 'Basic concepts, handwriting & tables practice for Class 3',
    description: 'Class 3 complete syllabus with daily practice worksheets and live guidance.',
    description_hi: 'कक्षा 3 के बच्चों के लिए पढ़ाई और बेसिक सुधार।',
    thumbnail_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000003',
    is_free: false,
    price: 1299,
    discount_price: 399,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 20,
    material_count: 10,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Batch B-2: Prathmik - Class 2 Primary Foundation',
    title_hi: 'बैच B-2: प्राथमिक - कक्षा 2 आधारशिला',
    tagline: 'Class 2 foundational reading, writing & arithmetic',
    description: 'Foundational learning for Class 2 kids with interactive exercises.',
    description_hi: 'कक्षा 2 के बच्चों के लिए सरल और रोचक पढ़ाई।',
    thumbnail_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    is_free: false,
    price: 1199,
    discount_price: 349,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 18,
    material_count: 8,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Batch B-1: Prathmik - Class 1 Early Foundation',
    title_hi: 'बैच B-1: प्राथमिक - कक्षा 1 बाल आधारशिला',
    tagline: 'Class 1 alphabet, numbers, phonics & foundational habits',
    description: 'Playful early education for Class 1 students with personalized attention.',
    description_hi: 'कक्षा 1 के बच्चों के लिए अक्षर, वर्णमाला, गिनती एवं भाषा की शुरुआत।',
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000001',
    is_free: false,
    price: 999,
    discount_price: 299,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 15,
    material_count: 6,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000011',
    title: 'Batch B-11: Shikhar - Class 11 Intermediate (Arts & Science)',
    title_hi: 'बैच B-11: शिखर - कक्षा 11 इंटरमीडिएट बोर्ड',
    tagline: 'Comprehensive Intermediate preparation with BADE SIR',
    description: 'Physics, Chemistry, Mathematics, Biology, History, Pol Science, English & Hindi for Class 11.',
    description_hi: 'कक्षा 11वीं के विद्यार्थियों के लिए विज्ञान एवं कला संकाय की संपूर्ण तैयारी।',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000011',
    is_free: false,
    price: 3499,
    discount_price: 999,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 90,
    material_count: 45,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000012',
    title: 'Batch B-12: Vijay - Class 12 Inter Board Target 2027',
    title_hi: 'बैच B-12: विजय - कक्षा 12 इंटरमीडिएट बोर्ड 2027',
    tagline: 'Board Toppers Batch with 10 years question bank & daily live classes',
    description: 'Complete syllabus revision, model test series and live problem solving for Class 12 BSEB/JAC Board.',
    description_hi: 'कक्षा 12वीं बोर्ड परीक्षा 2027 की अंतिम और निर्णायक तैयारी बड़े सर के साथ।',
    thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000012',
    is_free: false,
    price: 3999,
    discount_price: 1199,
    validity_days: 365,
    start_date: '2026-04-01',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_count: 110,
    material_count: 55,
  },
];

// Helper to generate seed subjects for classes 1 through 6
const generatePrimarySubjects = (className: string, classNum: number): AcademicSubject[] => [
  {
    id: `sub-math-${classNum}`,
    class_name: className,
    name: 'Mathematics',
    name_hi: 'गणित',
    code: `MATH-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: `sub-sci-${classNum}`,
    class_name: className,
    name: classNum <= 5 ? 'Environmental Studies (EVS)' : 'Science',
    name_hi: classNum <= 5 ? 'पर्यावरण अध्ययन (EVS)' : 'विज्ञान',
    code: `SCI-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'flask',
    has_sub_subjects: false,
    display_order: 2,
  },
  {
    id: `sub-sst-${classNum}`,
    class_name: className,
    name: 'Social Science',
    name_hi: 'सामाजिक अध्ययन',
    code: `SST-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'globe',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: `sub-hin-${classNum}`,
    class_name: className,
    name: 'Hindi',
    name_hi: 'हिंदी',
    code: `HIN-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: `sub-eng-${classNum}`,
    class_name: className,
    name: 'English',
    name_hi: 'अंग्रेज़ी',
    code: `ENG-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: `sub-skt-${classNum}`,
    class_name: className,
    name: 'Sanskrit / Urdu',
    name_hi: 'संस्कृत / उर्दू',
    code: `SKT-${classNum.toString().padStart(2, '0')}`,
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 6,
  },
];

// -------------------------------------------------------------
// SEED SUBJECTS FOR ALL CLASSES (CLASS 1 TO 12)
// -------------------------------------------------------------

export const initialAcademicSubjects: AcademicSubject[] = [
  // --- CLASS 10 SUBJECTS ---
  {
    id: 'sub-math-10',
    class_name: 'Class 10',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-10',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-science-10',
    class_name: 'Class 10',
    name: 'Science (Physics, Chemistry, Biology)',
    name_hi: 'विज्ञान (भौतिकी, रसायन, जीव विज्ञान)',
    code: 'SCI-10',
    icon_name: 'flask',
    has_sub_subjects: true,
    sub_subjects: [
      {
        id: 'subsub-chem-10',
        subject_id: 'sub-science-10',
        name: 'Chemistry',
        name_hi: 'रसायन विज्ञान',
        icon_name: 'flask-conical',
        display_order: 1,
      },
      {
        id: 'subsub-phy-10',
        subject_id: 'sub-science-10',
        name: 'Physics',
        name_hi: 'भौतिक विज्ञान',
        icon_name: 'zap',
        display_order: 2,
      },
      {
        id: 'subsub-bio-10',
        subject_id: 'sub-science-10',
        name: 'Biology',
        name_hi: 'जीव विज्ञान',
        icon_name: 'dna',
        display_order: 3,
      },
    ],
    display_order: 2,
  },
  {
    id: 'sub-sst-10',
    class_name: 'Class 10',
    name: 'Social Science',
    name_hi: 'सामाजिक विज्ञान',
    code: 'SST-10',
    icon_name: 'globe',
    has_sub_subjects: true,
    sub_subjects: [
      {
        id: 'subsub-hist-10',
        subject_id: 'sub-sst-10',
        name: 'History',
        name_hi: 'इतिहास',
        display_order: 1,
      },
      {
        id: 'subsub-geog-10',
        subject_id: 'sub-sst-10',
        name: 'Geography',
        name_hi: 'भूगोल',
        display_order: 2,
      },
      {
        id: 'subsub-pol-10',
        subject_id: 'sub-sst-10',
        name: 'Civics / Political Science',
        name_hi: 'राजनीति शास्त्र',
        display_order: 3,
      },
      {
        id: 'subsub-eco-10',
        subject_id: 'sub-sst-10',
        name: 'Economics',
        name_hi: 'अर्थशास्त्र',
        display_order: 4,
      },
    ],
    display_order: 3,
  },
  {
    id: 'sub-hindi-10',
    class_name: 'Class 10',
    name: 'Hindi (Godhuli & Varnika)',
    name_hi: 'हिंदी (गोधूलि एवं वर्णिका)',
    code: 'HIN-10',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-sanskrit-10',
    class_name: 'Class 10',
    name: 'Sanskrit / Non-Hindi',
    name_hi: 'संस्कृत / अहिंदी',
    code: 'SKT-10',
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: 'sub-english-10',
    class_name: 'Class 10',
    name: 'English (Panorama)',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-10',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 6,
  },
  {
    id: 'sub-urdu-10',
    class_name: 'Class 10',
    name: 'Urdu (Darakhshan & Roshni)',
    name_hi: 'उर्दू (درخشاں اور रोशनी)',
    code: 'URD-10',
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 7,
  },

  // --- CLASS 9 SUBJECTS ---
  {
    id: 'sub-math-09',
    class_name: 'Class 9',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-09',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-science-09',
    class_name: 'Class 9',
    name: 'Science (Physics, Chemistry, Biology)',
    name_hi: 'विज्ञान (भौतिकी, रसायन, जीव विज्ञान)',
    code: 'SCI-09',
    icon_name: 'flask',
    has_sub_subjects: true,
    sub_subjects: [
      {
        id: 'subsub-chem-09',
        subject_id: 'sub-science-09',
        name: 'Chemistry',
        name_hi: 'रसायन विज्ञान',
        icon_name: 'flask-conical',
        display_order: 1,
      },
      {
        id: 'subsub-phy-09',
        subject_id: 'sub-science-09',
        name: 'Physics',
        name_hi: 'भौतिक विज्ञान',
        icon_name: 'zap',
        display_order: 2,
      },
      {
        id: 'subsub-bio-09',
        subject_id: 'sub-science-09',
        name: 'Biology',
        name_hi: 'जीव विज्ञान',
        icon_name: 'dna',
        display_order: 3,
      },
    ],
    display_order: 2,
  },
  {
    id: 'sub-sst-09',
    class_name: 'Class 9',
    name: 'Social Science',
    name_hi: 'सामाजिक विज्ञान',
    code: 'SST-09',
    icon_name: 'globe',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: 'sub-hindi-09',
    class_name: 'Class 9',
    name: 'Hindi',
    name_hi: 'हिंदी',
    code: 'HIN-09',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-sanskrit-09',
    class_name: 'Class 9',
    name: 'Sanskrit / Urdu',
    name_hi: 'संस्कृत / उर्दू',
    code: 'SKT-09',
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: 'sub-english-09',
    class_name: 'Class 9',
    name: 'English',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-09',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 6,
  },

  // --- CLASS 8 SUBJECTS ---
  ...generatePrimarySubjects('Class 8', 8),

  // --- CLASS 7 SUBJECTS ---
  ...generatePrimarySubjects('Class 7', 7),

  // --- CLASS 6 SUBJECTS ---
  ...generatePrimarySubjects('Class 6', 6),

  // --- CLASS 5 SUBJECTS ---
  ...generatePrimarySubjects('Class 5', 5),

  // --- CLASS 4 SUBJECTS ---
  ...generatePrimarySubjects('Class 4', 4),

  // --- CLASS 3 SUBJECTS ---
  ...generatePrimarySubjects('Class 3', 3),

  // --- CLASS 2 SUBJECTS ---
  ...generatePrimarySubjects('Class 2', 2),

  // --- CLASS 1 SUBJECTS ---
  ...generatePrimarySubjects('Class 1', 1),

  // --- CLASS 11 SUBJECTS ---
  {
    id: 'sub-phy-11',
    class_name: 'Class 11',
    name: 'Physics',
    name_hi: 'भौतिक विज्ञान',
    code: 'PHY-11',
    icon_name: 'zap',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-chem-11',
    class_name: 'Class 11',
    name: 'Chemistry',
    name_hi: 'रसायन विज्ञान',
    code: 'CHEM-11',
    icon_name: 'flask-conical',
    has_sub_subjects: false,
    display_order: 2,
  },
  {
    id: 'sub-math-11',
    class_name: 'Class 11',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-11',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: 'sub-bio-11',
    class_name: 'Class 11',
    name: 'Biology',
    name_hi: 'जीव विज्ञान',
    code: 'BIO-11',
    icon_name: 'dna',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-eng-11',
    class_name: 'Class 11',
    name: 'English Core',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-11',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: 'sub-hin-11',
    class_name: 'Class 11',
    name: 'Hindi / Urdu',
    name_hi: 'हिंदी / उर्दू',
    code: 'HIN-11',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 6,
  },

  // --- CLASS 12 SUBJECTS ---
  {
    id: 'sub-phy-12',
    class_name: 'Class 12',
    name: 'Physics',
    name_hi: 'भौतिक विज्ञान',
    code: 'PHY-12',
    icon_name: 'zap',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-chem-12',
    class_name: 'Class 12',
    name: 'Chemistry',
    name_hi: 'रसायन विज्ञान',
    code: 'CHEM-12',
    icon_name: 'flask-conical',
    has_sub_subjects: false,
    display_order: 2,
  },
  {
    id: 'sub-math-12',
    class_name: 'Class 12',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-12',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: 'sub-bio-12',
    class_name: 'Class 12',
    name: 'Biology',
    name_hi: 'जीव विज्ञान',
    code: 'BIO-12',
    icon_name: 'dna',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-eng-12',
    class_name: 'Class 12',
    name: 'English Core',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-12',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: 'sub-hin-12',
    class_name: 'Class 12',
    name: 'Hindi / Urdu',
    name_hi: 'हिंदी / उर्दू',
    code: 'HIN-12',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 6,
  },
];

export const initialAcademicChapters: AcademicChapter[] = [
  // Class 10 - Mathematics Chapters
  {
    id: 'ch-math-01',
    subject_id: 'sub-math-10',
    chapter_number: 1,
    title: 'Real Numbers',
    title_hi: 'वास्तविक संख्याएं',
    description: 'Euclid division lemma, Fundamental theorem of arithmetic, irrational proofs.',
    live_count: 1,
    lecture_count: 5,
    material_count: 2,
  },
  {
    id: 'ch-math-02',
    subject_id: 'sub-math-10',
    chapter_number: 2,
    title: 'Polynomials',
    title_hi: 'बहुपद',
    description: 'Geometrical meaning of zeroes, relationship between coefficients and zeroes.',
    live_count: 0,
    lecture_count: 4,
    material_count: 2,
  },
  {
    id: 'ch-chem-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_number: 1,
    title: 'Chemical Reactions and Equations',
    title_hi: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
    description: 'Balancing chemical equations, combination, decomposition, displacement, redox reactions.',
    live_count: 1,
    lecture_count: 6,
    material_count: 3,
  },
  {
    id: 'ch-phy-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-phy-10',
    chapter_number: 1,
    title: 'Light: Reflection and Refraction',
    title_hi: 'प्रकाश: परावर्तन तथा अपवर्तन',
    description: 'Spherical mirrors, mirror formula, magnification, refraction, lens formula.',
    live_count: 1,
    lecture_count: 8,
    material_count: 3,
  },
  {
    id: 'ch-bio-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-bio-10',
    chapter_number: 1,
    title: 'Life Processes',
    title_hi: 'जैव प्रक्रम',
    description: 'Nutrition (autotrophic & heterotrophic), respiration, transportation, excretion.',
    live_count: 1,
    lecture_count: 6,
    material_count: 4,
  },
];

export const initialRecordedLectures: RecordedLecture[] = [
  {
    id: 'lec-ch1-01',
    course_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_id: 'ch-chem-01',
    title: 'Lec 01: Chemical Equations & Balancing Techniques',
    title_hi: 'लेक्चर 01: रासायनिक समीकरण एवं संतुलन विधि',
    description: 'Step-by-step balancing tricks for Bihar Board & JAC Board matric examination.',
    youtube_video_id: 'jfKfPfyJRdk',
    duration_seconds: 2850,
    is_free_preview: true,
    lecture_order: 1,
  },
];

export const initialChapterLiveClasses: LiveClass[] = [
  {
    id: 'live-ch1-01',
    course_id: 'c0000000-0000-0000-0000-000000000010',
    batch_id: 'ba000000-0000-0000-0000-000000000001',
    title: '🔴 Live Doubt Clearing: Chemical Reactions (BSEB/JAC Board)',
    title_hi: 'लाइव डाउट सेशन: रासायनिक अभिक्रियाएँ',
    description: 'Live interactive doubt session with Director BADE SIR.',
    youtube_video_id: 'jfKfPfyJRdk',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    duration_minutes: 60,
    status: 'live',
    created_at: new Date().toISOString(),
  },
];

export const initialChapterStudyMaterials: StudyMaterial[] = [
  {
    id: 'pdf-ch1-01',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub-science-10',
    chapter_id: 'ch-chem-01',
    title: 'Ch 01: Chemical Reactions — Handwritten Master Notes (बड़े सर)',
    title_hi: 'पाठ 01: रासायनिक अभिक्रियाएँ - हस्तलिखित क्लास नोट्स',
    description: 'Complete handwritten classroom notes with board high-scoring definitions.',
    file_path: 'bseb/class10/science/ch01_chemical_reactions_notes.pdf',
    file_size_bytes: 2800000,
    material_type: 'chapter_notes',
    is_free: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// -------------------------------------------------------------
// REACTIVE ACADEMIC REPOSITORY & ADMIN CRUD SERVICE
// -------------------------------------------------------------

class AcademicRepository {
  private courses: Course[] = allInitialCourses;
  private subjects: AcademicSubject[] = initialAcademicSubjects;
  private chapters: AcademicChapter[] = initialAcademicChapters;
  private lectures: RecordedLecture[] = initialRecordedLectures;
  private liveClasses: LiveClass[] = initialChapterLiveClasses;
  private materials: StudyMaterial[] = initialChapterStudyMaterials;
  private deletedIds: Set<string> = new Set();
  private isLoaded: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadFromStorage();
    this.syncFromCloud().catch(() => {});
  }

  private async loadFromStorage() {
    try {
      let rawDeleted = null;
      let sCourses = null, sSubs = null, sChaps = null, sLecs = null, sLive = null, sMats = null;

      if (Platform.OS !== 'web') {
        rawDeleted = await SecureStore.getItemAsync('icc_deleted_ids');
        sCourses = await SecureStore.getItemAsync('icc_courses');
        sSubs = await SecureStore.getItemAsync('icc_academic_subjects');
        sChaps = await SecureStore.getItemAsync('icc_academic_chapters');
        sLecs = await SecureStore.getItemAsync('icc_recorded_lectures');
        sLive = await SecureStore.getItemAsync('icc_live_classes');
        sMats = await SecureStore.getItemAsync('icc_study_materials');
      } else if (typeof window !== 'undefined') {
        rawDeleted = localStorage.getItem('icc_deleted_ids');
        sCourses = localStorage.getItem('icc_courses');
        sSubs = localStorage.getItem('icc_academic_subjects');
        sChaps = localStorage.getItem('icc_academic_chapters');
        sLecs = localStorage.getItem('icc_recorded_lectures');
        sLive = localStorage.getItem('icc_live_classes');
        sMats = localStorage.getItem('icc_study_materials');
      }

      if (rawDeleted) {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) this.deletedIds = new Set(arr);
      }

      // Merge stored courses with allInitialCourses to ensure ALL classes exist
      if (sCourses) {
        const parsed: Course[] = JSON.parse(sCourses);
        const map = new Map(allInitialCourses.map(c => [c.id, c]));
        for (const c of parsed) {
          map.set(c.id, c);
        }
        this.courses = Array.from(map.values());
      }

      if (sSubs) {
        const parsedSubs: AcademicSubject[] = JSON.parse(sSubs);
        const subMap = new Map(initialAcademicSubjects.map(s => [s.id, s]));
        for (const s of parsedSubs) {
          subMap.set(s.id, s);
        }
        this.subjects = Array.from(subMap.values());
      }

      if (sChaps) this.chapters = JSON.parse(sChaps);
      if (sLecs) this.lectures = JSON.parse(sLecs);
      if (sLive) this.liveClasses = JSON.parse(sLive);
      if (sMats) this.materials = JSON.parse(sMats);

      // Filter out any deleted items
      this.courses = this.courses.filter((c) => !this.deletedIds.has(c.id));
      this.subjects = this.subjects.filter((s) => !this.deletedIds.has(s.id));
      this.chapters = this.chapters.filter((ch) => !this.deletedIds.has(ch.id));
      this.lectures = this.lectures.filter((l) => !this.deletedIds.has(l.id));
      this.liveClasses = this.liveClasses.filter((lc) => !this.deletedIds.has(lc.id));
      this.materials = this.materials.filter((m) => !this.deletedIds.has(m.id));

      this.isLoaded = true;
    } catch {
      this.isLoaded = true;
    }
  }

  // Non-destructive cloud sync that MERGES instead of overwriting
  async syncFromCloud() {
    if (!isSupabaseConfigured) return;
    try {
      const { data: remoteCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (remoteCourses && remoteCourses.length > 0) {
        const valid = remoteCourses.filter((c) => !this.deletedIds.has(c.id));
        const courseMap = new Map(this.courses.map(c => [c.id, c]));
        for (const rem of valid) {
          const existing = courseMap.get(rem.id);
          if (existing) {
            // Keep local version if newer
            const localDate = new Date(existing.updated_at || existing.created_at || 0).getTime();
            const remoteDate = new Date(rem.updated_at || rem.created_at || 0).getTime();
            if (remoteDate >= localDate) {
              courseMap.set(rem.id, { ...existing, ...rem });
            }
          } else {
            courseMap.set(rem.id, rem);
          }
        }
        this.courses = Array.from(courseMap.values());
        await this.persist('icc_courses', this.courses);
      }

      // Sync subjects non-destructively
      const { data: remoteSubs } = await supabase.from('subjects').select('*');
      if (remoteSubs && remoteSubs.length > 0) {
        const validSubs = remoteSubs.filter((s) => !this.deletedIds.has(s.id));
        const subMap = new Map(this.subjects.map(s => [s.id, s]));
        for (const remSub of validSubs) {
          subMap.set(remSub.id, { ...subMap.get(remSub.id), ...remSub });
        }
        this.subjects = Array.from(subMap.values());
        await this.persist('icc_academic_subjects', this.subjects);
      }
    } catch (e) {
      console.warn('Sync from cloud error:', e);
    }
  }

  private async persist(key: string, data: any) {
    const serialized = JSON.stringify(data);
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, serialized);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(key, serialized);
      }
    } catch {}
  }

  private async markAsDeleted(id: string) {
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
  }

  getClasses(): string[] {
    return [
      'Class 10',
      'Class 9',
      'Class 8',
      'Class 7',
      'Class 6',
      'Class 5',
      'Class 4',
      'Class 3',
      'Class 2',
      'Class 1',
      'Class 11',
      'Class 12',
    ];
  }

  getClassNameFromCourse(course: Partial<Course>): string {
    if ((course as any).class_name) return (course as any).class_name;
    const t = (course.title || '').toLowerCase();
    const d = (course.description || '').toLowerCase();
    const tag = (course.tagline || '').toLowerCase();
    const combined = `${t} ${d} ${tag}`;

    // Exact number matching (1 to 12)
    if (combined.includes('10th') || combined.includes('class 10') || combined.includes('matric')) return 'Class 10';
    if (combined.includes('12th') || combined.includes('class 12') || combined.includes('inter')) return 'Class 12';
    if (combined.includes('11th') || combined.includes('class 11')) return 'Class 11';
    if (combined.includes('9th') || combined.includes('class 9')) return 'Class 9';
    if (combined.includes('8th') || combined.includes('class 8')) return 'Class 8';
    if (combined.includes('7th') || combined.includes('class 7')) return 'Class 7';
    if (combined.includes('6th') || combined.includes('class 6')) return 'Class 6';
    if (combined.includes('5th') || combined.includes('class 5')) return 'Class 5';
    if (combined.includes('4th') || combined.includes('class 4')) return 'Class 4';
    if (combined.includes('3rd') || combined.includes('class 3')) return 'Class 3';
    if (combined.includes('2nd') || combined.includes('class 2')) return 'Class 2';
    if (combined.includes('1st') || combined.includes('class 1')) return 'Class 1';

    if (course.class_id?.endsWith('10')) return 'Class 10';
    if (course.class_id?.endsWith('09') || course.class_id?.endsWith('9')) return 'Class 9';
    if (course.class_id?.endsWith('08') || course.class_id?.endsWith('8')) return 'Class 8';
    if (course.class_id?.endsWith('07') || course.class_id?.endsWith('7')) return 'Class 7';
    if (course.class_id?.endsWith('06') || course.class_id?.endsWith('6')) return 'Class 6';
    if (course.class_id?.endsWith('05') || course.class_id?.endsWith('5')) return 'Class 5';
    if (course.class_id?.endsWith('04') || course.class_id?.endsWith('4')) return 'Class 4';
    if (course.class_id?.endsWith('03') || course.class_id?.endsWith('3')) return 'Class 3';
    if (course.class_id?.endsWith('02') || course.class_id?.endsWith('2')) return 'Class 2';
    if (course.class_id?.endsWith('01') || course.class_id?.endsWith('1')) return 'Class 1';
    if (course.class_id?.endsWith('11')) return 'Class 11';
    if (course.class_id?.endsWith('12')) return 'Class 12';

    return 'Class 10';
  }

  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    return this.courses.filter((c) => !this.deletedIds.has(c.id));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    if (this.deletedIds.has(id)) return undefined;
    return this.courses.find((c) => c.id === id);
  }

  async addCourse(data: Partial<Course>): Promise<Course> {
    const newCourse: Course = {
      id: data.id || `c0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
      title: data.title || 'New Target Course',
      title_hi: data.title_hi || data.title || 'नया कोर्स',
      tagline: data.tagline || 'Complete Board Exam Syllabus Mastery with BADE SIR',
      description: data.description || '',
      description_hi: data.description_hi || data.description || '',
      thumbnail_url:
        data.thumbnail_url ||
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      board_id: data.board_id || 'b0000000-0000-0000-0000-000000000001',
      class_id: data.class_id || 'c0000000-0000-0000-0000-000000000010',
      is_free: Boolean(data.is_free),
      price: data.price !== undefined ? data.price : 999,
      discount_price: data.discount_price !== undefined ? data.discount_price : 499,
      validity_days: data.validity_days || 365,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      features: data.features || [
        'Daily Live Classes',
        'Handwritten PDF Notes',
        'Weekly 30-Second AI Speed Quiz',
        'Offline Study Mode',
      ],
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lecture_count: 0,
      material_count: 0,
    };
    if ((data as any).class_name) (newCourse as any).class_name = (data as any).class_name;

    this.courses.unshift(newCourse);
    await this.persist('icc_courses', this.courses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('courses').upsert({
          title: newCourse.title,
          title_hi: newCourse.title_hi,
          description: newCourse.description,
          description_hi: newCourse.description_hi,
          thumbnail_url: newCourse.thumbnail_url,
          price: newCourse.price,
          discount_price: newCourse.discount_price,
          validity_days: newCourse.validity_days,
          is_published: true,
        });
      }
    } catch {}

    return newCourse;
  }

  // BULLETPROOF UPDATE: NEVER THROWS 'Course not found'
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    let idx = this.courses.findIndex((c) => c.id === id);

    // Fallback search by title or normalized ID
    if (idx === -1 && updates.title) {
      idx = this.courses.findIndex(
        (c) => c.title.trim().toLowerCase() === updates.title!.trim().toLowerCase()
      );
    }

    if (idx === -1) {
      // Find in allInitialCourses
      const seedMatch = allInitialCourses.find((c) => c.id === id || c.title === updates.title);
      if (seedMatch) {
        this.courses.push({ ...seedMatch });
        idx = this.courses.length - 1;
      } else {
        // Create it cleanly
        const created = await this.addCourse({ ...updates, id } as any);
        return created;
      }
    }

    this.courses[idx] = {
      ...this.courses[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.persist('icc_courses', this.courses);

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('courses')
          .update({
            title: updates.title,
            title_hi: updates.title_hi,
            description: updates.description,
            thumbnail_url: updates.thumbnail_url,
            price: updates.price,
            discount_price: updates.discount_price,
            validity_days: updates.validity_days,
            updated_at: new Date().toISOString(),
          })
          .eq('title', this.courses[idx].title);
      }
    } catch {}

    return this.courses[idx];
  }

  async deleteCourse(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.courses = this.courses.filter((c) => c.id !== id);
    await this.persist('icc_courses', this.courses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('courses').delete().eq('id', id);
      }
    } catch {}
  }

  // --- SUBJECTS (Class Scoped from Class 1 to 12) ---
  async getSubjects(courseId?: string, className?: string): Promise<AcademicSubject[]> {
    let list = this.subjects.filter((s) => !this.deletedIds.has(s.id));

    if (className) {
      const targetClass = className.trim().toLowerCase();
      // Extract target number: e.g. "Class 8" -> "8"
      const numMatch = targetClass.match(/\d+/);
      const targetNum = numMatch ? numMatch[0] : '';

      list = list.filter((s) => {
        const sClass = (s.class_name || '').toLowerCase();
        if (sClass && sClass === targetClass) return true;
        if (targetNum) {
          const sNumMatch = sClass.match(/\d+/) || (s.code || '').match(/\d+/);
          if (sNumMatch && parseInt(sNumMatch[0], 10) === parseInt(targetNum, 10)) {
            return true;
          }
        }
        return false;
      });
      return list;
    }

    if (courseId) {
      const course = this.courses.find((c) => c.id === courseId);
      if (course) {
        const derivedClass = this.getClassNameFromCourse(course);
        return this.getSubjects(undefined, derivedClass);
      }
      const courseSpecific = list.filter((s) => s.course_id === courseId);
      if (courseSpecific.length > 0) return courseSpecific;
    }

    return list;
  }

  async addSubject(sub: Partial<AcademicSubject>): Promise<AcademicSubject> {
    const newSub: AcademicSubject = {
      id: sub.id || `sub-${Date.now()}`,
      course_id: sub.course_id,
      class_id: sub.class_id,
      class_name: sub.class_name || 'Class 10',
      name: sub.name || 'New Subject',
      name_hi: sub.name_hi || sub.name || 'नया विषय',
      code: sub.code || `SUB-${Date.now().toString().slice(-4)}`,
      icon_name: sub.icon_name || 'book-open',
      has_sub_subjects: Boolean(sub.has_sub_subjects),
      sub_subjects: sub.sub_subjects || [],
      display_order: this.subjects.length + 1,
    };
    this.subjects.push(newSub);
    await this.persist('icc_academic_subjects', this.subjects);
    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.subjects = this.subjects.filter((s) => s.id !== id);
    await this.persist('icc_academic_subjects', this.subjects);
  }

  // --- SUB-SUBJECTS ---
  async addSubSubject(subjectId: string, sub: { name: string; name_hi: string }): Promise<SubSubject> {
    const targetSubject = this.subjects.find((s) => s.id === subjectId);
    if (!targetSubject) throw new Error('Subject not found');

    const newSubSub: SubSubject = {
      id: `subsub-${Date.now()}`,
      subject_id: subjectId,
      name: sub.name,
      name_hi: sub.name_hi,
      display_order: (targetSubject.sub_subjects?.length || 0) + 1,
    };

    if (!targetSubject.sub_subjects) targetSubject.sub_subjects = [];
    targetSubject.sub_subjects.push(newSubSub);
    targetSubject.has_sub_subjects = true;

    await this.persist('icc_academic_subjects', this.subjects);
    return newSubSub;
  }

  // --- CHAPTERS (Subject Scoped) ---
  async getChapters(subjectId: string, subSubjectId?: string): Promise<AcademicChapter[]> {
    return this.chapters.filter((ch) => {
      if (this.deletedIds.has(ch.id)) return false;
      if (ch.subject_id !== subjectId) return false;
      if (subSubjectId) return ch.sub_subject_id === subSubjectId;
      return true;
    });
  }

  async addChapter(data: Partial<AcademicChapter>): Promise<AcademicChapter> {
    const newChapter: AcademicChapter = {
      id: data.id || `ch-${Date.now()}`,
      subject_id: data.subject_id!,
      sub_subject_id: data.sub_subject_id,
      course_id: data.course_id,
      class_name: data.class_name,
      chapter_number: data.chapter_number || this.chapters.length + 1,
      title: data.title || 'New Chapter',
      title_hi: data.title_hi || data.title || 'नया पाठ',
      description: data.description || '',
      live_count: 0,
      lecture_count: 0,
      material_count: 0,
    };
    this.chapters.push(newChapter);
    await this.persist('icc_academic_chapters', this.chapters);
    return newChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    return this.lectures.filter((l) => !this.deletedIds.has(l.id) && l.chapter_id === chapterId);
  }

  async addRecordedLecture(data: Partial<RecordedLecture>): Promise<RecordedLecture> {
    const newLec: RecordedLecture = {
      id: `lec-${Date.now()}`,
      course_id: data.course_id || 'c0000000-0000-0000-0000-000000000010',
      subject_id: data.subject_id || '',
      chapter_id: data.chapter_id || '',
      title: data.title || 'Video Lecture',
      title_hi: data.title_hi || data.title,
      description: data.description || '',
      youtube_video_id: data.youtube_video_id || 'jfKfPfyJRdk',
      duration_seconds: data.duration_seconds || 2700,
      is_free_preview: Boolean(data.is_free_preview),
      lecture_order: this.lectures.length + 1,
    };
    this.lectures.push(newLec);
    await this.persist('icc_recorded_lectures', this.lectures);

    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.lecture_count = (ch.lecture_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }
    return newLec;
  }

  async deleteRecordedLecture(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);
  }

  // --- CHAPTER CONTENT: LIVE CLASSES ---
  async getLiveClasses(chapterId?: string): Promise<LiveClass[]> {
    const list = this.liveClasses.filter((l) => !this.deletedIds.has(l.id));
    if (chapterId) {
      return list.filter((l) => (l as any).chapter_id === chapterId);
    }
    return list;
  }

  async scheduleLiveClass(data: Partial<LiveClass> & { chapter_id?: string; subject_id?: string; class_name?: string }): Promise<LiveClass> {
    const newLive: LiveClass = {
      id: `live-${Date.now()}`,
      course_id: data.course_id || 'c0000000-0000-0000-0000-000000000010',
      batch_id: data.batch_id || 'ba000000-0000-0000-0000-000000000001',
      title: data.title || 'Live Class Session',
      title_hi: data.title_hi || data.title,
      description: data.description || '',
      youtube_video_id: data.youtube_video_id || 'jfKfPfyJRdk',
      scheduled_at: data.scheduled_at || new Date().toISOString(),
      duration_minutes: data.duration_minutes || 60,
      status: data.status || 'live',
      created_at: new Date().toISOString(),
    };
    if (data.chapter_id) (newLive as any).chapter_id = data.chapter_id;
    if (data.subject_id) (newLive as any).subject_id = data.subject_id;
    if (data.class_name) (newLive as any).class_name = data.class_name;

    this.liveClasses.unshift(newLive);
    await this.persist('icc_live_classes', this.liveClasses);
    return newLive;
  }

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<void> {
    const item = this.liveClasses.find((l) => l.id === id);
    if (item) {
      item.status = status;
      await this.persist('icc_live_classes', this.liveClasses);
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.liveClasses = this.liveClasses.filter((l) => l.id !== id);
    await this.persist('icc_live_classes', this.liveClasses);
  }

  // --- CHAPTER CONTENT: STUDY MATERIALS PDF ---
  async getStudyMaterials(chapterId?: string): Promise<StudyMaterial[]> {
    const list = this.materials.filter((m) => !this.deletedIds.has(m.id));
    if (chapterId) {
      return list.filter((m) => m.chapter_id === chapterId);
    }
    return list;
  }

  async addStudyMaterial(data: Partial<StudyMaterial> & { class_name?: string }): Promise<StudyMaterial> {
    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      board_id: data.board_id || 'b0000000-0000-0000-0000-000000000001',
      class_id: data.class_id || 'c0000000-0000-0000-0000-000000000010',
      subject_id: data.subject_id || '',
      chapter_id: data.chapter_id || '',
      title: data.title || 'Study Material PDF',
      title_hi: data.title_hi || data.title,
      description: data.description || '',
      file_path: data.file_path || 'bseb/class10/notes.pdf',
      file_size_bytes: data.file_size_bytes || 2400000,
      material_type: data.material_type || 'chapter_notes',
      is_free: data.is_free !== false,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (data.class_name) (newMat as any).class_name = data.class_name;

    this.materials.unshift(newMat);
    await this.persist('icc_study_materials', this.materials);

    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.material_count = (ch.material_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }

    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_study_materials', this.materials);
  }
}

export const academicService = new AcademicRepository();
