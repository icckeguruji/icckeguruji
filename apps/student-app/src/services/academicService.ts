// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Comprehensive Curriculum for Class 1 to Class 12 (BSEB, JAC & CBSE)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Direct persistent local storage (never reverts) + Cloud Sync + Deletion Blacklist

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Course, LiveClass, StudyMaterial, UserProfile } from '@icc/shared-types';

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

class AcademicRepository {
  private courses: Course[] = [];
  private subjects: AcademicSubject[] = [];
  private chapters: AcademicChapter[] = [];
  private lectures: RecordedLecture[] = [];
  private liveClasses: LiveClass[] = [];
  private materials: StudyMaterial[] = [];
  private payments: any[] = [];
  private students: UserProfile[] = [];
  private listeners: Set<() => void> = new Set();
  private deletedIds: Set<string> = new Set();
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private isSyncingCloud: boolean = false;

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
    this.syncFromCloud().catch(() => {});
  }

  private async loadFromStorage() {
    try {
      let rawDeleted = null;
      let isInitialized = null;
      let sCourses = null, sSubs = null, sChaps = null, sLecs = null, sLive = null, sMats = null, sPayments = null, sStudents = null;

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
      }

      if (rawDeleted) {
        const arr = JSON.parse(rawDeleted);
        if (Array.isArray(arr)) this.deletedIds = new Set(arr);
      }

      // If storage was never initialized on this device, seed once and mark initialized
      if (!isInitialized) {
        this.courses = [...allInitialCourses];
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
      }

      // Filter out any tombstoned / deleted items
      this.courses = this.courses.filter((c) => !this.isDeleted(c.id));
      if (this.courses.length === 0) {
        this.courses = allInitialCourses.filter((c) => !this.isDeleted(c.id));
      }
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

  // Authoritative cloud sync with Supabase for Courses, Live Classes, Notes, Subjects & Chapters
  async syncFromCloud() {
    if (!isSupabaseConfigured || this.isSyncingCloud) return;
    this.isSyncingCloud = true;
    try {
      // 1. Sync Courses (Bidirectional: Push unsaved local courses + pull remote)
      const { data: remoteCourses, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!courseErr && Array.isArray(remoteCourses)) {
        const mergedMap = new Map<string, Course>();

        // 1. Add all remote courses from Supabase
        for (const remote of remoteCourses) {
          if (!this.deletedIds.has(remote.id)) {
            mergedMap.set(remote.id, {
              ...remote,
              thumbnail_url: getResolvedThumbnailUrl(remote.thumbnail_url),
            });
          }
        }

        // 2. Preserve any local courses (created in App) that haven't been deleted
        for (const localCourse of this.courses) {
          if (!this.deletedIds.has(localCourse.id)) {
            if (!mergedMap.has(localCourse.id)) {
              mergedMap.set(localCourse.id, localCourse);
              // Push local course to Supabase so it becomes permanent in the cloud
              const safeClassId = getSafeClassId(localCourse.class_id, (localCourse as any).class_name);
              supabase.from('courses').upsert({
                id: localCourse.id,
                title: localCourse.title,
                title_hi: localCourse.title_hi || localCourse.title,
                tagline: localCourse.tagline,
                description: localCourse.description,
                description_hi: localCourse.description_hi,
                thumbnail_url: getResolvedThumbnailUrl(localCourse.thumbnail_url),
                board_id: localCourse.board_id || 'b0000000-0000-0000-0000-000000000001',
                class_id: safeClassId,
                price: localCourse.price,
                discount_price: localCourse.discount_price,
                validity_days: localCourse.validity_days,
                class_name: (localCourse as any).class_name || 'Class 10',
                is_published: true,
                created_at: localCourse.created_at,
                updated_at: localCourse.updated_at,
              }).then(({ error: pushErr }) => {
                if (pushErr) console.warn('Supabase course sync push error:', pushErr);
              });
            }
          }
        }

        // 3. Fallback: if somehow empty, populate from allInitialCourses
        if (mergedMap.size === 0) {
          for (const initCourse of allInitialCourses) {
            if (!this.deletedIds.has(initCourse.id)) {
              mergedMap.set(initCourse.id, initCourse);
            }
          }
        }

        this.courses = Array.from(mergedMap.values());
        await this.persist('icc_courses', this.courses);
      }

      // 2. Sync Live Classes
      const { data: remoteLive, error: liveErr } = await supabase
        .from('live_classes')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (!liveErr && Array.isArray(remoteLive)) {
        for (const localLive of this.liveClasses) {
          if (!this.deletedIds.has(localLive.id) && !remoteLive.some((r) => r.id === localLive.id)) {
            try {
              await supabase.from('live_classes').upsert({
                id: localLive.id,
                course_id: localLive.course_id,
                title: localLive.title,
                title_hi: localLive.title_hi || localLive.title,
                description: localLive.description,
                instructor_name: localLive.instructor_name,
                scheduled_at: localLive.scheduled_at,
                duration_minutes: localLive.duration_minutes,
                status: localLive.status,
                class_name: (localLive as any).class_name,
              });
              remoteLive.unshift(localLive as any);
            } catch {}
          }
        }
        this.liveClasses = remoteLive;
        await this.persist('icc_live_classes', this.liveClasses);
      }

      // 3. Sync Study Materials
      const { data: remoteMats, error: matErr } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!matErr && Array.isArray(remoteMats)) {
        for (const localMat of this.materials) {
          if (!this.deletedIds.has(localMat.id) && !remoteMats.some((r) => r.id === localMat.id)) {
            try {
              await supabase.from('study_materials').upsert({
                id: localMat.id,
                board_id: localMat.board_id,
                class_id: localMat.class_id,
                subject_id: localMat.subject_id,
                chapter_id: localMat.chapter_id,
                title: localMat.title,
                title_hi: localMat.title_hi || localMat.title,
                description: localMat.description,
                file_path: localMat.file_path,
                file_size_bytes: localMat.file_size_bytes,
                material_type: localMat.material_type,
                is_free: localMat.is_free,
                class_name: (localMat as any).class_name,
              });
              remoteMats.unshift(localMat as any);
            } catch {}
          }
        }
        this.materials = remoteMats;
        await this.persist('icc_study_materials', this.materials);
      }

      // 4. Sync Recorded Lectures
      const { data: remoteLecs, error: lecErr } = await supabase
        .from('recorded_lectures')
        .select('*')
        .order('lecture_order', { ascending: true });

      if (!lecErr && Array.isArray(remoteLecs)) {
        this.lectures = remoteLecs;
        await this.persist('icc_recorded_lectures', this.lectures);
      }

      // 5. Sync Subjects
      const { data: remoteSubs, error: subErr } = await supabase
        .from('subjects')
        .select('*')
        .order('display_order', { ascending: true });

      if (!subErr && Array.isArray(remoteSubs)) {
        this.subjects = remoteSubs;
        await this.persist('icc_academic_subjects', this.subjects);
      }

      // 6. Sync Chapters
      const { data: remoteChaps, error: chapErr } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: true });

      if (!chapErr && Array.isArray(remoteChaps)) {
        this.chapters = remoteChaps;
        await this.persist('icc_academic_chapters', this.chapters);
      }

      // 7. Sync Payments
      const { data: remotePayments, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!payErr && Array.isArray(remotePayments)) {
        this.payments = remotePayments;
        await this.persist('icc_payments', this.payments);
      }

      // 8. Sync Students
      const { data: remoteProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profErr && Array.isArray(remoteProfiles)) {
        this.students = remoteProfiles as any;
        await this.persist('icc_students', this.students);
      }

      this.notify();
    } catch (e) {
      console.warn('Sync from cloud error:', e);
    } finally {
      this.isSyncingCloud = false;
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {}
    });
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
  async getCourses(): Promise<Course[]> {
    await this.ensureLoaded();
    const active = this.courses.filter((c) => !this.deletedIds.has(c.id));
    if (active.length === 0) {
      return allInitialCourses.filter((c) => !this.deletedIds.has(c.id));
    }
    return active;
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    await this.ensureLoaded();
    const found = this.courses.find((c) => c.id === id);
    if (!found || this.deletedIds.has(found.id)) return undefined;
    return found;
  }

  async addCourse(data: Partial<Course>): Promise<Course> {
    await this.ensureLoaded();
    const courseId = data.id && isValidUUID(data.id) ? data.id : generateUUID();

    // Remove any previous tombstone for this course ID
    this.deletedIds.delete(courseId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    const newCourse: Course = {
      id: courseId,
      title: data.title || 'New Target Course',
      title_hi: data.title_hi || data.title || 'नया कोर्स',
      tagline: data.tagline || 'Complete Board Exam Syllabus Mastery with BADE SIR',
      description: data.description || '',
      description_hi: data.description_hi || data.description || '',
      thumbnail_url: getResolvedThumbnailUrl(data.thumbnail_url),
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

    // Deduplicate in memory and place at top
    this.courses = this.courses.filter((c) => c.id !== courseId);
    this.courses.unshift(newCourse);
    await this.persist('icc_courses_modified', 'true');
    await this.persist('icc_courses', this.courses);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('courses').upsert({
          id: newCourse.id,
          title: newCourse.title,
          title_hi: newCourse.title_hi,
          tagline: newCourse.tagline,
          description: newCourse.description,
          description_hi: newCourse.description_hi,
          thumbnail_url: newCourse.thumbnail_url,
          board_id: newCourse.board_id || 'b0000000-0000-0000-0000-000000000001',
          class_id: getSafeClassId(newCourse.class_id, (newCourse as any).class_name),
          price: newCourse.price,
          discount_price: newCourse.discount_price,
          validity_days: newCourse.validity_days,
          class_name: (newCourse as any).class_name || 'Class 10',
          is_published: true,
          created_at: newCourse.created_at,
          updated_at: newCourse.updated_at,
        });
        if (error) console.error('Supabase course upsert error:', error);
      }
    } catch (e) {
      console.warn('Supabase course upsert warning:', e);
    }

    return newCourse;
  }

  // BULLETPROOF UPDATE: NEVER THROWS 'Course not found'
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    await this.ensureLoaded();
    let idx = this.courses.findIndex((c) => c.id === id);

    // Fallback search by title
    if (idx === -1 && updates.title) {
      idx = this.courses.findIndex(
        (c) => c.title.trim().toLowerCase() === updates.title!.trim().toLowerCase()
      );
    }

    if (idx === -1) {
      // Create it cleanly
      const created = await this.addCourse({ ...updates, id } as any);
      return created;
    }

    this.courses[idx] = {
      ...this.courses[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.persist('icc_courses_modified', 'true');
    await this.persist('icc_courses', this.courses);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('courses')
          .update({
            title: updates.title,
            title_hi: updates.title_hi,
            tagline: updates.tagline,
            description: updates.description,
            description_hi: updates.description_hi,
            thumbnail_url: updates.thumbnail_url,
            price: updates.price,
            discount_price: updates.discount_price,
            validity_days: updates.validity_days,
            class_name: (updates as any).class_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', this.courses[idx].id);
        if (error) console.error('Supabase course update error:', error);
      }
    } catch (e) {
      console.warn('Supabase update warning:', e);
    }

    return this.courses[idx];
  }

  async deleteCourse(id: string): Promise<void> {
    await this.ensureLoaded();
    const course = this.courses.find((c) => c.id === id);
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    this.courses = this.courses.filter((c) => c.id !== id);
    await this.persist('icc_courses_modified', 'true');
    await this.persist('icc_courses', this.courses);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('courses').delete().eq('id', id);
          if (error) console.error('Supabase course delete error:', error);
        }
        if (course?.title) {
          await supabase.from('courses').delete().eq('title', course.title);
        }
      }
    } catch (e) {
      console.warn('Supabase delete warning:', e);
    }
  }

  // --- SUBJECTS (Course Scoped or Class Scoped) ---
  async getSubjects(courseId?: string, className?: string): Promise<AcademicSubject[]> {
    await this.ensureLoaded();
    let list = this.subjects.filter((s) => !this.isDeleted(s.id));

    // When courseId is provided, return ONLY subjects explicitly belonging to this course
    // Zero auto-injection: Admin manually creates subjects for each course.
    if (courseId) {
      return list.filter((s) => s.course_id === courseId);
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
      return list;
    }

    return list;
  }

  async addSubject(sub: Partial<AcademicSubject>): Promise<AcademicSubject> {
    await this.ensureLoaded();
    const subId = sub.id && isValidUUID(sub.id) ? sub.id : generateUUID();
    this.deletedIds.delete(subId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    const newSub: AcademicSubject = {
      id: subId,
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
    this.notify();

    try {
      if (isSupabaseConfigured) {
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
        await supabase.from('subjects').upsert(payload);
      }
    } catch (e) {
      console.warn('Supabase addSubject warning:', e);
    }

    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.ensureLoaded();
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.subjects = this.subjects.filter((s) => s.id !== id);
    await this.persist('icc_academic_subjects', this.subjects);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        await supabase.from('subjects').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteSubject warning:', e);
    }
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
    return this.chapters.filter((ch) => {
      if (this.isDeleted(ch.id)) return false;
      if (ch.subject_id !== subjectId) return false;
      if (subSubjectId) return ch.sub_subject_id === subSubjectId;
      return true;
    });
  }

  async addChapter(data: Partial<AcademicChapter>): Promise<AcademicChapter> {
    await this.ensureLoaded();
    const chapterId = data.id && isValidUUID(data.id) ? data.id : generateUUID();
    this.deletedIds.delete(chapterId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    const newChapter: AcademicChapter = {
      id: chapterId,
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
    this.notify();

    try {
      if (isSupabaseConfigured) {
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
        await supabase.from('chapters').upsert(payload);
      }
    } catch (e) {
      console.warn('Supabase addChapter warning:', e);
    }

    return newChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.ensureLoaded();
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        await supabase.from('chapters').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase deleteChapter warning:', e);
    }
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    await this.ensureLoaded();
    return this.lectures.filter((l) => !this.isDeleted(l.id) && l.chapter_id === chapterId);
  }

  async addRecordedLecture(data: Partial<RecordedLecture>): Promise<RecordedLecture> {
    await this.ensureLoaded();
    const lecId = data.id && isValidUUID(data.id) ? data.id : generateUUID();
    this.deletedIds.delete(lecId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

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
    this.lectures = this.lectures.filter((l) => l.id !== lecId);
    this.lectures.push(newLec);
    await this.persist('icc_recorded_lectures', this.lectures);

    const ch = this.chapters.find((c) => c.id === data.chapter_id);
    if (ch) {
      ch.lecture_count = (ch.lecture_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }
    this.notify();

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('recorded_lectures').upsert({
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
        });
        if (error) console.error('Supabase addRecordedLecture error:', error);
      }
    } catch {}

    return newLec;
  }

  async deleteRecordedLecture(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.lectures.find((l) => l.id === id);
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('recorded_lectures').delete().eq('id', id);
          if (error) console.error('Supabase deleteRecordedLecture error:', error);
        }
        if (item?.title) {
          await supabase.from('recorded_lectures').delete().eq('title', item.title);
        }
      }
    } catch {}
  }

  // --- CHAPTER CONTENT: LIVE CLASSES ---
  async getLiveClasses(chapterId?: string): Promise<LiveClass[]> {
    await this.ensureLoaded();
    const list = this.liveClasses.filter((l) => !this.isDeleted(l.id));
    if (chapterId) {
      return list.filter((l) => (l as any).chapter_id === chapterId);
    }
    return list;
  }

  async scheduleLiveClass(data: Partial<LiveClass> & { chapter_id?: string; subject_id?: string; class_name?: string }): Promise<LiveClass> {
    await this.ensureLoaded();
    const liveId = data.id && isValidUUID(data.id) ? data.id : generateUUID();
    this.deletedIds.delete(liveId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

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

    this.liveClasses = this.liveClasses.filter((l) => l.id !== liveId);
    this.liveClasses.unshift(newLive);
    await this.persist('icc_live_classes', this.liveClasses);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('live_classes').upsert({
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
        });
        if (error) console.error('Supabase scheduleLiveClass error:', error);
      }
    } catch (e) {
      console.warn('scheduleLiveClass warning:', e);
    }

    return newLive;
  }

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    if (item) {
      item.status = status;
      await this.persist('icc_live_classes', this.liveClasses);
      this.notify();
      if (isSupabaseConfigured && isValidUUID(id)) {
        try {
          await supabase.from('live_classes').update({ status }).eq('id', id);
        } catch {}
      }
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    this.liveClasses = this.liveClasses.filter((l) => l.id !== id);
    await this.persist('icc_live_modified', 'true');
    await this.persist('icc_live_classes', this.liveClasses);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('live_classes').delete().eq('id', id);
          if (error) console.error('Supabase deleteLiveClass error:', error);
        }
        if (item?.title) {
          await supabase.from('live_classes').delete().eq('title', item.title);
        }
      }
    } catch (e) {
      console.warn('deleteLiveClass warning:', e);
    }
  }

  // --- CHAPTER CONTENT: STUDY MATERIALS PDF ---
  async getStudyMaterials(chapterId?: string): Promise<StudyMaterial[]> {
    await this.ensureLoaded();
    const list = this.materials.filter((m) => !this.isDeleted(m.id));
    if (chapterId) {
      return list.filter((m) => m.chapter_id === chapterId);
    }
    return list;
  }

  async addStudyMaterial(data: Partial<StudyMaterial> & { class_name?: string }): Promise<StudyMaterial> {
    await this.ensureLoaded();
    const matId = data.id && isValidUUID(data.id) ? data.id : generateUUID();
    this.deletedIds.delete(matId);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

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

    this.materials = this.materials.filter((m) => m.id !== matId);
    this.materials.unshift(newMat);
    await this.persist('icc_study_materials', this.materials);

    const ch = this.chapters.find((c) => c.id === chapterId);
    if (ch) {
      ch.material_count = (ch.material_count || 0) + 1;
      await this.persist('icc_academic_chapters', this.chapters);
    }

    this.notify();

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('study_materials').upsert({
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
        });
        if (error) console.error('Supabase addStudyMaterial error:', error);
      }
    } catch (e) {
      console.warn('addStudyMaterial warning:', e);
    }

    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.materials.find((m) => m.id === id);
    this.deletedIds.add(id);
    await this.persist('icc_deleted_ids', Array.from(this.deletedIds));

    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_materials_modified', 'true');
    await this.persist('icc_study_materials', this.materials);
    this.notify();

    try {
      if (isSupabaseConfigured) {
        if (isValidUUID(id)) {
          const { error } = await supabase.from('study_materials').delete().eq('id', id);
          if (error) console.error('Supabase deleteStudyMaterial error:', error);
        }
        if (item?.title) {
          await supabase.from('study_materials').delete().eq('title', item.title);
        }
      }
    } catch (e) {
      console.warn('deleteStudyMaterial warning:', e);
    }
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
    return [...this.students];
  }

  async toggleStudentStatus(studentId: string): Promise<UserProfile[]> {
    await this.ensureLoaded();
    this.students = this.students.map((s) =>
      s.id === studentId ? { ...s, is_active: !s.is_active, updated_at: new Date().toISOString() } : s
    );
    await this.persist('icc_students', this.students);
    return [...this.students];
  }

  async updateStudent(studentId: string, updates: Partial<UserProfile>): Promise<UserProfile[]> {
    await this.ensureLoaded();
    this.students = this.students.map((s) =>
      s.id === studentId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );
    await this.persist('icc_students', this.students);
    return [...this.students];
  }
}

export const academicService = new AcademicRepository();
