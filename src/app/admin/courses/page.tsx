'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, getResolvedThumbnailUrl } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Video,
  Edit3,
  Trash2,
  Upload,
  ChevronRight,
  FolderPlus,
  BookMarked,
  X,
  AlertCircle,
  RefreshCw,
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

export default function CoursesPage() {
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCourses = async () => {
    setIsRefreshing(true);
    try {
      const data = await AdminApi.getCourses();
      setCourses(data);
    } catch (e) {
      console.warn('loadCourses error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-courses-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          loadCourses();
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
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the course:\n"${course.title}"?\n\nThis will permanently remove it from the catalog and database.`
    );
    if (!confirmed) return;

    await AdminApi.deleteCourse(course.id);
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
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
        titleHi="कोर्स प्रबंधन"
        titleEn="Course Management"
        subtitleHi="संस्थान के पाठ्यक्रम एवं शुल्क विन्यास"
        subtitleEn="Create, edit and manage courses with real-time database sync"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल पाठ्यक्रम: ${courses.length}`, `Total Courses: ${courses.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('कक्षा 1 से 12वीं एवं प्रतियोगी फाउंडेशन पाठ्यक्रम', 'Classes 1st to 12th & Foundation Courses')}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadCourses}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50"
              title="Refresh courses from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{t('रिफ्रेश', 'Refresh')}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 flex-1 sm:flex-initial justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>{t('नया कोर्स जोड़ें', 'Add New Course')}</span>
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => {
            const resolvedThumb = getResolvedThumbnailUrl(course.thumbnail_url);
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={resolvedThumb}
                    alt={course.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://icconline.vercel.app/thumbnails/batch-b3-class10.jpg';
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

                  {/* Edit & Delete Quick Controls on Thumbnail */}
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

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {lang === 'hi' ? course.title_hi || course.title : course.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {lang === 'hi' ? course.description_hi || course.description : course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {course.validity_days} {t('दिन', 'days')}
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1 text-purple-500" />
                      {course.material_count || 0} {t('पीडीएफ', 'PDFs')}
                    </span>
                    <span className="flex items-center">
                      <Video className="w-3.5 h-3.5 mr-1 text-red-500" />
                      {course.lecture_count || 0} {t('वीडियो', 'Videos')}
                    </span>
                  </div>

                  {/* Card Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => openCurriculumModal(course)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{t('विषय व अध्याय (Curriculum)', 'Curriculum')}</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditModal(course)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t('संशोधित', 'Edit')}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('हटाएं', 'Delete')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('नया कोर्स बनाएं (Create Course)', 'Create New Course')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कोर्स का शीर्षक (English)', 'Course Title (English)')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Class 10th All Subjects Mastery"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कोर्स का शीर्षक (हिंदी)', 'Course Title (Hindi)')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title_hi}
                      onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                      placeholder="उदा. कक्षा 10वीं संपूर्ण विषय तैयारी"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कक्षा (Class)', 'Class')}
                  </label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Class 7">कक्षा 7</option>
                    <option value="Class 8">कक्षा 8</option>
                    <option value="Class 9">कक्षा 9</option>
                    <option value="Class 10">कक्षा 10</option>
                    <option value="Class 11">कक्षा 11 (विज्ञान)</option>
                    <option value="Class 12">कक्षा 12 (विज्ञान)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('विवरण (English Description)', 'Description (English)')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive target batch with daily live classes, complete NCERT solutions and notes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('विवरण (हिंदी Description)', 'Description (Hindi)')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description_hi}
                    onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                    placeholder="परीक्षा पर अंतिम और मजबूत प्रहार! प्रतिदिन लाइव कक्षाएं..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Course Thumbnail Upload (Compressed & High-Quality) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स थंबनेल अपलोड करें (Course Thumbnail)', 'Upload Course Thumbnail')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={getResolvedThumbnailUrl(thumbnailUrl)}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                        16:9 Display
                      </span>
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('गैलरी से फ़ोटो चुनें (PNG/JPG)', 'Choose Image from Device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="is_free" className="font-semibold text-slate-700">
                    {t('यह कोर्स निःशुल्क (Free) है', 'This is a Free Course')}
                  </label>
                </div>

                {!formData.is_free && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('मूल्य (₹)', 'Original Price (₹)')}
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('छूट मूल्य (₹)', 'Discounted Price (₹)')}
                      </label>
                      <input
                        type="number"
                        value={formData.discount_price}
                        onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('वैधता (दिन)', 'Validity (Days)')}
                  </label>
                  <input
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {t('कोर्स प्रकाशित करें', 'Publish Course')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {isEditModalOpen && editingCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('कोर्स संपादित करें (Edit Course)', 'Edit Course Details')}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCourse} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कोर्स का शीर्षक (English)', 'Course Title (English)')}
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कोर्स का शीर्षक (हिंदी)', 'Course Title (Hindi)')}
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title_hi}
                      onChange={(e) => setEditFormData({ ...editFormData, title_hi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('विवरण (English Description)', 'Description (English)')}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('विवरण (हिंदी Description)', 'Description (Hindi)')}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.description_hi}
                    onChange={(e) => setEditFormData({ ...editFormData, description_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Edit Thumbnail Upload from Device */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('नया थंबनेल अपलोड करें (Upload New Thumbnail)', 'Upload New Thumbnail')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={getResolvedThumbnailUrl(editThumbnailUrl)}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('डिवाइस से नई फ़ोटो चुनें (PNG/JPG)', 'Upload New Image from Device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit_is_free"
                    checked={editFormData.is_free}
                    onChange={(e) => setEditFormData({ ...editFormData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="edit_is_free" className="font-semibold text-slate-700">
                    {t('यह कोर्स निःशुल्क (Free) है', 'This is a Free Course')}
                  </label>
                </div>

                {!editFormData.is_free && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('मूल्य (₹)', 'Original Price (₹)')}
                      </label>
                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('छूट मूल्य (₹)', 'Discounted Price (₹)')}
                      </label>
                      <input
                        type="number"
                        value={editFormData.discount_price}
                        onChange={(e) => setEditFormData({ ...editFormData, discount_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('वैधता (दिन)', 'Validity (Days)')}
                  </label>
                  <input
                    type="number"
                    value={editFormData.validity_days}
                    onChange={(e) => setEditFormData({ ...editFormData, validity_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {t('परिवर्तन सहेजें', 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manual Subjects & Chapters Management Modal */}
        {curriculumCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">
                      {t('पाठ्यक्रम एवं विषय प्रबंधन (Manual Curriculum)', 'Manual Subjects & Chapters')}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                    {curriculumCourse.title}
                  </p>
                </div>
                <button
                  onClick={() => setCurriculumCourse(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid: Subjects on Left, Chapters on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Column 1: Subjects List & Add Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{t('कोर्स के विषय (Subjects)', 'Course Subjects')} ({courseSubjects.length})</span>
                    </span>
                  </div>

                  {/* Add Subject Form */}
                  <form onSubmit={handleAddSubject} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      required
                      placeholder="विषय का नाम (e.g. Mathematics, Science)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="हिंदी नाम (e.g. गणित, विज्ञान)"
                        value={newSubjectNameHi}
                        onChange={(e) => setNewSubjectNameHi(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>जोड़ें</span>
                      </button>
                    </div>
                  </form>

                  {/* Subjects Items */}
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-60 sm:max-h-72">
                    {courseSubjects.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <BookMarked className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <p>{t('कोई विषय नहीं जुड़ा है। ऊपर फ़ॉर्म से जोड़ें।', 'No subjects added yet. Add one above.')}</p>
                      </div>
                    ) : (
                      courseSubjects.map((sub) => {
                        const isSelected = selectedSubject?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleSelectSubject(sub)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold truncate">{sub.name}</p>
                              {sub.name_hi && sub.name_hi !== sub.name && (
                                <p className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {sub.name_hi}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubject(sub);
                                }}
                                title="Delete Subject"
                                className={`p-1 rounded hover:bg-rose-500 hover:text-white transition ${
                                  isSelected ? 'text-indigo-200' : 'text-slate-400'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Column 2: Chapters under Selected Subject */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1">
                      <FolderPlus className="w-4 h-4 text-emerald-600" />
                      <span>
                        {selectedSubject
                          ? `${selectedSubject.name} — ${t('पाठ/अध्याय (Chapters)', 'Chapters')} (${subjectChapters.length})`
                          : t('पाठ/अध्याय (Chapters)', 'Chapters')}
                      </span>
                    </span>
                  </div>

                  {!selectedSubject ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                      <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
                      <p>{t('बाएं से कोई विषय चुनें ताकि उसके पाठ जोड़ सकें।', 'Select a subject from the left to view and add chapters.')}</p>
                    </div>
                  ) : (
                    <>
                      {/* Add Chapter Form */}
                      <form onSubmit={handleAddChapter} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          required
                          placeholder="पाठ का शीर्षक (e.g. Ch 1: Real Numbers)"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="हिंदी शीर्षक (e.g. पाठ 1: वास्तविक संख्याएँ)"
                            value={newChapterTitleHi}
                            onChange={(e) => setNewChapterTitleHi(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>जोड़ें</span>
                          </button>
                        </div>
                      </form>

                      {/* Chapters Items */}
                      <div className="flex-1 overflow-y-auto space-y-2 max-h-60 sm:max-h-72">
                        {subjectChapters.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            <p>{t('इस विषय में अभी कोई पाठ नहीं है। नया पाठ जोड़ें।', 'No chapters added to this subject yet.')}</p>
                          </div>
                        ) : (
                          subjectChapters.map((chap, idx) => (
                            <div
                              key={chap.id}
                              className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs hover:border-emerald-300 transition"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-slate-800 truncate">
                                  {idx + 1}. {chap.title}
                                </p>
                                {chap.title_hi && chap.title_hi !== chap.title && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {chap.title_hi}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteChapter(chap)}
                                title="Delete Chapter"
                                className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setCurriculumCourse(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  {t('पूर्ण हुआ (Done)', 'Done')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
