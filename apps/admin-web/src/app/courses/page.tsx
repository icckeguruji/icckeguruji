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
} from 'lucide-react';

export default function CoursesPage() {
  const { lang, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    AdminApi.getCourses().then((data) => setCourses(data));
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await AdminApi.createCourse({
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      description: formData.description,
      description_hi: formData.description_hi,
      is_free: formData.is_free,
      price: formData.is_free ? 0 : Number(formData.price),
      discount_price: formData.is_free ? 0 : Number(formData.discount_price),
      validity_days: Number(formData.validity_days),
      is_published: true,
    });
    setCourses((prev) => [created, ...prev]);
    setIsModalOpen(false);
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

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="कोर्स प्रबंधन"
        titleEn="Course Management"
        subtitleHi="बिहार एवं झारखंड बोर्ड के पाठ्यक्रम एवं शुल्क विन्यास"
        subtitleEn="Create and publish state board courses with pricing and validity"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल पाठ्यक्रम: ${courses.length}`, `Total Courses: ${courses.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('केवल बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC) समर्थित हैं', 'Strictly BSEB and JAC boards')}
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
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                    {course.title.includes('BSEB') || course.board_id?.includes('1') ? 'BSEB (बिहार)' : 'JAC (झारखंड)'}
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
              </div>
            </div>
          ))}
        </div>

        {/* Create Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('बोर्ड (Board)', 'Board')}
                    </label>
                    <select
                      value={formData.board_code}
                      onChange={(e) => setFormData({ ...formData, board_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="BSEB">बिहार बोर्ड (BSEB)</option>
                      <option value="JAC">झारखंड बोर्ड (JAC)</option>
                    </select>
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
                      <option value="Class 9">कक्षा 9</option>
                      <option value="Class 10">कक्षा 10</option>
                      <option value="Class 11">कक्षा 11 (विज्ञान)</option>
                      <option value="Class 12">कक्षा 12 (विज्ञान)</option>
                    </select>
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
      </div>
    </div>
  );
}
