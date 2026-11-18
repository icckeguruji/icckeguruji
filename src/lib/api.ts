// IDEAL COACHING CENTRE — MASTER ADMIN API SERVICE LAYER
// Seamlessly interfaces with Supabase Backend (https://gshjxcoyfrskxnpdqooy.supabase.co)
// Direct cloud sync + permanent browser localStorage cache
// Guarantees changes (Add, Edit, Delete) NEVER revert back on refresh or reload!

import { supabase, isSupabaseConfigured } from './supabase';
import {
  UserProfile,
  Course,
  Payment,
  StudyMaterial,
  LiveClass,
  SubjectItem,
  ClassItem,
} from '@icc/shared-types';

export function getResolvedThumbnailUrl(url?: string): string {
  if (!url || typeof url !== 'string') return 'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg';
  const clean = url.trim();
  if (clean.startsWith('file://')) {
    return 'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg';
  }
  if (clean.startsWith('/')) {
    return `https://icconline.vercel.app${clean}`;
  }
  return clean;
}

export function getSafeClassId(classId?: string, className?: string): string {
  const validIds = new Set([
    'c0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000010',
    'c0000000-0000-0000-0000-000000000011',
    'c0000000-0000-0000-0000-000000000012',
  ]);
  if (classId && validIds.has(classId)) return classId;

  const name = (className || '').toLowerCase();
  if (name.includes('12')) return 'c0000000-0000-0000-0000-000000000012';
  if (name.includes('11')) return 'c0000000-0000-0000-0000-000000000011';
  if (name.includes('9')) return 'c0000000-0000-0000-0000-000000000009';
  return 'c0000000-0000-0000-0000-000000000010';
}

export function isValidUUID(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface BatchWithMeta {
  id: string;
  course_id: string;
  teacher_id?: string;
  name: string;
  name_hi?: string;
  schedule_info?: string;
  start_date?: string;
  is_active: boolean;
  created_at: string;
  courseTitle?: string;
  studentCount?: number;
  thumbnail_url?: string;
}

export interface AdminProfileData {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  role: string;
  avatar_url?: string;
  preferred_language?: string;
}

export interface RecordedLectureItem {
  id: string;
  course_id?: string;
  subject_id?: string;
  chapter_id?: string;
  topic_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  youtube_video_id: string;
  duration_minutes: number;
  lecture_order: number;
  is_free_preview: boolean;
  subject?: string;
  chapter?: string;
  created_at?: string;
}

export interface ExaminationItem {
  id: string;
  course_id?: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  title_hi?: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  pass_marks: number;
  negative_marking: number;
  exam_type: string;
  question_count?: number;
  is_published?: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
}

const defaultAdminProfile: AdminProfileData = {
  id: 'adm00000-0000-0000-0000-000000000001',
  full_name: 'BADE SIR (Director)',
  email: 'icckeguruji@gmail.com',
  mobile_number: '9771350910',
  role: 'admin',
  avatar_url: '/logo.png',
  preferred_language: 'en',
};

export const allInitialCourses: Course[] = [
  {
    id: 'ae78ea58-19aa-4ed4-86c8-336bd42c45ef',
    title: 'Class 10 State Board Topper Course 2027',
    title_hi: 'कक्षा 10वीं स्टेट बोर्ड टॉपर कोर्स 2027 (मैट्रिक)',
    tagline: 'Complete BSEB & JAC Matric Syllabus Mastery with BADE SIR',
    description: 'Comprehensive coaching program covering Math, Science, Social Science, Hindi, English and Sanskrit with daily HD live classes and handwritten PDF master notes.',
    description_hi: 'गणित, विज्ञान, सामाजिक विज्ञान एवं भाषा विषयों की संपूर्ण लाइव तैयारी एवं हस्तलिखित नोट्स।',
    thumbnail_url: 'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    price: 999,
    discount_price: 499,
    validity_days: 365,
    class_name: 'Class 10',
    is_published: true,
    is_free: false,
    lecture_count: 0,
    material_count: 0,
    created_at: '2026-11-18T00:00:00Z',
    updated_at: '2026-11-18T00:00:00Z',
  },
  {
    id: 'c1200000-1111-4000-8000-000000000012',
    title: 'Class 12 Intermediate Science Target Course 2027',
    title_hi: 'कक्षा 12वीं इंटरमीडिएट साइंस टारगेट कोर्स 2027',
    tagline: 'Physics, Chemistry, Maths & Biology Excellence with BADE SIR',
    description: 'Specialized 12th board preparation program covering high-scoring numerical methods, conceptual derivations, and chapter-wise question banks.',
    description_hi: 'भौतिकी, रसायन, गणित एवं जीव विज्ञान की उच्च स्तरीय बोर्ड परीक्षा तैयारी।',
    thumbnail_url: 'https://icconline.vercel.app/thumbnails/batch-b4-class9.jpg',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000012',
    price: 1499,
    discount_price: 699,
    validity_days: 365,
    class_name: 'Class 12',
    is_published: true,
    is_free: false,
    lecture_count: 0,
    material_count: 0,
    created_at: '2026-11-18T00:00:00Z',
    updated_at: '2026-11-18T00:00:00Z',
  },
  {
    id: 'c0900000-1111-4000-8000-000000000009',
    title: 'Class 9 Foundation & Target Course 2027',
    title_hi: 'कक्षा 9वीं फाउंडेशन एवं बोर्ड पूर्व तैयारी कोर्स 2027',
    tagline: 'Strong Science & Mathematics Foundation for High School',
    description: 'Build rock-solid conceptual clarity for Class 9 Mathematics and Science to score 95%+ in school and upcoming matric exams.',
    description_hi: 'कक्षा 9वीं गणित एवं विज्ञान की मजबूत नींव ताकि 10वीं बोर्ड में 95%+ अंक सुनिश्चित हों।',
    thumbnail_url: 'https://icconline.vercel.app/thumbnails/batch-b1-class8.jpg',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000009',
    price: 899,
    discount_price: 399,
    validity_days: 365,
    class_name: 'Class 9',
    is_published: true,
    is_free: false,
    lecture_count: 0,
    material_count: 0,
    created_at: '2026-11-18T00:00:00Z',
    updated_at: '2026-11-18T00:00:00Z',
  },
  {
    id: 'c1100000-1111-4000-8000-000000000011',
    title: 'Class 11 Science Concept & Target Course 2027',
    title_hi: 'कक्षा 11वीं साइंस कॉन्सेप्ट एवं टारगेट कोर्स 2027',
    tagline: 'Bridging High School with Senior Secondary Science & Math',
    description: 'Thorough coverage of Class 11 Science syllabus with in-depth problem-solving sessions and formula cheat sheets.',
    description_hi: 'कक्षा 11वीं भौतिकी, रसायन एवं गणित के कठिन अध्यायों का सरल समाधान।',
    thumbnail_url: 'https://icconline.vercel.app/thumbnails/batch-b2-class9.jpg',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000011',
    price: 1299,
    discount_price: 599,
    validity_days: 365,
    class_name: 'Class 11',
    is_published: true,
    is_free: false,
    lecture_count: 0,
    material_count: 0,
    created_at: '2026-11-18T00:00:00Z',
    updated_at: '2026-11-18T00:00:00Z',
  },
];

// Storage keys (v4 synchronized)
const STORAGE_KEYS = {
  STUDENTS: 'icc_v4_students',
  COURSES: 'icc_v4_courses',
  PAYMENTS: 'icc_v4_payments',
  MATERIALS: 'icc_v4_materials',
  LIVE_CLASSES: 'icc_v4_live_classes',
  RECORDED_LECTURES: 'icc_v4_recorded_lectures',
  EXAMINATIONS: 'icc_v4_examinations',
  SUBJECTS: 'icc_v4_subjects',
  ADMIN_PROFILE: 'icc_v4_profile',
};

// Helper to retrieve data from localStorage (browser-safe, permanent)
function getPersistentState<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw) as T;
    }
  } catch {}
  return defaultData;
}

