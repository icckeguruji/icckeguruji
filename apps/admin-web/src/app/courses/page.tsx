'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { initialCourses } from '@/lib/sample-data';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import { Clock, Video, FileText, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { PublicEnrollmentModal } from '@/components/PublicEnrollmentModal';

export default function PublicCoursesPage() {
  const [boardFilter, setBoardFilter] = useState<'all' | 'BSEB' | 'JAC'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const { lang, t } = useLanguage();

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const filtered = initialCourses.filter((c) => {
    if (boardFilter === 'all') return true;
    // board_id ...0001 = BSEB (B-3 class10, B-4 class9); board_id ...0002 = JAC (B-1 class8, B-2 class7)
    // B-3 and B-4 cover BSEB+JAC both; B-1 and B-2 are JAC-only
    const bsebIds = ['batch-b3-class10', 'batch-b4-class9'];
    if (boardFilter === 'BSEB') return bsebIds.includes(c.id);
    if (boardFilter === 'JAC') return !bsebIds.includes(c.id); // JAC-only batches
    return true;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          {t('पाठ्यक्रम एवं शुल्क संरचना', 'Courses & Fee Structure')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t(
            'बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC) मैट्रिक एवं इंटरमीडिएट के विशेष बैच',
            'Target batches specialized for Bihar and Jharkhand state board matric and intermediate exams'
          )}
        </p>
      </div>

      {/* Board Filter Tabs */}
      <div className="flex justify-center space-x-3">
        {[
          { id: 'all', labelHi: 'सभी पाठ्यक्रम', labelEn: 'All Courses' },
          { id: 'BSEB', labelHi: 'बिहार बोर्ड (BSEB)', labelEn: 'Bihar Board (BSEB)' },
          { id: 'JAC', labelHi: 'झारखंड बोर्ड (JAC)', labelEn: 'Jharkhand Board (JAC)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBoardFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              boardFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t(tab.labelHi, tab.labelEn)}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-900/90 text-white text-xs font-bold backdrop-blur-sm border border-slate-700">
                  {['batch-b3-class10', 'batch-b4-class9'].includes(course.id)
                    ? t('BSEB + JAC', 'BSEB + JAC')
                    : t('JAC रांची', 'JAC Ranchi')}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-black shadow-xs">
                  {course.is_free ? (lang === 'hi' ? 'निःशुल्क' : 'FREE') : formatINR(course.discount_price || course.price)}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {lang === 'hi' ? course.title_hi || course.title : course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {lang === 'hi' ? course.description_hi || course.description : course.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {course.validity_days} {t('दिन', 'Days')}
                  </span>
                  <span className="flex items-center">
                    <Video className="w-3.5 h-3.5 mr-1 text-red-500" />
                    {course.lecture_count || 45}+ {t('वीडियो', 'Videos')}
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    {course.material_count || 24}+ {t('पीडीएफ', 'PDFs')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleEnrollClick(course)}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-98"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{t('कोर्स में प्रवेश लें', 'Enroll Now')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic UPI Enrollment Modal */}
      <PublicEnrollmentModal
        course={selectedCourse}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
}
