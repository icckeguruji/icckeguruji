'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Award,
  Video,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { initialCourses } from '@/lib/sample-data';
import { formatINR } from '@icc/shared-utils';
import { useLanguage } from '@/components/LanguageContext';

export default function PublicHomePage() {
  const { lang, t } = useLanguage();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <span>
                {t(
                  'बिहार बोर्ड एवं झारखंड बोर्ड विशेष सत्र 2026-27',
                  'Bihar & Jharkhand State Board Target Batch 2026-27'
                )}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight sm:leading-tight tracking-tight">
              {lang === 'hi' ? (
                <>
                  बोर्ड परीक्षा में <span className="text-blue-600">शीर्ष स्थान</span> प्राप्त करने का विश्वसनीय संस्थान
                </>
              ) : (
                <>
                  Your Trusted Pathway to <span className="text-blue-600">Top Ranks</span> in State Board Exams
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {t(
                'आइडियल कोचिंग सेंटर के साथ घर बैठे करें कक्षा 9वीं से 12वीं की संपूर्ण एवं व्यवस्थित तैयारी। दैनिक लाइव कक्षाएं, हस्तलिखित नोट्स, एवं मॉक टेस्ट।',
                'Comprehensive online coaching for Classes 9 through 12. Learn from expert faculty with daily live lectures, handwritten chapter notes, and weekly mock exams.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/download-app"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition w-full sm:w-auto justify-center"
              >
                <Smartphone className="w-5 h-5" />
                <span>{t('एंड्रॉयड ऐप डाउनलोड करें', 'Download Android App')}</span>
              </Link>
              <Link
                href="/courses"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm transition w-full sm:w-auto justify-center"
              >
                <span>{t('पाठ्यक्रम देखें', 'Explore Courses')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('निःशुल्क आधार बैच उपलब्ध', 'Free Foundation Batches')}
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('सुरक्षित ईमेल ओटीपी लॉगिन', 'Secure Email OTP Login')}
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('ऑफलाइन पीडीएफ डाउनलोड', 'Offline PDF Downloads')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('आइडियल कोचिंग सेंटर ही क्यों चुनें?', 'Why Choose Ideal Coaching Centre?')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {t(
              'बिहार और झारखंड के राज्य बोर्ड पैटर्न के पूर्णतः अनुकूल शिक्षा प्रणाली',
              'Tailored specifically to the official curriculum of Bihar (BSEB) and Jharkhand (JAC) boards'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('यूट्यूब लाइव एवं रिकॉर्डेड कक्षाएं', 'Live & Recorded Video Classes')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'असीमित उच्च गति पर बिना किसी रुकावट के लाइव कक्षाएं। यदि क्लास छूट जाए, तो कभी भी रिकॉर्डेड वीडियो देखें।',
                'Fast and smooth streaming on low-bandwidth connections. Catch missed classes anytime with high-quality recorded archives.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('हस्तलिखित टॉपर नोट्स', 'Handwritten Topper Notes')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'राज्य टॉपर छात्रों एवं अनुभवी शिक्षकों द्वारा तैयार अध्यायवार संक्षिप्त नोट्स, फॉर्मूला शीट और 10 वर्षीय हल प्रश्न पत्र।',
                'Comprehensive chapter-wise formula sheets, revision summaries, and past 10 years board paper solutions prepared by senior teachers.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('साप्ताहिक ऑनलाइन परीक्षा', 'Weekly Online Mock Exams')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'बोर्ड परीक्षा के सटीक वस्तुनिष्ठ पैटर्न पर आधारित समयबद्ध टेस्ट, निगेटिव मार्किंग और विस्तृत समाधान सहित स्कोरकार्ड।',
                'Real exam simulation with timed MCQ questions, server-evaluated accuracy scoring, and bilingual detailed answer explanations.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('लोकप्रिय पाठ्यक्रम', 'Featured Courses')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t(
                'BSEB एवं JAC बोर्ड के लिए विशेष रूप से तैयार किए गए बैच',
                'Target batches specialized for Bihar and Jharkhand board exams'
              )}
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
          >
            <span>{t('सभी देखें', 'View All Courses')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-100 relative">
                <img
                  src={c.thumbnail_url}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/80 text-white">
                    {c.title.includes('BSEB') ? 'BSEB' : 'JAC'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-slate-950">
                    {c.is_free ? (lang === 'hi' ? 'निःशुल्क' : 'FREE') : formatINR(c.discount_price || c.price)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {lang === 'hi' ? c.title_hi || c.title : c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lang === 'hi' ? c.description_hi || c.description : c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    ⏱️ {c.validity_days} {t('दिन वैधता', 'Days Validity')}
                  </span>
                  <Link
                    href="/download-app"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    {t('प्रवेश लें', 'Enroll Now')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Download Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase">
              {t('मोबाइल-प्रथम शिक्षा', 'Mobile Learning First')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {t(
                'आइडियल कोचिंग सेंटर एंड्रॉयड ऐप डाउनलोड करें',
                'Download the Ideal Coaching Centre Android App'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t(
                'धीमे इंटरनेट पर भी सुगम लाइव क्लास, ऑफलाइन पीडीएफ रीडिंग, और बिना किसी रुकावट के बोर्ड परीक्षा की तैयारी अपने मोबाइल फोन पर करें।',
                'Optimized for fast performance on all Android devices. Watch uninterrupted live sessions, read downloaded PDF notes offline, and take mock tests on the go.'
              )}
            </p>
            <div className="pt-2">
              <Link
                href="/download-app"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-md transition"
              >
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span>{t('डायरेक्ट एपीके डाउनलोड', 'Direct APK Download')}</span>
              </Link>
            </div>
          </div>

          <div className="w-52 h-52 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 p-4 text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-white text-blue-800 font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow">
                ICC
              </div>
              <p className="font-bold text-xs">v1.0.0 Android Release</p>
              <p className="text-[10px] text-blue-200 mt-1">Zero Cost · Fast · Offline</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
