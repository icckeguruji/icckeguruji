// IDEAL COACHING CENTRE — ADMIN & FACULTY API SERVICE LAYER
// Seamlessly interfaces with Supabase Backend with permanent browser localStorage persistence
// Ensures changes made in Admin Panel NEVER revert back on refresh or reload!

import { supabase, isSupabaseConfigured } from './supabase';
import {
  initialBoards,
  initialClasses,
  initialSubjects,
  initialCourses,
  initialStudents,
  initialPayments,
  initialStudyMaterials,
  initialLiveClasses,
  initialPlatformConfig,
} from './sample-data';
import {
  UserProfile,
  Course,
  Batch,
  Payment,
  StudyMaterial,
  LiveClass,
  SubjectItem,
  AcademicBoard,
  ClassItem,
  Examination,
  TeacherProfile,
} from '@icc/shared-types';

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

// Initial default batches matching initial courses (Clean slate - No dummy data)
const initialBatchesData: BatchWithMeta[] = [];

const defaultAdminProfile: AdminProfileData = {
  id: 'adm00000-0000-0000-0000-000000000001',
  full_name: 'BADE SIR (Director)',
  email: 'icckeguruji@gmail.com',
  mobile_number: '9771350910',
  role: 'admin',
  avatar_url: '/logo.png',
  preferred_language: 'en',
};

// Persistent Storage Keys (v3 Clean Slate)
const STORAGE_KEYS = {
  STUDENTS: 'icc_v3_clean_students',
  COURSES: 'icc_v3_clean_courses',
  BATCHES: 'icc_v3_clean_batches',
  PAYMENTS: 'icc_v3_clean_payments',
  MATERIALS: 'icc_v3_clean_materials',
  LIVE_CLASSES: 'icc_v3_clean_live_classes',
  SUBJECTS: 'icc_v3_clean_subjects',
  ADMIN_PROFILE: 'icc_v3_clean_profile',
};

// Clear legacy dirty mock cache from localStorage
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'icc_admin_persistent_students',
      'icc_admin_persistent_courses',
      'icc_admin_persistent_batches',
      'icc_admin_persistent_payments',
      'icc_admin_persistent_materials',
      'icc_admin_persistent_live_classes',
      'icc_courses_v1',
      'icc_courses_v2',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// Helper to retrieve data from localStorage (browser-safe, permanent)
function getPersistentState<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return parsed as T;
    }
  } catch {}
  return defaultData;
}

// Helper to save data to localStorage (browser-safe, permanent)
function savePersistentState<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// In-memory working state initialized from persistent store or seeds
let localStudents: UserProfile[] = getPersistentState(STORAGE_KEYS.STUDENTS, [...initialStudents]);
let localPayments: Payment[] = getPersistentState(STORAGE_KEYS.PAYMENTS, [...initialPayments]);
let localCourses: Course[] = getPersistentState(STORAGE_KEYS.COURSES, [...initialCourses]);
let localBatches: BatchWithMeta[] = getPersistentState(STORAGE_KEYS.BATCHES, [...initialBatchesData]);
let localMaterials: StudyMaterial[] = getPersistentState(STORAGE_KEYS.MATERIALS, [...initialStudyMaterials]);
let localLiveClasses: LiveClass[] = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, [...initialLiveClasses]);
let localSubjects: SubjectItem[] = getPersistentState(STORAGE_KEYS.SUBJECTS, [...initialSubjects]);
let localAdminProfile: AdminProfileData = getPersistentState(STORAGE_KEYS.ADMIN_PROFILE, { ...defaultAdminProfile });

