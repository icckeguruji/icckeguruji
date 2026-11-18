'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, getResolvedThumbnailUrl } from '@/lib/api';
import { formatINR } from '@icc/shared-utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Course } from '@icc/shared-types';
import {
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  HardDrive,
  Database,
  ShieldCheck,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  FolderPlus,
  BookMarked,
  X,
  ExternalLink,
  Layers,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';

interface CourseSubject {
  id: string;
  course_id: string;
  name: string;
  name_hi?: string;
  code?: string;
  icon_name?: string;
  display_order?: number;
}

interface SubjectChapter {
  id: string;
  subject_id: string;
  course_id?: string;
  title: string;
  title_hi?: string;
  chapter_number?: number;
  description?: string;
}

export default function AdminDashboardPage() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalRevenue: 0,
    pdfCount: 0,
    liveClassesToday: 0,
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Curriculum Management Modal State
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<CourseSubject | null>(null);
  const [subjectChapters, setSubjectChapters] = useState<SubjectChapter[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Form states for adding subject / chapter
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectNameHi, setNewSubjectNameHi] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTitleHi, setNewChapterTitleHi] = useState('');

  // Course Form States
  const [thumbnailUrl, setThumbnailUrl] = useState('/thumbnails/batch-b3-class10.jpg');
  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    board_code: 'BSEB',
    class_name: 'Class 10',
    is_free: false,
    price: 999,
    discount_price: 499,
    validity_days: 365,
    description: '',
    description_hi: '',
  });

  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    title_hi: '',
    board_code: 'BSEB',
    class_name: 'Class 10',
    is_free: false,
    price: 999,
    discount_price: 499,
    validity_days: 365,
    description: '',
    description_hi: '',
  });

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [analyticsData, coursesData] = await Promise.all([
        AdminApi.getDashboardAnalytics(),
        AdminApi.getCourses(),
      ]);
      setStats(analyticsData);
      setCourses(coursesData);
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-dashboard-master-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          loadDashboardData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          loadDashboardData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          loadDashboardData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
          loadDashboardData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
          loadDashboardData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // HTML5 Canvas Client-Side Compression to prevent Quota Exceeded and oversized payloads
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        if (isEdit) {
          setEditThumbnailUrl(compressedBase64);
        } else {
          setThumbnailUrl(compressedBase64);
        }
      } catch (err) {
        console.error('Failed to compress thumbnail image:', err);
      }
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const boardIdMap: Record<string, string> = {
      BSEB: 'b0000000-0000-0000-0000-000000000001',
      JAC: 'b0000000-0000-0000-0000-000000000002',
    };
    const classIdMap: Record<string, string> = {
      'Class 7': 'c0000000-0000-0000-0000-000000000007',
      'Class 8': 'c0000000-0000-0000-0000-000000000008',
      'Class 9': 'c0000000-0000-0000-0000-000000000009',
      'Class 10': 'c0000000-0000-0000-0000-000000000010',
      'Class 11': 'c0000000-0000-0000-0000-000000000011',
      'Class 12': 'c0000000-0000-0000-0000-000000000012',
    };

    const board_id = boardIdMap[formData.board_code] || 'b0000000-0000-0000-0000-000000000001';
    const class_id = classIdMap[formData.class_name] || 'c0000000-0000-0000-0000-000000000010';

    const created = await AdminApi.createCourse({
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      description: formData.description,
      description_hi: formData.description_hi,
      thumbnail_url: thumbnailUrl,
      board_id,
      class_id,
      session_id: 'a0000000-0000-0000-0000-000000000001',
      is_free: formData.is_free,
      price: formData.is_free ? 0 : Number(formData.price),
      discount_price: formData.is_free ? 0 : Number(formData.discount_price),
      validity_days: Number(formData.validity_days),
      class_name: formData.class_name,
      is_published: true,
    } as any);
    setCourses((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setIsModalOpen(false);
    setThumbnailUrl('/thumbnails/batch-b3-class10.jpg');
    setFormData({
      title: '',
      title_hi: '',
      board_code: 'BSEB',
      class_name: 'Class 10',
      is_free: false,
      price: 999,
      discount_price: 499,
      validity_days: 365,
      description: '',
      description_hi: '',
    });
    loadDashboardData();
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditThumbnailUrl(course.thumbnail_url || '/thumbnails/batch-b3-class10.jpg');
    setEditFormData({
      title: course.title,
      title_hi: course.title_hi || course.title,
      board_code: course.title.includes('JAC') || course.board_id?.includes('2') ? 'JAC' : 'BSEB',
      class_name: 'Class 10',
      is_free: course.is_free,
      price: course.price,
      discount_price: course.discount_price || course.price,
      validity_days: course.validity_days || 365,
      description: course.description || '',
      description_hi: course.description_hi || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const updated = await AdminApi.updateCourse(editingCourse.id, {
      title: editFormData.title,
      title_hi: editFormData.title_hi,
      description: editFormData.description,
      description_hi: editFormData.description_hi,
      thumbnail_url: editThumbnailUrl,
      is_free: editFormData.is_free,
      price: editFormData.is_free ? 0 : Number(editFormData.price),
      discount_price: editFormData.is_free ? 0 : Number(editFormData.discount_price),
      validity_days: Number(editFormData.validity_days),
    });

    if (updated) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updated : c)));
    }
    setIsEditModalOpen(false);
    setEditingCourse(null);
    loadDashboardData();
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the course:\n"${course.title}"?\n\nThis will permanently remove it from the catalog and database.`
    );
    if (!confirmed) return;

    await AdminApi.deleteCourse(course.id);
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    loadDashboardData();
  };

  // --- Curriculum Management Logic ---
  const openCurriculumModal = async (course: Course) => {
    setCurriculumCourse(course);
    setSelectedSubject(null);
    setSubjectChapters([]);
    setLoadingCurriculum(true);
    const subs = await AdminApi.getCourseSubjects(course.id);
    setCourseSubjects(subs);
    setLoadingCurriculum(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !newSubjectName.trim()) return;

    const created = await AdminApi.createCourseSubject(curriculumCourse.id, {
      name: newSubjectName.trim(),
      name_hi: newSubjectNameHi.trim() || newSubjectName.trim(),
    });
    setCourseSubjects((prev) => [...prev, created]);
    setNewSubjectName('');
    setNewSubjectNameHi('');
  };

  const handleDeleteSubject = async (sub: CourseSubject) => {
    if (!curriculumCourse) return;
    const confirm = window.confirm(`Delete subject "${sub.name}" from this course?`);
    if (!confirm) return;

    await AdminApi.deleteCourseSubject(curriculumCourse.id, sub.id);
    setCourseSubjects((prev) => prev.filter((s) => s.id !== sub.id));
    if (selectedSubject?.id === sub.id) {
      setSelectedSubject(null);
      setSubjectChapters([]);
    }
  };

  const handleSelectSubject = async (sub: CourseSubject) => {
    setSelectedSubject(sub);
    const chaps = await AdminApi.getSubjectChapters(sub.id);
    setSubjectChapters(chaps);
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !selectedSubject || !newChapterTitle.trim()) return;

    const created = await AdminApi.createSubjectChapter(
      selectedSubject.id,
      curriculumCourse.id,
      {
        title: newChapterTitle.trim(),
        title_hi: newChapterTitleHi.trim() || newChapterTitle.trim(),
        chapter_number: subjectChapters.length + 1,
      }
    );
    setSubjectChapters((prev) => [...prev, created]);
    setNewChapterTitle('');
    setNewChapterTitleHi('');
  };

  const handleDeleteChapter = async (chap: SubjectChapter) => {
    if (!selectedSubject) return;
    const confirm = window.confirm(`Delete chapter "${chap.title}"?`);
    if (!confirm) return;

    await AdminApi.deleteSubjectChapter(selectedSubject.id, chap.id);
    setSubjectChapters((prev) => prev.filter((c) => c.id !== chap.id));
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="डैशबोर्ड अवलोकन"
        titleEn="Dashboard Overview"
        subtitleHi="आइडियल कोचिंग सेंटर - डायरेक्टर बड़े सर प्रशासनिक पोर्टल"
        subtitleEn="Ideal Coaching Centre - Director BADE SIR Management System"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Real-time Status and Refresh Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700">
              {t('लाइव क्लाउड सिंक सक्रिय (Supabase Live Cloud)', 'Live Cloud Sync (Supabase Live Cloud)')}
            </span>
            <span className="hidden sm:inline-block text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
              {courses.length} {t('कोर्स डेटाबेस में मौजूद', 'Courses in DB')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{t('रिफ्रेश', 'Refresh')}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('नया कोर्स', 'New Course')}</span>
            </button>
          </div>
        </div>

        {/* Urgent Action Alert: Pending Payments */}
        {stats.pendingPayments > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {t(
                    `${stats.pendingPayments} नए शुल्क भुगतान सत्यापन की प्रतीक्षा में हैं`,
                    `${stats.pendingPayments} new UPI payments awaiting verification`
                  )}
                </p>
                <p className="text-xs text-amber-700">
                  {t(
                    'विद्यार्थी के भुगतान का यूटीआर (UTR) और स्क्रीनशॉट जांचकर कोर्स एक्टिवेट करें।',
                    'Review transaction reference & screenshot to activate student enrollments.'
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/admin/payments"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
            >
              <span>{t('अभी जांचें', 'Review Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('कुल विद्यार्थी', 'Total Students')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalStudents}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.activeStudents} {t('सक्रिय अध्येता', 'Active Learners')}
              </p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('सक्रिय पाठ्यक्रम', 'Published Courses')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('सत्र 2026-27 पाठ्यक्रम', 'Session 2026-27 Courses')}
              </p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('प्राप्त कुल शुल्क', 'Total Collected Fee')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{formatINR(stats.totalRevenue)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {stats.approvedPayments} {t('स्वीकृत भुगतान', 'Verified Payments')}
              </p>
            </div>
          </div>

          {/* Study Materials & Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('अपलोड की गई सामग्री', 'Study Materials')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{stats.pdfCount}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('स्वचालित असाइन किए गए पीडीएफ', 'Auto-assigned PDFs')}
              </p>
            </div>
          </div>
        </div>

        {/* 📚 ACTIVE COURSES DIRECT COMMAND CENTER (Instantly Visible & Live) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {t('संस्थान के सक्रिय पाठ्यक्रम (Active Courses on Cloud)', 'Institute Published Courses')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'मोबाइल ऐप और एडमिन डैशबोर्ड दोनों जगह पूर्णतः सिंक (Supabase Live)',
                  'Bidirectionally synchronized in real-time across Android App and Web'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 flex-1 sm:flex-initial justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>{t('नया कोर्स जोड़ें', 'Add New Course')}</span>
              </button>
              <Link
                href="/admin/courses"
                className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex-1 sm:flex-initial justify-center"
              >
                <span>{t('सभी देखें', 'Manage All')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Courses List Grid */}
          {courses.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                {t('अभी कोई कोर्स नहीं है', 'No courses added yet')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t('ऊपर "+ नया कोर्स जोड़ें" बटन दबाकर नया कोर्स जोड़ें।', 'Click "+ Add New Course" above to create your first course.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => {
                const resolvedThumb = getResolvedThumbnailUrl(course.thumbnail_url);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={resolvedThumb}
                          alt={course.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg';
                          }}
                        />
                        <div className="absolute top-3 left-3 flex space-x-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {t('सत्र 2026-27', 'Session 2026-27')}
                          </span>
                          {course.is_free ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                              {t('निःशुल्क', 'FREE')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-slate-950">
                              {formatINR(course.discount_price || course.price)}
                            </span>
                          )}
                        </div>

                        {/* Quick Controls */}
                        <div className="absolute top-3 right-3 flex space-x-1.5">
                          <button
                            onClick={() => openEditModal(course)}
                            title="Edit Course"
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-xs transition shadow"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course)}
                            title="Delete Course"
                            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-xs transition shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            {t('🟢 क्लाउड पर लाइव (Active)', '🟢 Live on Cloud')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {lang === 'hi' ? course.title_hi || course.title : course.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {course.description || course.description_hi || t('संपूर्ण बोर्ड परीक्षा पाठ्यक्रम तैयारी', 'Full board exam preparation curriculum')}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => openCurriculumModal(course)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{t('विषय एवं अध्याय', 'Curriculum')}</span>
                      </button>
                      <Link
                        href={`/courses`}
                        target="_blank"
                        className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title="Student View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Free Tier Compliance & Resource Quota Meter */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {t('शून्य-लागत अवसंरचना स्थिति (Zero-Paid Policy)', 'Zero-Cost Infrastructure Meter')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t(
                  'प्रणाली केवल वैध निःशुल्क योजनाओं (₹0/माह) पर संचालित है। स्वचालित भुगतान उन्नयन पूर्णतः अक्षम है।',
                  'System strictly runs within verified free plans. Paid upgrades are disabled.'
                )}
              </p>
            </div>
            <div className="mt-3 md:mt-0 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold self-start md:self-auto">
              ₹0.00 / Monthly Spend
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            {/* Database Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1 text-blue-400" /> PostgreSQL DB
                </span>
                <span className="font-bold text-slate-200">14.2 MB / 500 MB (2.8%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2.8%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('तालिकाओं और अनुक्रमणिका का कुशल उपयोग', 'Efficient indexing & storage')}
              </p>
            </div>

            {/* Storage Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <HardDrive className="w-3.5 h-3.5 mr-1 text-purple-400" /> Supabase Storage
                </span>
                <span className="font-bold text-slate-200">42.8 MB / 1000 MB (4.2%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '4.2%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('केवल संपीड़ित पीडीएफ और रसीदें', 'Compressed PDFs & receipts only')}
              </p>
            </div>

            {/* Authentication Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Auth MAU Quota
                </span>
                <span className="font-bold text-slate-200">3 / 50,000 (&lt;0.1%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0.1%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('ईमेल ओटीपी (एसएमएस शुल्क ₹0)', 'Email OTP (₹0 SMS expense)')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/courses"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('कोर्स प्रबंधन विस्तार से', 'Course Management Hub')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('कक्षा 1 से 12वीं के लिए', 'For Classes 1st to 12th')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>

          <Link
            href="/admin/study-materials"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('पीडीएफ नोट्स अपलोड करें', 'Upload PDF Notes')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('स्वचालित शैक्षणिक मैपिंग के साथ', 'With Automatic Academic Mapping')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>

          <Link
            href="/admin/live-classes"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('यूट्यूब लाइव क्लास शेड्यूल करें', 'Schedule YouTube Live')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('बैच अनुसार कक्षा प्रसारण', 'Batch-wise live broadcast')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>
        </div>
      </div>

      {/* --- ADD COURSE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                {t('नया पाठ्यक्रम जोड़ें', 'Add New Course')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स का शीर्षक (English)', 'Course Title (English)')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 State Board Topper Course 2027"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स का शीर्षक (हिंदी)', 'Course Title (Hindi)')}
                </label>
                <input
                  type="text"
                  placeholder="उदा. कक्षा 10वीं स्टेट बोर्ड टॉपर कोर्स 2027"
                  value={formData.title_hi}
                  onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('बोर्ड', 'Board')}
                  </label>
                  <select
                    value={formData.board_code}
                    onChange={(e) => setFormData({ ...formData, board_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BSEB">BSEB (बिहार बोर्ड)</option>
                    <option value="JAC">JAC (झारखंड बोर्ड)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('कक्षा', 'Class')}
                  </label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              {/* Free vs Paid Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {t('यह कोर्स पूर्णतः निःशुल्क (FREE) है', 'This course is 100% FREE')}
                  </span>
                </label>
              </div>

              {!formData.is_free && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('मूल्य (MRP)', 'Original Price (₹)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('छूट मूल्य (Offer Price)', 'Discount Price (₹)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail Image Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स थंबनेल फोटो', 'Course Thumbnail')}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, false)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('विवरण (Description)', 'Description')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Course features, curriculum overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {t('प्रकाशित करें (Publish Course)', 'Publish Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT COURSE MODAL --- */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                {t('पाठ्यक्रम संपादित करें', 'Edit Course')}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स का शीर्षक (English)', 'Course Title (English)')}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स का शीर्षक (हिंदी)', 'Course Title (Hindi)')}
                </label>
                <input
                  type="text"
                  value={editFormData.title_hi}
                  onChange={(e) => setEditFormData({ ...editFormData, title_hi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Free vs Paid Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_free}
                    onChange={(e) => setEditFormData({ ...editFormData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {t('यह कोर्स पूर्णतः निःशुल्क (FREE) है', 'This course is 100% FREE')}
                  </span>
                </label>
              </div>

              {!editFormData.is_free && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('मूल्य (MRP)', 'Original Price (₹)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('छूट मूल्य (Offer Price)', 'Discount Price (₹)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.discount_price}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, discount_price: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail Image Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('कोर्स थंबनेल फोटो', 'Course Thumbnail')}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    <img
                      src={getResolvedThumbnailUrl(editThumbnailUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, true)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('विवरण (Description)', 'Description')}
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {t('सहेजें (Save Changes)', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CURRICULUM MANAGEMENT MODAL --- */}
      {curriculumCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {t('पाठ्यक्रम पाठ्यक्रम संरचना', 'Course Curriculum & Syllabus')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {curriculumCourse.title}
                </p>
              </div>
              <button
                onClick={() => setCurriculumCourse(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[350px]">
              {/* Left Column: Subjects */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center">
                      <FolderPlus className="w-4 h-4 mr-1.5 text-blue-600" />
                      {t('1. विषय सूची (Subjects)', '1. Subjects')}
                    </h4>
                    <span className="text-xs text-slate-500 font-semibold">
                      {courseSubjects.length} {t('विषय', 'Subjects')}
                    </span>
                  </div>

                  {loadingCurriculum ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading subjects...</div>
                  ) : courseSubjects.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                      {t('इस कोर्स में कोई विषय नहीं है। नीचे जोड़ें।', 'No subjects added yet. Add below.')}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {courseSubjects.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectSubject(sub)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            selectedSubject?.id === sub.id
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold truncate">
                              {lang === 'hi' ? sub.name_hi || sub.name : sub.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubject(sub);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Subject Form */}
                <form onSubmit={handleAddSubject} className="pt-3 border-t mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Subject (e.g. Science)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                      className="px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="विषय नाम (उदा. विज्ञान)"
                      value={newSubjectNameHi}
                      onChange={(e) => setNewSubjectNameHi(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('विषय जोड़ें (Add Subject)', 'Add Subject')}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Chapters for selected subject */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center">
                      <BookMarked className="w-4 h-4 mr-1.5 text-indigo-600" />
                      {t('2. अध्याय सूची (Chapters)', '2. Chapters')}
                    </h4>
                    {selectedSubject && (
                      <span className="text-xs text-indigo-600 font-semibold truncate max-w-[150px]">
                        {selectedSubject.name}
                      </span>
                    )}
                  </div>

                  {!selectedSubject ? (
                    <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                      {t('अध्याय देखने के लिए बाईं ओर से कोई विषय चुनें।', 'Select a subject on the left to manage chapters.')}
                    </div>
                  ) : subjectChapters.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                      {t('इस विषय में अभी कोई अध्याय नहीं है। नीचे जोड़ें।', 'No chapters in this subject yet. Add below.')}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {subjectChapters.map((chap, idx) => (
                        <div
                          key={chap.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-bold text-slate-400 block">
                              Chapter {idx + 1}
                            </span>
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {lang === 'hi' ? chap.title_hi || chap.title : chap.title}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteChapter(chap)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Chapter Form */}
                {selectedSubject && (
                  <form onSubmit={handleAddChapter} className="pt-3 border-t mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Chapter Title (English)"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        required
                        className="px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="अध्याय शीर्षक (हिंदी)"
                        value={newChapterTitleHi}
                        onChange={(e) => setNewChapterTitleHi(e.target.value)}
                        className="px-2.5 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('अध्याय जोड़ें (Add Chapter)', 'Add Chapter')}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setCurriculumCourse(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                {t('पूर्ण हुआ (Done)', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