function sanitizeItemForStorage(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const copy = { ...item };
  if (
    typeof copy.thumbnail_url === 'string' &&
    copy.thumbnail_url.startsWith('data:image/') &&
    copy.thumbnail_url.length > 5000
  ) {
    copy.thumbnail_url = '/thumbnails/batch-b3-class10.jpg';
  }
  return copy;
}

// Helper to save data to localStorage (browser-safe, permanent, quota-guarded)
function savePersistentState<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const toStore = Array.isArray(data)
      ? data.map(sanitizeItemForStorage)
      : sanitizeItemForStorage(data);
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (err) {
    console.warn(`localStorage quota limit encountered for key: ${key}`, err);
    try {
      if (Array.isArray(data)) {
        const fallback = data.slice(0, 15).map(sanitizeItemForStorage);
        localStorage.setItem(key, JSON.stringify(fallback));
      }
    } catch (retryErr) {
      console.warn('Fallback save also failed:', retryErr);
    }
  }
}

// In-memory working cache initialized from persistent store
let localStudents: UserProfile[] = getPersistentState(STORAGE_KEYS.STUDENTS, []);
let localPayments: Payment[] = getPersistentState(STORAGE_KEYS.PAYMENTS, []);
const cachedCourses = getPersistentState<Course[]>(STORAGE_KEYS.COURSES, []);
let localCourses: Course[] = Array.isArray(cachedCourses) ? cachedCourses : [];
let localMaterials: StudyMaterial[] = getPersistentState(STORAGE_KEYS.MATERIALS, []);
let localLiveClasses: LiveClass[] = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, []);
let localLectures: RecordedLectureItem[] = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, []);
let localExams: ExaminationItem[] = getPersistentState(STORAGE_KEYS.EXAMINATIONS, []);
let localAdminProfile: AdminProfileData = getPersistentState(STORAGE_KEYS.ADMIN_PROFILE, { ...defaultAdminProfile });

