// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Manages Course -> Subject -> Sub-Subject -> Chapter -> Content (Live, Videos, PDFs)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Supports Supabase cloud persistence + persistent offline local fallback

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
  {
    id: 'sub-math-10',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
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
    name: 'Sanskrit / Urdu',
    name_hi: 'संस्कृत / उर्दू',
    code: 'SKT-10',
    icon_name: 'languages',
    has_sub_subjects: false,
    display_order: 5,
  },
  {
    id: 'sub-english-10',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'English (Panorama)',
    name_hi: 'अंग्रेज़ी',
    code: 'ENG-10',
    icon_name: 'feather',
    has_sub_subjects: false,
    display_order: 6,
  },
];

export const initialAcademicChapters: AcademicChapter[] = [
  // Mathematics Chapters
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

  // Science -> Chemistry Chapters
  {
    id: 'ch-chem-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_number: 1,
    title: 'Chemical Reactions and Equations',
    title_hi: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
    description: 'Balancing chemical equations, types of reactions, oxidation, reduction, rancidity.',
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
    description: 'Indicators, pH scale, preparation of Bleaching Powder, Baking Soda, Plaster of Paris.',
    live_count: 0,
    lecture_count: 5,
    material_count: 2,
  },
  {
    id: 'ch-chem-03',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_number: 3,
    title: 'Metals and Non-metals',
    title_hi: 'धातु एवं अधातु',
    description: 'Physical & chemical properties, reactivity series, metallurgy, corrosion prevention.',
    live_count: 0,
    lecture_count: 5,
    material_count: 2,
  },
  {
    id: 'ch-chem-04',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_number: 4,
    title: 'Carbon and its Compounds',
    title_hi: 'कार्बन एवं उसके यौगिक',
    description: 'Covalent bonding, homologous series, functional groups, soap & detergents.',
    live_count: 0,
    lecture_count: 6,
    material_count: 3,
  },

  // Science -> Physics Chapters
  {
    id: 'ch-phy-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-phy-10',
    chapter_number: 1,
    title: 'Light - Reflection and Refraction',
    title_hi: 'प्रकाश - परावर्तन तथा अपवर्तन',
    description: 'Spherical mirrors, mirror formula, magnification, refraction, lens formula.',
    live_count: 1,
    lecture_count: 6,
    material_count: 3,
  },
  {
    id: 'ch-phy-02',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-phy-10',
    chapter_number: 2,
    title: 'Human Eye and Colourful World',
    title_hi: 'मानव नेत्र तथा रंगबिरंगा संसार',
    description: 'Defects of vision (Myopia, Hypermetropia), prism dispersion, atmospheric refraction.',
    live_count: 0,
    lecture_count: 4,
    material_count: 2,
  },
  {
    id: 'ch-phy-03',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-phy-10',
    chapter_number: 3,
    title: 'Electricity',
    title_hi: 'विद्युत',
    description: 'Ohm’s law, resistance, series and parallel circuits, Joule’s heating effect.',
    live_count: 0,
    lecture_count: 5,
    material_count: 3,
  },

  // Science -> Biology Chapters
  {
    id: 'ch-bio-01',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-bio-10',
    chapter_number: 1,
    title: 'Life Processes',
    title_hi: 'जैव प्रक्रम',
    description: 'Nutrition (Autotrophic, Heterotrophic), human digestive system, respiration, excretion.',
    live_count: 1,
    lecture_count: 6,
    material_count: 3,
  },
  {
    id: 'ch-bio-02',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-bio-10',
    chapter_number: 2,
    title: 'Control and Coordination',
    title_hi: 'नियंत्रण एवं समन्वय',
    description: 'Nervous system, neuron structure, reflex arc, human brain, plant hormones.',
    live_count: 0,
    lecture_count: 4,
    material_count: 2,
  },
  {
    id: 'ch-bio-03',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-bio-10',
    chapter_number: 3,
    title: 'How do Organisms Reproduce?',
    title_hi: 'जीव जनन कैसे करते हैं?',
    description: 'Asexual reproduction, sexual reproduction in plants & humans, reproductive health.',
    live_count: 0,
    lecture_count: 5,
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
    id: 'lec-ch1-03',
    course_id: 'cr000000-0000-0000-0000-000000000001',
    subject_id: 'sub-science-10',
    sub_subject_id: 'subsub-chem-10',
    chapter_id: 'ch-chem-01',
    title: 'Lec 03: Displacement, Double Displacement & Redox Reactions',
    title_hi: 'लेक्चर 03: विस्थापन, द्विविस्थापन एवं रेडॉक्स अभिक्रिया',
    description: 'Understanding oxidation-reduction in everyday life with director guidance.',
    youtube_video_id: 'jfKfPfyJRdk',
    duration_seconds: 2750,
    is_free_preview: false,
    lecture_order: 3,
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
    scheduled_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // starts in 30 mins
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
    description: 'Class 10 Live Sunday Special with BADE SIR.',
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
    id: 'pdf-ch1-02',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub-science-10',
    chapter_id: 'ch-chem-01',
    title: 'Ch 01: All Balanced Equations Formula Cheat Sheet',
    title_hi: 'पाठ 01: समस्त संतुलित रासायनिक अभिक्रियाएं फॉर्मूला शीट',
    description: 'One page quick reference sheet for matric exam revision.',
    file_path: 'bseb/class10/science/ch01_chemical_reactions_formula.pdf',
    file_size_bytes: 1200000,
    material_type: 'formula_sheet',
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

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    try {
      if (Platform.OS !== 'web') {
        const storedCourses = await SecureStore.getItemAsync('icc_courses');
        if (storedCourses) this.courses = JSON.parse(storedCourses);

        const storedSubs = await SecureStore.getItemAsync('icc_academic_subjects');
        if (storedSubs) this.subjects = JSON.parse(storedSubs);

        const storedChaps = await SecureStore.getItemAsync('icc_academic_chapters');
        if (storedChaps) this.chapters = JSON.parse(storedChaps);

        const storedLecs = await SecureStore.getItemAsync('icc_recorded_lectures');
        if (storedLecs) this.lectures = JSON.parse(storedLecs);

        const storedLive = await SecureStore.getItemAsync('icc_live_classes');
        if (storedLive) this.liveClasses = JSON.parse(storedLive);

        const storedMats = await SecureStore.getItemAsync('icc_study_materials');
        if (storedMats) this.materials = JSON.parse(storedMats);
      } else if (typeof window !== 'undefined') {
        const sCourses = localStorage.getItem('icc_courses');
        if (sCourses) this.courses = JSON.parse(sCourses);
        const sSubs = localStorage.getItem('icc_academic_subjects');
        if (sSubs) this.subjects = JSON.parse(sSubs);
        const sChaps = localStorage.getItem('icc_academic_chapters');
        if (sChaps) this.chapters = JSON.parse(sChaps);
        const sLecs = localStorage.getItem('icc_recorded_lectures');
        if (sLecs) this.lectures = JSON.parse(sLecs);
        const sLive = localStorage.getItem('icc_live_classes');
        if (sLive) this.liveClasses = JSON.parse(sLive);
        const sMats = localStorage.getItem('icc_study_materials');
        if (sMats) this.materials = JSON.parse(sMats);
      }
    } catch {}
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

  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    return this.courses;
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    return this.courses.find((c) => c.id === id);
  }

  async addCourse(data: Partial<Course>): Promise<Course> {
    const newCourse: Course = {
      id: `cr-${Date.now()}`,
      title: data.title || 'New Target Course',
      title_hi: data.title_hi || data.title || 'नया कोर्स',
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
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lecture_count: 0,
      material_count: 0,
    };
    this.courses.unshift(newCourse);
    await this.persist('icc_courses', this.courses);

    // Sync with Supabase if configured
    try {
      if (isSupabaseConfigured) {
        await supabase.from('courses').insert({
          id: newCourse.id,
          title: newCourse.title,
          title_hi: newCourse.title_hi,
          description: newCourse.description,
          description_hi: newCourse.description_hi,
          thumbnail_url: newCourse.thumbnail_url,
          board_id: newCourse.board_id,
          class_id: newCourse.class_id,
          is_free: newCourse.is_free,
          price: newCourse.price,
          discount_price: newCourse.discount_price,
          validity_days: newCourse.validity_days,
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
              description: updates.description,
              thumbnail_url: updates.thumbnail_url,
              price: updates.price,
              discount_price: updates.discount_price,
              validity_days: updates.validity_days,
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

  // --- SUBJECTS ---
  async getSubjects(courseId?: string): Promise<AcademicSubject[]> {
    return this.subjects;
  }

  async addSubject(sub: Partial<AcademicSubject>): Promise<AcademicSubject> {
    const newSub: AcademicSubject = {
      id: `sub-${Date.now()}`,
      name: sub.name || 'New Subject',
      name_hi: sub.name_hi || sub.name || 'नया विषय',
      code: sub.code || `SUB-${this.subjects.length + 1}`,
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

  // --- CHAPTERS ---
  async getChapters(subjectId: string, subSubjectId?: string): Promise<AcademicChapter[]> {
    return this.chapters.filter((ch) => {
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
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    return this.lectures.filter((l) => l.chapter_id === chapterId);
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

    // Update chapter lecture count
    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.lecture_count = (ch.lecture_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }
    return newLec;
  }

  async deleteRecordedLecture(id: string): Promise<void> {
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);
  }

  // --- CHAPTER CONTENT: LIVE CLASSES ---
  async getLiveClasses(chapterId?: string): Promise<LiveClass[]> {
    if (chapterId) {
      return this.liveClasses.filter((l) => (l as any).chapter_id === chapterId);
    }
    return this.liveClasses;
  }

  async scheduleLiveClass(data: Partial<LiveClass> & { chapter_id?: string; subject_id?: string }): Promise<LiveClass> {
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

  // --- CHAPTER CONTENT: STUDY MATERIALS PDF ---
  async getStudyMaterials(chapterId?: string): Promise<StudyMaterial[]> {
    if (chapterId) {
      return this.materials.filter((m) => m.chapter_id === chapterId);
    }
    return this.materials;
  }

  async addStudyMaterial(data: Partial<StudyMaterial>): Promise<StudyMaterial> {
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
    this.materials.unshift(newMat);
    await this.persist('icc_study_materials', this.materials);

    // Update chapter material count
    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.material_count = (ch.material_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }
    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_study_materials', this.materials);
  }
}

export const academicService = new AcademicRepository();
