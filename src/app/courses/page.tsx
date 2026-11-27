'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminApi, getResolvedThumbnailUrl } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  Clock,
  Video,
  FileText,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Phone,
  MessageCircle,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { PublicEnrollmentModal } from '@/components/PublicEnrollmentModal';

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Syllabus Modal State
  const [syllabusCourse, setSyllabusCourse] = useState<Course | null>(null);
  const [syllabusData, setSyllabusData] = useState<any[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  const { lang, t } = useLanguage();

  const loadCourses = () => {
    AdminApi.getCourses().then((data) => {
      setCourses(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCourses();

    let channel: any = null;
    if (isSupabaseConfigured) {
      // Single multiplexed Realtime channel (saves 80% Supabase connections on free tier)
      channel = supabase
        .channel('public-courses-live-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, loadCourses)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, loadCourses)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, loadCourses)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'recorded_lectures' }, loadCourses)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, loadCourses)
        .subscribe();
    }

    let lastFetch = Date.now();
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && Date.now() - lastFetch > 20000) {
        lastFetch = Date.now();
        loadCourses();
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const handleOpenSyllabus = async (course: Course) => {
    setSyllabusCourse(course);
    setLoadingSyllabus(true);
    try {
      const curriculum = await AdminApi.getCourseCurriculumWithCounts(course.id);
      setSyllabusData(curriculum);
    } catch {
      setSyllabusData([]);
    } finally {
      setLoadingSyllabus(false);
    }
  };

  const filtered = courses.filter((c) => {
    if (classFilter === 'all') return true;
    const title = ((c.title || '') + ' ' + (c.class_name || '')).toLowerCase();
    return title.includes(classFilter.toLowerCase());
  });

  return (
    <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('सत्र 2026-27 आधिकारिक पाठ्यक्रम', 'Official Curriculum Session 2026-27')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('पाठ्यक्रम एवं शुल्क संरचना', 'Courses & Fee Structure')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t(
            'कक्षा 1 से 12वीं तक के सभी प्रमुख विषयों के परिणामोन्मुखी पाठ्यक्रम • लाइव कक्षाएं, रिकॉर्डेड वीडियो एवं हस्तलिखित नोट्स।',
            'Comprehensive target courses for Classes 1st to 12th • Daily live classes, recorded HD lectures & handwritten notes.'
          )}
        </p>
      </div>

      {/* Class Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { id: 'all', labelHi: 'सभी पाठ्यक्रम (All)', labelEn: 'All Classes' },
          { id: '10', labelHi: 'कक्षा 10वीं (Matric)', labelEn: 'Class 10th' },
          { id: '12', labelHi: 'कक्षा 12वीं (Inter)', labelEn: 'Class 12th' },
          { id: '11', labelHi: 'कक्षा 11वीं (Science)', labelEn: 'Class 11th' },
          { id: '9', labelHi: 'कक्षा 9वीं (Foundation)', labelEn: 'Class 9th' },
          { id: 'Foundation', labelHi: 'फाउंडेशन (1st to 8th)', labelEn: 'Foundation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setClassFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              classFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
                'Official course batches for Session 2026-27 will be announced shortly. Contact Director BADE SIR for admissions.'
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
          {filtered.map((course) => {
            const courseTitle = lang === 'hi' ? course.title_hi || course.title : course.title;
            const courseDesc = lang === 'hi' ? course.description_hi || course.description : course.description;
            const thumbUrl = getResolvedThumbnailUrl(course.thumbnail_url, course.title);

            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Thumbnail & Badges */}
                <div className="h-52 bg-slate-950 relative overflow-hidden flex items-center justify-center group">
                  <img
                    src={thumbUrl}
                    alt={course.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold backdrop-blur-sm border border-slate-700">
                      {course.class_name || t('सत्र 2026-27', 'Session 2026-27')}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-xs">
                      {course.is_free ? (lang === 'hi' ? 'निःशुल्क' : 'FREE') : formatINR(course.discount_price || course.price)}
                    </span>
                  </div>
                  {course.discount_price && course.price > course.discount_price && (
                    <div className="absolute bottom-3 right-3 bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-xs line-through">
                      {formatINR(course.price)}
                    </div>
                  )}
                </div>

                {/* Course Details Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                      {courseTitle}
                    </h3>
                    {course.tagline && (
                      <p className="text-[11px] font-semibold text-blue-600 line-clamp-1">
                        ✨ {course.tagline}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {courseDesc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-slate-50 rounded-xl text-slate-600 text-xs">
                      <div>
                        <span className="block font-black text-slate-800">{course.validity_days || 365}</span>
                        <span className="text-[10px] text-slate-500">{t('दिन वैधता', 'Days')}</span>
                      </div>
                      <div>
                        <span className="block font-black text-blue-600">{course.lecture_count || 12}+</span>
                        <span className="text-[10px] text-slate-500">{t('वीडियो', 'Videos')}</span>
                      </div>
                      <div>
                        <span className="block font-black text-emerald-600">{course.material_count || 20}+</span>
                        <span className="text-[10px] text-slate-500">{t('पीडीएफ', 'PDFs')}</span>
                      </div>
                    </div>

                    {/* Action 1: View Curriculum Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSyllabus(course)}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>{t('पाठ्यक्रम एवं विषय देखें', 'View Syllabus & Chapters')}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Action 2: Enroll Button */}
                    <button
                      type="button"
                      onClick={() => handleEnrollClick(course)}
                      className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition active:scale-98"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{t('कोर्स में प्रवेश लें (Enroll Now)', 'Enroll in Course')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SYLLABUS & CHAPTERS MODAL */}
      {syllabusCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'hi' ? syllabusCourse.title_hi || syllabusCourse.title : syllabusCourse.title}
                </h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  {t('कोर्स पाठ्यक्रम एवं विषय सूची (Course Curriculum)', 'Course Curriculum & Chapters')}
                </p>
              </div>
              <button
                onClick={() => setSyllabusCourse(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingSyllabus ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  {t('पाठ्यक्रम लोड हो रहा है...', 'Loading course curriculum...')}
                </div>
              ) : syllabusData.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-slate-500">
                  <BookOpen className="w-10 h-10 mx-auto text-blue-500" />
                  <p className="font-bold text-slate-700 text-sm">
                    {t('डायरेक्टर बड़े सर द्वारा पाठ्यक्रम अपडेट किया जा रहा है।', 'Curriculum is being updated by Director BADE SIR.')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t('सभी विषयों के मुख्य अध्याय शीघ्र लाइव दिखेंगे।', 'All core subject chapters will be available shortly.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syllabusData.map((subj, sIdx) => (
                    <div key={subj.id || sIdx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {sIdx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{subj.name}</h4>
                            {subj.name_hi && subj.name_hi !== subj.name && (
                              <p className="text-[11px] text-slate-500">{subj.name_hi}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                          {subj.chapterCount || subj.chapters?.length || 0} {t('अध्याय', 'Chapters')}
                        </span>
                      </div>

                      {subj.chapters && subj.chapters.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                          {subj.chapters.map((ch: any, cIdx: number) => (
                            <div key={ch.id || cIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {ch.chapter_number || cIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 truncate">{ch.title}</p>
                                {ch.title_hi && ch.title_hi !== ch.title && (
                                  <p className="text-[10px] text-slate-500 truncate">{ch.title_hi}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {t('अध्याय शीघ्र जोड़े जा रहे हैं...', 'Chapters being curated...')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">
                {syllabusCourse.is_free ? t('निःशुल्क बैच', 'Free Batch') : formatINR(syllabusCourse.discount_price || syllabusCourse.price)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const target = syllabusCourse;
                  setSyllabusCourse(null);
                  handleEnrollClick(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{t('कोर्स में प्रवेश लें', 'Enroll in Course')}</span>
              </button>
            </div>
          </div>
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
