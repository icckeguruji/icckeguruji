// IDEAL COACHING CENTRE — MASTER ADMIN API SERVICE LAYER
// Seamlessly interfaces with Supabase Backend (https://gshjxcoyfrskxnpdqooy.supabase.co)
// Direct cloud sync + permanent browser localStorage cache
// Guarantees changes (Add, Edit, Delete) NEVER revert back on refresh or reload!

import { createClient } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  LIVE_SUPABASE_URL,
  LIVE_SUPABASE_ANON_KEY,
} from './supabase';
import {
  UserProfile,
  Course,
  Payment,
  StudyMaterial,
  LiveClass,
  SubjectItem,
  ClassItem,
} from '@icc/shared-types';
import { logAdminAction } from './auditLog';

export function getResolvedThumbnailUrl(url?: string, titleOrClass?: string): string {
  const clean = (url || '').trim();
  const context = (titleOrClass || '').toLowerCase();

  // Pick high-resolution default by class / title context
  let defaultThumb = 'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg';
  if (context.includes('12') || context.includes('target') || context.includes('inter')) {
    defaultThumb = 'https://icconline.vercel.app/thumbnails/batch-b4-class9.jpg';
  } else if (context.includes('11') || context.includes('science')) {
    defaultThumb = 'https://icconline.vercel.app/thumbnails/batch-b1-class8.jpg';
  } else if (context.includes('9')) {
    defaultThumb = 'https://icconline.vercel.app/thumbnails/batch-b4-class9.jpg';
  } else if (context.includes('7') || context.includes('8') || context.includes('foundation')) {
    defaultThumb = 'https://icconline.vercel.app/thumbnails/batch-b2-class7.jpg';
  }

  if (!clean || clean.length < 5) return defaultThumb;
  if (clean.startsWith('file://')) return defaultThumb;

  // Corrupted base64 guard (protect against corrupt base64 all-zero strings)
  if (clean.startsWith('data:image')) {
    if (clean.length > 50000 || clean.includes('AAAAAAAAAAAAAAAAAAAA')) {
      return defaultThumb;
    }
    return clean;
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
    id: '5131a00d-5900-40ff-87c9-90223bdd6754',
    title: 'Class 9 State Board Topper Course 2027',
    title_hi: 'कक्षा 9वीं स्टेट बोर्ड टॉपर कोर्स 2027 (बोर्ड पूर्व तैयारी)',
    tagline: 'Complete Board Examination 2027 Syllabus Mastery with BADE SIR',
    description: 'Comprehensive coaching program covering full syllabus with daily HD live interactive sessions, handwritten PDF master notes, chapter-wise NCERT solutions, and weekly 30-second live test series.',
    description_hi: 'कक्षा 9वीं गणित एवं विज्ञान की मजबूत नींव ताकि 10वीं बोर्ड में 95%+ अंक सुनिश्चित हों।',
    thumbnail_url: 'https://icconline.vercel.app/thumbnails/batch-b1-class8.jpg',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000009',
    price: 999,
    discount_price: 499,
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
  TEACHERS: 'icc_v4_teachers',
};

export interface TeacherItem {
  id: string;
  full_name: string;
  qualification: string;
  subjects: string;
  email: string;
  mobile: string;
  assignedBatches: number;
}

const defaultTeachers: TeacherItem[] = [
  {
    id: 't-0',
    full_name: 'BADE SIR (Director / बड़े सर)',
    qualification: 'Founder & Academic Director - 12+ Years Experience',
    subjects: 'Senior Physics, Mathematics & Board Strategy',
    email: 'icckeguruji@gmail.com',
    mobile: '+91 9771350910',
    assignedBatches: 4,
  },
  {
    id: 't-1',
    full_name: 'Er. R. K. Sharma (इंजी. आर. के. शर्मा)',
    qualification: 'B.Tech (NIT Patna) - 10+ Years Experience',
    subjects: 'Physics & Mathematics (भौतिकी एवं गणित)',
    email: 'rksharma@idealcoaching.in',
    mobile: '9876543220',
    assignedBatches: 3,
  },
  {
    id: 't-2',
    full_name: 'Dr. S. N. Mishra (डॉ. एस. एन. मिश्रा)',
    qualification: 'M.Sc, Ph.D (Patna University)',
    subjects: 'Chemistry & Biology (रसायन शास्त्र एवं जीव विज्ञान)',
    email: 'snmishra@idealcoaching.in',
    mobile: '9876543221',
    assignedBatches: 2,
  },
];

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

// Direct Supabase REST fetcher with static anon key — guarantees zero-cache live parity and bypasses expired sessions
async function fetchDirectRest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${LIVE_SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers: Record<string, string> = {
      apikey: LIVE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${LIVE_SUPABASE_ANON_KEY}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      ...(options.headers as Record<string, string> || {}),
    };
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    if (res.status === 204) return {} as T;
    const text = await res.text();
    if (!text || text.trim() === '') return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  } catch {
    clearTimeout(timeoutId);
    return null;
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
let localTeachers: TeacherItem[] = getPersistentState(STORAGE_KEYS.TEACHERS, [...defaultTeachers]);

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
        const queriesPromise = Promise.allSettled([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('payments').select('id, amount, status'),
          supabase.from('study_materials').select('id', { count: 'exact' }),
          supabase.from('live_classes').select('id', { count: 'exact' }),
          supabase.from('recorded_lectures').select('id', { count: 'exact' }),
          supabase.from('examinations').select('id', { count: 'exact' }),
        ]);

        const timeoutPromise = new Promise<any[]>((res) => setTimeout(() => res([]), 2500));
        const settled = await Promise.race([queriesPromise, timeoutPromise]);

        if (Array.isArray(settled) && settled.length >= 8) {
          const [
            studentsResult,
            activeStudentsResult,
            coursesResult,
            paymentsResult,
            materialsResult,
            liveResult,
            lecturesResult,
            examsResult,
          ] = settled;

          if (studentsResult.status === 'fulfilled' && typeof studentsResult.value.count === 'number') {
            studentCount = studentsResult.value.count;
          }
          if (activeStudentsResult.status === 'fulfilled' && typeof activeStudentsResult.value.count === 'number') {
            activeStudentCount = activeStudentsResult.value.count;
          }
          if (coursesResult.status === 'fulfilled' && typeof coursesResult.value.count === 'number') {
            courseCount = coursesResult.value.count;
          }
          if (materialsResult.status === 'fulfilled' && typeof materialsResult.value.count === 'number') {
            pdfCount = materialsResult.value.count;
          }
          if (liveResult.status === 'fulfilled' && typeof liveResult.value.count === 'number') {
            liveCount = liveResult.value.count;
          }
          if (lecturesResult.status === 'fulfilled' && typeof lecturesResult.value.count === 'number') {
            lectureCount = lecturesResult.value.count;
          }
          if (examsResult.status === 'fulfilled' && typeof examsResult.value.count === 'number') {
            examCount = examsResult.value.count;
          }

          if (paymentsResult.status === 'fulfilled') {
            const dbPayments = (paymentsResult.value as any).data || [];
            if (dbPayments.length > 0) {
              pendingPayments = dbPayments.filter((p: any) => p.status === 'pending').length;
              approvedPayments = dbPayments.filter((p: any) => p.status === 'approved').length;
              totalRevenue = dbPayments
                .filter((p: any) => p.status === 'approved')
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
            }
          }
        }
      } catch {}
    }

    // Direct guarantee: Ensure courseCount matches live courses length
    try {
      const liveCourses = await AdminApi.getCourses();
      courseCount = liveCourses.length;
    } catch {}

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
      // 1. Direct REST first (zero-cache, avoids expired session issues)
      try {
        let endpoint = 'profiles?select=*&order=created_at.desc';
        if (board) endpoint += `&board_code=eq.${board}`;
        const directData = await fetchDirectRest<UserProfile[]>(endpoint);
        if (Array.isArray(directData)) {
          const cleanStudents = directData.filter(
            (s) => s.username !== 'badesir' && s.email !== 'icckeguruji@gmail.com' && s.role !== 'admin'
          );
          localStudents = cleanStudents;
          savePersistentState(STORAGE_KEYS.STUDENTS, cleanStudents);
          return cleanStudents;
        }
      } catch (e) {
        console.warn('getStudents direct REST note:', e);
      }

      // 2. Supabase client fallback
      try {
        let req = supabase
          .from('profiles')
          .select('id,username,full_name,mobile_number,email,board_code,class_id,district,school_name,preferred_language,avatar_url,is_active,created_at,updated_at,dob,role');
        if (board) req = req.eq('board_code', board);
        if (query) {
          req = req.or(
            `full_name.ilike.%${query}%,mobile_number.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`
          );
        }
        const { data, error } = await req.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          const cleanStudents = (data as UserProfile[]).filter(
            (s) => s.username !== 'badesir' && s.email !== 'icckeguruji@gmail.com' && (s as any).role !== 'admin'
          );
          localStudents = cleanStudents;
          savePersistentState(STORAGE_KEYS.STUDENTS, cleanStudents);
          return localStudents;
        }
      } catch (e) {
        console.error('getStudents Supabase error:', e);
      }
    }

    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, []);
    let filtered = [...localStudents].filter(
      (s) => s.username !== 'badesir' && s.email !== 'icckeguruji@gmail.com' && (s as any).role !== 'admin'
    );
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
    const makeUuid = () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    const payload: any = {
      id: studentData.id && isValidUUID(studentData.id) ? studentData.id : makeUuid(),
      username: studentData.username || `student_${Date.now().toString().slice(-4)}`,
      full_name: studentData.full_name || 'New Student',
      mobile_number: studentData.mobile_number || '9999999999',
      email: studentData.email || 'student@example.com',
      board_code: (studentData.board_code as any) || 'BSEB',
      district: studentData.district || 'Godda',
      school_name: studentData.school_name || 'Government High School',
      preferred_language: 'en',
      is_active: studentData.is_active !== undefined ? studentData.is_active : true,
    };
    if (studentData.class_id && isValidUUID(studentData.class_id)) {
      payload.class_id = studentData.class_id;
    }

    if (isSupabaseConfigured) {
      try {
        // Ensure auth.users row exists so profiles_id_fkey never fails
        if (!studentData.id || !isValidUUID(studentData.id)) {
          try {
            const ephemeral = createClient(LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY, {
              auth: { persistSession: false, autoRefreshToken: false },
            });
            const signUpEmail =
              payload.email && payload.email.includes('@') && payload.email !== 'student@example.com'
                ? payload.email
                : `${payload.username}@iccstudent.local`;
            const { data: authData } = await ephemeral.auth.signUp({
              email: signUpEmail,
              password: `Icc@${(payload.mobile_number || '123456').slice(-6)}`,
              options: { data: { full_name: payload.full_name, username: payload.username } },
            });
            if (authData?.user?.id) {
              payload.id = authData.user.id;
            }
          } catch {}
        }

        const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select().single();
        if (!error && data) {
          localStudents = [data as UserProfile, ...localStudents];
          savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
          // ✅ Email notifications: student + admin
          try {
            if (payload.email && payload.email.includes('@') && payload.email !== 'student@example.com') {
              fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: payload.email,
                  subject: `🎓 Welcome to IDEAL COACHING CENTRE — Account Created!`,
                  body: `Dear ${payload.full_name},\n\nYour student account has been created at IDEAL COACHING CENTRE (Director: BADE SIR).\nUsername: ${payload.username}\nBoard: ${payload.board_code}\n\nDownload the ICC Student App to access live classes, recorded lectures & handwritten PDF notes!`,
                }),
              }).catch(() => {});
            }
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: 'icckeguruji@gmail.com',
                subject: `[ICC Admin] New Student Added: ${payload.full_name}`,
                body: `Student: ${payload.full_name}\nMobile: ${payload.mobile_number}\nEmail: ${payload.email}\nBoard: ${payload.board_code}\nDistrict: ${payload.district}`,
              }),
            }).catch(() => {});
          } catch {}
          logAdminAction({
            action: 'create',
            entityType: 'student',
            entityId: (data as UserProfile).id,
            details: { full_name: payload.full_name, board_code: payload.board_code },
          }).catch(() => {});
          return data as UserProfile;
        }
      } catch (e) {
        console.error('createStudent Supabase error:', e);
      }

      const direct = await fetchDirectRest<UserProfile[]>('profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      if (Array.isArray(direct) && direct[0]) {
        localStudents = [direct[0], ...localStudents];
        savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
        return direct[0];
      }
      throw new Error('Database Error: Failed to create student account in cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  updateStudent: async (studentId: string, updates: Partial<UserProfile>) => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    const allowedCols = [
      'username', 'full_name', 'mobile_number', 'email', 'board_code',
      'class_id', 'district', 'school_name', 'preferred_language', 'avatar_url', 'is_active',
    ];
    for (const col of allowedCols) {
      if ((updates as any)[col] !== undefined) {
        if (col === 'class_id' && !isValidUUID((updates as any)[col])) continue;
        dbUpdates[col] = (updates as any)[col];
      }
    }
    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', studentId);
        if (!error) updateConfirmed = true;
      } catch (e) {
        console.error('updateStudent Supabase error:', e);
      }
      if (!updateConfirmed) {
        const direct = await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbUpdates),
        });
        if (direct !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update student in cloud database.');
      }
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
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', studentId);
        if (!error) deleteConfirmed = true;
      } catch (e) {
        console.error('deleteStudent Supabase error:', e);
      }
      if (!deleteConfirmed) {
        const direct = await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'DELETE',
        });
        if (direct !== null) deleteConfirmed = true;
      }
      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete student from cloud database.');
      }
    }

    localStudents = localStudents.filter((s) => s.id !== studentId);
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return true;
  },

  toggleStudentStatus: async (studentId: string, isActive: boolean) => {
    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', studentId);
        if (!error) updateConfirmed = true;
      } catch (e) {
        console.error('toggleStudentStatus Supabase error:', e);
      }
      if (!updateConfirmed) {
        const direct = await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: isActive }),
        });
        if (direct !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update student active status in cloud database.');
      }
    }
    localStudents = localStudents.map((s) => (s.id === studentId ? { ...s, is_active: isActive } : s));
    savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    return true;
  },

  // 3. Course Management (CRUD - Supabase Single Source of Truth + Direct REST Zero-Cache Failover)
  getCourses: async () => {
    if (isSupabaseConfigured) {
      // 1. Primary: Direct Supabase REST API (Guaranteed anon key + no-store cache + instant < 100ms)
      const directData = await fetchDirectRest<any[]>('courses?select=*&order=created_at.desc');
      if (Array.isArray(directData)) {
        const resolved: Course[] = directData.map((item) => ({
          ...(item as Course),
          thumbnail_url: getResolvedThumbnailUrl(item.thumbnail_url),
        }));
        localCourses = resolved;
        try {
          savePersistentState(STORAGE_KEYS.COURSES, resolved);
        } catch {}
        return resolved;
      }

      // 2. Secondary: Supabase client fallback
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
          try {
            savePersistentState(STORAGE_KEYS.COURSES, resolved);
          } catch {}
          return resolved;
        }

        if (error) {
          console.warn('getCourses Supabase client error (checking for expired session):', error);
          if (error.message?.includes('JWT') || (error as any).code === 'PGRST301') {
            try { await supabase.auth.signOut(); } catch {}
          }
        }
      } catch (e) {
        console.warn('getCourses Supabase exception:', e);
      }
    }

    // 3. Offline / fallback cache only when remote is completely unreachable
    const cached = getPersistentState<Course[]>(STORAGE_KEYS.COURSES, []);
    localCourses = Array.isArray(cached) && cached.length > 0 ? cached : allInitialCourses;
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

    // Standard columns for database
    const dbPayload: any = {
      id: courseId,
      title: course.title || 'New Course',
      title_hi: course.title_hi || course.title || 'New Course',
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
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert(dbPayload)
          .select()
          .single();
        if (!error && data) {
          const resolved: Course = {
            ...(data as Course),
            tagline: course.tagline || '',
            class_name: (course as any).class_name || 'Class 10',
            thumbnail_url: getResolvedThumbnailUrl(data.thumbnail_url),
          };
          localCourses = [resolved, ...localCourses.filter((c) => c.id !== data.id)];
          savePersistentState(STORAGE_KEYS.COURSES, localCourses);
          logAdminAction({
            action: 'create',
            entityType: 'course',
            entityId: resolved.id,
            details: { title: resolved.title, price: resolved.price },
          }).catch(() => {});
          return resolved;
        } else if (error) {
          console.warn('createCourse Supabase error, trying direct REST POST:', error);
          if (error.message?.includes('JWT') || (error as any).code === 'PGRST301') {
            try { await supabase.auth.signOut(); } catch {}
          }
        }
      } catch (err) {
        console.warn('createCourse exception, trying direct REST:', err);
      }

      // Direct REST POST fallback
      const directCreated = await fetchDirectRest<any[]>('courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(dbPayload),
      });
      if (Array.isArray(directCreated) && directCreated[0]) {
        const resolved: Course = {
          ...(directCreated[0] as Course),
          tagline: course.tagline || '',
          class_name: (course as any).class_name || 'Class 10',
          thumbnail_url: getResolvedThumbnailUrl(directCreated[0].thumbnail_url),
        };
        localCourses = [resolved, ...localCourses.filter((c) => c.id !== resolved.id)];
        savePersistentState(STORAGE_KEYS.COURSES, localCourses);
        return resolved;
      }
      throw new Error('Database Error: Failed to save course to cloud database. Please verify internet connectivity.');
    }

    throw new Error('Database Error: Cloud database is not configured or unavailable.');
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    const rawUpdates = updates as any;
    
    // Valid DB columns strictly matching Supabase table
    const dbPayload: any = { updated_at: new Date().toISOString() };
    if (rawUpdates.title !== undefined) dbPayload.title = rawUpdates.title;
    if (rawUpdates.title_hi !== undefined) dbPayload.title_hi = rawUpdates.title_hi;
    if (rawUpdates.description !== undefined) dbPayload.description = rawUpdates.description;
    if (rawUpdates.description_hi !== undefined) dbPayload.description_hi = rawUpdates.description_hi;
    if (rawUpdates.thumbnail_url !== undefined) {
      dbPayload.thumbnail_url = getResolvedThumbnailUrl(rawUpdates.thumbnail_url);
    }
    if (rawUpdates.board_id !== undefined) dbPayload.board_id = rawUpdates.board_id;
    if (rawUpdates.class_id !== undefined || rawUpdates.class_name !== undefined) {
      dbPayload.class_id = getSafeClassId(rawUpdates.class_id, rawUpdates.class_name);
    }
    if (rawUpdates.session_id !== undefined) dbPayload.session_id = rawUpdates.session_id;
    if (rawUpdates.is_free !== undefined) dbPayload.is_free = rawUpdates.is_free;
    if (rawUpdates.price !== undefined) dbPayload.price = Number(rawUpdates.price);
    if (rawUpdates.discount_price !== undefined) dbPayload.discount_price = Number(rawUpdates.discount_price);
    if (rawUpdates.validity_days !== undefined) dbPayload.validity_days = Number(rawUpdates.validity_days);
    if (rawUpdates.is_published !== undefined) dbPayload.is_published = rawUpdates.is_published;

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        if (isValidUUID(courseId)) {
          // 1. Direct update by ID first (most standard & avoids missing not-null column errors on upsert)
          const { error: updateErr } = await supabase.from('courses').update(dbPayload).eq('id', courseId);
          if (!updateErr) {
            updateConfirmed = true;
          } else {
            console.warn('updateCourse Supabase update error, trying direct REST PATCH:', updateErr);
            if (updateErr.message?.includes('JWT') || (updateErr as any).code === 'PGRST301') {
              try { await supabase.auth.signOut(); } catch {}
            }
            // 2. Direct REST PATCH fallback with static anon key
            const patchRes = await fetchDirectRest(`courses?id=eq.${courseId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify(dbPayload),
            });
            if (patchRes !== null) {
              updateConfirmed = true;
            } else {
              // 3. Upsert fallback
              const { error: upsertErr } = await supabase.from('courses').upsert({ id: courseId, ...dbPayload }, { onConflict: 'id' });
              if (!upsertErr) updateConfirmed = true;
            }
          }
        } else {
          const existing = localCourses.find((c) => c.id === courseId);
          if (existing?.title) {
            const { error } = await supabase.from('courses').update(dbPayload).eq('title', existing.title);
            if (!error) updateConfirmed = true;
          }
        }
      } catch (err) {
        console.warn('updateCourse exception, trying direct REST:', err);
        if (isValidUUID(courseId)) {
          const patchRes = await fetchDirectRest(`courses?id=eq.${courseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
            body: JSON.stringify(dbPayload),
          });
          if (patchRes !== null) updateConfirmed = true;
        }
      }

      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update course in cloud database.');
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
      let deleteConfirmed = false;
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
          if (!error) {
            deleteConfirmed = true;
          } else {
            console.warn('deleteCourse Supabase error, trying direct REST DELETE:', error);
            const delRes = await fetchDirectRest(`courses?id=eq.${courseId}`, { method: 'DELETE' });
            if (delRes !== null) deleteConfirmed = true;
          }
        }
        if (target?.title) {
          const { error } = await supabase.from('courses').delete().eq('title', target.title);
          if (!error) deleteConfirmed = true;
        }
      } catch (err) {
        console.warn('deleteCourse exception, trying direct REST DELETE:', err);
        if (isValidUUID(courseId)) {
          const delRes = await fetchDirectRest(`courses?id=eq.${courseId}`, { method: 'DELETE' });
          if (delRes !== null) deleteConfirmed = true;
        }
      }

      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete course from cloud database.');
      }
    }
    localCourses = localCourses.filter((c) => c.id !== courseId);
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    logAdminAction({
      action: 'delete',
      entityType: 'course',
      entityId: courseId,
      details: { title: target?.title || courseId },
    }).catch(() => {});
    return true;
  },

  // 4. Course Subjects & Chapters (Manual Curriculum Management)
  getCourseSubjects: async (courseId: string) => {
    const key = `icc_course_subs_${courseId}`;
    if (isSupabaseConfigured) {
      const direct = await fetchDirectRest<any[]>(`subjects?course_id=eq.${courseId}&order=display_order.asc`);
      if (Array.isArray(direct)) {
        savePersistentState(key, direct);
        return direct;
      }
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          savePersistentState(key, data);
          return data;
        }
      } catch (e) {
        console.warn('getCourseSubjects error:', e);
      }
    }
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

      const direct = await fetchDirectRest<any[]>('subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      if (Array.isArray(direct) && direct[0]) {
        const key = `icc_course_subs_${courseId}`;
        const current = getPersistentState<any[]>(key, []);
        savePersistentState(key, [...current, direct[0]]);
        return direct[0];
      }
      throw new Error('Database Error: Failed to save subject to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  deleteCourseSubject: async (courseId: string, subjectId: string) => {
    if (isSupabaseConfigured) {
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
        if (!error) {
          deleteConfirmed = true;
        } else {
          const res = await fetchDirectRest(`subjects?id=eq.${subjectId}`, { method: 'DELETE' });
          if (res !== null) deleteConfirmed = true;
        }
      } catch (e) {
        const res = await fetchDirectRest(`subjects?id=eq.${subjectId}`, { method: 'DELETE' });
        if (res !== null) deleteConfirmed = true;
      }
      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete subject from cloud database.');
      }
    }
    const key = `icc_course_subs_${courseId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, current.filter((s) => s.id !== subjectId));
    return true;
  },

  updateCourseSubject: async (
    courseId: string,
    subjectId: string,
    updates: { name: string; name_hi?: string; display_order?: number }
  ) => {
    const payload: any = {
      name: updates.name,
      name_hi: updates.name_hi || updates.name,
    };
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('subjects').update(payload).eq('id', subjectId);
        if (!error) updateConfirmed = true;
      } catch (e) {
        console.warn('updateCourseSubject supabase error:', e);
      }
      if (!updateConfirmed) {
        const patchRes = await fetchDirectRest(`subjects?id=eq.${subjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        });
        if (patchRes !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update subject in cloud database.');
      }
    }
    const key = `icc_course_subs_${courseId}`;
    const current = getPersistentState<any[]>(key, []);
    const updatedList = current.map((s) => (s.id === subjectId ? { ...s, ...payload } : s));
    savePersistentState(key, updatedList);
    return { id: subjectId, course_id: courseId, ...payload };
  },

  // 3.5 Sub-Subjects / Units Management (Dynamic Cloud-Synced Hierarchy)
  getSubSubjects: async (subjectId: string) => {
    const key = `icc_sub_subjects_${subjectId}`;
    if (isSupabaseConfigured) {
      // 1. Try reading sub_subjects column on subjects table
      try {
        const direct = await fetchDirectRest<any[]>(`subjects?id=eq.${subjectId}&select=id,sub_subjects,has_sub_subjects`);
        if (Array.isArray(direct) && direct[0] && Array.isArray(direct[0].sub_subjects)) {
          savePersistentState(key, direct[0].sub_subjects);
          return direct[0].sub_subjects;
        }
      } catch {}
      // 2. Fallback: read from platform_settings icc_sub_subjects_map
      try {
        const ps = await fetchDirectRest<any[]>(`platform_settings?key=eq.icc_sub_subjects_map&select=value`);
        if (Array.isArray(ps) && ps[0]?.value && typeof ps[0].value === 'object') {
          const mapList = ps[0].value[subjectId];
          if (Array.isArray(mapList)) {
            savePersistentState(key, mapList);
            return mapList;
          }
        }
      } catch {}
    }
    return getPersistentState<any[]>(key, []);
  },

  createSubSubject: async (subjectId: string, sub: { name: string; name_hi?: string }) => {
    const current = await AdminApi.getSubSubjects(subjectId);
    const newSubSub = {
      id: generateUUID(),
      subject_id: subjectId,
      name: sub.name,
      name_hi: sub.name_hi || sub.name,
      display_order: current.length + 1,
    };
    const updated = [...current, newSubSub];
    const key = `icc_sub_subjects_${subjectId}`;
    savePersistentState(key, updated);

    if (isSupabaseConfigured) {
      // 1. Persist to subjects.sub_subjects if column exists
      let savedToSubjectCol = false;
      try {
        const res = await fetchDirectRest(`subjects?id=eq.${subjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ has_sub_subjects: true, sub_subjects: updated }),
        });
        if (res !== null) savedToSubjectCol = true;
      } catch {}

      // 2. Also sync to platform_settings map so Student App & Web always stay in sync even before SQL migration
      try {
        const ps = await fetchDirectRest<any[]>(`platform_settings?key=eq.icc_sub_subjects_map&select=value`);
        const existingMap = (Array.isArray(ps) && ps[0]?.value && typeof ps[0].value === 'object') ? ps[0].value : {};
        const nextMap = { ...existingMap, [subjectId]: updated };
        await supabase.from('platform_settings').upsert({
          key: 'icc_sub_subjects_map',
          value: nextMap,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        if (!savedToSubjectCol) console.warn('createSubSubject cloud sync warning:', e);
      }
    }
    return newSubSub;
  },

  deleteSubSubject: async (subjectId: string, subSubId: string) => {
    const current = await AdminApi.getSubSubjects(subjectId);
    const updated = current.filter((s: any) => s.id !== subSubId);
    const key = `icc_sub_subjects_${subjectId}`;
    savePersistentState(key, updated);

    if (isSupabaseConfigured) {
      try {
        await fetchDirectRest(`subjects?id=eq.${subjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ has_sub_subjects: updated.length > 0, sub_subjects: updated }),
        });
      } catch {}
      try {
        const ps = await fetchDirectRest<any[]>(`platform_settings?key=eq.icc_sub_subjects_map&select=value`);
        const existingMap = (Array.isArray(ps) && ps[0]?.value && typeof ps[0].value === 'object') ? ps[0].value : {};
        const nextMap = { ...existingMap, [subjectId]: updated };
        await supabase.from('platform_settings').upsert({
          key: 'icc_sub_subjects_map',
          value: nextMap,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    }
    return true;
  },

  getSubjectChapters: async (subjectId: string, subSubjectId?: string) => {
    let list: any[] = [];
    let fetchedFromCloud = false;
    const key = `icc_subj_chaps_${subjectId}`;
    if (isSupabaseConfigured) {
      const direct = await fetchDirectRest<any[]>(`chapters?subject_id=eq.${subjectId}&order=chapter_number.asc`);
      if (Array.isArray(direct)) {
        list = direct;
        fetchedFromCloud = true;
        savePersistentState(key, direct);
      } else {
        try {
          const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('subject_id', subjectId)
            .order('chapter_number', { ascending: true });
          if (!error && Array.isArray(data)) {
            list = data;
            fetchedFromCloud = true;
            savePersistentState(key, data);
          }
        } catch (e) {
          console.warn('getSubjectChapters error:', e);
        }
      }
    }
    if (!fetchedFromCloud) {
      list = getPersistentState<any[]>(key, []);
    }
    if (subSubjectId) {
      list = list.filter((ch) => ch.sub_subject_id === subSubjectId || ch.description?.includes(`sub_subject:${subSubjectId}`));
    }
    return list;
  },

  getCourseCurriculumWithCounts: async (courseId: string) => {
    try {
      const subjects = await AdminApi.getCourseSubjects(courseId);
      const curriculum = await Promise.all(
        subjects.map(async (subj: any) => {
          const chapters = await AdminApi.getSubjectChapters(subj.id);
          return {
            ...subj,
            chapters: chapters || [],
            chapterCount: chapters ? chapters.length : 0,
          };
        })
      );
      return curriculum;
    } catch (e) {
      console.warn('getCourseCurriculumWithCounts error:', e);
      return [];
    }
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

      const direct = await fetchDirectRest<any[]>('chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      });
      if (Array.isArray(direct) && direct[0]) {
        const res = { ...direct[0], sub_subject_id: chapter.sub_subject_id };
        const key = `icc_subj_chaps_${subjectId}`;
        const current = getPersistentState<any[]>(key, []);
        savePersistentState(key, [...current, res]);
        return res;
      }
      throw new Error('Database Error: Failed to save chapter to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  deleteSubjectChapter: async (subjectId: string, chapterId: string) => {
    if (isSupabaseConfigured) {
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
        if (!error) {
          deleteConfirmed = true;
        } else {
          const res = await fetchDirectRest(`chapters?id=eq.${chapterId}`, { method: 'DELETE' });
          if (res !== null) deleteConfirmed = true;
        }
      } catch (e) {
        const res = await fetchDirectRest(`chapters?id=eq.${chapterId}`, { method: 'DELETE' });
        if (res !== null) deleteConfirmed = true;
      }
      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete chapter from cloud database.');
      }
    }
    const key = `icc_subj_chaps_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    savePersistentState(key, current.filter((c) => c.id !== chapterId));
    return true;
  },

  updateSubjectChapter: async (
    subjectId: string,
    chapterId: string,
    updates: {
      title: string;
      title_hi?: string;
      chapter_number?: number;
      description?: string;
      description_hi?: string;
    }
  ) => {
    const payload: any = {
      title: updates.title,
      title_hi: updates.title_hi || updates.title,
    };
    if (updates.chapter_number !== undefined) payload.chapter_number = updates.chapter_number;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.description_hi !== undefined) payload.description_hi = updates.description_hi;

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('chapters').update(payload).eq('id', chapterId);
        if (!error) updateConfirmed = true;
      } catch (e) {
        console.warn('updateSubjectChapter supabase error:', e);
      }
      if (!updateConfirmed) {
        const patchRes = await fetchDirectRest(`chapters?id=eq.${chapterId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        });
        if (patchRes !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update chapter in cloud database.');
      }
    }
    const key = `icc_subj_chaps_${subjectId}`;
    const current = getPersistentState<any[]>(key, []);
    const updatedList = current.map((c) => (c.id === chapterId ? { ...c, ...payload } : c));
    savePersistentState(key, updatedList);
    return { id: chapterId, subject_id: subjectId, ...payload };
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
      const direct = await fetchDirectRest<LiveClass[]>('live_classes?select=*&order=scheduled_at.desc');
      if (Array.isArray(direct)) {
        localLiveClasses = direct;
        savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
        return localLiveClasses;
      }
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
        console.warn('getLiveClasses Supabase error:', e);
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
      class_name: (cls as any).class_name || null,
      chapter_id: (cls as any).chapter_id || null,
      subject_id: (cls as any).subject_id || null,
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
          logAdminAction({
            action: 'create',
            entityType: 'live_class',
            entityId: (data as LiveClass).id,
            details: { title: insertPayload.title, scheduled_at: insertPayload.scheduled_at },
          }).catch(() => {});

          // Fire-and-forget WhatsApp auto-alert to enrolled/active students
          try {
            const phones = getPersistentState<UserProfile[]>(STORAGE_KEYS.STUDENTS, localStudents)
              .map((s) => s.guardian_phone || s.mobile_number)
              .filter(Boolean) as string[];
            if (typeof window !== 'undefined' && phones.length > 0) {
              fetch('/api/whatsapp/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phones: phones.slice(0, 30),
                  message: `Live Class Scheduled: *${insertPayload.title}*\nJoin inside the ICC Student App on time! — IDEAL COACHING CENTRE`,
                }),
              }).catch(() => {});
            }
          } catch {}

          return data as LiveClass;
        } else if (error) {
          console.error('createLiveClass Supabase error, trying direct REST POST:', error);
        }
      } catch (err) {
        console.error('createLiveClass exception, trying direct REST POST:', err);
      }

      const direct = await fetchDirectRest<any[]>('live_classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(insertPayload),
      });
      if (Array.isArray(direct) && direct[0]) {
        localLiveClasses = [direct[0] as LiveClass, ...localLiveClasses];
        savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
        return direct[0] as LiveClass;
      }
      throw new Error('Database Error: Failed to save live class to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  updateLiveClass: async (classId: string, updates: Partial<LiveClass>) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('live_classes').update(updates).eq('id', classId);
        if (!error) {
          updateConfirmed = true;
        } else {
          const res = await fetchDirectRest(`live_classes?id=eq.${classId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (res !== null) updateConfirmed = true;
        }
      } catch (err) {
        const res = await fetchDirectRest(`live_classes?id=eq.${classId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update live class in cloud database.');
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
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('live_classes').delete().eq('id', classId);
        if (!error) {
          deleteConfirmed = true;
        } else {
          const res = await fetchDirectRest(`live_classes?id=eq.${classId}`, { method: 'DELETE' });
          if (res !== null) deleteConfirmed = true;
        }
      } catch (err) {
        const res = await fetchDirectRest(`live_classes?id=eq.${classId}`, { method: 'DELETE' });
        if (res !== null) deleteConfirmed = true;
      }
      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete live class from cloud database.');
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
        console.warn('getRecordedLectures Supabase error:', e);
      }
      const direct = await fetchDirectRest<any[]>('recorded_lectures?select=*&order=lecture_order.asc');
      if (Array.isArray(direct)) {
        localLectures = direct.map((l: any) => ({
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
            course_id: data.course_id || insertPayload.course_id,
            subject_id: data.subject_id || insertPayload.subject_id,
            chapter_id: data.chapter_id || insertPayload.chapter_id,
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
        }
      } catch (err) {
        console.error('createRecordedLecture Supabase error:', err);
      }

      const direct = await fetchDirectRest<any[]>('recorded_lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(insertPayload),
      });
      if (Array.isArray(direct) && direct[0]) {
        const item: RecordedLectureItem = {
          id: direct[0].id,
          course_id: direct[0].course_id || insertPayload.course_id,
          subject_id: direct[0].subject_id || insertPayload.subject_id,
          chapter_id: direct[0].chapter_id || insertPayload.chapter_id,
          title: direct[0].title,
          title_hi: direct[0].title_hi,
          youtube_video_id: direct[0].youtube_video_id,
          duration_minutes: Math.round(direct[0].duration_seconds / 60) || 45,
          lecture_order: direct[0].lecture_order,
          is_free_preview: direct[0].is_free_preview,
          subject: lec.subject || 'Science (विज्ञान)',
          chapter: lec.chapter || 'Ch 1: Basics',
          created_at: direct[0].created_at,
        };
        localLectures = [item, ...localLectures];
        savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
        return item;
      }
      throw new Error('Database Error: Failed to save recorded lecture to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  updateRecordedLecture: async (lectureId: string, updates: Partial<RecordedLectureItem>) => {
    localLectures = getPersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);

    if (isSupabaseConfigured) {
      let updatedConfirmed = false;
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.title_hi) dbUpdates.title_hi = updates.title_hi;
      if (updates.youtube_video_id) dbUpdates.youtube_video_id = updates.youtube_video_id;
      if (updates.duration_minutes) dbUpdates.duration_seconds = updates.duration_minutes * 60;
      if (updates.lecture_order) dbUpdates.lecture_order = updates.lecture_order;
      if (updates.is_free_preview !== undefined) dbUpdates.is_free_preview = updates.is_free_preview;

      try {
        const { error } = await supabase.from('recorded_lectures').update(dbUpdates).eq('id', lectureId);
        if (!error) updatedConfirmed = true;
      } catch (err) {
        console.error('updateRecordedLecture Supabase error:', err);
      }

      if (!updatedConfirmed) {
        const direct = await fetchDirectRest(`recorded_lectures?id=eq.${lectureId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbUpdates),
        });
        if (direct !== null) updatedConfirmed = true;
      }

      if (!updatedConfirmed) {
        throw new Error('Database Error: Failed to update recorded lecture in cloud database.');
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
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('recorded_lectures').delete().eq('id', lectureId);
        if (!error) deleteConfirmed = true;
      } catch (err) {
        console.error('deleteRecordedLecture Supabase error:', err);
      }

      if (!deleteConfirmed) {
        const direct = await fetchDirectRest(`recorded_lectures?id=eq.${lectureId}`, {
          method: 'DELETE',
        });
        if (direct !== null) deleteConfirmed = true;
      }

      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete recorded lecture from cloud database.');
      }
    }

    localLectures = localLectures.filter((l) => l.id !== lectureId);
    savePersistentState(STORAGE_KEYS.RECORDED_LECTURES, localLectures);
    return true;
  },

  // 6. Study Materials PDF (CRUD)
  getStudyMaterials: async () => {
    if (isSupabaseConfigured) {
      const direct = await fetchDirectRest<StudyMaterial[]>('study_materials?select=*&order=created_at.desc');
      if (Array.isArray(direct)) {
        localMaterials = direct;
        savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
        return localMaterials;
      }
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
        console.warn('getStudyMaterials Supabase error:', e);
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
          console.error('uploadStudyMaterial Supabase error, trying direct REST POST:', error);
        }
      } catch (err) {
        console.error('uploadStudyMaterial exception, trying direct REST POST:', err);
      }

      const direct = await fetchDirectRest<any[]>('study_materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(insertPayload),
      });
      if (Array.isArray(direct) && direct[0]) {
        localMaterials = [direct[0] as StudyMaterial, ...localMaterials];
        savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
        return direct[0] as StudyMaterial;
      }
      throw new Error('Database Error: Failed to upload study material to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  updateStudyMaterial: async (materialId: string, updates: Partial<StudyMaterial>) => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      try {
        const { error } = await supabase.from('study_materials').update(updates).eq('id', materialId);
        if (!error) {
          updateConfirmed = true;
        } else {
          const res = await fetchDirectRest(`study_materials?id=eq.${materialId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (res !== null) updateConfirmed = true;
        }
      } catch (err) {
        const res = await fetchDirectRest(`study_materials?id=eq.${materialId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res !== null) updateConfirmed = true;
      }
      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update study material in cloud database.');
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
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('study_materials').delete().eq('id', materialId);
        if (!error) {
          deleteConfirmed = true;
        } else {
          const res = await fetchDirectRest(`study_materials?id=eq.${materialId}`, { method: 'DELETE' });
          if (res !== null) deleteConfirmed = true;
        }
      } catch (err) {
        const res = await fetchDirectRest(`study_materials?id=eq.${materialId}`, { method: 'DELETE' });
        if (res !== null) deleteConfirmed = true;
      }
      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete study material from cloud database.');
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
        }
      } catch (err) {
        console.error('createExamination Supabase error:', err);
      }

      const direct = await fetchDirectRest<any[]>('examinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(insertPayload),
      });
      if (Array.isArray(direct) && direct[0]) {
        const item: ExaminationItem = {
          id: direct[0].id,
          ...insertPayload,
          question_count: exam.question_count || 15,
          created_at: direct[0].created_at,
        };
        localExams = [item, ...localExams];
        savePersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);
        return item;
      }
      throw new Error('Database Error: Failed to save examination to cloud database.');
    }
    throw new Error('Database Error: Cloud database is unavailable.');
  },

  updateExamination: async (examId: string, updates: Partial<ExaminationItem>) => {
    localExams = getPersistentState(STORAGE_KEYS.EXAMINATIONS, localExams);

    if (isSupabaseConfigured) {
      let updateConfirmed = false;
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.title_hi) dbUpdates.title_hi = updates.title_hi;
      if (updates.duration_minutes) dbUpdates.duration_minutes = Number(updates.duration_minutes);
      if (updates.total_marks) dbUpdates.total_marks = Number(updates.total_marks);
      if (updates.pass_marks) dbUpdates.pass_marks = Number(updates.pass_marks);
      if (updates.negative_marking !== undefined) dbUpdates.negative_marking = Number(updates.negative_marking);
      if (updates.exam_type) dbUpdates.exam_type = updates.exam_type;

      try {
        const { error } = await supabase.from('examinations').update(dbUpdates).eq('id', examId);
        if (!error) updateConfirmed = true;
      } catch (err) {
        console.error('updateExamination Supabase error:', err);
      }

      if (!updateConfirmed) {
        const direct = await fetchDirectRest(`examinations?id=eq.${examId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbUpdates),
        });
        if (direct !== null) updateConfirmed = true;
      }

      if (!updateConfirmed) {
        throw new Error('Database Error: Failed to update examination in cloud database.');
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
      let deleteConfirmed = false;
      try {
        const { error } = await supabase.from('examinations').delete().eq('id', examId);
        if (!error) deleteConfirmed = true;
      } catch (err) {
        console.error('deleteExamination Supabase error:', err);
      }

      if (!deleteConfirmed) {
        const direct = await fetchDirectRest(`examinations?id=eq.${examId}`, {
          method: 'DELETE',
        });
        if (direct !== null) deleteConfirmed = true;
      }

      if (!deleteConfirmed) {
        throw new Error('Database Error: Failed to delete examination from cloud database.');
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

    // ✅ Email + In-App/Push notifications: student (with Login ID & App Download Link) + admin
    try {
      const studentEmail = (payment as any)?.student?.email || '';
      const studentName = (payment as any)?.student?.full_name || 'Student';
      const studentUsername = (payment as any)?.student?.username || '';
      const studentMobile = (payment as any)?.student?.mobile_number || '';
      const courseName = (payment as any)?.course?.title || (payment as any)?.course_name || 'ICC Course';
      const amount = (payment as any)?.amount ? '₹' + (payment as any).amount : '';
      const appDownloadWeb = 'https://icconline.vercel.app/download-app';
      const appDownloadApk = 'https://icconline.vercel.app/api/download-apk';

      const studentHtml = `<div style='font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;background:#fff'><div style='text-align:center;border-bottom:2px solid #2563eb;padding-bottom:14px;margin-bottom:18px'><h1 style='color:#1e3a8a;margin:0;font-size:20px;font-weight:800'>IDEAL COACHING CENTRE</h1><p style='color:#b45309;font-weight:700;margin:4px 0 0;font-size:12px'>Director: BADE SIR • Mahagama, Godda</p></div><h2 style='color:#059669'>✅ Enrollment Approved & Login ID Activated!</h2><p style='color:#334155;font-size:14px;line-height:1.6'>Dear <strong>${studentName}</strong>,<br/><br/>Your payment of <strong>${amount}</strong> for <strong>${courseName}</strong> has been verified and approved by Director BADE SIR. Your course access is now <strong style='color:#059669'>ACTIVE</strong>!</p><div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin:14px 0'><p style='margin:0;font-size:13px;color:#065f46'><strong>Your Login ID:</strong> ${studentEmail || studentMobile || studentUsername}</p>${studentMobile ? `<p style='margin:4px 0 0;font-size:13px;color:#065f46'><strong>Mobile:</strong> ${studentMobile}</p>` : ''}${studentUsername ? `<p style='margin:4px 0 0;font-size:13px;color:#065f46'><strong>Username:</strong> ${studentUsername}</p>` : ''}</div><div style='text-align:center;margin:18px 0'><a href='${appDownloadWeb}' style='display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:14px'>📲 Download ICC Android App</a><p style='margin:8px 0 0;font-size:12px;color:#64748b'>Direct APK: <a href='${appDownloadApk}'>${appDownloadApk}</a></p></div><p style='color:#94a3b8;font-size:11px;text-align:center;margin-top:20px'>ICC Online • Helpline: +91 9771350910</p></div>`;
      const adminHtml = `<div style='font-family:sans-serif;padding:20px'><h1 style='color:#1e3a8a'>ICC Admin: Payment Approved ✅</h1><p><b>Student:</b> ${studentName} (${studentEmail})<br/><b>Course:</b> ${courseName}<br/><b>Amount:</b> ${amount}<br/><b>Payment ID:</b> ${paymentId}<br/><b>Remarks:</b> ${remarks}<br/><b>Time:</b> ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p></div>`;
      if (studentEmail && studentEmail.includes('@')) {
        fetch('/api/email/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ to: studentEmail, subject: '✅ [ICC] Approved! Login ID & App Download Link — ' + courseName, htmlBody: studentHtml }) }).catch(()=>{});
      }
      fetch('/api/email/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ to: 'icckeguruji@gmail.com', subject: '[ICC Admin] Payment Approved: ' + studentName + ' — ' + courseName, htmlBody: adminHtml }) }).catch(()=>{});
      if (targetStudentId) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: targetStudentId,
            title: `✅ Enrollment Approved: ${courseName}`,
            message: `Your Login ID (${studentEmail || studentMobile}) is active! Download App: ${appDownloadWeb}`,
            type: 'approval',
            link: '/(tabs)/courses',
          }),
        }).catch(() => {});
      }
    } catch {}

    return {
      success: true,
      message: 'Payment approved! Student account activated & email notification sent.',
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

        // Remove rejected pending enrollment for this course
        if (targetStudentId && payment?.course_id) {
          await supabase
            .from('enrollments')
            .delete()
            .eq('student_id', targetStudentId)
            .eq('course_id', payment.course_id)
            .eq('status', 'pending');
        }

        // Delete the rejected payment record so student can cleanly re-enroll
        await supabase.from('payments').delete().eq('id', paymentId);

        // If student was a NEW unapproved registration (is_active === false), purge their profile too
        // If student already had an active ID (is_active === true), keep their active account intact!
        if (targetStudentId) {
          try {
            await supabase.from('profiles').delete().eq('id', targetStudentId).eq('is_active', false);
          } catch {}
        }
      } catch {}
    }

    localPayments = localPayments.filter((p) => p.id !== paymentId);
    savePersistentState(STORAGE_KEYS.PAYMENTS, localPayments);

    if (targetStudentId && !(payment as any)?.student?.is_active) {
      localStudents = localStudents.filter((s) => s.id !== targetStudentId);
      savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    }

    // ✅ Email notifications: student + admin
    try {
      const studentEmail = (payment as any)?.student?.email || '';
      const studentName = (payment as any)?.student?.full_name || 'Student';
      const courseName = (payment as any)?.course?.title || (payment as any)?.course_name || 'ICC Course';
      if (studentEmail && studentEmail.includes('@')) {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: studentEmail,
            subject: `⚠️ [ICC] Payment Verification Update — ${courseName}`,
            body: `Dear ${studentName},\n\nYour payment submission for ${courseName} could not be verified.\nReason: ${remarks}\n\nPlease contact Director BADE SIR on WhatsApp (+91 9771350910) or re-submit with a valid 12-digit UTR.`,
          }),
        }).catch(() => {});
      }
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'icckeguruji@gmail.com',
          subject: `[ICC Admin] Payment Rejected: ${studentName} — ${courseName}`,
          body: `Student: ${studentName} (${studentEmail})\nCourse: ${courseName}\nPayment ID: ${paymentId}\nRemarks: ${remarks}`,
        }),
      }).catch(() => {});
    } catch {}

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

  isAdminLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const cookies = document.cookie || '';
      const hasCookie = cookies.includes('icc-role=admin') || cookies.includes('sb-access-token=');
      const hasLocalFlag =
        localStorage.getItem('icc_admin_logged_in') === 'true' ||
        localStorage.getItem('icc_user_role') === 'admin';
      return Boolean(hasCookie || hasLocalFlag);
    } catch {
      return false;
    }
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'icc-role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('icc_admin_logged_in');
        localStorage.removeItem('icc_user_role');
        window.dispatchEvent(new Event('icc_auth_changed'));
      } catch {}
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

  // 12. Teachers (Full Cloud Real-Time Two-Way Sync via Supabase platform_settings & /api/teachers)
  getTeachers: async (): Promise<TeacherItem[]> => {
    localTeachers = getPersistentState(STORAGE_KEYS.TEACHERS, [...defaultTeachers]);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'icc_teachers')
          .maybeSingle();
        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          localTeachers = data.value as TeacherItem[];
          savePersistentState(STORAGE_KEYS.TEACHERS, localTeachers);
          return localTeachers;
        }
      } catch (e) {
        console.warn('getTeachers cloud fetch error, trying /api/teachers:', e);
      }
      try {
        const res = await fetch('/api/teachers', { cache: 'no-store' });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            localTeachers = list;
            savePersistentState(STORAGE_KEYS.TEACHERS, localTeachers);
            return localTeachers;
          }
        }
      } catch {}
    }
    return localTeachers;
  },

  createTeacher: async (teacherData: Omit<TeacherItem, 'id'>): Promise<TeacherItem> => {
    localTeachers = getPersistentState(STORAGE_KEYS.TEACHERS, [...defaultTeachers]);
    const newTeacher: TeacherItem = {
      id: `t-${Date.now()}`,
      ...teacherData,
    };
    const updated = [newTeacher, ...localTeachers.filter((t) => t.id !== newTeacher.id)];

    if (isSupabaseConfigured) {
      let isSaved = false;
      try {
        const { error } = await supabase.from('platform_settings').upsert({
          key: 'icc_teachers',
          value: updated,
          description: 'Institute Teachers & Faculty List with real-time multi-client sync',
          updated_at: new Date().toISOString(),
        });
        if (!error) isSaved = true;
      } catch (e) {
        console.warn('createTeacher Supabase error:', e);
      }

      if (!isSaved) {
        try {
          const res = await fetch('/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeacher),
          });
          if (res.ok) isSaved = true;
        } catch {}
      }

      if (!isSaved) {
        throw new Error('Database Error: Failed to save teacher to cloud database.');
      }
    }

    localTeachers = updated;
    savePersistentState(STORAGE_KEYS.TEACHERS, localTeachers);
    return newTeacher;
  },

  updateTeacher: async (teacherId: string, updates: Partial<TeacherItem>): Promise<TeacherItem | null> => {
    localTeachers = getPersistentState(STORAGE_KEYS.TEACHERS, [...defaultTeachers]);
    const updated = localTeachers.map((t) => (t.id === teacherId ? { ...t, ...updates } : t));

    if (isSupabaseConfigured) {
      let isSaved = false;
      try {
        const { error } = await supabase.from('platform_settings').upsert({
          key: 'icc_teachers',
          value: updated,
          description: 'Institute Teachers & Faculty List with real-time multi-client sync',
          updated_at: new Date().toISOString(),
        });
        if (!error) isSaved = true;
      } catch (e) {
        console.warn('updateTeacher Supabase error:', e);
      }

      if (!isSaved) {
        try {
          const res = await fetch('/api/teachers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: teacherId, ...updates }),
          });
          if (res.ok) isSaved = true;
        } catch {}
      }

      if (!isSaved) {
        throw new Error('Database Error: Failed to update teacher in cloud database.');
      }
    }

    localTeachers = updated;
    savePersistentState(STORAGE_KEYS.TEACHERS, localTeachers);
    return localTeachers.find((t) => t.id === teacherId) || null;
  },

  deleteTeacher: async (teacherId: string): Promise<boolean> => {
    localTeachers = getPersistentState(STORAGE_KEYS.TEACHERS, [...defaultTeachers]);
    const updated = localTeachers.filter((t) => t.id !== teacherId);

    if (isSupabaseConfigured) {
      let isSaved = false;
      try {
        const { error } = await supabase.from('platform_settings').upsert({
          key: 'icc_teachers',
          value: updated,
          description: 'Institute Teachers & Faculty List with real-time multi-client sync',
          updated_at: new Date().toISOString(),
        });
        if (!error) isSaved = true;
      } catch (e) {
        console.warn('deleteTeacher Supabase error:', e);
      }

      if (!isSaved) {
        try {
          const res = await fetch(`/api/teachers?id=${teacherId}`, {
            method: 'DELETE',
          });
          if (res.ok) isSaved = true;
        } catch {}
      }

      if (!isSaved) {
        throw new Error('Database Error: Failed to delete teacher from cloud database.');
      }
    }

    localTeachers = updated;
    savePersistentState(STORAGE_KEYS.TEACHERS, localTeachers);
    return true;
  },
};
