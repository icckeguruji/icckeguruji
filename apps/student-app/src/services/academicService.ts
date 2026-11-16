// IDEAL COACHING CENTRE — UNIFIED ACADEMIC HIERARCHY & DATA SERVICE
// Comprehensive Curriculum for Class 1 to Class 12 (BSEB, JAC & CBSE)
// Provides full CRUD operations for Director BADE SIR & Teachers in Android App
// Direct persistent local storage (never reverts) + Cloud Sync + Deletion Blacklist

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Course, LiveClass, StudyMaterial, UserProfile } from '@icc/shared-types';

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

export const allInitialCourses: Course[] = [];
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
    this.notify();
    this.notify();
    this.notify();
        await this.persist('icc_academic_subjects', this.subjects);
    this.notify();
        await this.persist('icc_academic_chapters', this.chapters);
    this.notify();
        await this.persist('icc_recorded_lectures', this.lectures);
        await this.persist('icc_live_classes', this.liveClasses);
    this.notify();
        await this.persist('icc_study_materials', this.materials);
    this.notify();
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
      this.courses = this.courses.filter((c) => !this.isDeleted(c.id, c.title));
      this.subjects = this.subjects.filter((s) => !this.isDeleted(s.id, s.name));
      this.chapters = this.chapters.filter((ch) => !this.isDeleted(ch.id, ch.title));
      this.lectures = this.lectures.filter((l) => !this.isDeleted(l.id, l.title));
      this.liveClasses = this.liveClasses.filter((lc) => !this.isDeleted(lc.id, lc.title));
      this.materials = this.materials.filter((m) => !this.isDeleted(m.id, m.title));

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

  private isDeleted(id: string, title?: string): boolean {
    if (this.deletedIds.has(id)) return true;
    if (title) {
      const cleanTitle = title.trim().toLowerCase();
      const norm = this.normalizeKey(title);
      const noYear = cleanTitle.replace(/\(.*\)/g, '').trim();
      const normNoYear = this.normalizeKey(noYear);

      if (this.deletedIds.has(`title:${cleanTitle}`)) return true;
      if (this.deletedIds.has(`title:${noYear}`)) return true;
      if (this.deletedIds.has(`norm:${norm}`)) return true;
      if (this.deletedIds.has(`norm:${normNoYear}`)) return true;

      if (this.deletedIds.has(`live:${cleanTitle}`)) return true;
      if (this.deletedIds.has(`live:${noYear}`)) return true;
      if (this.deletedIds.has(`material:${cleanTitle}`)) return true;
      if (this.deletedIds.has(`material:${noYear}`)) return true;
    }
    return false;
  }

  // Non-destructive cloud sync that NEVER resurrects deleted items or sample courses
  async syncFromCloud() {
    if (!isSupabaseConfigured) return;
    try {
      const isCoursesModified = (await this.getItem('icc_courses_modified')) === 'true';

      const { data: remoteCourses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteCourses && remoteCourses.length > 0) {
        // If director has deliberately cleared all courses, do NOT revive old remote courses
        if (isCoursesModified && this.courses.length === 0) {
          return;
        }

        const valid = remoteCourses.filter((c) => {
          if (this.isDeleted(c.id, c.title)) return false;
          // NEVER EVER re-import initial sample / seed IDs under any condition
          if (SAMPLE_RESERVED_IDS.has(c.id)) return false;
          if (c.id.startsWith('cr000000-') || c.id.startsWith('10000000-')) return false;
          return true;
        });

        const courseMap = new Map(this.courses.map((c) => [c.id, c]));
        for (const rem of valid) {
          const existing = courseMap.get(rem.id);
          if (existing) {
            // Keep local version if newer
            const localDate = new Date(existing.updated_at || existing.created_at || 0).getTime();
            const remoteDate = new Date(rem.updated_at || rem.created_at || 0).getTime();
            if (remoteDate >= localDate) {
              courseMap.set(rem.id, { ...existing, ...rem });
            }
          } else if (!isCoursesModified) {
            // Only add if not previously modified
            courseMap.set(rem.id, rem);
          }
        }
        this.courses = Array.from(courseMap.values()).filter((c) => !this.isDeleted(c.id, c.title));
        await this.persist('icc_courses', this.courses);
        this.notify();
      }

      // Sync subjects non-destructively
      const { data: remoteSubs } = await supabase.from('subjects').select('*');
      if (remoteSubs && remoteSubs.length > 0) {
        const validSubs = remoteSubs.filter((s) => !this.isDeleted(s.id, s.name));
        const subMap = new Map(this.subjects.map((s) => [s.id, s]));
        for (const remSub of validSubs) {
          subMap.set(remSub.id, { ...subMap.get(remSub.id), ...remSub });
        }
        this.subjects = Array.from(subMap.values()).filter((s) => !this.isDeleted(s.id, s.name));
        await this.persist('icc_academic_subjects', this.subjects);
        this.notify();
      }
    } catch (e) {
      console.warn('Sync from cloud error:', e);
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

  private async markAsDeleted(id: string, extraKeys: string[] = []) {
    this.deletedIds.add(id);
    for (const key of extraKeys) {
      if (key) {
        const clean = key.trim().toLowerCase();
        this.deletedIds.add(clean);
        this.deletedIds.add(`norm:${this.normalizeKey(clean)}`);
      }
    }
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
    return this.courses.filter((c) => !this.isDeleted(c.id, c.title));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    await this.ensureLoaded();
    const found = this.courses.find((c) => c.id === id);
    if (!found || this.isDeleted(found.id, found.title)) return undefined;
    return found;
  }

  async addCourse(data: Partial<Course>): Promise<Course> {
    await this.ensureLoaded();
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
    await this.ensureLoaded();
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
    await this.ensureLoaded();
    const course = this.courses.find((c) => c.id === id);
    const extraKeys: string[] = [];
    if (course?.title) {
      const clean = course.title.trim().toLowerCase();
      extraKeys.push(`title:${clean}`);
      const noYear = clean.replace(/\(.*\)/g, '').trim();
      extraKeys.push(`title:${noYear}`);
    }
    await this.markAsDeleted(id, extraKeys);
    this.courses = this.courses.filter((c) => c.id !== id);
    await this.persist('icc_courses_modified', 'true');
    await this.persist('icc_courses', this.courses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('courses').delete().eq('id', id);
        if (course?.title) {
          await supabase.from('courses').delete().eq('title', course.title);
        }
      }
    } catch {}
  }

  // --- SUBJECTS (Class Scoped from Class 1 to 12) ---
  async getSubjects(courseId?: string, className?: string): Promise<AcademicSubject[]> {
    await this.ensureLoaded();
    let list = this.subjects.filter((s) => !this.isDeleted(s.id, s.name));

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
    await this.ensureLoaded();
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
    this.notify();
    return newSub;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.ensureLoaded();
    const sub = this.subjects.find((s) => s.id === id);
    const extraKeys: string[] = [];
    if (sub?.name) extraKeys.push(`sub:${sub.name.trim().toLowerCase()}`);
    await this.markAsDeleted(id, extraKeys);
    this.subjects = this.subjects.filter((s) => s.id !== id);
    await this.persist('icc_academic_subjects', this.subjects);
  }

  // --- SUB-SUBJECTS ---
  async addSubSubject(subjectId: string, sub: { name: string; name_hi: string }): Promise<SubSubject> {
    await this.ensureLoaded();
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
    await this.ensureLoaded();
    return this.chapters.filter((ch) => {
      if (this.isDeleted(ch.id, ch.title)) return false;
      if (ch.subject_id !== subjectId) return false;
      if (subSubjectId) return ch.sub_subject_id === subSubjectId;
      return true;
    });
  }

  async addChapter(data: Partial<AcademicChapter>): Promise<AcademicChapter> {
    await this.ensureLoaded();
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
    this.notify();
    return newChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await this.ensureLoaded();
    const ch = this.chapters.find((c) => c.id === id);
    const extraKeys: string[] = [];
    if (ch?.title) extraKeys.push(`ch:${ch.title.trim().toLowerCase()}`);
    await this.markAsDeleted(id, extraKeys);
    this.chapters = this.chapters.filter((c) => c.id !== id);
    await this.persist('icc_academic_chapters', this.chapters);
  }

  // --- CHAPTER CONTENT: RECORDED VIDEOS ---
  async getRecordedLectures(chapterId: string): Promise<RecordedLecture[]> {
    await this.ensureLoaded();
    return this.lectures.filter((l) => !this.isDeleted(l.id, l.title) && l.chapter_id === chapterId);
  }

  async addRecordedLecture(data: Partial<RecordedLecture>): Promise<RecordedLecture> {
    await this.ensureLoaded();
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
    await this.ensureLoaded();
    const lec = this.lectures.find((l) => l.id === id);
    const extraKeys: string[] = [];
    if (lec?.title) extraKeys.push(`lec:${lec.title.trim().toLowerCase()}`);
    await this.markAsDeleted(id, extraKeys);
    this.lectures = this.lectures.filter((l) => l.id !== id);
    await this.persist('icc_recorded_lectures', this.lectures);
  }

  // --- CHAPTER CONTENT: LIVE CLASSES ---
  async getLiveClasses(chapterId?: string): Promise<LiveClass[]> {
    await this.ensureLoaded();
    const list = this.liveClasses.filter((l) => !this.isDeleted(l.id, l.title));
    if (chapterId) {
      return list.filter((l) => (l as any).chapter_id === chapterId);
    }
    return list;
  }

  async scheduleLiveClass(data: Partial<LiveClass> & { chapter_id?: string; subject_id?: string; class_name?: string }): Promise<LiveClass> {
    await this.ensureLoaded();
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
    this.notify();
    return newLive;
  }

  async updateLiveClassStatus(id: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    if (item) {
      item.status = status;
      await this.persist('icc_live_classes', this.liveClasses);
    }
  }

  async deleteLiveClass(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.liveClasses.find((l) => l.id === id);
    const extraKeys: string[] = [];
    if (item?.title) {
      const clean = item.title.trim().toLowerCase();
      extraKeys.push(`live:${clean}`);
      const noYear = clean.replace(/\(.*\)/g, '').trim();
      extraKeys.push(`live:${noYear}`);
    }
    await this.markAsDeleted(id, extraKeys);
    this.liveClasses = this.liveClasses.filter((l) => l.id !== id);
    await this.persist('icc_live_modified', 'true');
    await this.persist('icc_live_classes', this.liveClasses);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('live_classes').delete().eq('id', id);
        if (item?.title) {
          await supabase.from('live_classes').delete().eq('title', item.title);
        }
      }
    } catch {}
  }

  // --- CHAPTER CONTENT: STUDY MATERIALS PDF ---
  async getStudyMaterials(chapterId?: string): Promise<StudyMaterial[]> {
    await this.ensureLoaded();
    const list = this.materials.filter((m) => !this.isDeleted(m.id, m.title));
    if (chapterId) {
      return list.filter((m) => m.chapter_id === chapterId);
    }
    return list;
  }

  async addStudyMaterial(data: Partial<StudyMaterial> & { class_name?: string }): Promise<StudyMaterial> {
    await this.ensureLoaded();
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

    this.notify();
    return newMat;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await this.ensureLoaded();
    const item = this.materials.find((m) => m.id === id);
    const extraKeys: string[] = [];
    if (item?.title) {
      const clean = item.title.trim().toLowerCase();
      extraKeys.push(`material:${clean}`);
      const noYear = clean.replace(/\(.*\)/g, '').trim();
      extraKeys.push(`material:${noYear}`);
    }
    await this.markAsDeleted(id, extraKeys);
    this.materials = this.materials.filter((m) => m.id !== id);
    await this.persist('icc_materials_modified', 'true');
    await this.persist('icc_study_materials', this.materials);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('study_materials').delete().eq('id', id);
        if (item?.title) {
          await supabase.from('study_materials').delete().eq('title', item.title);
        }
      }
    } catch {}
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
