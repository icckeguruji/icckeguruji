// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Manages Course -> Subject -> Sub-Subject -> Chapter -> Content (Live, Videos, PDFs)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Supports Supabase cloud persistence + persistent offline local fallback with deletion blacklist

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Course, LiveClass, StudyMaterial } from '@icc/shared-types';
import { initialCourses } from '../../../admin-web/src/lib/sample-data';

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
// SEED HIERARCHICAL ACADEMIC DATA (BSEB & JAC CURRICULUM)
// -------------------------------------------------------------

export const initialAcademicSubjects: AcademicSubject[] = [
  // --- CLASS 10 SUBJECTS ---
  {
    id: 'sub-math-10',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    class_name: 'Class 10',
    name: 'Urdu (Darakhshan & Roshni)',
    name_hi: 'उर्दू (درخشاں اور روشنی)',
    code: 'URD-10',
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 7,
  },

  // --- CLASS 9 SUBJECTS ---
  {
    id: 'sub-math-09',
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
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
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
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
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
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
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
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
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
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
    course_id: 'cr000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000009',
    class_name: 'Class 9',
    name: 'English',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-09',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 6,
  },

  // --- CLASS 8 SUBJECTS ---
  {
    id: 'sub-math-08',
    course_id: 'cr000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000008',
    class_name: 'Class 8',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-08',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-science-08',
    course_id: 'cr000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000008',
    class_name: 'Class 8',
    name: 'Science',
    name_hi: 'विज्ञान',
    code: 'SCI-08',
    icon_name: 'flask',
    has_sub_subjects: false,
    display_order: 2,
  },
  {
    id: 'sub-sst-08',
    course_id: 'cr000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000008',
    class_name: 'Class 8',
    name: 'Social Science',
    name_hi: 'सामाजिक अध्ययन',
    code: 'SST-08',
    icon_name: 'globe',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: 'sub-hindi-08',
    course_id: 'cr000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000008',
    class_name: 'Class 8',
    name: 'Hindi',
    name_hi: 'हिंदी',
    code: 'HIN-08',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-english-08',
    course_id: 'cr000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000008',
    class_name: 'Class 8',
    name: 'English',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-08',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 5,
  },

  // --- CLASS 7 SUBJECTS ---
  {
    id: 'sub-math-07',
    course_id: 'cr000000-0000-0000-0000-000000000004',
    class_id: 'c0000000-0000-0000-0000-000000000007',
    class_name: 'Class 7',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'MATH-07',
    icon_name: 'calculator',
    has_sub_subjects: false,
    display_order: 1,
  },
  {
    id: 'sub-science-07',
    course_id: 'cr000000-0000-0000-0000-000000000004',
    class_id: 'c0000000-0000-0000-0000-000000000007',
    class_name: 'Class 7',
    name: 'Science',
    name_hi: 'विज्ञान',
    code: 'SCI-07',
    icon_name: 'flask',
    has_sub_subjects: false,
    display_order: 2,
  },
  {
    id: 'sub-sst-07',
    course_id: 'cr000000-0000-0000-0000-000000000004',
    class_id: 'c0000000-0000-0000-0000-000000000007',
    class_name: 'Class 7',
    name: 'Social Science',
    name_hi: 'सामाजिक विज्ञान',
    code: 'SST-07',
    icon_name: 'globe',
    has_sub_subjects: false,
    display_order: 3,
  },
  {
    id: 'sub-hindi-07',
    course_id: 'cr000000-0000-0000-0000-000000000004',
    class_id: 'c0000000-0000-0000-0000-000000000007',
    class_name: 'Class 7',
    name: 'Hindi',
    name_hi: 'हिंदी',
    code: 'HIN-07',
    icon_name: 'book-open',
    has_sub_subjects: false,
    display_order: 4,
  },
  {
    id: 'sub-english-07',
    course_id: 'cr000000-0000-0000-0000-000000000004',
    class_id: 'c0000000-0000-0000-0000-000000000007',
    class_name: 'Class 7',
    name: 'English',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-07',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 5,
  },

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
    id: 'ch-math-03',
    subject_id: 'sub-math-10',
    chapter_number: 3,
    title: 'Pair of Linear Equations in Two Variables',
    title_hi: 'दो चर वाले रैखिक समीकरण युग्म',
    description: 'Graphical & algebraic solutions, elimination and substitution methods.',
    live_count: 0,
    lecture_count: 6,
    material_count: 3,
  },
  {
    id: 'ch-math-08',
    subject_id: 'sub-math-10',
    chapter_number: 8,
    title: 'Introduction to Trigonometry',
    title_hi: 'त्रिकोणमिति का परिचय',
    description: 'Trigonometric ratios, values of standard angles (0, 30, 45, 60, 90), identities.',
    live_count: 1,
    lecture_count: 7,
    material_count: 4,
  },

  // Class 10 - Science -> Chemistry Chapters
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
    id: 'ch-chem-02',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_number: 2,
    title: 'Acids, Bases and Salts',
    title_hi: 'अम्ल, क्षारक एवं लवण',
    description: 'pH scale, indicators, bleaching powder, baking soda, washing soda, plaster of paris.',
    live_count: 0,
    lecture_count: 5,
    material_count: 2,
  },

  // Class 10 - Science -> Physics Chapters
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
    id: 'ch-phy-02',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-phy-10',
    chapter_number: 2,
    title: 'Electricity',
    title_hi: 'विद्युत',
    description: "Ohm's law, resistance in series and parallel, electric power and heating effect.",
    live_count: 0,
    lecture_count: 7,
    material_count: 3,
  },

  // Class 10 - Science -> Biology Chapters
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

  // Class 9 - Mathematics Chapters
  {
    id: 'ch-math-09-01',
    subject_id: 'sub-math-09',
    chapter_number: 1,
    title: 'Number Systems',
    title_hi: 'संख्या पद्धति',
    description: 'Real numbers, rationalization, laws of exponents for real numbers.',
    live_count: 1,
    lecture_count: 4,
    material_count: 2,
  },
  {
    id: 'ch-math-09-02',
    subject_id: 'sub-math-09',
    chapter_number: 2,
    title: 'Polynomials',
    title_hi: 'बहुपद',
    description: 'Definition, coefficients, remainder theorem, factor theorem, algebraic identities.',
    live_count: 0,
    lecture_count: 5,
    material_count: 2,
  },

  // Class 9 - Science Chapters
  {
    id: 'ch-chem-09-01',
    subject_id: 'sub-science-09',
    sub_subject_id: 'subsub-chem-09',
    chapter_number: 1,
    title: 'Matter in Our Surroundings',
    title_hi: 'हमारे आस-पास के पदार्थ',
    description: 'Physical nature of matter, states of matter, evaporation, latent heat.',
    live_count: 1,
    lecture_count: 4,
    material_count: 2,
  },
  {
    id: 'ch-phy-09-01',
    subject_id: 'sub-science-09',
    sub_subject_id: 'subsub-phy-09',
    chapter_number: 1,
    title: 'Motion',
    title_hi: 'गति',
    description: 'Distance, displacement, uniform and non-uniform motion, velocity, acceleration.',
    live_count: 0,
    lecture_count: 6,
    material_count: 3,
  },

  // Class 8 - Mathematics Chapters
  {
    id: 'ch-math-08-01',
    subject_id: 'sub-math-08',
    chapter_number: 1,
    title: 'Rational Numbers',
    title_hi: 'परिमेय संख्याएँ',
    description: 'Properties of rational numbers, representation on number line.',
    live_count: 1,
    lecture_count: 3,
    material_count: 2,
  },

  // Class 7 - Mathematics Chapters
  {
    id: 'ch-math-07-01',
    subject_id: 'sub-math-07',
    chapter_number: 1,
    title: 'Integers',
    title_hi: 'पूर्णांक',
    description: 'Addition, subtraction, multiplication and division of integers.',
    live_count: 1,
    lecture_count: 3,
    material_count: 2,
  },
];