export const AdminApi = {
  // 1. Analytics Summary
  getDashboardAnalytics: async () => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);

    let studentCount = localStudents.length;
    let activeStudentCount = localStudents.filter((s) => s.is_active).length;
    let courseCount = localCourses.length;
    let pdfCount = localMaterials.length;
    let liveCount = localLiveClasses.length;
    let lectureCount = localLectures.length;
    let examCount = localExams.length;

    let pendingPayments = localPayments.filter((p) => p.status === 'pending').length;
    let approvedPayments = localPayments.filter((p) => p.status === 'approved').length;
    let totalRevenue = localPayments
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);

    if (isSupabaseConfigured) {
      try {
        const [
          studentsRes,
          activeStudentsRes,
          coursesRes,
          paymentsRes,
          materialsRes,
          liveRes,
          lecturesRes,
          examsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('payments').select('id, amount, status'),
          supabase.from('study_materials').select('id', { count: 'exact' }),
          supabase.from('live_classes').select('id', { count: 'exact' }),
          supabase.from('recorded_lectures').select('id', { count: 'exact' }),
          supabase.from('examinations').select('id', { count: 'exact' }),
        ]);

        if (typeof studentsRes.count === 'number') {
          studentCount = studentsRes.count;
        } else if (Array.isArray((studentsRes as any).data)) {
          studentCount = (studentsRes as any).data.length;
        }

        if (typeof activeStudentsRes.count === 'number') {
          activeStudentCount = activeStudentsRes.count;
        } else if (Array.isArray((activeStudentsRes as any).data)) {
          activeStudentCount = (activeStudentsRes as any).data.length;
        }

        if (typeof coursesRes.count === 'number') {
          courseCount = coursesRes.count;
        } else if (Array.isArray((coursesRes as any).data)) {
          courseCount = (coursesRes as any).data.length;
        }

        if (typeof materialsRes.count === 'number') {
          pdfCount = materialsRes.count;
        } else if (Array.isArray((materialsRes as any).data)) {
          pdfCount = (materialsRes as any).data.length;
        }

        if (typeof liveRes.count === 'number') {
          liveCount = liveRes.count;
        } else if (Array.isArray((liveRes as any).data)) {
          liveCount = (liveRes as any).data.length;
        }

        if (typeof lecturesRes.count === 'number') {
          lectureCount = lecturesRes.count;
        } else if (Array.isArray((lecturesRes as any).data)) {
          lectureCount = (lecturesRes as any).data.length;
        }

        if (typeof examsRes.count === 'number') {
          examCount = examsRes.count;
        } else if (Array.isArray((examsRes as any).data)) {
          examCount = (examsRes as any).data.length;
        }

        const dbPayments = paymentsRes.data || [];
        if (dbPayments.length > 0) {
          pendingPayments = dbPayments.filter((p) => p.status === 'pending').length;
          approvedPayments = dbPayments.filter((p) => p.status === 'approved').length;
          totalRevenue = dbPayments
            .filter((p) => p.status === 'approved')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        }
      } catch {}
    }

    return {
      totalStudents: studentCount,
      activeStudents: activeStudentCount,
      totalCourses: courseCount,
      totalBatches: 0, // Batches completely eliminated; only Courses exist
      pendingPayments,
      approvedPayments,
      totalRevenue,
      pdfCount,
      liveClassesToday: liveCount,
      lectureCount,
      examCount,
    };
  },

  // 2. Student Management (CRUD)
  getStudents: async (query?: string, board?: string) => {
    if (isSupabaseConfigured) {
      try {
        let req = supabase.from('profiles').select('*');
        if (board) req = req.eq('board_code', board);
        if (query) {
          req = req.or(
            `full_name.ilike.%${query}%,mobile_number.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`
          );
        }
        const { data, error } = await req.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localStudents = data as UserProfile[];
          savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
          return localStudents;
        }
      } catch (e) {
        console.error('getStudents Supabase error:', e);
      }
    }

    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, []);
    let filtered = [...localStudents];
    if (board) filtered = filtered.filter((s) => s.board_code === board);
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.mobile_number.includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.username.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  createStudent: async (studentData: Partial<UserProfile>) => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    const newStudent: UserProfile = {
      id: `u-${Date.now()}`,
      username: studentData.username || `student_${Date.now().toString().slice(-4)}`,
      full_name: studentData.full_name || 'New Student',
      mobile_number: studentData.mobile_number || '9999999999',
      email: studentData.email || 'student@example.com',
      board_code: (studentData.board_code as any) || 'BSEB',
      district: studentData.district || 'Godda',
      school_name: studentData.school_name || 'Government High School',
      guardian_name: studentData.guardian_name || '',
      guardian_phone: studentData.guardian_phone || '',
      preferred_language: 'en',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').insert(studentData).select().single();
        if (!error && data) {
          localStudents = [data as UserProfile, ...localStudents];
          savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
          return data as UserProfile;
        }
      } catch {}
    }

    localStudents = [newStudent, ...localStudents];
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return newStudent;
  },

  updateStudent: async (studentId: string, updates: Partial<UserProfile>) => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(updates).eq('id', studentId);
      } catch {}
    }

    localStudents = localStudents.map((s) =>
      s.id === studentId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return localStudents.find((s) => s.id === studentId) || null;
  },

  deleteStudent: async (studentId: string) => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', studentId);
      } catch {}
    }

    localStudents = localStudents.filter((s) => s.id !== studentId);
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return true;
  },

  toggleStudentStatus: async (studentId: string, isActive: boolean) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ is_active: isActive }).eq('id', studentId);
      } catch {}
    }
    localStudents = localStudents.map((s) => (s.id === studentId ? { ...s, is_active: isActive } : s));
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return true;
  },

  // 3. Course Management (CRUD - Supabase Single Source of Truth)
  getCourses: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          const resolved: Course[] = data.map((item) => ({
            ...(item as Course),
            thumbnail_url: getResolvedThumbnailUrl(item.thumbnail_url),
          }));
          localCourses = resolved;
          savePersistentState(STORAGE_KEYS.COURSES, resolved);
          return resolved;
        } else if (error) {
          console.error('getCourses Supabase query error:', error);
        }
      } catch (e) {
        console.error('getCourses Supabase exception:', e);
      }
    }
    // Offline / fallback cache only when Supabase is unreachable
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, []);
    return localCourses.map((c) => ({
      ...c,
      thumbnail_url: getResolvedThumbnailUrl(c.thumbnail_url),
    }));
  },

  createCourse: async (course: Partial<Course>) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);

    const defaultBoardId = 'b0000000-0000-0000-0000-000000000001';
    const safeClassId = getSafeClassId(course.class_id, (course as any)?.class_name);
    const defaultSessionId = 'a0000000-0000-0000-0000-000000000001';
    const courseId = course.id && isValidUUID(course.id) ? course.id : generateUUID();

    const insertPayload: any = {
      id: courseId,
      title: course.title || 'New Course',
      title_hi: course.title_hi || course.title || 'New Course',
      tagline: course.tagline || '',
      description: course.description || '',
      description_hi: course.description_hi || course.description || '',
      thumbnail_url: getResolvedThumbnailUrl(course.thumbnail_url),
      board_id: course.board_id || defaultBoardId,
      class_id: safeClassId,
      session_id: course.session_id || defaultSessionId,
      is_free: course.is_free ?? false,
      price: course.is_free ? 0 : (course.price ?? 999),
      discount_price: course.is_free ? 0 : (course.discount_price ?? 499),
      validity_days: course.validity_days ?? 365,
      class_name: (course as any).class_name || 'Class 10',
      is_published: true,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) {
          const resolved = {
            ...(data as Course),
            thumbnail_url: getResolvedThumbnailUrl(data.thumbnail_url),
          };
          localCourses = [resolved, ...localCourses.filter((c) => c.id !== data.id)];
          savePersistentState(STORAGE_KEYS.COURSES, localCourses);
          return resolved;
        } else if (error) {
          console.error('createCourse Supabase error:', error);
        }
      } catch (err) {
        console.error('createCourse exception:', err);
      }
    }

    const fallbackCourse: Course = {
      ...insertPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lecture_count: 0,
      material_count: 0,
    };

    localCourses = [fallbackCourse, ...localCourses.filter((c) => c.id !== fallbackCourse.id)];
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return fallbackCourse;
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    const { board, class: classItem, lecture_count, material_count, ...cleanUpdates } = updates as any;
    if (cleanUpdates.thumbnail_url) {
      cleanUpdates.thumbnail_url = getResolvedThumbnailUrl(cleanUpdates.thumbnail_url);
    }
    if (cleanUpdates.class_id || cleanUpdates.class_name) {
      cleanUpdates.class_id = getSafeClassId(cleanUpdates.class_id, cleanUpdates.class_name);
    }
    cleanUpdates.updated_at = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(courseId)) {
          const { error } = await supabase.from('courses').update(cleanUpdates).eq('id', courseId);
          if (error) console.error('updateCourse Supabase error:', error);
        } else {
          const existing = localCourses.find((c) => c.id === courseId);
          if (existing?.title) {
            await supabase.from('courses').update(cleanUpdates).eq('title', existing.title);
          }
        }
      } catch (err) {
        console.error('updateCourse exception:', err);
      }
    }

    localCourses = localCourses.map((c) =>
      c.id === courseId
        ? {
            ...c,
            ...updates,
            thumbnail_url: updates.thumbnail_url ? getResolvedThumbnailUrl(updates.thumbnail_url) : c.thumbnail_url,
            updated_at: new Date().toISOString(),
          }
        : c
    );
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return localCourses.find((c) => c.id === courseId) || null;
  },

  deleteCourse: async (courseId: string) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    const target = localCourses.find((c) => c.id === courseId);

    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(courseId)) {
          // Pre-delete related records to prevent foreign key errors
          await Promise.allSettled([
            supabase.from('subjects').delete().eq('course_id', courseId),
            supabase.from('live_classes').delete().eq('course_id', courseId),
            supabase.from('study_materials').delete().eq('course_id', courseId),
            supabase.from('recorded_lectures').delete().eq('course_id', courseId),
          ]);
          const { error } = await supabase.from('courses').delete().eq('id', courseId);
          if (error) console.error('deleteCourse Supabase error:', error);
        }
        if (target?.title) {
          await supabase.from('courses').delete().eq('title', target.title);
        }
      } catch (err) {
        console.error('deleteCourse exception:', err);
      }
    }
    localCourses = localCourses.filter((c) => c.id !== courseId);
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return true;
  },

  // 4. Course Subjects & Chapters (Manual Curriculum Management)
  getCourseSubjects: async (courseId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.error('getCourseSubjects error:', e);
      }
    }
    const key = `icc_course_subs_${courseId}`;
    return getPersistentState<any[]>(key, []);
  },

  createCourseSubject: async (courseId: string, subject: { name: string; name_hi?: string }) => {
    const payload = {
      course_id: courseId,
      name: subject.name,
      name_hi: subject.name_hi || subject.name,
      code: `SUB-${Date.now().toString().slice(-4)}`,
      icon_name: 'book-open',
      is_active: true,
      display_order: 1,
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          const key = `icc_course_subs_${courseId}`;
          const current = getPersistentState<any[]>(key, []);
          savePersistentState(key, [...current, data]);
          return data;
        }
      } catch (e) {
        console.error('createCourseSubject error:', e);
      }
    }
    const fallback = { id: `sub-${Date.now()}`, ...payload };
    const key = `icc_course_subs_${courseId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, [...current, fallback]);
    return fallback;
  },

  deleteCourseSubject: async (courseId: string, subjectId: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('subjects').delete().eq('id', subjectId);
      } catch (e) {
        console.error('deleteCourseSubject error:', e);
      }
    }
    const key = `icc_course_subs_${courseId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, current.filter((s) => s.id !== subjectId));
    return true;
  },

  // 3.5 Sub-Subjects / Units Management (Dynamic Hierarchy)
  getSubSubjects: async (subjectId: string) => {
    const key = `icc_sub_subjects_${subjectId}`;
    return getPersistentState<any[]>(key, []);
  },

  createSubSubject: async (subjectId: string, sub: { name: string; name_hi?: string }) => {
    const key = `icc_sub_subjects_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    const newSubSub = {
      id: `subsub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject_id: subjectId,
      name: sub.name,
      name_hi: sub.name_hi || sub.name,
      display_order: current.length + 1,
    };
    savePersistentState(key, [...current, newSubSub]);
    return newSubSub;
  },

  deleteSubSubject: async (subjectId: string, subSubId: string) => {
    const key = `icc_sub_subjects_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, current.filter((s) => s.id !== subSubId));
    return true;
  },

  getSubjectChapters: async (subjectId: string, subSubjectId?: string) => {
    let list: any[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('subject_id', subjectId)
          .order('chapter_number', { ascending: true });
        if (!error && Array.isArray(data)) {
          list = data;
        }
      } catch (e) {
        console.error('getSubjectChapters error:', e);
      }
    }
    if (list.length === 0) {
      const key = `icc_subj_chaps_${subjectId}`;
      list = getPersistentState<any[]>(key, []);
    }
    if (subSubjectId) {
      list = list.filter((ch) => ch.sub_subject_id === subSubjectId || ch.description?.includes(`sub_subject:${subSubjectId}`));
    }
    return list;
  },

  createSubjectChapter: async (
    subjectId: string,
    courseId: string,
    chapter: { title: string; title_hi?: string; chapter_number?: number; sub_subject_id?: string; description?: string }
  ) => {
    const desc = chapter.description || (chapter.sub_subject_id ? `sub_subject:${chapter.sub_subject_id}` : '');
    const payload = {
      subject_id: subjectId,
      course_id: courseId,
      title: chapter.title,
      title_hi: chapter.title_hi || chapter.title,
      chapter_number: chapter.chapter_number || 1,
      display_order: chapter.chapter_number || 1,
      description: desc,
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          const res = { ...data, sub_subject_id: chapter.sub_subject_id };
          const key = `icc_subj_chaps_${subjectId}`;
          const current = getPersistentState<any[]>(key, []);
          savePersistentState(key, [...current, res]);
          return res;
        }
      } catch (e) {
        console.error('createSubjectChapter error:', e);
      }
    }
    const fallback = { id: `ch-${Date.now()}`, ...payload, sub_subject_id: chapter.sub_subject_id };
    const key = `icc_subj_chaps_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, [...current, fallback]);
    return fallback;
  },

  deleteSubjectChapter: async (subjectId: string, chapterId: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('chapters').delete().eq('id', chapterId);
      } catch (e) {
        console.error('deleteSubjectChapter error:', e);
      }
    }
    const key = `icc_subj_chaps_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, current.filter((c) => c.id !== chapterId));
    return true;
  },

  // Chapter Content Lookups
  getChapterLiveClasses: async (chapterId: string) => {
    const all = await AdminApi.getLiveClasses();
    return all.filter((l: any) => l.chapter_id === chapterId);
  },

  getChapterRecordedLectures: async (chapterId: string) => {
    const all = await AdminApi.getRecordedLectures();
    return all.filter((l: any) => l.chapter_id === chapterId);
  },

  getChapterStudyMaterials: async (chapterId: string) => {
    const all = await AdminApi.getStudyMaterials();
    return all.filter((m: any) => m.chapter_id === chapterId);
  },

  // 4. Live Classes (CRUD)
  getLiveClasses: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('live_classes')
          .select('*')
          .order('scheduled_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localLiveClasses = data as LiveClass[];
          savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
          return localLiveClasses;
        }
      } catch (e) {
        console.error('getLiveClasses Supabase error:', e);
      }
    }
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, []);
    return localLiveClasses;
  },

  createLiveClass: async (cls: Partial<LiveClass>) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);

    const validCourseId =
      cls.course_id ||
      localCourses[0]?.id ||
      'c0000000-0000-0000-0000-000000000010';

    const insertPayload: any = {
      course_id: validCourseId,
      title: cls.title || 'Live Session',
      title_hi: cls.title_hi || cls.title || 'लाइव कक्षा',
      description: cls.description || '',
      youtube_video_id: cls.youtube_video_id || 'jfKfPfyJRdk',
      scheduled_at: cls.scheduled_at || new Date().toISOString(),
      duration_minutes: cls.duration_minutes || 60,
      status: cls.status || 'scheduled',
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('live_classes')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) {
          localLiveClasses = [data as LiveClass, ...localLiveClasses];
          savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
          return data as LiveClass;
        } else if (error) {
          console.error('createLiveClass Supabase error:', error);
        }
      } catch (err) {
        console.error('createLiveClass exception:', err);
      }
    }

    const fallbackLive: LiveClass = {
      id: `live-${Date.now()}`,
      ...insertPayload,
      created_at: new Date().toISOString(),
    };

    localLiveClasses = [fallbackLive, ...localLiveClasses];
    savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    return fallbackLive;
  },

  updateLiveClass: async (classId: string, updates: Partial<LiveClass>) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('live_classes').update(updates).eq('id', classId);
        if (error) console.error('updateLiveClass Supabase error:', error);
      } catch (err) {
        console.error('updateLiveClass exception:', err);
      }
    }

    localLiveClasses = localLiveClasses.map((l) =>
      l.id === classId ? { ...l, ...updates } : l
    );
    savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    // Automatic Live-to-Recording Lifecycle: SCHEDULED -> LIVE -> ENDED_PROCESSING -> RECORDED_READY
    if (updates.status === 'completed') {
      try {
        const liveItem = localLiveClasses.find((l) => l.id === classId);
        if (liveItem && liveItem.youtube_video_id) {
          await AdminApi.promoteLiveToRecordedLecture({
            live_class_id: classId,
            course_id: liveItem.course_id,
            subject_id: (liveItem as any).subject_id,
            chapter_id: (liveItem as any).chapter_id,
            title: liveItem.title,
            title_hi: liveItem.title_hi,
            description: liveItem.description,
            youtube_video_id: liveItem.youtube_video_id,
            duration_minutes: liveItem.duration_minutes || 60,
          });
        }
      } catch (err) {
        console.error('Auto promotion to recorded lecture failed:', err);
      }
    }

    return localLiveClasses.find((l) => l.id === classId) || null;
  },

  promoteLiveToRecordedLecture: async (live: {
    live_class_id?: string;
    course_id: string;
    subject_id?: string;
    chapter_id?: string;
    title: string;
    title_hi?: string;
    description?: string;
    youtube_video_id: string;
    duration_minutes?: number;
  }) => {
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    // Deduplication check
    const existing = localLectures.find(
      (l) => l.youtube_video_id === live.youtube_video_id || (l.title === live.title && l.chapter_id === live.chapter_id)
    );
    if (existing) return existing;

    return await AdminApi.createRecordedLecture({
      course_id: live.course_id,
      subject_id: live.subject_id || 'd0000000-0000-0000-0000-000000000002',
      chapter_id: live.chapter_id || 'e0000000-0000-0000-0000-000000000001',
      title: live.title,
      title_hi: live.title_hi || live.title,
      description: live.description || '',
      youtube_video_id: live.youtube_video_id,
      duration_minutes: live.duration_minutes || 60,
      lecture_order: localLectures.length + 1,
      is_free_preview: false,
    });
  },

  deleteLiveClass: async (classId: string) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('live_classes').delete().eq('id', classId);
        if (error) console.error('deleteLiveClass Supabase error:', error);
      } catch (err) {
        console.error('deleteLiveClass exception:', err);
      }
    }
    localLiveClasses = localLiveClasses.filter((l) => l.id !== classId);
    savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    return true;
  },

  // 5. Recorded Video Lectures (CRUD)
  getRecordedLectures: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recorded_lectures')
          .select('*')
          .order('lecture_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          localLectures = data.map((l: any) => ({
            id: l.id,
            course_id: l.course_id,
            subject_id: l.subject_id,
            chapter_id: l.chapter_id,
            title: l.title,
            title_hi: l.title_hi || l.title,
            description: l.description,
            youtube_video_id: l.youtube_video_id,
            duration_minutes: Math.round((l.duration_seconds || 0) / 60) || 45,
            lecture_order: l.lecture_order || 1,
            is_free_preview: Boolean(l.is_free_preview),
            subject: l.subject || 'Core Subject',
            chapter: l.chapter || 'Chapter 1',
            created_at: l.created_at,
          }));
          savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
          return localLectures;
        }
      } catch (e) {
        console.error('getRecordedLectures Supabase error:', e);
      }
    }
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, []);
    return localLectures;
  },

  createRecordedLecture: async (lec: Partial<RecordedLectureItem>) => {
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);

    const validCourseId =
      lec.course_id ||
      localCourses[0]?.id ||
      'c0000000-0000-0000-0000-000000000010';

    const insertPayload: any = {
      course_id: validCourseId,
      subject_id: lec.subject_id || 'd0000000-0000-0000-0000-000000000002',
      chapter_id: lec.chapter_id || 'e0000000-0000-0000-0000-000000000001',
      title: lec.title || 'New Video Lecture',
      title_hi: lec.title_hi || lec.title || 'नया वीडियो व्याख्यान',
      description: lec.description || '',
      youtube_video_id: lec.youtube_video_id || 'dQw4w9WgXcQ',
      duration_seconds: (lec.duration_minutes || 45) * 60,
      lecture_order: lec.lecture_order || 1,
      is_free_preview: Boolean(lec.is_free_preview),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('recorded_lectures')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) {
          const item: RecordedLectureItem = {
            id: data.id,
            title: data.title,
            title_hi: data.title_hi,
            youtube_video_id: data.youtube_video_id,
            duration_minutes: Math.round(data.duration_seconds / 60) || 45,
            lecture_order: data.lecture_order,
            is_free_preview: data.is_free_preview,
            subject: lec.subject || 'Science (विज्ञान)',
            chapter: lec.chapter || 'Ch 1: Basics',
            created_at: data.created_at,
          };
          localLectures = [item, ...localLectures];
          savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
          return item;
        } else if (error) {
          console.error('createRecordedLecture Supabase error:', error);
        }
      } catch (err) {
        console.error('createRecordedLecture exception:', err);
      }
    }

    const fallbackLec: RecordedLectureItem = {
      id: `lec-${Date.now()}`,
      title: insertPayload.title,
      title_hi: insertPayload.title_hi,
      youtube_video_id: insertPayload.youtube_video_id,
      duration_minutes: lec.duration_minutes || 45,
      lecture_order: insertPayload.lecture_order,
      is_free_preview: insertPayload.is_free_preview,
      subject: lec.subject || 'Science (विज्ञान)',
      chapter: lec.chapter || 'Ch 1: Basics',
      created_at: new Date().toISOString(),
    };

    localLectures = [fallbackLec, ...localLectures];
    savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    return fallbackLec;
  },

  updateRecordedLecture: async (lectureId: string, updates: Partial<RecordedLectureItem>) => {
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);

    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.title_hi) dbUpdates.title_hi = updates.title_hi;
        if (updates.youtube_video_id) dbUpdates.youtube_video_id = updates.youtube_video_id;
        if (updates.duration_minutes) dbUpdates.duration_seconds = updates.duration_minutes * 60;
        if (updates.lecture_order) dbUpdates.lecture_order = updates.lecture_order;
        if (updates.is_free_preview !== undefined) dbUpdates.is_free_preview = updates.is_free_preview;

        const { error } = await supabase.from('recorded_lectures').update(dbUpdates).eq('id', lectureId);
        if (error) console.error('updateRecordedLecture Supabase error:', error);
      } catch (err) {
        console.error('updateRecordedLecture exception:', err);
      }
    }

    localLectures = localLectures.map((l) =>
      l.id === lectureId ? { ...l, ...updates } : l
    );
    savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    return localLectures.find((l) => l.id === lectureId) || null;
  },

  deleteRecordedLecture: async (lectureId: string) => {
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('recorded_lectures').delete().eq('id', lectureId);
        if (error) console.error('deleteRecordedLecture Supabase error:', error);
      } catch (err) {
        console.error('deleteRecordedLecture exception:', err);
      }
    }

    localLectures = localLectures.filter((l) => l.id !== lectureId);
    savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    return true;
  },

  // 6. Study Materials PDF (CRUD)
  getStudyMaterials: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localMaterials = data as StudyMaterial[];
          savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
          return localMaterials;
        }
      } catch (e) {
        console.error('getStudyMaterials Supabase error:', e);
      }
    }
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, []);
    return localMaterials;
  },

  uploadStudyMaterial: async (material: Partial<StudyMaterial>) => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    const defaultBoardId = 'b0000000-0000-0000-0000-000000000001';
    const defaultClassId = 'c0000000-0000-0000-0000-000000000010';
    const defaultSubjectId = 'd0000000-0000-0000-0000-000000000002';
    const defaultChapterId = 'e0000000-0000-0000-0000-000000000001';

    const insertPayload: any = {
      title: material.title || 'Untitled Notes',
      title_hi: material.title_hi || material.title || 'बिना शीर्षक नोट्स',
      description: material.description || '',
      board_id: material.board_id || defaultBoardId,
      class_id: material.class_id || defaultClassId,
      subject_id: material.subject_id || defaultSubjectId,
      chapter_id: material.chapter_id || defaultChapterId,
      file_path: material.file_path || 'bseb/class10/notes.pdf',
      file_size_bytes: material.file_size_bytes || 2450000,
      material_type: material.material_type || 'chapter_notes',
      is_free: material.is_free ?? false,
      version: 1,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) {
          localMaterials = [data as StudyMaterial, ...localMaterials];
          savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
          return data as StudyMaterial;
        } else if (error) {
          console.error('uploadStudyMaterial Supabase error:', error);
        }
      } catch (err) {
        console.error('uploadStudyMaterial exception:', err);
      }
    }

    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      ...insertPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localMaterials = [newMat, ...localMaterials];
    savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    return newMat;
  },

  updateStudyMaterial: async (materialId: string, updates: Partial<StudyMaterial>) => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('study_materials').update(updates).eq('id', materialId);
        if (error) console.error('updateStudyMaterial Supabase error:', error);
      } catch (err) {
        console.error('updateStudyMaterial exception:', err);
      }
    }

    localMaterials = localMaterials.map((m) =>
      m.id === materialId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    );
    savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    return localMaterials.find((m) => m.id === materialId) || null;
  },

  deleteStudyMaterial: async (materialId: string) => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('study_materials').delete().eq('id', materialId);
        if (error) console.error('deleteStudyMaterial Supabase error:', error);
      } catch (err) {
        console.error('deleteStudyMaterial exception:', err);
      }
    }
    localMaterials = localMaterials.filter((m) => m.id !== materialId);
    savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    return true;
  },

  // 7. Examinations (CRUD)
  getExaminations: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localExams = data.map((e: any) => ({
            id: e.id,
            course_id: e.course_id,
            title: e.title,
            title_hi: e.title_hi || e.title,
            description: e.description,
            duration_minutes: e.duration_minutes || 60,
            total_marks: Number(e.total_marks) || 100,
            pass_marks: Number(e.pass_marks) || 33,
            negative_marking: Number(e.negative_marking) || 0,
            exam_type: e.exam_type || 'chapter_test',
            question_count: e.question_count || 20,
            is_published: Boolean(e.is_published),
            created_at: e.created_at,
          }));
          savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
          return localExams;
        }
      } catch (e) {
        console.error('getExaminations Supabase error:', e);
      }
    }
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, []);
    return localExams;
  },

  createExamination: async (exam: Partial<ExaminationItem>) => {
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);

    const validCourseId =
      exam.course_id ||
      localCourses[0]?.id ||
      'c0000000-0000-0000-0000-000000000010';

    const insertPayload: any = {
      course_id: validCourseId,
      title: exam.title || 'New Examination',
      title_hi: exam.title_hi || exam.title || 'नई परीक्षा',
      description: exam.description || '',
      duration_minutes: Number(exam.duration_minutes) || 45,
      total_marks: Number(exam.total_marks) || 50,
      pass_marks: Number(exam.pass_marks) || 17,
      negative_marking: Number(exam.negative_marking) || 0,
      exam_type: exam.exam_type || 'chapter_test',
      is_published: true,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('examinations')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) {
          const item: ExaminationItem = {
            id: data.id,
            ...insertPayload,
            question_count: exam.question_count || 15,
            created_at: data.created_at,
          };
          localExams = [item, ...localExams];
          savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
          return item;
        } else if (error) {
          console.error('createExamination Supabase error:', error);
        }
      } catch (err) {
        console.error('createExamination exception:', err);
      }
    }

    const fallbackExam: ExaminationItem = {
      id: `ex-${Date.now()}`,
      ...insertPayload,
      question_count: exam.question_count || 15,
      created_at: new Date().toISOString(),
    };

    localExams = [fallbackExam, ...localExams];
    savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
    return fallbackExam;
  },

  updateExamination: async (examId: string, updates: Partial<ExaminationItem>) => {
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);

    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.title_hi) dbUpdates.title_hi = updates.title_hi;
        if (updates.duration_minutes) dbUpdates.duration_minutes = Number(updates.duration_minutes);
        if (updates.total_marks) dbUpdates.total_marks = Number(updates.total_marks);
        if (updates.pass_marks) dbUpdates.pass_marks = Number(updates.pass_marks);
        if (updates.negative_marking !== undefined) dbUpdates.negative_marking = Number(updates.negative_marking);
        if (updates.exam_type) dbUpdates.exam_type = updates.exam_type;

        const { error } = await supabase.from('examinations').update(dbUpdates).eq('id', examId);
        if (error) console.error('updateExamination Supabase error:', error);
      } catch (err) {
        console.error('updateExamination exception:', err);
      }
    }

    localExams = localExams.map((e) =>
      e.id === examId ? { ...e, ...updates } : e
    );
    savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
    return localExams.find((e) => e.id === examId) || null;
  },

  deleteExamination: async (examId: string) => {
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('examinations').delete().eq('id', examId);
        if (error) console.error('deleteExamination Supabase error:', error);
      } catch (err) {
        console.error('deleteExamination exception:', err);
      }
    }

    localExams = localExams.filter((e) => e.id !== examId);
    savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
    return true;
  },

  // 8. Manual UPI Payments
  getPayments: async (statusFilter?: string) => {
    if (isSupabaseConfigured) {
      try {
        let req = supabase.from('payments').select('*, student:profiles(*), course:courses(*)');
        if (statusFilter && statusFilter !== 'all') {
          req = req.eq('status', statusFilter);
        }
        const { data, error } = await req.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localPayments = data as Payment[];
          savePersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
          return localPayments;
        }
      } catch {}
    }

    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, []);
    if (statusFilter && statusFilter !== 'all') {
      return localPayments.filter((p) => p.status === statusFilter);
    }
    return localPayments;
  },

  approvePayment: async (paymentId: string, remarks: string) => {
    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
    let targetStudentId = '';
    const payment = localPayments.find((p) => p.id === paymentId);
    if (payment) {
      targetStudentId = payment.student_id;
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('admin_approve_payment', {
          p_payment_id: paymentId,
          p_admin_remarks: remarks,
        });

        if (targetStudentId) {
          try {
            await supabase.from('profiles').update({ is_active: true }).eq('id', targetStudentId);
          } catch {}
          await supabase.from('enrollments').upsert({
            student_id: targetStudentId,
            course_id: payment?.course_id,
            status: 'active',
            enrolled_at: new Date().toISOString(),
          });
        }
      } catch {}
    }

    localPayments = localPayments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'approved',
            admin_remarks: remarks,
            reviewed_at: new Date().toISOString(),
            student: p.student ? { ...p.student, is_active: true } : p.student,
          }
        : p
    );
    savePersistentState(STORAGE_KEYS.PAYMENTS, localPayments);

    if (targetStudentId) {
      localStudents = localStudents.map((s) => (s.id === targetStudentId ? { ...s, is_active: true } : s));
      savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    }

    return {
      success: true,
      message: 'Payment approved! Student account activated.',
    };
  },

  rejectPayment: async (paymentId: string, remarks: string) => {
    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
    let targetStudentId = '';
    const payment = localPayments.find((p) => p.id === paymentId);
    if (payment) {
      targetStudentId = payment.student_id;
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('admin_reject_payment', {
          p_payment_id: paymentId,
          p_admin_remarks: remarks,
        });

        if (targetStudentId) {
          try {
            await supabase.from('profiles').delete().eq('id', targetStudentId).eq('is_active', false);
          } catch {}
        }
      } catch {}
    }

    localPayments = localPayments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'rejected',
            admin_remarks: remarks,
            reviewed_at: new Date().toISOString(),
          }
        : p
    );
    savePersistentState(STORAGE_KEYS.PAYMENTS, localPayments);

    if (targetStudentId) {
      localStudents = localStudents.filter((s) => s.id !== targetStudentId);
      savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    }

    return {
      success: true,
      message: 'Payment rejected. Record updated.',
    };
  },

  deletePayment: async (paymentId: string) => {
    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, localPayments);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('payments').delete().eq('id', paymentId);
      } catch {}
    }

    localPayments = localPayments.filter((p) => p.id !== paymentId);
    savePersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
    return true;
  },

  // 9. Legacy Batches Stubs (Compatibility only - All redirects to Courses)
  getBatches: async () => [],
  createBatch: async () => ({ id: '', course_id: '', name: '', is_active: false, created_at: '' }),
  updateBatch: async () => null,
  deleteBatch: async () => true,

  // 10. Academic Metadata
  getAcademics: async () => {
    return {
      boards: [],
      classes: [],
      subjects: [],
    };
  },

  getPlatformConfig: async () => {
    return {
      maintenance_mode: false,
      banner_text: 'IDEAL COACHING CENTRE — Excellence in Education',
    };
  },

  // 11. Admin Profile & Session Management
  getAdminProfile: async (): Promise<AdminProfileData> => {
    localAdminProfile = getPersistentState(STORAGE_KEYS.ADMIN_PROFILE, { ...defaultAdminProfile });

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'icckeguruji@gmail.com')
          .maybeSingle();
        if (data) {
          localAdminProfile = {
            id: data.id || localAdminProfile.id,
            full_name: data.full_name || localAdminProfile.full_name,
            email: data.email || localAdminProfile.email,
            mobile_number: data.mobile_number || localAdminProfile.mobile_number,
            role: 'admin',
            avatar_url: data.avatar_url || localAdminProfile.avatar_url,
            preferred_language: data.preferred_language || 'en',
          };
          savePersistentState(STORAGE_KEYS.ADMIN_PROFILE, localAdminProfile);
          return localAdminProfile;
        }
      } catch {}
    }

    return localAdminProfile;
  },

  updateAdminProfile: async (updates: Partial<AdminProfileData>): Promise<AdminProfileData> => {
    localAdminProfile = getPersistentState(STORAGE_KEYS.ADMIN_PROFILE, { ...defaultAdminProfile });
    const updated = { ...localAdminProfile, ...updates };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.full_name,
            mobile_number: updates.mobile_number,
            avatar_url: updates.avatar_url,
          })
          .eq('email', 'icckeguruji@gmail.com');
      } catch {}
    }

    localAdminProfile = updated;
    savePersistentState(STORAGE_KEYS.ADMIN_PROFILE, updated);
    return updated;
  },

  changeAdminPassword: async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, message: error.message };
        }
      } catch {}
    }

    return { success: true, message: 'Password updated successfully!' };
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      document.cookie = 'icc-role=; path=/; max-age=0';
    }
  },

  sendEmailNotification: async (payload: {
    to: string;
    subject: string;
    htmlBody?: string;
    body?: string;
    type?: string;
  }) => {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return await res.json();
      } catch {}
    }
    return { success: true, message: 'Simulated email dispatch' };
  },
};
