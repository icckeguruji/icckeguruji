'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
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
  Eye,
  Tag,
  Edit3,
  Trash2,
  Upload,
} from 'lucide-react';

export default function CoursesPage() {
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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

  const loadCourses = () => {
    AdminApi.getCourses().then((data) => setCourses(data));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (isEdit) {
            setEditThumbnailUrl(event.target.result as string);
          } else {
            setThumbnailUrl(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
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
      is_published: true,
    });
    setCourses((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setIsModalOpen(false);
    setThumbnailUrl('/logo.png');
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

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="कोर्स प्रबंधन"
        titleEn="Course Management"
        subtitleHi="संस्थान के पाठ्यक्रम एवं शुल्क विन्यास"
        subtitleEn="Create, edit and manage courses with real-time database sync"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल पाठ्यक्रम: ${courses.length}`, `Total Courses: ${courses.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('कक्षा 1 से 12वीं एवं प्रतियोगी फाउंडेशन पाठ्यक्रम', 'Classes 1st to 12th & Foundation Courses')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नया कोर्स जोड़ें', 'Add New Course')}</span>
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img
                  src={course.thumbnail_url || '/thumbnails/batch-b3-class10.jpg'}
                  alt={course.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
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
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-sm transition shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    title="Delete Course"
                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-sm transition shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {lang === 'hi' ? course.title_hi || course.title : course.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lang === 'hi' ? course.description_hi || course.description : course.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.validity_days} {t('दिन वैधता', 'days')}
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-purple-500" />
                    {course.material_count || 12} {t('पीडीएफ', 'PDFs')}
                  </span>
                  <span className="flex items-center">
                    <Video className="w-3.5 h-3.5 mr-1 text-red-500" />
                    {course.lecture_count || 45} {t('वीडियो', 'Videos')}
                  </span>
                </div>

                {/* Card Action Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(course)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('संशोधित करें', 'Edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('हटाएं', 'Delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('नया कोर्स बनाएं (Create Course)', 'Create New Course')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
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
                      placeholder="e.g. BSEB Class 10 Toppers Batch 2026-27"
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
                      placeholder="उदा. बिहार बोर्ड कक्षा 10 टॉपर बैच"
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

                {/* Course Thumbnail Upload (16:9 Uncropped Preview) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कोर्स थंबनेल अपलोड करें (Course Thumbnail 16:9)', 'Upload Course Thumbnail (16:9)')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                        16:9 Complete Display
                      </span>
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('डिवाइस से फ़ोटो चुनें (PNG/JPG)', 'Upload from Device (PNG/JPG)')}</span>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('कोर्स संपादित करें (Edit Course)', 'Edit Course Details')}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
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
                    {t('नया थंबनेल अपलोड करें (Upload New Thumbnail)', 'Upload New Thumbnail (16:9)')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={editThumbnailUrl}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                        16:9 Uncropped Preview
                      </span>
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
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
      </div>
    </div>
  );
}
