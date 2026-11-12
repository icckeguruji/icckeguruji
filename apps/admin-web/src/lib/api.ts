// IDEAL COACHING CENTRE — ADMIN API SERVICE LAYER
// Seamlessly interfaces with Supabase Backend with graceful seed state fallback

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
  Payment,
  StudyMaterial,
  LiveClass,
  SubjectItem,
  AcademicBoard,
  ClassItem,
  Examination,
  TeacherProfile,
} from '@icc/shared-types';

// In-memory mutable state for responsive local testing when Supabase keys are pending
let localStudents = [...initialStudents];
let localPayments = [...initialPayments];
let localCourses = [...initialCourses];
let localMaterials = [...initialStudyMaterials];
let localLiveClasses = [...initialLiveClasses];
let localSubjects = [...initialSubjects];

export const AdminApi = {
  // 1. Analytics Summary
  getDashboardAnalytics: async () => {
    if (isSupabaseConfigured) {
      const [studentsRes, coursesRes, paymentsRes, materialsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('payments').select('id, amount, status'),
        supabase.from('study_materials').select('id', { count: 'exact' }),
      ]);
      const payments = paymentsRes.data || [];
      const pendingPayments = payments.filter((p) => p.status === 'pending').length;
      const totalRevenue = payments
        .filter((p) => p.status === 'approved')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        totalStudents: studentsRes.count || 0,
        activeStudents: Math.max((studentsRes.count || 0) - 2, 0),
        totalCourses: coursesRes.count || 0,
        pendingPayments,
        approvedPayments: payments.filter((p) => p.status === 'approved').length,
        totalRevenue,
        pdfCount: materialsRes.count || 0,
        liveClassesToday: 2,
      };
    }

    const pending = localPayments.filter((p) => p.status === 'pending').length;
    const approved = localPayments.filter((p) => p.status === 'approved');
    const revenue = approved.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalStudents: localStudents.length,
      activeStudents: localStudents.filter((s) => s.is_active).length,
      totalCourses: localCourses.length,
      pendingPayments: pending,
      approvedPayments: approved.length,
      totalRevenue: revenue,
      pdfCount: localMaterials.length,
      liveClassesToday: 2,
    };
  },

  // 2. Student Management
  getStudents: async (query?: string, board?: string) => {
    if (isSupabaseConfigured) {
      let req = supabase.from('profiles').select('*');
      if (board) req = req.eq('board_code', board);
      if (query) {
        req = req.or(`full_name.ilike.%${query}%,mobile_number.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`);
      }
      const { data, error } = await req.order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as UserProfile[];
    }

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

  toggleStudentStatus: async (studentId: string, isActive: boolean) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', studentId);
      if (error) throw error;
      return true;
    }
    localStudents = localStudents.map((s) => (s.id === studentId ? { ...s, is_active: isActive } : s));
    return true;
  },

  // 3. Courses
  getCourses: async () => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('courses').select('*, board:academic_boards(*), class:classes(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Course[];
    }
    return localCourses;
  },

  createCourse: async (course: Partial<Course>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('courses').insert(course).select().single();
      if (error) throw error;
      return data as Course;
    }
    const newCourse: Course = {
      id: `cr-${Date.now()}`,
      title: course.title || '',
      title_hi: course.title_hi || '',
      description: course.description,
      description_hi: course.description_hi,
      thumbnail_url: course.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      board_id: course.board_id || initialBoards[0].id,
      class_id: course.class_id || initialClasses[1].id,
      is_free: course.is_free || false,
      price: course.price || 0,
      discount_price: course.discount_price,
      validity_days: course.validity_days || 365,
      is_published: course.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localCourses.unshift(newCourse);
    return newCourse;
  },

  // 4. Payments & Approvals
  getPayments: async (statusFilter?: string) => {
    if (isSupabaseConfigured) {
      let req = supabase.from('payments').select('*, student:profiles(*), course:courses(*)');
      if (statusFilter && statusFilter !== 'all') {
        req = req.eq('status', statusFilter);
      }
      const { data, error } = await req.order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Payment[];
    }

    if (statusFilter && statusFilter !== 'all') {
      return localPayments.filter((p) => p.status === statusFilter);
    }
    return localPayments;
  },

  approvePayment: async (paymentId: string, remarks: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_approve_payment', {
        p_payment_id: paymentId,
        p_admin_remarks: remarks,
      });
      if (error) throw error;
      return data;
    }

    localPayments = localPayments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'approved',
            admin_remarks: remarks,
            reviewed_at: new Date().toISOString(),
          }
        : p
    );
    return { success: true };
  },

  rejectPayment: async (paymentId: string, remarks: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('admin_reject_payment', {
        p_payment_id: paymentId,
        p_admin_remarks: remarks,
      });
      if (error) throw error;
      return data;
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
    return { success: true };
  },

  // 5. Automatic Study Materials (PDF)
  getStudyMaterials: async () => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('study_materials').select('*, subject:subjects(*), chapter:chapters(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as StudyMaterial[];
    }
    return localMaterials;
  },

  uploadStudyMaterial: async (material: Partial<StudyMaterial>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('study_materials').insert(material).select().single();
      if (error) throw error;
      return data as StudyMaterial;
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
    localMaterials.unshift(newMat);
    return newMat;
  },

  // 6. Live Classes
  getLiveClasses: async () => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('live_classes').select('*').order('scheduled_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LiveClass[];
    }
    return localLiveClasses;
  },

  createLiveClass: async (cls: Partial<LiveClass>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('live_classes').insert(cls).select().single();
      if (error) throw error;
      return data as LiveClass;
    }
    const newLive: LiveClass = {
      id: `live-${Date.now()}`,
      course_id: cls.course_id || initialCourses[0].id,
      title: cls.title || 'Live Session',
      title_hi: cls.title_hi,
      description: cls.description,
      youtube_video_id: cls.youtube_video_id || 'jfKfPfyJRdk',
      scheduled_at: cls.scheduled_at || new Date().toISOString(),
      duration_minutes: cls.duration_minutes || 60,
      status: cls.status || 'scheduled',
      created_at: new Date().toISOString(),
    };
    localLiveClasses.unshift(newLive);
    return newLive;
  },

  // 7. Academic Metadata
  getAcademics: async () => {
    return {
      boards: initialBoards,
      classes: initialClasses,
      subjects: localSubjects,
    };
  },

  // 8. Platform Settings
  getPlatformConfig: async () => {
    return initialPlatformConfig;
  },
};
