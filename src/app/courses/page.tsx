'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminApi } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import { Clock, Video, FileText, ArrowRight, ShieldCheck, GraduationCap, BookOpen, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { PublicEnrollmentModal } from '@/components/PublicEnrollmentModal';

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const { lang, t } = useLanguage();

  const loadCourses = () => {
    AdminApi.getCourses().then((data) => {
      setCourses(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCourses();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('public-courses-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          loadCourses();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const filtered = courses.filter((c) => {
    if (classFilter === 'all') return true;
    const title = (c.title || '').toLowerCase();
    return title.includes(classFilter.toLowerCase());
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          {t('पाठ्यक्रम एवं शुल्क संरचना', 'Courses & Fee Structure')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t(
            'कक्षा 1 से 12वीं तक के सभी प्रमुख विषयों के विशेष एवं परिणामोन्मुखी पाठ्यक्रम',
            'Comprehensive target courses for Classes 1st to 12th designed for top academic scores'
          )}
        </p>
      </div>

      {/* Class Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { id: 'all', labelHi: 'सभी कक्षाएं', labelEn: 'All Classes' },
          { id: '10', labelHi: 'कक्षा 10वीं (Matric)', labelEn: 'Class 10th' },
          { id: '12', labelHi: 'कक्षा 12वीं (Inter)', labelEn: 'Class 12th' },
          { id: '11', labelHi: 'कक्षा 11वीं', labelEn: 'Class 11th' },
          { id: '9', labelHi: 'कक्षा 9वीं', labelEn: 'Class 9th' },
          { id: 'Foundation', labelHi: 'फाउंडेशन विंग', labelEn: 'Foundation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setClassFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              classFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t(tab.labelHi, tab.labelEn)}
          </button>
        ))}
      </div>

      {/* Courses Content */}
      {filtered.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-5 shadow-xs">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('सत्र 2026-27 के लिए नए पाठ्यक्रम शीघ्र उपलब्ध होंगे', 'New Courses for Session 2026-27 Coming Soon')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              {t(
                'पुराना डेटा हटा दिया गया है। नए सत्र 2026-27 के आधिकारिक ऑनलाइन एवं ऑफलाइन कोर्स की घोषणा जल्द की जाएगी। अग्रिम नामांकन एवं जानकारी के लिए नीचे संपर्क करें।',
                'Old batches have been cleared. Official course batches for Session 2026-27 will be announced shortly. Contact Director BADE SIR for admissions.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="tel:+919771350910"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <Phone className="w-4 h-4" />
              <span>{t('डायरेक्टर से संपर्क करें: 9771350910', 'Call Director: 9771350910')}</span>
            </a>
            <a
              href="https://wa.me/919771350910?text=Hello%20BADE%20SIR,%20I%20want%20admission%20details%20for%20new%20courses."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('व्हाट्सएप पर जानकारी लें', 'WhatsApp Enquiry')}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <img
                  src={course.thumbnail_url || '/logo.png'}
                  alt={course.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900/90 text-white text-xs font-bold backdrop-blur-sm border border-slate-700">
                    {t('सत्र 2026-27', 'Session 2026-27')}
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
                      {course.lecture_count || 0} {t('वीडियो', 'Videos')}
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      {course.material_count || 0} {t('पीडीएफ', 'PDFs')}
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
      )}

      {/* Dynamic UPI Enrollment Modal */}
      <PublicEnrollmentModal
        course={selectedCourse}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
}