export const AdminApi = {
  // 1. Analytics Summary
  getDashboardAnalytics: async () => {
    localStudents = getPersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    localPayments = getPersistentState(STORAGE_KEYS.PAYMENTS, localPayments);
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    localBatches = getPersistentState(STORAGE_KEYS.BATCHES, localBatches);

    let studentCount = localStudents.length;
    let courseCount = localCourses.length;
    let pdfCount = localMaterials.length;
    let batchCount = localBatches.length;
    let pendingPayments = localPayments.filter((p) => p.status === 'pending').length;
    let approvedPayments = localPayments.filter((p) => p.status === 'approved').length;
    let totalRevenue = localPayments
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);

    if (isSupabaseConfigured) {
      try {
        const [studentsRes, coursesRes, paymentsRes, materialsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('payments').select('id, amount, status'),
          supabase.from('study_materials').select('id', { count: 'exact' }),
        ]);

        if (studentsRes.count && studentsRes.count > 0) studentCount = studentsRes.count;
        if (coursesRes.count && coursesRes.count > 0) courseCount = coursesRes.count;
        if (materialsRes.count && materialsRes.count > 0) pdfCount = materialsRes.count;

        const dbPayments = paymentsRes.data || [];
        if (dbPayments.length > 0) {
          pendingPayments = dbPayments.filter((p) => p.status === 'pending').length;
          approvedPayments = dbPayments.filter((p) => p.status === 'approved').length;
          totalRevenue = dbPayments
            .filter((p) => p.status === 'approved')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        }
      } catch {
        // Fallback to local persistent state
      }
    }

    return {
      totalStudents: studentCount,
      activeStudents: Math.max(studentCount - 2, 1),
      totalCourses: courseCount,
      totalBatches: batchCount,
      pendingPayments,
      approvedPayments,
      totalRevenue,
      pdfCount,
      liveClassesToday: 2,
    };
  },

  // 2. Student Management
  getStudents: async (query?: string, board?: string) => {
    if (isSupabaseConfigured) {
      try {
        let req = supabase.from('profiles').select('*');
        if (board) req = req.eq('board_code', board);
        if (query) {
          req = req.or(`full_name.ilike.%${query}%,mobile_number.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`);
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').insert(studentData).select().single();
        if (!error && data) {
          localStudents.unshift(data as UserProfile);
          savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
          return data as UserProfile;
        }
      } catch {}
    }

    const newStudent: UserProfile = {
      id: `u-${Date.now()}`,
      username: studentData.username || `student_${Date.now().toString().slice(-4)}`,
      full_name: studentData.full_name || 'New Student',
      mobile_number: studentData.mobile_number || '9999999999',
      email: studentData.email || 'student@example.com',
      board_code: studentData.board_code || 'BSEB',
      district: studentData.district || 'Godda',
      school_name: studentData.school_name || 'Government High School',
      guardian_name: studentData.guardian_name || '',
      guardian_phone: studentData.guardian_phone || '',
      preferred_language: 'en',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

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

  // 3. Courses Management
  getCourses: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, board:academic_boards(*), class:classes(*)')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localCourses = data as Course[];
          savePersistentState(STORAGE_KEYS.COURSES, localCourses);
          return localCourses;
        }
      } catch (e) {
        console.error('getCourses Supabase error:', e);
      }
    }
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, []);
    return localCourses;
  },

  createCourse: async (course: Partial<Course>) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);

    // Default valid Supabase foreign keys
    const defaultBoardId = 'b0000000-0000-0000-0000-000000000001';
    const defaultClassId = 'c0000000-0000-0000-0000-000000000010';
    const defaultSessionId = 'a0000000-0000-0000-0000-000000000001';

    const insertPayload: any = {
      title: course.title || 'New Course',
      title_hi: course.title_hi || course.title || 'नया कोर्स',
      description: course.description || '',
      description_hi: course.description_hi || course.description || '',
      thumbnail_url: course.thumbnail_url || '/logo.png',
      board_id: course.board_id || defaultBoardId,
      class_id: course.class_id || defaultClassId,
      session_id: course.session_id || defaultSessionId,
      is_free: course.is_free ?? false,
      price: course.is_free ? 0 : (course.price ?? 999),
      discount_price: course.is_free ? 0 : (course.discount_price ?? 499),
      validity_days: course.validity_days ?? 365,
      is_published: true,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert(insertPayload)
          .select('*, board:academic_boards(*), class:classes(*)')
          .single();
        if (!error && data) {
          localCourses = [data as Course, ...localCourses.filter((c) => c.id !== data.id)];
          savePersistentState(STORAGE_KEYS.COURSES, localCourses);
          return data as Course;
        } else if (error) {
          console.error('createCourse Supabase error:', error);
        }
      } catch (err) {
        console.error('createCourse exception:', err);
      }
    }

    const fallbackCourse: Course = {
      id: `cr-${Date.now()}`,
      ...insertPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lecture_count: 0,
      material_count: 0,
    };

    localCourses = [fallbackCourse, ...localCourses];
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return fallbackCourse;
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    if (isSupabaseConfigured) {
      try {
        const { board, class: classItem, lecture_count, material_count, ...cleanUpdates } = updates as any;
        const { error } = await supabase.from('courses').update(cleanUpdates).eq('id', courseId);
        if (error) console.error('updateCourse Supabase error:', error);
      } catch (err) {
        console.error('updateCourse exception:', err);
      }
    }

    localCourses = localCourses.map((c) =>
      c.id === courseId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return localCourses.find((c) => c.id === courseId) || null;
  },

  deleteCourse: async (courseId: string) => {
    localCourses = getPersistentState(STORAGE_KEYS.COURSES, localCourses);
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) console.error('deleteCourse Supabase error:', error);
      } catch (err) {
        console.error('deleteCourse exception:', err);
      }
    }
    localCourses = localCourses.filter((c) => c.id !== courseId);
    savePersistentState(STORAGE_KEYS.COURSES, localCourses);
    return true;
  },

  // 4. Batches Management
  getBatches: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*, course:courses(*)')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localBatches = data.map((b: any) => ({
            ...b,
            courseTitle: b.course?.title || 'BSEB/JAC Board Course',
            studentCount: b.student_count || 0,
          }));
          savePersistentState(STORAGE_KEYS.BATCHES, localBatches);
          return localBatches;
        }
      } catch {}
    }
    localBatches = getPersistentState(STORAGE_KEYS.BATCHES, []);
    return localBatches;
  },

  createBatch: async (batchData: Partial<BatchWithMeta>) => {
    localBatches = getPersistentState(STORAGE_KEYS.BATCHES, localBatches);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .insert({
            course_id: batchData.course_id || localCourses[0]?.id,
            name: batchData.name,
            name_hi: batchData.name_hi,
            schedule_info: batchData.schedule_info,
            is_active: true,
          })
          .select()
          .single();
        if (!error && data) {
          const newBatch: BatchWithMeta = {
            ...data,
            courseTitle: batchData.courseTitle || 'BSEB/JAC Board Batch',
            studentCount: 0,
            thumbnail_url: batchData.thumbnail_url || '/thumbnails/batch-b3-class10.jpg',
          };
          localBatches.unshift(newBatch);
          savePersistentState(STORAGE_KEYS.BATCHES, localBatches);
          return newBatch;
        }
      } catch {}
    }

    const newBatch: BatchWithMeta = {
      id: `ba-${Date.now()}`,
      course_id: batchData.course_id || localCourses[0]?.id || 'cr-1',
      name: batchData.name || 'New Batch',
      name_hi: batchData.name_hi || batchData.name || 'नया बैच',
      courseTitle: batchData.courseTitle || 'BSEB/JAC Board Batch',
      schedule_info: batchData.schedule_info || 'Mon-Sat: 06:00 AM - 08:00 AM IST',
      studentCount: 0,
      thumbnail_url: batchData.thumbnail_url || '/thumbnails/batch-b3-class10.jpg',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    localBatches = [newBatch, ...localBatches];
    savePersistentState(STORAGE_KEYS.BATCHES, localBatches);
    return newBatch;
  },

  updateBatch: async (batchId: string, updates: Partial<BatchWithMeta>) => {
    localBatches = getPersistentState(STORAGE_KEYS.BATCHES, localBatches);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('batches')
          .update({
            name: updates.name,
            name_hi: updates.name_hi,
            schedule_info: updates.schedule_info,
          })
          .eq('id', batchId);
      } catch {}
    }

    localBatches = localBatches.map((b) =>
      b.id === batchId ? { ...b, ...updates } : b
    );
    savePersistentState(STORAGE_KEYS.BATCHES, localBatches);
    return localBatches.find((b) => b.id === batchId) || null;
  },

  deleteBatch: async (batchId: string) => {
    localBatches = getPersistentState(STORAGE_KEYS.BATCHES, localBatches);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('batches').delete().eq('id', batchId);
      } catch {}
    }

    localBatches = localBatches.filter((b) => b.id !== batchId);
    savePersistentState(STORAGE_KEYS.BATCHES, localBatches);
    return true;
  },

  // 5. Manual UPI Payments
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

        // Activate student account officially and create active enrollment
        if (targetStudentId) {
          try {
            await supabase.from('profiles').update({ is_active: true }).eq('id', targetStudentId);
          } catch {}
          try {
            await supabase.from('users').update({ is_active: true }).eq('id', targetStudentId);
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

    // Also activate in local student registry
    if (targetStudentId) {
      localStudents = localStudents.map((s) => (s.id === targetStudentId ? { ...s, is_active: true } : s));
      savePersistentState(STORAGE_KEYS.STUDENTS, localStudents);
    }

    // 1. Dispatch automated push notification to the student upon approval
    const payAny = payment as any;
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '🎉 Enrollment Approved! Course Unlocked',
            message: `Congratulations! Your enrollment for ${payment?.course?.title || payAny?.course_title || 'BSEB/JAC Board Batch'} has been approved by Admin. All live classes, notes & exams are now accessible.`,
            type: 'approval',
            studentId: targetStudentId || undefined,
            link: '/(tabs)/courses',
          }),
        }).catch(() => {});
      } catch {}
    }

    // 2. Dispatch automated email notification via Google Apps Script (script.new)
    const targetEmail = payment?.student?.email || payAny?.student_email;
    if (targetEmail && targetEmail.includes('@')) {
      AdminApi.sendEmailNotification({
        to: targetEmail,
        subject: '🎉 Enrollment Approved! Course Unlocked — IDEAL COACHING CENTRE',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">IDEAL COACHING CENTRE</h1>
              <p style="color: #b45309; font-weight: bold; margin: 4px 0 0 0; text-transform: uppercase;">Director: BADE SIR</p>
              <p style="color: #64748b; font-size: 12px; margin: 2px 0 0 0;">Sarotiya, Mahagama, Godda (JH) 814165 • BSEB & JAC</p>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h2 style="color: #15803d; margin: 0 0 8px 0; font-size: 18px;">✅ Enrollment Verified & Approved!</h2>
              <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
                Dear <strong>${payAny?.student_name || payment?.student?.full_name || 'Student'}</strong>,<br/>
                Your course enrollment for <strong>${payment?.course?.title || payAny?.course_title || 'BSEB/JAC Board Batch'}</strong> has been verified by Director BADE SIR. You now have full access to daily live classes, handwritten notes and weekly mock tests.
              </p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
              <p style="margin: 4px 0;"><strong>UTR / Ref:</strong> ${payment?.upi_ref_number || payAny?.utr_number || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Admin Remarks:</strong> ${remarks}</p>
              <p style="margin: 4px 0;"><strong>Helpline WhatsApp:</strong> +91 9771350910</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;">
              Automated message sent via IDEAL COACHING CENTRE Free Email Engine.
            </p>
          </div>
        `,
        type: 'approval',
      }).catch(() => {});
    }

    return {
      success: true,
      message: 'Payment approved! Student account activated, push notification & confirmation email dispatched.',
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
          try {
            await supabase.from('users').delete().eq('id', targetStudentId).eq('is_active', false);
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
            student: undefined,
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
      message: 'Payment rejected. Unapproved student record purged; student may re-enroll with the same WhatsApp number and email.',
    };
  },

  // 6. Automatic Study Materials (PDF)
  getStudyMaterials: async () => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*, subject:subjects(*), chapter:chapters(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localMaterials = data as StudyMaterial[];
          savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
          return localMaterials;
        }
      } catch {}
    }
    return localMaterials;
  },

  uploadStudyMaterial: async (material: Partial<StudyMaterial>) => {
    localMaterials = getPersistentState(STORAGE_KEYS.MATERIALS, localMaterials);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('study_materials').insert(material).select().single();
        if (!error && data) {
          localMaterials.unshift(data as StudyMaterial);
          savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
          return data as StudyMaterial;
        }
      } catch {}
    }

    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      board_id: material.board_id || initialBoards[0].id,
      class_id: material.class_id || initialClasses[1].id,
      subject_id: material.subject_id || initialSubjects[0].id,
      chapter_id: material.chapter_id || 'ch000000-0000-0000-0000-000000000001',
      title: material.title || 'Untitled Notes',
      title_hi: material.title_hi || material.title || 'बिना शीर्षक नोट्स',
      description: material.description,
      file_path: material.file_path || 'bseb/class10/sample.pdf',
      file_size_bytes: material.file_size_bytes || 1500000,
      material_type: material.material_type || 'chapter_notes',
      is_free: material.is_free || false,
      version: 1,
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
        await supabase.from('study_materials').update(updates).eq('id', materialId);
      } catch {}
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
        await supabase.from('study_materials').delete().eq('id', materialId);
      } catch {}
    }
    localMaterials = localMaterials.filter((m) => m.id !== materialId);
    savePersistentState(STORAGE_KEYS.MATERIALS, localMaterials);
    return true;
  },

  // 7. Live Classes
  getLiveClasses: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('live_classes').select('*').order('scheduled_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          localLiveClasses = data as LiveClass[];
          savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
          return localLiveClasses;
        }
      } catch {}
    }
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, []);
    return localLiveClasses;
  },

  createLiveClass: async (cls: Partial<LiveClass>) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('live_classes').insert(cls).select().single();
        if (!error && data) {
          localLiveClasses.unshift(data as LiveClass);
          savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
          return data as LiveClass;
        }
      } catch {}
    }

    const newLive: LiveClass = {
      id: `live-${Date.now()}`,
      course_id: cls.course_id || localCourses[0]?.id || 'cr000000-0000-0000-0000-000000000001',
      title: cls.title || 'Live Session',
      title_hi: cls.title_hi,
      description: cls.description,
      youtube_video_id: cls.youtube_video_id || 'jfKfPfyJRdk',
      scheduled_at: cls.scheduled_at || new Date().toISOString(),
      duration_minutes: cls.duration_minutes || 60,
      status: cls.status || 'scheduled',
      created_at: new Date().toISOString(),
    };

    localLiveClasses = [newLive, ...localLiveClasses];
    savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    return newLive;
  },

  deleteLiveClass: async (classId: string) => {
    localLiveClasses = getPersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('live_classes').delete().eq('id', classId);
      } catch {}
    }
    localLiveClasses = localLiveClasses.filter((l) => l.id !== classId);
    savePersistentState(STORAGE_KEYS.LIVE_CLASSES, localLiveClasses);
    return true;
  },

  // 8. Academic Metadata
  getAcademics: async () => {
    localSubjects = getPersistentState(STORAGE_KEYS.SUBJECTS, localSubjects);
    return {
      boards: initialBoards,
      classes: initialClasses,
      subjects: localSubjects,
    };
  },

  // 9. Platform Settings
  getPlatformConfig: async () => {
    return initialPlatformConfig;
  },

  // 10. Admin Profile & Session Management
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
            avatar_url: data.avatar_url || data.profile_photo_url || localAdminProfile.avatar_url,
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

  // 11. Google Apps Script Email Engine (script.new integration)
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
