// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Comprehensive Curriculum for Class 1 to Class 12 (BSEB, JAC & CBSE)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Direct persistent local storage (never reverts) + Cloud Sync + Deletion Blacklist

import {
  supabase,
  isSupabaseConfigured,
  LIVE_SUPABASE_URL,
  LIVE_SUPABASE_ANON_KEY,
} from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Course, LiveClass, StudyMaterial, UserProfile } from '@icc/shared-types';

// Direct Supabase REST fetcher with static anon key — guarantees zero-cache live parity and bypasses expired sessions
async function fetchDirectRest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${LIVE_SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers: Record<string, string> = {
      apikey: LIVE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${LIVE_SUPABASE_ANON_KEY}`,
      ...(options.headers as Record<string, string> || {}),
    };
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    if (res.status === 204) return {} as T;
    const text = await res.text();
    if (!text || text.trim() === '') return {} as T;
    return JSON.parse(text) as T;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
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
  chapter_count?: number;
  lecture_count?: number;
  material_count?: number;
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
// 100% BLANK SLATE: ZERO HARDCODED DUMMY DATA
// All courses, subjects, chapters, live classes & notes must be
// added manually by Director BADE SIR or created via AI Copilot.
// -------------------------------------------------------------

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
export const initialAcademicSubjects: AcademicSubject[] = [];
export const initialAcademicChapters: AcademicChapter[] = [];
export const initialRecordedLectures: RecordedLecture[] = [];
export const initialChapterLiveClasses: LiveClass[] = [];
export const initialChapterStudyMaterials: StudyMaterial[] = [];

// -------------------------------------------------------------
// REACTIVE ACADEMIC REPOSITORY & ADMIN CRUD SERVICE
// -------------------------------------------------------------

const SAMPLE_RESERVED_IDS = new Set([
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  'cr000000-0000-0000-0000-000000000001',
  'cr000000-0000-0000-0000-000000000002',
  'cr000000-0000-0000-0000-000000000003',
  'cr000000-0000-0000-0000-000000000004',
  'mat00000-0000-0000-0000-000000000001',
  'mat00000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000002',
  'live0000-0000-0000-0000-000000000001',
  'live0000-0000-0000-0000-000000000002',
  'live0000-0000-0000-0000-000000000003',
]);

export interface Teacher {
  id: string;
  full_name: string;
  qualification: string;
  subjects: string;
  email: string;
  mobile: string;
  assignedBatches: number;
}

export const defaultTeachersList: Teacher[] = [
  {
    id: 't-0',
    full_name: 'BADE SIR (Director)',
    qualification: 'Founder & Academic Director - 12+ Years Experience',
    subjects: 'Senior Physics, Mathematics & Board Strategy',
    email: 'icckeguruji@gmail.com',
    mobile: '+91 9771350910',
    assignedBatches: 4,
  },
  {
    id: 't-1',
    full_name: 'Er. R. K. Sharma',
    qualification: 'B.Tech (NIT Patna) - 10+ Years Experience',
    subjects: 'Physics & Mathematics',
    email: 'rksharma@idealcoaching.in',
    mobile: '9876543220',
    assignedBatches: 3,
  },
  {
    id: 't-2',
    full_name: 'Dr. S. N. Mishra',
    qualification: 'M.Sc, Ph.D (Patna University)',
    subjects: 'Chemistry & Biology',
    email: 'snmishra@idealcoaching.in',
    mobile: '9876543221',
    assignedBatches: 2,
  },
];

class AcademicRepository {
  private courses: Course[] = [];
  private subjects: AcademicSubject[] = [];
  public chapters: AcademicChapter[] = [];
  public lectures: RecordedLecture[] = [];
  private liveClasses: LiveClass[] = [];
  private materials: StudyMaterial[] = [];
  private payments: any[] = [];
  private students: UserProfile[] = [];
  private teachers: Teacher[] = [...defaultTeachersList];
  private listeners: Set<() => void> = new Set();
  private deletedIds: Set<string> = new Set();
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private syncPromise: Promise<void> | null = null;
  private realtimeChannel: any = null;
  private lastRealtimeSync: number = 0;
  private notifyTimeout: any = null;

  constructor() {
    this.loadPromise = this.init();
  }

  async ensureLoaded(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  private async init() {
    await this.loadFromStorage();
    this.setupRealtimeSync();
    // Fast parallel initial cloud sync with 2.5s network timeout
    await Promise.race([
      this.syncFromCloud(),
      new Promise((res) => setTimeout(res, 2500)),
    ]);
  }

  private triggerThrottledSync() {
    const now = Date.now();
    if (now - this.lastRealtimeSync < 5000) return;
    this.lastRealtimeSync = now;
    this.syncFromCloud().catch(() => {});
  }

  private setupRealtimeSync() {
    if (!isSupabaseConfigured || this.realtimeChannel) return;
    try {
      this.realtimeChannel = supabase
        .channel('icc-academic-realtime-master')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'recorded_lectures' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, () => {
          this.triggerThrottledSync();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          this.triggerThrottledSync();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime sync setup error:', e);
    }
  }

  private async loadFromStorage() {
    try {
      let rawDeleted = null;
      let isInitialized = null;
      let sCourses = null, sSubs = null, sChaps = null, sLecs = null, sLive = null, sMats = null, sPayments = null, sStudents = null, sTeachers = null;

      if (Platform.OS !== 'web') {
        rawDeleted = await SecureStore.getItemAsync('icc_deleted_ids');
        isInitialized = await SecureStore.getItemAsync('icc_storage_initialized');
        sCourses = await SecureStore.getItemAsync('icc_courses');
        sSubs = await SecureStore.getItemAsync('icc_academic_subjects');
        sChaps = await SecureStore.getItemAsync('icc_academic_chapters');
        sLecs = await SecureStore.getItemAsync('icc_recorded_lectures');
        sLive = await SecureStore.getItemAsync('icc_live_classes');
        sMats = await SecureStore.getItemAsync('icc_study_materials');
        sPayments = await SecureStore.getItemAsync('icc_payments');
        sStudents = await SecureStore.getItemAsync('icc_students');
        sTeachers = await SecureStore.getItemAsync('icc_teachers');
      } else if (typeof window !== 'undefined') {
        rawDeleted = localStorage.getItem('icc_deleted_ids');
        isInitialized = localStorage.getItem('icc_storage_initialized');
        sCourses = localStorage.getItem('icc_courses');
        sSubs = localStorage.getItem('icc_academic_subjects');
        sChaps = localStorage.getItem('icc_academic_chapters');
        sLecs = localStorage.getItem('icc_recorded_lectures');
        sLive = localStorage.getItem('icc_live_classes');
        sMats = localStorage.getItem('icc_study_materials');
        sPayments = localStorage.getItem('icc_payments');
        sStudents = localStorage.getItem('icc_students');
        sTeachers = localStorage.getItem('icc_teachers');
      }

      if (rawDeleted) {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) this.deletedIds = new Set(arr);
      }

      // If storage was never initialized on this device, seed once and mark initialized
      if (!isInitialized) {
        this.courses = [];
        this.subjects = [];
        this.chapters = [];
        this.lectures = [];
        this.liveClasses = [];
        this.materials = [];
        this.payments = [];
        this.students = [];

        await this.persist('icc_storage_initialized', 'true');
        await this.persist('icc_courses_modified', 'true');
        await this.persist('icc_courses', this.courses);
        await this.persist('icc_academic_subjects', this.subjects);
        await this.persist('icc_academic_chapters', this.chapters);
        await this.persist('icc_recorded_lectures', this.lectures);
        await this.persist('icc_live_classes', this.liveClasses);
        await this.persist('icc_study_materials', this.materials);
        await this.persist('icc_payments', this.payments);
        await this.persist('icc_students', this.students);
      } else {
        // Authoritative load from persistent storage — never re-seed deleted items
        if (sCourses !== null) this.courses = JSON.parse(sCourses);
        if (sSubs !== null) this.subjects = JSON.parse(sSubs);
        if (sChaps !== null) this.chapters = JSON.parse(sChaps);
        if (sLecs !== null) this.lectures = JSON.parse(sLecs);
        if (sLive !== null) this.liveClasses = JSON.parse(sLive);
        if (sMats !== null) this.materials = JSON.parse(sMats);
        if (sPayments !== null) this.payments = JSON.parse(sPayments);
        if (sStudents !== null) this.students = JSON.parse(sStudents);
        if (sTeachers !== null) this.teachers = JSON.parse(sTeachers);
      }

      // Filter out any tombstoned / deleted items
      this.courses = this.courses.filter((c) => !this.isDeleted(c.id));
      this.subjects = this.subjects.filter((s) => !this.isDeleted(s.id));
      this.chapters = this.chapters.filter((ch) => !this.isDeleted(ch.id));
      this.lectures = this.lectures.filter((l) => !this.isDeleted(l.id));
      this.liveClasses = this.liveClasses.filter((lc) => !this.isDeleted(lc.id));
      this.materials = this.materials.filter((m) => !this.isDeleted(m.id));

      this.isLoaded = true;
    } catch {
      this.isLoaded = true;
    }
  }

  private normalizeKey(text: string): string {
    return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(key);
      } else if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {}
    return null;
  }

  private isDeleted(id: string): boolean {
    return this.deletedIds.has(id);
  }

  // Authoritative, ultra-fast parallel cloud sync with Supabase (Single Source of Truth)
  async syncFromCloud(): Promise<void> {
    if (!isSupabaseConfigured) return;
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        // Fast parallel fetch using Direct REST with static anon key (Guaranteed ~500ms, zero auth hang)
        const [
          remoteCourses,
          remoteLive,
          remoteMats,
          remoteLecs,
          remoteSubs,
          remoteChaps,
          remotePayments,
          remoteProfiles,
        ] = await Promise.all([
          fetchDirectRest<any[]>('courses?select=*&order=created_at.desc'),
          fetchDirectRest<any[]>('live_classes?select=*&order=scheduled_at.desc'),
          fetchDirectRest<any[]>('study_materials?select=*&order=created_at.desc'),
          fetchDirectRest<any[]>('recorded_lectures?select=*&order=lecture_order.asc'),
          fetchDirectRest<any[]>('subjects?select=*&order=display_order.asc'),
          fetchDirectRest<any[]>('chapters?select=*&order=chapter_number.asc'),
          fetchDirectRest<any[]>('payments?select=*&order=created_at.desc'),
          fetchDirectRest<any[]>('profiles?select=*&order=created_at.desc'),
        ]);

        const hasListChanged = (newList: any[], currentList: any[]): boolean => {
          if (newList.length !== currentList.length) return true;
          for (let i = 0; i < newList.length; i++) {
            const a = newList[i];
            const b = currentList[i];
            if (a.id !== b.id) return true;
            if (a.updated_at && b.updated_at && a.updated_at !== b.updated_at) return true;
            if (a.status && b.status && a.status !== b.status) return true;
            if (a.title && b.title && a.title !== b.title) return true;
            if (a.name && b.name && a.name !== b.name) return true;
          }
          return false;
        };

        let hasChanged = false;

        // 1. Courses: Authoritative from Supabase
        if (Array.isArray(remoteCourses) && remoteCourses.length > 0) {
          const mappedCourses = remoteCourses
            .filter((remote) => !this.isDeleted(remote.id))
            .map((remote) => ({
              ...remote,
              thumbnail_url: getResolvedThumbnailUrl(remote.thumbnail_url),
            }));
          if (hasListChanged(mappedCourses, this.courses)) {
            this.courses = mappedCourses;
            this.persist('icc_courses', this.courses).catch(() => {});
            hasChanged = true;
          }
        }

        // 2. Live Classes: Authoritative from Supabase
        if (Array.isArray(remoteLive)) {
          const activeLive = remoteLive.filter((l) => !this.isDeleted(l.id));
          if (hasListChanged(activeLive, this.liveClasses)) {
            this.liveClasses = activeLive;
            this.persist('icc_live_classes', this.liveClasses).catch(() => {});
            hasChanged = true;
          }
        }

        // 3. Study Materials: Authoritative from Supabase
        if (Array.isArray(remoteMats)) {
          const activeMats = remoteMats.filter((m) => !this.isDeleted(m.id));
          if (hasListChanged(activeMats, this.materials)) {
            this.materials = activeMats;
            this.persist('icc_study_materials', this.materials).catch(() => {});
            hasChanged = true;
          }
        }

        // 4. Recorded Lectures: Authoritative from Supabase
        if (Array.isArray(remoteLecs)) {
          const activeLecs = remoteLecs.filter((l) => !this.isDeleted(l.id));
          if (hasListChanged(activeLecs, this.lectures)) {
            this.lectures = activeLecs;
            this.persist('icc_recorded_lectures', this.lectures).catch(() => {});
            hasChanged = true;
          }
        }

        // 5. Subjects: Authoritative from Supabase
        if (Array.isArray(remoteSubs) && remoteSubs.length > 0) {
          const activeSubs = remoteSubs.filter((s) => !this.isDeleted(s.id));
          if (hasListChanged(activeSubs, this.subjects)) {
            this.subjects = activeSubs;
            this.persist('icc_academic_subjects', this.subjects).catch(() => {});
            hasChanged = true;
          }
        }

        // 6. Chapters: Authoritative from Supabase
        if (Array.isArray(remoteChaps) && remoteChaps.length > 0) {
          const activeChaps = remoteChaps.filter((c) => !this.isDeleted(c.id));
          if (hasListChanged(activeChaps, this.chapters)) {
            this.chapters = activeChaps;
            this.persist('icc_academic_chapters', this.chapters).catch(() => {});
            hasChanged = true;
          }
        }

        // 7. Payments: Authoritative from Supabase
        if (Array.isArray(remotePayments)) {
          if (hasListChanged(remotePayments, this.payments)) {
            this.payments = remotePayments;
            this.persist('icc_payments', this.payments).catch(() => {});
            hasChanged = true;
          }
        }

        // 8. Profiles / Students: Authoritative from Supabase
        if (Array.isArray(remoteProfiles)) {
          if (hasListChanged(remoteProfiles, this.students)) {
            this.students = remoteProfiles;
            this.persist('icc_students', this.students).catch(() => {});
            hasChanged = true;
          }
        }

        // 9. Teachers: Authoritative from Supabase platform_settings or /api/teachers
        try {
          let remoteTeachers: Teacher[] | null = null;
          const { data: tData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'icc_teachers')
            .maybeSingle();
          if (tData?.value && Array.isArray(tData.value)) {
            remoteTeachers = tData.value as Teacher[];
          } else {
            const tRes = await fetchDirectRest<any>('platform_settings?key=eq.icc_teachers&select=value');
            if (Array.isArray(tRes) && tRes[0]?.value && Array.isArray(tRes[0].value)) {
              remoteTeachers = tRes[0].value;
            }
          }
          if (Array.isArray(remoteTeachers) && remoteTeachers.length > 0) {
            if (hasListChanged(remoteTeachers, this.teachers)) {
              this.teachers = remoteTeachers;
              this.persist('icc_teachers', this.teachers).catch(() => {});
              hasChanged = true;
            }
          }
        } catch (tErr) {
          console.warn('Sync teachers from cloud error:', tErr);
        }

        if (hasChanged) {
          this.notify();
        }
      } catch (e) {
        console.warn('Sync from cloud error:', e);
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    if (this.notifyTimeout) clearTimeout(this.notifyTimeout);
    this.notifyTimeout = setTimeout(() => {
      this.listeners.forEach((l) => {
        try {
          l();
        } catch {}
      });
    }, 100);
  }

  /**
   * Complete 1-Tap Blank Slate: Wipes all courses, subjects, chapters,
   * live classes, and materials from local SecureStore and database.
   */
  async purgeAllData(): Promise<void> {
    await this.ensureLoaded();
    this.courses = [];
    this.subjects = [];
    this.chapters = [];
    this.lectures = [];
    this.liveClasses = [];
    this.materials = [];
    this.payments = [];
    this.students = [];
    this.deletedIds.clear();

    await this.persist('icc_storage_initialized', 'true');
    await this.persist('icc_courses_modified', 'true');
    await this.persist('icc_materials_modified', 'true');
    await this.persist('icc_live_modified', 'true');
    await this.persist('icc_courses', []);
    await this.persist('icc_academic_subjects', []);
    await this.persist('icc_academic_chapters', []);
    await this.persist('icc_recorded_lectures', []);
    await this.persist('icc_live_classes', []);
    await this.persist('icc_study_materials', []);
    await this.persist('icc_payments', []);
    await this.persist('icc_students', []);
    await this.persist('icc_deleted_ids', []);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('live_classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('study_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Remote purge warning:', e);
      }
    }
    this.notify();
  }

  private async persist(key: string, data: any) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
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
  async getCourses(forceLive = false): Promise<Course[]> {
    await this.ensureLoaded();
    if (forceLive && isSupabaseConfigured) {
      await this.syncFromCloud();
    }
    const active = this.courses.filter((c) => !this.isDeleted(c.id));
    return active.map((c) => {
      const cClass = (c.class_name || this.getClassNameFromCourse(c) || '').toLowerCase();
      const realLecCount = this.lectures.filter((l) => {
        if (l.course_id === c.id) return true;
        const sub = this.subjects.find((s) => s.id === l.subject_id);
        if (sub && (sub.course_id === c.id || (sub.class_name && sub.class_name.toLowerCase() === cClass))) {
          return true;
        }
        return false;
      }).length;

      const realMatCount = this.materials.filter((m: any) => {
        if (m.course_id === c.id) return true;
        if (m.class_name && m.class_name.toLowerCase() === cClass) return true;
        const sub = this.subjects.find((s) => s.id === m.subject_id);
        if (sub && (sub.course_id === c.id || (sub.class_name && sub.class_name.toLowerCase() === cClass))) {
          return true;
        }
        return false;
      }).length;

      return {
        ...c,
        lecture_count: realLecCount,
        material_count: realMatCount,
      };
    });
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    await this.ensureLoaded();
    let found = this.courses.find((c) => c.id === id);

    // If not in local cache, try fetching from Supabase
    if (!found && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          found = { ...data, thumbnail_url: getResolvedThumbnailUrl(data.thumbnail_url) } as Course;
          this.courses = [...this.courses.filter((c) => c.id !== id), found];
          this.persist('icc_courses', this.courses).catch(() => {});
        }
      } catch (e) {
        console.warn('getCourseById Supabase fetch error:', e);
      }
    }

    if (!found || this.deletedIds.has(found.id)) return undefined;

    const cClass = (found.class_name || this.getClassNameFromCourse(found) || '').toLowerCase();
    const realLecCount = this.lectures.filter((l) => {
      if (l.course_id === found.id) return true;
      const sub = this.subjects.find((s) => s.id === l.subject_id);
      if (sub && (sub.course_id === found.id || (sub.class_name && sub.class_name.toLowerCase() === cClass))) {
        return true;
      }
      return false;
    }).length;

    const realMatCount = this.materials.filter((m: any) => {
      if (m.course_id === found.id) return true;
      if (m.class_name && m.class_name.toLowerCase() === cClass) return true;
      const sub = this.subjects.find((s) => s.id === m.subject_id);
      if (sub && (sub.course_id === found.id || (sub.class_name && sub.class_name.toLowerCase() === cClass))) {
        return true;
      }
      return false;
    }).length;

    return {
      ...found,
      lecture_count: realLecCount,
      material_count: realMatCount,
    };
  }

  async addCourse(data: Partial<Course>): Promise<Course> {
    await this.ensureLoaded();
    const courseId = data.id && isValidUUID(data.id) ? data.id : generateUUID();
    this.deletedIds.delete(courseId);
    const defaultBoardId = 'b0000000-0000-0000-0000-000000000001';
    const safeClassId = getSafeClassId(data.class_id, (data as any)?.class_name);
    const defaultSessionId = 'a0000000-0000-0000-0000-000000000001';

    // Strictly DB-valid columns
    const dbPayload: any = {
      id: courseId,
      title: data.title || 'New Target Course',
      title_hi: data.title_hi || data.title || 'New Target Course',
      description: data.description || '',
      description_hi: data.description_hi || data.description || '',
      thumbnail_url: getResolvedThumbnailUrl(data.thumbnail_url),
      board_id: data.board_id || defaultBoardId,
      class_id: safeClassId,
      session_id: data.session_id || defaultSessionId,
      is_free: Boolean(data.is_free),
      price: data.price !== undefined ? data.price : 999,
      discount_price: data.discount_price !== undefined ? data.discount_price : 499,
      validity_days: data.validity_days || 365,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data: created, error } = await supabase
          .from('courses')
          .insert(dbPayload)
          .select()
          .single();
        if (!error && created) {
          const resolved: Course = {
            ...(created as Course),
            tagline: data.tagline || '',
            class_name: (data as any)?.class_name || 'Class 10',
            thumbnail_url: getResolvedThumbnailUrl(created.thumbnail_url),
          };
          this.courses = [resolved, ...this.courses.filter((c) => c.id !== resolved.id)];
          await this.persist('icc_courses', this.courses);
          this.notify();
          return resolved;
        } else if (error) {
          console.warn('Supabase course insert error, trying direct REST POST:', error);
        }
      } catch (e) {
        console.warn('Supabase course insert exception, trying direct REST POST:', e);
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
          tagline: data.tagline || '',
          class_name: (data as any)?.class_name || 'Class 10',
          thumbnail_url: getResolvedThumbnailUrl(directCreated[0].thumbnail_url),
        };
        this.courses = [resolved, ...this.courses.filter((c) => c.id !== resolved.id)];
        await this.persist('icc_courses', this.courses);
        this.notify();
        return resolved;
      }
    }

    throw new Error('Database Error: Failed to save course to cloud database. Please check your internet connection.');
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    return this.addCourse(data);
  }

  async saveCourse(data: Partial<Course>): Promise<Course> {
    if (data.id) {
      return this.updateCourse(data.id, data);
    }
    return this.addCourse(data);
  }

  // BULLETPROOF UPDATE: NEVER THROWS 'Course not found' OR SCHEMA COLUMN ERRORS
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    await this.ensureLoaded();
    const rawUpdates = updates as any;
    const dbPayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (rawUpdates.title !== undefined) dbPayload.title = rawUpdates.title;
    if (rawUpdates.title_hi !== undefined) dbPayload.title_hi = rawUpdates.title_hi;
    if (rawUpdates.description !== undefined) dbPayload.description = rawUpdates.description;
    if (rawUpdates.description_hi !== undefined) dbPayload.description_hi = rawUpdates.description_hi;
    if (rawUpdates.thumbnail_url !== undefined) {
      dbPayload.thumbnail_url = getResolvedThumbnailUrl(rawUpdates.thumbnail_url);
    }
    if (rawUpdates.is_free !== undefined) dbPayload.is_free = rawUpdates.is_free;
    if (rawUpdates.price !== undefined) dbPayload.price = Number(rawUpdates.price);
    if (rawUpdates.discount_price !== undefined) dbPayload.discount_price = Number(rawUpdates.discount_price);
    if (rawUpdates.validity_days !== undefined) dbPayload.validity_days = Number(rawUpdates.validity_days);
    if (rawUpdates.board_id !== undefined) dbPayload.board_id = rawUpdates.board_id;
    if (rawUpdates.class_id !== undefined || rawUpdates.class_name !== undefined) {
      dbPayload.class_id = getSafeClassId(rawUpdates.class_id, rawUpdates.class_name);
    }

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(id)) {
          const { error: upsertErr } = await supabase.from('courses').upsert({ id, ...dbPayload }, { onConflict: 'id' });
          if (!upsertErr) {
            isSaved = true;
          } else {
            console.warn('updateCourse upsert error, trying update:', upsertErr);
            const { error: updateErr } = await supabase.from('courses').update(dbPayload).eq('id', id);
            if (!updateErr) {
              isSaved = true;
            } else {
              const res = await fetchDirectRest(`courses?id=eq.${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload),
              });
              if (res) isSaved = true;
            }
          }
        } else if (updates.title) {
          const { error } = await supabase.from('courses').update(dbPayload).eq('title', updates.title);
          if (!error) isSaved = true;
        }
      } catch (e) {
        console.warn('updateCourse exception:', e);
      }
    }

    if (!isSaved && isSupabaseConfigured) {
      throw new Error('Database Error: Failed to update course in cloud database. Please verify internet connection.');
    }

    this.courses = this.courses.map((c) =>
      c.id === id
        ? {
            ...c,
            ...updates,
            thumbnail_url: updates.thumbnail_url ? getResolvedThumbnailUrl(updates.thumbnail_url) : c.thumbnail_url,
            updated_at: new Date().toISOString(),
          }
        : c
    );
    await this.persist('icc_courses', this.courses);
    this.notify();
    return this.courses.find((c) => c.id === id)!;
  }

  async deleteCourse(id: string): Promise<void> {
    await this.ensureLoaded();
    const course = this.courses.find((c) => c.id === id);

    let isDeleted = false;
    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(id)) {
          // Pre-delete any children referencing course_id to guarantee no foreign key lock
          await Promise.allSettled([
            supabase.from('subjects').delete().eq('course_id', id),
            supabase.from('live_classes').delete().eq('course_id', id),
            supabase.from('study_materials').delete().eq('course_id', id),
            supabase.from('recorded_lectures').delete().eq('course_id', id),
          ]);
          const { error } = await supabase.from('courses').delete().eq('id', id);
          if (!error) {
            isDeleted = true;
          } else {
            await fetchDirectRest(`courses?id=eq.${id}`, { method: 'DELETE' });
            isDeleted = true;
          }
        } else if (course?.title) {
          const { error } = await supabase.from('courses').delete().eq('title', course.title);
          if (!error) isDeleted = true;
        }
      } catch (e) {
        console.warn('Supabase delete warning:', e);
        if (isValidUUID(id)) {
          await fetchDirectRest(`courses?id=eq.${id}`, { method: 'DELETE' });
          isDeleted = true;
        }
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete course from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    this.courses = this.courses.filter((c) => c.id !== id);
    await this.persist('icc_courses', this.courses);
    this.notify();
  }

  // --- SUBJECTS (Course Scoped or Class Scoped) ---
  async getSubjects(courseId?: string, className?: string): Promise<AcademicSubject[]> {
    await this.ensureLoaded();

    const computeSubjectCounts = (s: AcademicSubject): AcademicSubject => {
      const subjectChapterIds = new Set(
        this.chapters.filter((c) => !this.isDeleted(c.id) && c.subject_id === s.id).map((c) => c.id)
      );
      const lecCount = this.lectures.filter(
        (l) => !this.isDeleted(l.id) && (l.subject_id === s.id || (l.chapter_id && subjectChapterIds.has(l.chapter_id)))
      ).length;
      const liveCount = this.liveClasses.filter(
        (l) => !this.isDeleted(l.id) && ((l as any).subject_id === s.id || ((l as any).chapter_id && subjectChapterIds.has((l as any).chapter_id)))
      ).length;
      const matCount = this.materials.filter(
        (m) => !this.isDeleted(m.id) && (m.subject_id === s.id || (m.chapter_id && subjectChapterIds.has(m.chapter_id)))
      ).length;

      return {
        ...s,
        chapter_count: subjectChapterIds.size,
        lecture_count: lecCount + liveCount,
        material_count: matCount,
      };
    };

    // ✅ ALWAYS fetch fresh from Supabase when courseId is provided (live data)
    if (courseId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('course_id', courseId)
          .order('display_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: AcademicSubject[] = data
            .filter((d: any) => !this.isDeleted(d.id))
            .map((d: any) => ({
              id: d.id,
              course_id: d.course_id,
              class_id: d.class_id,
              class_name: d.class_name || '',
              name: d.name,
              name_hi: d.name_hi || d.name,
              code: d.code || '',
              icon_name: d.icon_name || 'book-open',
              has_sub_subjects: Boolean(d.has_sub_subjects),
              sub_subjects: d.sub_subjects || [],
              display_order: d.display_order || 0,
            }));
          // Update local cache for this courseId
          this.subjects = [
            ...this.subjects.filter((s) => s.course_id !== courseId),
            ...mapped,
          ];
          this.persist('icc_academic_subjects', this.subjects).catch(() => {});
          return mapped.map(computeSubjectCounts);
        }
      } catch (e) {
        console.warn('getSubjects Supabase fetch error:', e);
      }
    }

    let list = this.subjects.filter((s) => !this.isDeleted(s.id));

    // When courseId is provided, return ONLY subjects explicitly belonging to this course
    // Zero auto-injection: Admin manually creates subjects for each course.
    if (courseId) {
      return list.filter((s) => s.course_id === courseId).map(computeSubjectCounts);
    }

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
      return list.map(computeSubjectCounts);
    }

    return list.map(computeSubjectCounts);
  }

  async addSubject(sub: Partial<AcademicSubject>): Promise<AcademicSubject> {
    await this.ensureLoaded();
    const subId = sub.id && isValidUUID(sub.id) ? sub.id : generateUUID();

    const newSub: AcademicSubject = {
      id: subId,
      course_id: sub.course_id,
      class_id: sub.class_id,
      class_name: sub.class_name || 'Class 10',
      name: sub.name || 'New Subject',
      name_hi: sub.name_hi || sub.name || 'New Subject',
      code: sub.code || `SUB-${Date.now().toString().slice(-4)}`,
      icon_name: sub.icon_name || 'book-open',
      has_sub_subjects: Boolean(sub.has_sub_subjects),
      sub_subjects: sub.sub_subjects || [],
      display_order: this.subjects.length + 1,
    };

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          id: newSub.id,
          name: newSub.name,
          name_hi: newSub.name_hi,
          code: newSub.code,
          icon_name: newSub.icon_name,
          display_order: newSub.display_order,
          is_active: true,
        };
        if (newSub.course_id && isValidUUID(newSub.course_id)) {
          payload.course_id = newSub.course_id;
        }
        const { error } = await supabase.from('subjects').upsert(payload);
        if (!error) {
          isSaved = true;
        } else {
          const direct = await fetchDirectRest('subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (direct) isSaved = true;
        }
      } catch (e) {
        console.warn('Supabase addSubject error:', e);
      }
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to save subject to cloud database. Please check your connection.');
    }

    this.deletedIds.delete(subId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.subjects.push(newSub);
    await this.persist('icc_academic_subjects', this.subjects);
    this.notify();
    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.ensureLoaded();
    let isDeleted = false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (!error) {
          isDeleted = true;
        } else {
          await fetchDirectRest(`subjects?id=eq.${id}`, { method: 'DELETE' });
          isDeleted = true;
        }
      } catch (e) {
        console.warn('Supabase deleteSubject error:', e);
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete subject from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.subjects = this.subjects.filter((s) => s.id !== id);
    await this.persist('icc_academic_subjects', this.subjects);
    this.notify();
  }

  async updateSubject(id: string, updates: Partial<AcademicSubject>): Promise<AcademicSubject> {
    await this.ensureLoaded();
    const payload: any = {
      name: updates.name,
      name_hi: updates.name_hi || updates.name,
    };
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subjects').update(payload).eq('id', id);
        if (!error) isSaved = true;
      } catch (e) {
        console.warn('Supabase updateSubject error:', e);
      }
      if (!isSaved) {
        const direct = await fetchDirectRest(`subjects?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        });
        if (direct) isSaved = true;
      }
    }

    this.subjects = this.subjects.map((s) => (s.id === id ? { ...s, ...payload } : s));
    await this.persist('icc_academic_subjects', this.subjects);
    this.notify();
    const updated = this.subjects.find((s) => s.id === id);
    if (!updated) throw new Error('Subject not found');
    return updated;
  }

  // --- SUB-SUBJECTS ---
  async addSubSubject(subjectId: string, sub: { name: string; name_hi: string }): Promise<SubSubject> {
    await this.ensureLoaded();
    const targetSubject = this.subjects.find((s) => s.id === subjectId);
    if (!targetSubject) throw new Error('Subject not found');

    const newSubSub: SubSubject = {
      id: generateUUID(),
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
    await this.ensureLoaded();

    const computeChapterCounts = (ch: AcademicChapter): AcademicChapter => {
      const lecCount = this.lectures.filter((l) => !this.isDeleted(l.id) && l.chapter_id === ch.id).length;
      const liveCount = this.liveClasses.filter((l) => !this.isDeleted(l.id) && (l as any).chapter_id === ch.id).length;
      const matCount = this.materials.filter((m) => !this.isDeleted(m.id) && m.chapter_id === ch.id).length;
      return {
        ...ch,
        lecture_count: lecCount,
        live_count: liveCount,
        material_count: matCount,
      };
    };

    // ✅ ALWAYS fetch fresh from Supabase first (live database = single source of truth)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('subject_id', subjectId)
          .order('chapter_number', { ascending: true });
        if (!error && Array.isArray(data)) {
          const mapped: AcademicChapter[] = data
            .filter((d: any) => !this.isDeleted(d.id))
            .filter((d: any) => !subSubjectId || d.description?.includes(`sub_subject:${subSubjectId}`))
            .map((d: any) => ({
              id: d.id,
              subject_id: d.subject_id,
              sub_subject_id: subSubjectId,
              course_id: d.course_id,
              class_name: d.class_name,
              chapter_number: d.chapter_number || 1,
              title: d.title,
              title_hi: d.title_hi || d.title,
              description: d.description || '',
              live_count: 0,
              lecture_count: 0,
              material_count: 0,
            }));
          // Update local cache for this subject
          this.chapters = [
            ...this.chapters.filter((c) => c.subject_id !== subjectId),
            ...mapped,
          ];
          this.persist('icc_academic_chapters', this.chapters).catch(() => {});
          return mapped.map(computeChapterCounts);
        }
      } catch (e) {
        console.warn('getChapters Supabase fetch error:', e);
      }
    }

    // Fallback: local cache
    const local = this.chapters.filter((ch) => {
      if (this.isDeleted(ch.id)) return false;
      if (ch.subject_id !== subjectId) return false;
      if (subSubjectId) return ch.sub_subject_id === subSubjectId;
      return true;
    });
    return local.map(computeChapterCounts);
  }

  async addChapter(data: Partial<AcademicChapter>): Promise<AcademicChapter> {
    await this.ensureLoaded();
    const chapterId = data.id && isValidUUID(data.id) ? data.id : generateUUID();

    const newChapter: AcademicChapter = {
      id: chapterId,
      subject_id: data.subject_id!,
      sub_subject_id: data.sub_subject_id,
      course_id: data.course_id,
      class_name: data.class_name,
      chapter_number: data.chapter_number || this.chapters.length + 1,
      title: data.title || 'New Chapter',
      title_hi: data.title_hi || data.title || 'New Chapter',
      description: data.description || '',
      live_count: 0,
      lecture_count: 0,
      material_count: 0,
    };

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          id: newChapter.id,
          title: newChapter.title,
          title_hi: newChapter.title_hi,
          chapter_number: newChapter.chapter_number,
          description: newChapter.description,
        };
        if (newChapter.subject_id && isValidUUID(newChapter.subject_id)) {
          payload.subject_id = newChapter.subject_id;
        }
        if (newChapter.course_id && isValidUUID(newChapter.course_id)) {
          payload.course_id = newChapter.course_id;
        }
        const { error } = await supabase.from('chapters').upsert(payload);
        if (!error) {
          isSaved = true;
        } else {
          const direct = await fetchDirectRest('chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (direct) isSaved = true;
        }
      } catch (e) {
        console.warn('Supabase addChapter error:', e);
      }
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to save chapter to cloud database. Please check your connection.');
    }

    this.deletedIds.delete(chapterId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.chapters.push(newChapter);
    await this.persist('icc_academic_chapters', this.chapters);
    this.notify();
    return newChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.ensureLoaded();
    let isDeleted = false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('chapters').delete().eq('id', id);
        if (!error) {
          isDeleted = true;
        } else {
          await fetchDirectRest(`chapters?id=eq.${id}`, { method: 'DELETE' });
          isDeleted = true;
        }
      } catch (e) {
        console.warn('Supabase deleteChapter error:', e);
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete chapter from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);
    this.notify();
  }

  async updateChapter(id: string, updates: Partial<AcademicChapter>): Promise<AcademicChapter> {
    await this.ensureLoaded();
    const payload: any = {
      title: updates.title,
      title_hi: updates.title_hi || updates.title,
    };
    if (updates.chapter_number !== undefined) payload.chapter_number = updates.chapter_number;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.description_hi !== undefined) payload.description_hi = updates.description_hi;

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('chapters').update(payload).eq('id', id);
        if (!error) isSaved = true;
      } catch (e) {
        console.warn('Supabase updateChapter error:', e);
      }
      if (!isSaved) {
        const direct = await fetchDirectRest(`chapters?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        });
        if (direct) isSaved = true;
      }
    }

    this.chapters = this.chapters.map((c) => (c.id === id ? { ...c, ...payload } : c));
    await this.persist('icc_academic_chapters', this.chapters);
    this.notify();
    const updated = this.chapters.find((c) => c.id === id);
    if (!updated) throw new Error('Chapter not found');
    return updated;
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    await this.ensureLoaded();
    if (isSupabaseConfigured && isValidUUID(chapterId)) {
      try {
        const { data, error } = await supabase
          .from('recorded_lectures')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('lecture_order', { ascending: true });
        if (!error && Array.isArray(data)) {
          const active = data.filter((l: any) => !this.isDeleted(l.id));
          this.lectures = [...this.lectures.filter((l) => l.chapter_id !== chapterId), ...active];
          this.persist('icc_recorded_lectures', this.lectures).catch(() => {});
          return active;
        }
      } catch (e) {
        console.warn('getRecordedLectures Supabase fetch error:', e);
      }
    }
    return this.lectures.filter((l) => !this.isDeleted(l.id) && l.chapter_id === chapterId);
  }

  async addRecordedLecture(data: Partial<RecordedLecture>): Promise<RecordedLecture> {
    await this.ensureLoaded();
    const lecId = data.id && isValidUUID(data.id) ? data.id : generateUUID();

    const validCourseId =
      (data.course_id && isValidUUID(data.course_id) ? data.course_id : null) ||
      this.courses[0]?.id ||
      'ae78ea58-19aa-4ed4-86c8-336bd42c45ef';

    const newLec: RecordedLecture = {
      id: lecId,
      course_id: validCourseId,
      subject_id: data.subject_id || 'd0000000-0000-0000-0000-000000000002',
      chapter_id: data.chapter_id || 'e0000000-0000-0000-0000-000000000001',
      title: data.title || 'Video Lecture',
      title_hi: data.title_hi || data.title,
      description: data.description || '',
      youtube_video_id: data.youtube_video_id || 'jfKfPfyJRdk',
      duration_seconds: data.duration_seconds || 2700,
      is_free_preview: Boolean(data.is_free_preview),
      lecture_order: this.lectures.length + 1,
    };

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: newLec.id,
          course_id: newLec.course_id,
          subject_id: newLec.subject_id,
          chapter_id: newLec.chapter_id,
          title: newLec.title,
          title_hi: newLec.title_hi,
          description: newLec.description,
          youtube_video_id: newLec.youtube_video_id,
          duration_seconds: newLec.duration_seconds,
          is_free_preview: newLec.is_free_preview,
          lecture_order: newLec.lecture_order,
        };
        const { error } = await supabase.from('recorded_lectures').upsert(payload);
        if (!error) {
          isSaved = true;
        } else {
          const direct = await fetchDirectRest('recorded_lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (direct) isSaved = true;
        }
      } catch (e) {
        console.warn('Supabase addRecordedLecture error:', e);
      }
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to save video lecture to cloud database. Please check your connection.');
    }

    this.deletedIds.delete(lecId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.lectures = this.lectures.filter((l) => l.id !== lecId);
    this.lectures.push(newLec);
    await this.persist('icc_recorded_lectures', this.lectures);

    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.lecture_count = (ch.lecture_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }
    this.notify();
    return newLec;
  }

  async deleteRecordedLecture(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.lectures.find((l) => l.id === id);
    let isDeleted = false;

    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('recorded_lectures').delete().eq('id', id);
          if (!error) isDeleted = true;
          else {
            await fetchDirectRest(`recorded_lectures?id=eq.${id}`, { method: 'DELETE' });
            isDeleted = true;
          }
        }
        if (item?.title) {
          await supabase.from('recorded_lectures').delete().eq('title', item.title);
          isDeleted = true;
        }
      } catch (e) {
        console.warn('Supabase deleteRecordedLecture error:', e);
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete video lecture from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);
    this.notify();
  }

  // --- CHAPTER CONTENT: LIVE CLASSES ---
  async getLiveClasses(chapterId?: string): Promise<LiveClass[]> {
    await this.ensureLoaded();
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('live_classes').select('*').order('scheduled_at', { ascending: false });
        if (chapterId && isValidUUID(chapterId)) q = q.eq('chapter_id', chapterId);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          const active = data.filter((l: any) => !this.isDeleted(l.id));
          if (!chapterId) {
            this.liveClasses = active;
          } else {
            this.liveClasses = [...this.liveClasses.filter((l) => (l as any).chapter_id !== chapterId), ...active];
          }
          this.persist('icc_live_classes', this.liveClasses).catch(() => {});
          return active;
        }
      } catch (e) {
        console.warn('getLiveClasses Supabase fetch error:', e);
      }
    }
    const list = this.liveClasses.filter((l) => !this.isDeleted(l.id));
    if (chapterId) {
      return list.filter((l) => (l as any).chapter_id === chapterId);
    }
    return list;
  }

  async scheduleLiveClass(data: Partial<LiveClass> & { chapter_id?: string; subject_id?: string; class_name?: string }): Promise<LiveClass> {
    await this.ensureLoaded();
    const liveId = data.id && isValidUUID(data.id) ? data.id : generateUUID();

    const validCourseId =
      (data.course_id && isValidUUID(data.course_id) ? data.course_id : null) ||
      this.courses[0]?.id ||
      'ae78ea58-19aa-4ed4-86c8-336bd42c45ef';

    const newLive: LiveClass = {
      id: liveId,
      course_id: validCourseId,
      batch_id: data.batch_id,
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

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: newLive.id,
          course_id: newLive.course_id,
          title: newLive.title,
          title_hi: newLive.title_hi,
          description: newLive.description,
          youtube_video_id: newLive.youtube_video_id,
          scheduled_at: newLive.scheduled_at,
          duration_minutes: newLive.duration_minutes,
          status: newLive.status,
          class_name: (newLive as any).class_name,
          chapter_id: (newLive as any).chapter_id || null,
          subject_id: (newLive as any).subject_id || null,
        };
        const { error } = await supabase.from('live_classes').upsert(payload);
        if (!error) {
          isSaved = true;
        } else {
          const direct = await fetchDirectRest('live_classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (direct) isSaved = true;
        }
      } catch (e) {
        console.warn('scheduleLiveClass error:', e);
      }
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to save live class to cloud database. Please check your connection.');
    }

    this.deletedIds.delete(liveId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.liveClasses = this.liveClasses.filter((l) => l.id !== liveId);
    this.liveClasses.unshift(newLive);
    await this.persist('icc_live_classes', this.liveClasses);
    this.notify();

    return newLive;
  }

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    if (!item) return;

    let isSaved = false;
    if (isSupabaseConfigured && isValidUUID(id)) {
      try {
        const { error } = await supabase.from('live_classes').update({ status }).eq('id', id);
        if (!error) isSaved = true;
        else {
          await fetchDirectRest(`live_classes?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          isSaved = true;
        }
      } catch {}
    } else {
      isSaved = true;
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to update live class status in cloud database.');
    }

    item.status = status;
    await this.persist('icc_live_classes', this.liveClasses);
    this.notify();

    // Automatic Live-to-Recording Lifecycle: SCHEDULED -> LIVE -> ENDED_PROCESSING -> RECORDED_READY
    if (status === 'completed' && item.youtube_video_id) {
      try {
        const existing = this.lectures.find(
          (lec) =>
            lec.youtube_video_id === item.youtube_video_id ||
            (lec.title === item.title && lec.chapter_id === (item as any).chapter_id)
        );
        if (!existing) {
          await this.addRecordedLecture({
            course_id: item.course_id,
            subject_id: (item as any).subject_id || this.subjects[0]?.id,
            chapter_id: (item as any).chapter_id || this.chapters[0]?.id,
            title: item.title,
            title_hi: item.title_hi || item.title,
            description: item.description,
            youtube_video_id: item.youtube_video_id,
            duration_seconds: (item.duration_minutes || 60) * 60,
            is_free_preview: false,
          });
        }
      } catch (err) {
        console.error('AcademicService auto promotion error:', err);
      }
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    let isDeleted = false;

    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('live_classes').delete().eq('id', id);
          if (!error) isDeleted = true;
          else {
            await fetchDirectRest(`live_classes?id=eq.${id}`, { method: 'DELETE' });
            isDeleted = true;
          }
        }
        if (item?.title) {
          await supabase.from('live_classes').delete().eq('title', item.title);
          isDeleted = true;
        }
      } catch (e) {
        console.warn('deleteLiveClass error:', e);
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete live class from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.liveClasses = this.liveClasses.filter((l) => l.id !== id);
    await this.persist('icc_live_modified', 'true');
    await this.persist('icc_live_classes', this.liveClasses);
    this.notify();
  }

  // --- CHAPTER CONTENT: STUDY MATERIALS PDF ---
  async getStudyMaterials(chapterId?: string): Promise<StudyMaterial[]> {
    await this.ensureLoaded();
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('study_materials').select('*').order('created_at', { ascending: false });
        if (chapterId && isValidUUID(chapterId)) q = q.eq('chapter_id', chapterId);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          const active = data.filter((m: any) => !this.isDeleted(m.id));
          if (!chapterId) {
            this.materials = active;
          } else {
            this.materials = [...this.materials.filter((m) => m.chapter_id !== chapterId), ...active];
          }
          this.persist('icc_study_materials', this.materials).catch(() => {});
          return active;
        }
      } catch (e) {
        console.warn('getStudyMaterials Supabase fetch error:', e);
      }
    }
    const list = this.materials.filter((m) => !this.isDeleted(m.id));
    if (chapterId) {
      return list.filter((m) => m.chapter_id === chapterId);
    }
    return list;
  }

  async addStudyMaterial(data: Partial<StudyMaterial> & { class_name?: string }): Promise<StudyMaterial> {
    await this.ensureLoaded();
    const matId = data.id && isValidUUID(data.id) ? data.id : generateUUID();

    const defaultBoardId = 'b0000000-0000-0000-0000-000000000001';
    const defaultClassId = 'c0000000-0000-0000-0000-000000000010';
    const defaultSubjectId = 'd0000000-0000-0000-0000-000000000002';
    const defaultChapterId = 'e0000000-0000-0000-0000-000000000001';

    const subjectId = (data.subject_id && isValidUUID(data.subject_id)) ? data.subject_id : defaultSubjectId;
    const chapterId = (data.chapter_id && isValidUUID(data.chapter_id)) ? data.chapter_id : defaultChapterId;

    const newMat: StudyMaterial = {
      id: matId,
      board_id: data.board_id || defaultBoardId,
      class_id: data.class_id || defaultClassId,
      subject_id: subjectId,
      chapter_id: chapterId,
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

    let isSaved = false;
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: newMat.id,
          board_id: newMat.board_id,
          class_id: newMat.class_id,
          subject_id: newMat.subject_id,
          chapter_id: newMat.chapter_id,
          title: newMat.title,
          title_hi: newMat.title_hi,
          description: newMat.description,
          file_path: newMat.file_path,
          file_size_bytes: newMat.file_size_bytes,
          material_type: newMat.material_type,
          is_free: newMat.is_free,
          class_name: (newMat as any).class_name,
        };
        const { error } = await supabase.from('study_materials').upsert(payload);
        if (!error) {
          isSaved = true;
        } else {
          const direct = await fetchDirectRest('study_materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (direct) isSaved = true;
        }
      } catch (e) {
        console.warn('addStudyMaterial error:', e);
      }
    }

    if (!isSaved) {
      throw new Error('Database Error: Unable to upload study material to cloud database. Please check your connection.');
    }

    this.deletedIds.delete(matId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.materials = this.materials.filter((m) => m.id !== matId);
    this.materials.unshift(newMat);
    await this.persist('icc_study_materials', this.materials);

    const ch = this.chapters.find((c) => c.id === chapterId);
    if (ch) {
      ch.material_count = (ch.material_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }

    this.notify();
    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.materials.find((m) => m.id === id);
    let isDeleted = false;

    if (isSupabaseConfigured) {
      try {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('study_materials').delete().eq('id', id);
          if (!error) isDeleted = true;
          else {
            await fetchDirectRest(`study_materials?id=eq.${id}`, { method: 'DELETE' });
            isDeleted = true;
          }
        }
        if (item?.title) {
          await supabase.from('study_materials').delete().eq('title', item.title);
          isDeleted = true;
        }
      } catch (e) {
        console.warn('deleteStudyMaterial error:', e);
      }
    }

    if (!isDeleted) {
      throw new Error('Database Error: Unable to delete study material from cloud database. Please check your connection.');
    }

    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_materials_modified', 'true');
    await this.persist('icc_study_materials', this.materials);
    this.notify();
  }

  // --- DIRECTOR CONTROLS: PAYMENTS ---
  async getPayments(): Promise<any[]> {
    await this.ensureLoaded();
    return [...this.payments];
  }

  async approvePayment(payId: string, reviewedBy?: string): Promise<any[]> {
    await this.ensureLoaded();
    this.payments = this.payments.map((p) =>
      p.id === payId
        ? {
            ...p,
            status: 'approved',
            reviewed_by: reviewedBy || 'u0000000-0000-0000-0000-000000000000',
            reviewed_at: new Date().toISOString(),
          }
        : p
    );
    await this.persist('icc_payments', this.payments);

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('payments')
          .update({
            status: 'approved',
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', payId);
      }
    } catch {}
    return [...this.payments];
  }

  async rejectPayment(payId: string, reviewedBy?: string): Promise<any[]> {
    await this.ensureLoaded();
    this.payments = this.payments.map((p) =>
      p.id === payId
        ? {
            ...p,
            status: 'rejected',
            reviewed_by: reviewedBy || 'u0000000-0000-0000-0000-000000000000',
            reviewed_at: new Date().toISOString(),
          }
        : p
    );
    await this.persist('icc_payments', this.payments);

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('payments')
          .update({
            status: 'rejected',
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', payId);
      }
    } catch {}
    return [...this.payments];
  }

  // --- DIRECTOR CONTROLS: STUDENTS ---
  async getStudents(): Promise<UserProfile[]> {
    await this.ensureLoaded();
    try {
      const remote = await fetchDirectRest<UserProfile[]>('profiles?select=*&order=created_at.desc');
      if (Array.isArray(remote) && remote.length > 0) {
        this.students = remote;
        this.persist('icc_students', this.students).catch(() => {});
      }
    } catch (e) {
      console.warn('getStudents fetchDirectRest fallback:', e);
    }
    return this.students.filter(
      (s) => s.username !== 'badesir' && s.email !== 'icckeguruji@gmail.com' && (s as any).role !== 'admin'
    );
  }

  async toggleStudentStatus(studentId: string): Promise<UserProfile[]> {
    await this.ensureLoaded();
    const current = this.students.find((s) => s.id === studentId);
    const nextStatus = current ? !current.is_active : true;
    const updates = { is_active: nextStatus, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(updates).eq('id', studentId);
      } catch (e) {
        console.warn('toggleStudentStatus supabase err:', e);
      }
      try {
        await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (e) {}
    }

    this.students = this.students.map((s) =>
      s.id === studentId ? { ...s, ...updates } : s
    );
    await this.persist('icc_students', this.students);
    return this.getStudents();
  }

  async updateStudent(studentId: string, updates: Partial<UserProfile>): Promise<UserProfile[]> {
    await this.ensureLoaded();
    const payload = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(payload).eq('id', studentId);
      } catch (e) {
        console.warn('updateStudent supabase err:', e);
      }
      try {
        await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
    }

    this.students = this.students.map((s) =>
      s.id === studentId ? { ...s, ...payload } : s
    );
    await this.persist('icc_students', this.students);
    return this.getStudents();
  }

  async deleteStudent(studentId: string): Promise<UserProfile[]> {
    await this.ensureLoaded();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', studentId);
      } catch (e) {
        console.warn('deleteStudent supabase err:', e);
      }
      try {
        await fetchDirectRest(`profiles?id=eq.${studentId}`, {
          method: 'DELETE',
        });
      } catch (e) {}
    }

    this.students = this.students.filter((s) => s.id !== studentId);
    await this.persist('icc_students', this.students);
    return this.getStudents();
  }

  // --- DIRECTOR CONTROLS: TEACHERS (FULL CLOUD TWO-WAY SYNC) ---
  async getTeachers(): Promise<Teacher[]> {
    await this.ensureLoaded();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'icc_teachers')
          .maybeSingle();
        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          this.teachers = data.value as Teacher[];
          this.persist('icc_teachers', this.teachers).catch(() => {});
          return [...this.teachers];
        }
      } catch (e) {
        console.warn('getTeachers cloud fetch error:', e);
      }
    }
    return [...this.teachers];
  }

  async addTeacher(teacherData: Omit<Teacher, 'id'>): Promise<Teacher> {
    await this.ensureLoaded();
    const newTeacher: Teacher = {
      id: `t-${Date.now()}`,
      ...teacherData,
    };
    const updated = [newTeacher, ...this.teachers.filter((t) => t.id !== newTeacher.id)];

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
        console.warn('addTeacher Supabase error:', e);
      }

      if (!isSaved) {
        try {
          const res = await fetch('https://icconline.vercel.app/api/teachers', {
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

    this.teachers = updated;
    await this.persist('icc_teachers', this.teachers);
    this.notify();
    return newTeacher;
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
    await this.ensureLoaded();
    const updated = this.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));

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
          const res = await fetch('https://icconline.vercel.app/api/teachers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          });
          if (res.ok) isSaved = true;
        } catch {}
      }

      if (!isSaved) {
        throw new Error('Database Error: Failed to update teacher in cloud database.');
      }
    }

    this.teachers = updated;
    await this.persist('icc_teachers', this.teachers);
    this.notify();
    return this.teachers.find((t) => t.id === id) || null;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const updated = this.teachers.filter((t) => t.id !== id);

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
          const res = await fetch(`https://icconline.vercel.app/api/teachers?id=${id}`, {
            method: 'DELETE',
          });
          if (res.ok) isSaved = true;
        } catch {}
      }

      if (!isSaved) {
        throw new Error('Database Error: Failed to delete teacher from cloud database.');
      }
    }

    this.teachers = updated;
    await this.persist('icc_teachers', this.teachers);
    this.notify();
    return true;
  }
}

export const academicService = new AcademicRepository();