export const initialRecordedLectures: RecordedLecture[] = [
  {
    id: 'lec-ch1-01',
    course_id: 'cr000000-0000-0000-0000-000000000001',
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
  {
    id: 'lec-ch1-02',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_id: 'ch-chem-01',
    title: 'Lec 02: Types of Chemical Reactions (Combination & Decomposition)',
    title_hi: 'लेक्चर 02: संयोजन एवं वियोजन अभिक्रियाएं',
    description: 'Practical experiments & board exam repeated questions.',
    youtube_video_id: 'jfKfPfyJRdk',
    duration_seconds: 3100,
    is_free_preview: false,
    lecture_order: 2,
  },
  {
    id: 'lec-math-01',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    subject_id: 'sub-math-10',
    chapter_id: 'ch-math-01',
    title: 'Lec 01: Euclid Division Lemma & HCF Algorithm',
    title_hi: 'लेक्चर 01: यूक्लिड विभाजन प्रमेयिका एवं HCF',
    description: 'Master Class 10 Chapter 1 foundation with BADE SIR.',
    youtube_video_id: 'dQw4w9WgXcQ',
    duration_seconds: 3200,
    is_free_preview: true,
    lecture_order: 1,
  },
];

export const initialChapterLiveClasses: LiveClass[] = [
  {
    id: 'live-ch1-01',
    course_id: 'cr000000-0000-0000-0000-000000000001',
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
  {
    id: 'live-math-01',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    batch_id: 'ba000000-0000-0000-0000-000000000001',
    title: '🔴 Real Numbers: Board Model Papers & Rapid Solving',
    title_hi: 'वास्तविक संख्याएं: बोर्ड मॉडल पेपर लाइव सॉल्यूशन',
    description: 'Class 10 Live Special with BADE SIR.',
    youtube_video_id: 'dQw4w9WgXcQ',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    duration_minutes: 90,
    status: 'scheduled',
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
  {
    id: 'pdf-math-01',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub-math-10',
    chapter_id: 'ch-math-01',
    title: 'Ch 01: Real Numbers — Formulas & Theorems Handout',
    title_hi: 'पाठ 01: वास्तविक संख्याएं - सूत्र एवं प्रमेय',
    description: 'Summary of Euclid division lemma and rational theorems.',
    file_path: 'bseb/class10/math/ch01_real_numbers_formula.pdf',
    file_size_bytes: 980000,
    material_type: 'formula_sheet',
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
  private courses: Course[] = initialCourses;
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

      if (sCourses) this.courses = JSON.parse(sCourses);
      if (sSubs) this.subjects = JSON.parse(sSubs);
      if (sChaps) this.chapters = JSON.parse(sChaps);
      if (sLecs) this.lectures = JSON.parse(sLecs);
      if (sLive) this.liveClasses = JSON.parse(sLive);
      if (sMats) this.materials = JSON.parse(sMats);

      // Filter out any items in deletedIds
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

  private async syncFromCloud() {
    if (!isSupabaseConfigured) return;
    try {
      // 1. Fetch live courses
      const { data: remoteCourses } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (remoteCourses && remoteCourses.length > 0) {
        const valid = remoteCourses.filter((c) => !this.deletedIds.has(c.id));
        if (valid.length > 0) {
          this.courses = valid;
          await this.persist('icc_courses', this.courses);
        }
      }

      // 2. Fetch live subjects
      const { data: remoteSubs } = await supabase.from('subjects').select('*');
      if (remoteSubs && remoteSubs.length > 0) {
        const validSubs = remoteSubs.filter((s) => !this.deletedIds.has(s.id));
        // Merge with existing
        const existingIds = new Set(validSubs.map((s) => s.id));
        const mergedSubs = [...validSubs, ...this.subjects.filter((s) => !existingIds.has(s.id) && !this.deletedIds.has(s.id))];
        this.subjects = mergedSubs;
        await this.persist('icc_academic_subjects', this.subjects);
      }

      // 3. Fetch live chapters
      const { data: remoteChaps } = await supabase.from('chapters').select('*');
      if (remoteChaps && remoteChaps.length > 0) {
        const validChaps = remoteChaps.filter((c) => !this.deletedIds.has(c.id));
        const existingIds = new Set(validChaps.map((c) => c.id));
        const mergedChaps = [...validChaps, ...this.chapters.filter((c) => !existingIds.has(c.id) && !this.deletedIds.has(c.id))];
        this.chapters = mergedChaps;
        await this.persist('icc_academic_chapters', this.chapters);
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
    return ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 11', 'Class 12'];
  }

  getClassNameFromCourse(course: Partial<Course>): string {
    if ((course as any).class_name) return (course as any).class_name;
    const t = (course.title || '').toLowerCase();
    const d = (course.description || '').toLowerCase();
    const tag = (course.tagline || '').toLowerCase();
    const combined = `${t} ${d} ${tag}`;

    if (combined.includes('10th') || combined.includes('class 10') || combined.includes('matric')) return 'Class 10';
    if (combined.includes('9th') || combined.includes('class 9')) return 'Class 9';
    if (combined.includes('8th') || combined.includes('class 8')) return 'Class 8';
    if (combined.includes('7th') || combined.includes('class 7')) return 'Class 7';
    if (combined.includes('11th') || combined.includes('class 11')) return 'Class 11';
    if (combined.includes('12th') || combined.includes('class 12') || combined.includes('inter')) return 'Class 12';

    if (course.class_id?.endsWith('10')) return 'Class 10';
    if (course.class_id?.endsWith('09')) return 'Class 9';
    if (course.class_id?.endsWith('08')) return 'Class 8';
    if (course.class_id?.endsWith('07')) return 'Class 7';

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
      id: `cr000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
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
          id: newCourse.id,
          title: newCourse.title,
          title_hi: newCourse.title_hi,
          tagline: newCourse.tagline,
          description: newCourse.description,
          description_hi: newCourse.description_hi,
          thumbnail_url: newCourse.thumbnail_url,
          board_id: newCourse.board_id,
          class_id: newCourse.class_id,
          class_name: (newCourse as any).class_name || this.getClassNameFromCourse(newCourse),
          is_free: newCourse.is_free,
          price: newCourse.price,
          discount_price: newCourse.discount_price,
          validity_days: newCourse.validity_days,
          start_date: newCourse.start_date,
          features: newCourse.features,
          is_published: true,
        });
      }
    } catch (e) {
      console.warn('Supabase course sync error:', e);
    }

    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx !== -1) {
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
              tagline: updates.tagline,
              description: updates.description,
              thumbnail_url: updates.thumbnail_url,
              price: updates.price,
              discount_price: updates.discount_price,
              validity_days: updates.validity_days,
              start_date: updates.start_date,
              features: updates.features,
              class_name: (updates as any).class_name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
        }
      } catch (e) {
        console.warn('Supabase course update error:', e);
      }
      return this.courses[idx];
    }
    throw new Error('Course not found');
  }

  async deleteCourse(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.courses = this.courses.filter((c) => c.id !== id);
    await this.persist('icc_courses', this.courses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('courses').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase course delete error:', e);
    }
  }

  // --- SUBJECTS (Class Scoped) ---
  async getSubjects(courseId?: string, className?: string): Promise<AcademicSubject[]> {
    let list = this.subjects.filter((s) => !this.deletedIds.has(s.id));

    if (className) {
      const targetClass = className.trim().toLowerCase();
      list = list.filter((s) => {
        const sClass = (s.class_name || '').toLowerCase();
        if (sClass && sClass === targetClass) return true;
        if (targetClass.includes('10') && (s.code.includes('10') || sClass.includes('10'))) return true;
        if (targetClass.includes('9') && (s.code.includes('09') || s.code.includes('9') || sClass.includes('9'))) return true;
        if (targetClass.includes('8') && (s.code.includes('08') || s.code.includes('8') || sClass.includes('8'))) return true;
        if (targetClass.includes('7') && (s.code.includes('07') || s.code.includes('7') || sClass.includes('7'))) return true;
        if (targetClass.includes('11') && (s.code.includes('11') || sClass.includes('11'))) return true;
        if (targetClass.includes('12') && (s.code.includes('12') || sClass.includes('12'))) return true;
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
      id: `sub-${Date.now()}`,
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

    try {
      if (isSupabaseConfigured) {
        await supabase.from('subjects').upsert({
          id: newSub.id,
          name: newSub.name,
          name_hi: newSub.name_hi,
          code: newSub.code,
          icon_name: newSub.icon_name,
          class_name: newSub.class_name,
          class_id: newSub.class_id,
          display_order: newSub.display_order,
        });
      }
    } catch (e) {
      console.warn('Supabase addSubject error:', e);
    }

    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.subjects = this.subjects.filter((s) => s.id !== id);
    await this.persist('icc_academic_subjects', this.subjects);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('subjects').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteSubject error:', e);
    }
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
      id: `ch-${Date.now()}`,
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

    try {
      if (isSupabaseConfigured) {
        await supabase.from('chapters').upsert({
          id: newChapter.id,
          subject_id: newChapter.subject_id,
          chapter_number: newChapter.chapter_number,
          title: newChapter.title,
          title_hi: newChapter.title_hi,
          description: newChapter.description,
        });
      }
    } catch (e) {
      console.warn('Supabase addChapter error:', e);
    }

    return newChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('chapters').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteChapter error:', e);
    }
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    return this.lectures.filter((l) => !this.deletedIds.has(l.id) && l.chapter_id === chapterId);
  }

  async addRecordedLecture(data: Partial<RecordedLecture>): Promise<RecordedLecture> {
    const newLec: RecordedLecture = {
      id: `lec-${Date.now()}`,
      course_id: data.course_id || 'cr000000-0000-0000-0000-000000000001',
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

    try {
      if (isSupabaseConfigured) {
        await supabase.from('recorded_lectures').upsert({
          id: newLec.id,
          course_id: newLec.course_id,
          subject_id: newLec.subject_id,
          chapter_id: newLec.chapter_id,
          title: newLec.title,
          description: newLec.description,
          video_url: newLec.youtube_video_id,
          duration_seconds: newLec.duration_seconds,
          is_free_preview: newLec.is_free_preview,
        });
      }
    } catch (e) {
      console.warn('Supabase addRecordedLecture error:', e);
    }

    return newLec;
  }

  async deleteRecordedLecture(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('recorded_lectures').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteRecordedLecture error:', e);
    }
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
      course_id: data.course_id || 'cr000000-0000-0000-0000-000000000001',
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

    try {
      if (isSupabaseConfigured) {
        await supabase.from('live_classes').upsert({
          id: newLive.id,
          course_id: newLive.course_id,
          batch_id: newLive.batch_id,
          title: newLive.title,
          description: newLive.description,
          scheduled_at: newLive.scheduled_at,
          duration_minutes: newLive.duration_minutes,
          status: newLive.status,
          created_at: newLive.created_at,
        });
      }
    } catch (e) {
      console.warn('Supabase scheduleLiveClass error:', e);
    }

    return newLive;
  }

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<void> {
    const item = this.liveClasses.find((l) => l.id === id);
    if (item) {
      item.status = status;
      await this.persist('icc_live_classes', this.liveClasses);

      try {
        if (isSupabaseConfigured) {
          await supabase.from('live_classes').update({ status }).eq('id', id);
        }
      } catch (e) {
        console.warn('Supabase updateLiveClassStatus error:', e);
      }
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.liveClasses = this.liveClasses.filter((l) => l.id !== id);
    await this.persist('icc_live_classes', this.liveClasses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('live_classes').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteLiveClass error:', e);
    }
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
    if ((data as any).class_name) (newMat as any).class_name = (data as any).class_name;

    this.materials.unshift(newMat);
    await this.persist('icc_study_materials', this.materials);

    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.material_count = (ch.material_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }

    try {
      if (isSupabaseConfigured) {
        await supabase.from('study_materials').upsert({
          id: newMat.id,
          title: newMat.title,
          description: newMat.description,
          file_path: newMat.file_path,
          file_size_bytes: newMat.file_size_bytes,
          material_type: newMat.material_type,
          is_free: newMat.is_free,
          board_id: newMat.board_id,
          class_id: newMat.class_id,
          subject_id: newMat.subject_id,
          chapter_id: newMat.chapter_id,
          version: newMat.version,
        });
      }
    } catch (e) {
      console.warn('Supabase addStudyMaterial error:', e);
    }

    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await this.markAsDeleted(id);
    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_study_materials', this.materials);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('study_materials').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteStudyMaterial error:', e);
    }
  }
}

export const academicService = new AcademicRepository();
