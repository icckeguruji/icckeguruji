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

const CLASSES_LIST = [
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

export default function CoursesPage() {
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeClassFilter, setActiveClassFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Curriculum Management Modal State
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<CourseSubject | null>(null);
  const [subSubjects, setSubSubjects] = useState<any[]>([]);
  const [selectedSubSubject, setSelectedSubSubject] = useState<any | null>(null);
  const [subjectChapters, setSubjectChapters] = useState<SubjectChapter[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Chapter Content Inspector State
  const [activeChapterContent, setActiveChapterContent] = useState<SubjectChapter | null>(null);
  const [chapterLiveClasses, setChapterLiveClasses] = useState<any[]>([]);
  const [chapterRecordedLectures, setChapterRecordedLectures] = useState<any[]>([]);
  const [chapterStudyMaterials, setChapterStudyMaterials] = useState<any[]>([]);

  // Form states for adding subject / sub-subject / chapter / content
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectNameHi, setNewSubjectNameHi] = useState('');
  const [newSubSubjectName, setNewSubSubjectName] = useState('');
  const [newSubSubjectNameHi, setNewSubSubjectNameHi] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTitleHi, setNewChapterTitleHi] = useState('');
  const [contentFormTitle, setContentFormTitle] = useState('');
  const [contentFormUrl, setContentFormUrl] = useState('');

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

  const loadCourses = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const data = await AdminApi.getCourses();
      setCourses(data);
    } catch (e) {
      console.warn('loadCourses error:', e);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses(false);

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('admin-courses-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          loadCourses(true);
        })
        .subscribe();
    }

    // Active heartbeat polling every 5s when tab is visible for instant parity (SILENT)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadCourses(true);
      }
    }, 5000);

    const handleFocus = () => loadCourses(true);
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadCourses(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

  const getDerivedClassName = (course: Course) => {
    if ((course as any).class_name) return (course as any).class_name;
    const match = course.title.match(/Class\s*(\d+)/i) || (course.tagline ? course.tagline.match(/Class\s*(\d+)/i) : null);
    if (match) return `Class ${match[1]}`;
    return 'Class 10';
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const boardIdMap: Record<string, string> = {
      BSEB: 'b0000000-0000-0000-0000-000000000001',
      JAC: 'b0000000-0000-0000-0000-000000000002',
    };
    const classIdMap: Record<string, string> = {
      'Class 1': 'c0000000-0000-0000-0000-000000000001',
      'Class 2': 'c0000000-0000-0000-0000-000000000002',
      'Class 3': 'c0000000-0000-0000-0000-000000000003',
      'Class 4': 'c0000000-0000-0000-0000-000000000004',
      'Class 5': 'c0000000-0000-0000-0000-000000000005',
      'Class 6': 'c0000000-0000-0000-0000-000000000006',
      'Class 7': 'c0000000-0000-0000-0000-000000000007',
      'Class 8': 'c0000000-0000-0000-0000-000000000008',
      'Class 9': 'c0000000-0000-0000-0000-000000000009',
      'Class 10': 'c0000000-0000-0000-0000-000000000010',
      'Class 11': 'c0000000-0000-0000-0000-000000000011',
      'Class 12': 'c0000000-0000-0000-0000-000000000012',
    };

    const board_id = boardIdMap[formData.board_code] || 'b0000000-0000-0000-0000-000000000001';
    const class_id = classIdMap[formData.class_name] || 'c0000000-0000-0000-0000-000000000010';

    try {
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
      alert('Success: Course created and saved to cloud database successfully!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to save course to cloud database. Please try again.'));
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditThumbnailUrl(course.thumbnail_url || '/thumbnails/batch-b3-class10.jpg');
    setEditFormData({
      title: course.title,
      title_hi: course.title_hi || course.title,
      board_code: course.title.includes('JAC') || course.board_id?.includes('2') ? 'JAC' : 'BSEB',
      class_name: getDerivedClassName(course),
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

    const boardIdMap: Record<string, string> = {
      BSEB: 'b0000000-0000-0000-0000-000000000001',
      JAC: 'b0000000-0000-0000-0000-000000000002',
    };
    const classIdMap: Record<string, string> = {
      'Class 1': 'c0000000-0000-0000-0000-000000000001',
      'Class 2': 'c0000000-0000-0000-0000-000000000002',
      'Class 3': 'c0000000-0000-0000-0000-000000000003',
      'Class 4': 'c0000000-0000-0000-0000-000000000004',
      'Class 5': 'c0000000-0000-0000-0000-000000000005',
      'Class 6': 'c0000000-0000-0000-0000-000000000006',
      'Class 7': 'c0000000-0000-0000-0000-000000000007',
      'Class 8': 'c0000000-0000-0000-0000-000000000008',
      'Class 9': 'c0000000-0000-0000-0000-000000000009',
      'Class 10': 'c0000000-0000-0000-0000-000000000010',
      'Class 11': 'c0000000-0000-0000-0000-000000000011',
      'Class 12': 'c0000000-0000-0000-0000-000000000012',
    };

    const board_id = boardIdMap[editFormData.board_code] || 'b0000000-0000-0000-0000-000000000001';
    const class_id = classIdMap[editFormData.class_name] || 'c0000000-0000-0000-0000-000000000010';

    try {
      const updated = await AdminApi.updateCourse(editingCourse.id, {
        title: editFormData.title,
        title_hi: editFormData.title_hi,
        description: editFormData.description,
        description_hi: editFormData.description_hi,
        thumbnail_url: editThumbnailUrl,
        board_id,
        class_id,
        class_name: editFormData.class_name,
        is_free: editFormData.is_free,
        price: editFormData.is_free ? 0 : Number(editFormData.price),
        discount_price: editFormData.is_free ? 0 : Number(editFormData.discount_price),
        validity_days: Number(editFormData.validity_days),
      });

      if (updated) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? {
                  ...c,
                  ...updated,
                  class_name: editFormData.class_name,
                  board_id,
                  class_id,
                  thumbnail_url: editThumbnailUrl,
                }
              : c
          )
        );
      }
      setIsEditModalOpen(false);
      setEditingCourse(null);
      alert('Success: Course updated and saved to cloud database successfully!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to update course in cloud database.'));
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the course:\n"${course.title}"?\n\nThis will permanently remove it from the catalog and database.`
    );
    if (!confirmed) return;

    try {
      await AdminApi.deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      alert('Success: Course permanently removed from cloud database.');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to delete course from database.'));
    }
  };

  // --- Curriculum Management Logic ---
  const openCurriculumModal = async (course: Course) => {
    setCurriculumCourse(course);
    setSelectedSubject(null);
    setSelectedSubSubject(null);
    setSubSubjects([]);
    setSubjectChapters([]);
    setActiveChapterContent(null);
    setLoadingCurriculum(true);
    const subs = await AdminApi.getCourseSubjects(course.id);
    setCourseSubjects(subs);
    setLoadingCurriculum(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !newSubjectName.trim()) return;

    try {
      const created = await AdminApi.createCourseSubject(curriculumCourse.id, {
        name: newSubjectName.trim(),
        name_hi: newSubjectNameHi.trim() || newSubjectName.trim(),
      });
      setCourseSubjects((prev) => [...prev, created]);
      setNewSubjectName('');
      setNewSubjectNameHi('');
      alert('Success: Subject added and saved to cloud database!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to save subject to database.'));
    }
  };

  const handleDeleteSubject = async (sub: CourseSubject) => {
    if (!curriculumCourse) return;
    const confirm = window.confirm(`Delete subject "${sub.name}" from this course?`);
    if (!confirm) return;

    try {
      await AdminApi.deleteCourseSubject(curriculumCourse.id, sub.id);
      setCourseSubjects((prev) => prev.filter((s) => s.id !== sub.id));
      if (selectedSubject?.id === sub.id) {
        setSelectedSubject(null);
        setSelectedSubSubject(null);
        setSubSubjects([]);
        setSubjectChapters([]);
        setActiveChapterContent(null);
      }
      alert('Success: Subject deleted from database.');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to delete subject from database.'));
    }
  };

  const handleSelectSubject = async (sub: CourseSubject) => {
    setSelectedSubject(sub);
    setSelectedSubSubject(null);
    setActiveChapterContent(null);
    const [subSubs, chaps] = await Promise.all([
      AdminApi.getSubSubjects(sub.id),
      AdminApi.getSubjectChapters(sub.id),
    ]);
    setSubSubjects(subSubs);
    setSubjectChapters(chaps);
  };

  const handleAddSubSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !newSubSubjectName.trim()) return;
    const created = await AdminApi.createSubSubject(selectedSubject.id, {
      name: newSubSubjectName.trim(),
      name_hi: newSubSubjectNameHi.trim() || newSubSubjectName.trim(),
    });
    setSubSubjects((prev) => [...prev, created]);
    setNewSubSubjectName('');
    setNewSubSubjectNameHi('');
  };

  const handleDeleteSubSubject = async (subSub: any) => {
    if (!selectedSubject) return;
    const confirm = window.confirm(`Delete sub-subject/unit "${subSub.name}"?`);
    if (!confirm) return;
    await AdminApi.deleteSubSubject(selectedSubject.id, subSub.id);
    setSubSubjects((prev) => prev.filter((s) => s.id !== subSub.id));
    if (selectedSubSubject?.id === subSub.id) {
      setSelectedSubSubject(null);
    }
  };

  const handleSelectSubSubject = async (subSub: any | null) => {
    if (!selectedSubject) return;
    setSelectedSubSubject(subSub);
    setActiveChapterContent(null);
    const chaps = await AdminApi.getSubjectChapters(selectedSubject.id, subSub?.id);
    setSubjectChapters(chaps);
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !selectedSubject || !newChapterTitle.trim()) return;

    try {
      const created = await AdminApi.createSubjectChapter(
        selectedSubject.id,
        curriculumCourse.id,
        {
          title: newChapterTitle.trim(),
          title_hi: newChapterTitleHi.trim() || newChapterTitle.trim(),
          chapter_number: subjectChapters.length + 1,
          sub_subject_id: selectedSubSubject?.id,
        }
      );
      setSubjectChapters((prev) => [...prev, created]);
      setNewChapterTitle('');
      setNewChapterTitleHi('');
      alert('Success: Chapter created and saved to cloud database!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to save chapter to database.'));
    }
  };

  const handleDeleteChapter = async (chap: SubjectChapter) => {
    if (!selectedSubject) return;
    const confirm = window.confirm(`Delete chapter "${chap.title}"?`);
    if (!confirm) return;

    try {
      await AdminApi.deleteSubjectChapter(selectedSubject.id, chap.id);
      setSubjectChapters((prev) => prev.filter((c) => c.id !== chap.id));
      if (activeChapterContent?.id === chap.id) {
        setActiveChapterContent(null);
      }
      alert('Success: Chapter deleted from database.');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to delete chapter from database.'));
    }
  };

  const handleOpenChapterContent = async (chap: SubjectChapter) => {
    setActiveChapterContent(chap);
    const [lives, vids, mats] = await Promise.all([
      AdminApi.getChapterLiveClasses(chap.id),
      AdminApi.getChapterRecordedLectures(chap.id),
      AdminApi.getChapterStudyMaterials(chap.id),
    ]);
    setChapterLiveClasses(lives);
    setChapterRecordedLectures(vids);
    setChapterStudyMaterials(mats);
  };

  const handleAddChapterLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !activeChapterContent || !contentFormTitle.trim()) return;
    const cleanVid = contentFormUrl.includes('v=')
      ? contentFormUrl.split('v=')[1]?.split('&')[0]
      : contentFormUrl.includes('youtu.be/')
      ? contentFormUrl.split('youtu.be/')[1]?.split('?')[0]
      : contentFormUrl || 'jfKfPfyJRdk';

    const created = await AdminApi.createLiveClass({
      course_id: curriculumCourse.id,
      title: contentFormTitle.trim(),
      youtube_video_id: cleanVid,
      status: 'live',
      duration_minutes: 60,
    } as any);
    (created as any).chapter_id = activeChapterContent.id;
    setChapterLiveClasses((prev) => [created, ...prev]);
    setContentFormTitle('');
    setContentFormUrl('');
  };

  const handleAddChapterVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourse || !selectedSubject || !activeChapterContent || !contentFormTitle.trim()) return;
    const cleanVid = contentFormUrl.includes('v=')
      ? contentFormUrl.split('v=')[1]?.split('&')[0]
      : contentFormUrl.includes('youtu.be/')
      ? contentFormUrl.split('youtu.be/')[1]?.split('?')[0]
      : contentFormUrl || 'jfKfPfyJRdk';

    const created = await AdminApi.createRecordedLecture({
      course_id: curriculumCourse.id,
      subject_id: selectedSubject.id,
      chapter_id: activeChapterContent.id,
      title: contentFormTitle.trim(),
      youtube_video_id: cleanVid,
      duration_minutes: 45,
    });
    setChapterRecordedLectures((prev) => [created, ...prev]);
    setContentFormTitle('');
    setContentFormUrl('');
  };

  const filteredCourses = courses.filter((c) => {
    if (activeClassFilter === 'ALL') return true;
    const derivedClass = getDerivedClassName(c);
    if (derivedClass.toLowerCase() === activeClassFilter.toLowerCase()) return true;
    const pattern = new RegExp(`\\b${activeClassFilter}\\b`, 'i');
    return pattern.test(c.title) || (c.tagline ? pattern.test(c.tagline) : false);
  });

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
              onClick={() => loadCourses(false)}
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

        {/* Class Filter Bar (Parity with Mobile App) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {['ALL', ...CLASSES_LIST].map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClassFilter(cls)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeClassFilter === cls
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cls === 'ALL' ? t('सभी कक्षाएं (ALL)', 'ALL Classes') : cls}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {activeClassFilter === 'ALL'
                ? t('अभी कोई कोर्स नहीं है', 'No courses in database')
                : t(`${activeClassFilter} में अभी कोई कोर्स नहीं है`, `No courses found in ${activeClassFilter}`)}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {t('ऊपर "+ नया कोर्स जोड़ें" बटन दबाकर या मोबाइल ऐप से नया कोर्स जोड़ें।', 'Create your first course with "+ Add New Course" or from the mobile app.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => {
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
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                      {getDerivedClassName(course)}
                    </span>
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
        )}

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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स का शीर्षक (Course Title)', 'Course Title')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Class 10th Board Exam Complete Batch"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
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
                    {CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स का विवरण (Description)', 'Description')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive target batch with daily live classes, complete NCERT solutions, and handwritten notes..."
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स का शीर्षक (Course Title)', 'Course Title')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('बोर्ड (Board)', 'Board')}
                    </label>
                    <select
                      value={editFormData.board_code}
                      onChange={(e) => setEditFormData({ ...editFormData, board_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="BSEB">BSEB (Bihar Board)</option>
                      <option value="JAC">JAC (Jharkhand Board)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कक्षा (Class)', 'Class')}
                    </label>
                    <select
                      value={editFormData.class_name}
                      onChange={(e) => setEditFormData({ ...editFormData, class_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {CLASSES_LIST.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स का विवरण (Description)', 'Description')}
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
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

        {/* Dynamic Educational Content Hierarchy & Curriculum Management Modal */}
        {curriculumCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">
                      Dynamic Educational Content Hierarchy & Curriculum
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
                    Course: <strong className="text-slate-800">{curriculumCourse.title}</strong> • Hierarchy: Course → Subject → Sub-Subject → Chapter → (Live, Videos, Notes)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurriculumCourse(null);
                    setActiveChapterContent(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3-Column Hierarchy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {/* Column 1: Subjects */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>1. Subjects ({courseSubjects.length})</span>
                    </span>
                  </div>

                  {/* Add Subject Form */}
                  <form onSubmit={handleAddSubject} className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      required
                      placeholder="Subject Name (e.g. Science)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        placeholder="Alternative Label (Optional)"
                        value={newSubjectNameHi}
                        onChange={(e) => setNewSubjectNameHi(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </form>

                  {/* Subjects Items */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56">
                    {courseSubjects.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <BookMarked className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <p>No subjects added yet. Add one above.</p>
                      </div>
                    ) : (
                      courseSubjects.map((sub) => {
                        const isSelected = selectedSubject?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleSelectSubject(sub)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
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

                {/* Column 2: Sub-Subjects / Subject Units */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>2. Sub-Subjects / Units ({subSubjects.length})</span>
                    </span>
                  </div>

                  {!selectedSubject ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                      <p>Select a subject from left to manage units (e.g. Physics, Chemistry, Biology).</p>
                    </div>
                  ) : (
                    <>
                      {/* Add Sub-Subject Form */}
                      <form onSubmit={handleAddSubSubject} className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          required
                          placeholder="Sub-Subject (e.g. Physics)"
                          value={newSubSubjectName}
                          onChange={(e) => setNewSubSubjectName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                        <div className="flex space-x-1.5">
                          <input
                            type="text"
                            placeholder="Alternative Label (Optional)"
                            value={newSubSubjectNameHi}
                            onChange={(e) => setNewSubSubjectNameHi(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </form>

                      {/* Sub-Subject Items */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56">
                        <div
                          onClick={() => handleSelectSubSubject(null)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer transition ${
                            selectedSubSubject === null
                              ? 'bg-purple-600 text-white border-purple-700 font-bold'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          All Chapters (Direct Subject Scope)
                        </div>
                        {subSubjects.map((subSub) => {
                          const isSel = selectedSubSubject?.id === subSub.id;
                          return (
                            <div
                              key={subSub.id}
                              onClick={() => handleSelectSubSubject(subSub)}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                                isSel
                                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <p className="font-bold truncate">{subSub.name}</p>
                                {subSub.name_hi && subSub.name_hi !== subSub.name && (
                                  <p className={`text-[10px] ${isSel ? 'text-purple-200' : 'text-slate-400'}`}>
                                    {subSub.name_hi}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubSubject(subSub);
                                }}
                                className={`p-1 rounded hover:bg-rose-500 hover:text-white transition ${
                                  isSel ? 'text-purple-200' : 'text-slate-400'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Column 3: Chapters under Selected Scope */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                      <FolderPlus className="w-4 h-4 text-emerald-600" />
                      <span>3. Chapters ({subjectChapters.length})</span>
                    </span>
                  </div>

                  {!selectedSubject ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                      <p>Select a subject and unit to view or add chapters.</p>
                    </div>
                  ) : (
                    <>
                      {/* Add Chapter Form */}
                      <form onSubmit={handleAddChapter} className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          required
                          placeholder="Chapter Title (e.g. Ch 1: Real Numbers)"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Chapter</span>
                        </button>
                      </form>

                      {/* Chapters Items */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56">
                        {subjectChapters.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            <p>No chapters added to this unit yet.</p>
                          </div>
                        ) : (
                          subjectChapters.map((chap, idx) => {
                            const isInspecting = activeChapterContent?.id === chap.id;
                            return (
                              <div
                                key={chap.id}
                                onClick={() => handleOpenChapterContent(chap)}
                                className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                                  isInspecting
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="min-w-0 pr-1">
                                  <p className="font-bold truncate">
                                    {idx + 1}. {chap.title}
                                  </p>
                                  {chap.title_hi && chap.title_hi !== chap.title && (
                                    <p className={`text-[10px] ${isInspecting ? 'text-emerald-200' : 'text-slate-400'} truncate`}>
                                      {chap.title_hi}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChapter(chap);
                                    }}
                                    title="Delete Chapter"
                                    className={`p-1 rounded hover:bg-rose-500 hover:text-white transition ${
                                      isInspecting ? 'text-emerald-200' : 'text-slate-400'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <ChevronRight className={`w-4 h-4 ${isInspecting ? 'text-white' : 'text-slate-400'}`} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Chapter Content Inspector (Live Classes, Recorded Videos, PDF Notes) */}
              {activeChapterContent && (
                <div className="border border-emerald-300 bg-emerald-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="font-bold text-xs text-emerald-900 flex items-center space-x-1.5">
                      <FolderPlus className="w-4 h-4 text-emerald-700" />
                      <span>Chapter Content: {activeChapterContent.title}</span>
                    </span>
                    <button
                      onClick={() => setActiveChapterContent(null)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      Close Inspector ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Live Classes */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <span className="font-bold text-slate-800 flex items-center space-x-1 mb-2">
                        <Video className="w-3.5 h-3.5 text-rose-600" />
                        <span>Live Classes ({chapterLiveClasses.length})</span>
                      </span>
                      <form onSubmit={handleAddChapterLiveClass} className="space-y-1 mb-2">
                        <input
                          type="text"
                          required
                          placeholder="Live Title"
                          value={contentFormTitle}
                          onChange={(e) => setContentFormTitle(e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded"
                        />
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            placeholder="YouTube ID/Link"
                            value={contentFormUrl}
                            onChange={(e) => setContentFormUrl(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                          />
                          <button type="submit" className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-semibold">
                            + Live
                          </button>
                        </div>
                      </form>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {chapterLiveClasses.map((l: any) => (
                          <div key={l.id} className="p-1.5 bg-slate-50 rounded border text-[11px] truncate">
                            {l.title} ({l.status})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recorded Videos */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <span className="font-bold text-slate-800 flex items-center space-x-1 mb-2">
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recorded Videos ({chapterRecordedLectures.length})</span>
                      </span>
                      <form onSubmit={handleAddChapterVideo} className="space-y-1 mb-2">
                        <input
                          type="text"
                          required
                          placeholder="Lecture Title"
                          value={contentFormTitle}
                          onChange={(e) => setContentFormTitle(e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded"
                        />
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            placeholder="YouTube Video ID"
                            value={contentFormUrl}
                            onChange={(e) => setContentFormUrl(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                          />
                          <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                            + Video
                          </button>
                        </div>
                      </form>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {chapterRecordedLectures.map((v: any) => (
                          <div key={v.id} className="p-1.5 bg-slate-50 rounded border text-[11px] truncate">
                            {v.title}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Study Materials */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <span className="font-bold text-slate-800 flex items-center space-x-1 mb-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Study Materials ({chapterStudyMaterials.length})</span>
                      </span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {chapterStudyMaterials.length === 0 ? (
                          <p className="text-[11px] text-slate-400">No PDF notes attached yet.</p>
                        ) : (
                          chapterStudyMaterials.map((m: any) => (
                            <div key={m.id} className="p-1.5 bg-slate-50 rounded border text-[11px] truncate">
                              📄 {m.title}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setCurriculumCourse(null);
                    setActiveChapterContent(null);
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
