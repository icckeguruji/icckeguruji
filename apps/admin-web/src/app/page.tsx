'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Award,
  Video,
  FileText,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { initialCourses } from '@/lib/sample-data';
import { formatINR } from '@icc/shared-utils';
import { useLanguage } from '@/components/LanguageContext';
import ToppersWallOfFame from '@/components/ToppersWallOfFame';

export default function PublicHomePage() {
  const { lang, t } = useLanguage();

  const stats = [
    { value: 'Class 1–12', label: t('BSEB & JAC Board', 'BSEB & JAC Board') },
    { value: '98.4%', label: t('शीर्ष बोर्ड स्कोर', 'Top Board Score') },
    { value: t('हर रविवार', 'Every Sunday'), label: t('साप्ताहिक टेस्ट', 'Weekly Tests') },
    { value: 'BADE SIR', label: t('संस्थापक निदेशक', 'Director') },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <span>
                {t(
                  '📍 सरोतिया, महागामा, गोड्डा (झारखंड) • BSEB & JAC Board 2026-27',
                  '📍 Sarotiya, Mahagama, Godda (JH) • BSEB & JAC Board 2026-27'
                )}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight sm:leading-tight tracking-tight">
              Your Trusted Pathway to <span className="text-blue-600">Top Ranks</span> in Board Exams
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {t(
                'डायरेक्टर बड़े सर के मार्गदर्शन में कक्षा 1 से 12वीं तक की संपूर्ण तैयारी। दैनिक लाइव कक्षाएं, हस्तलिखित नोट्स एवं साप्ताहिक रविवार टेस्ट।',
                'Comprehensive coaching for Classes 1 through 12 under Director BADE SIR. Daily live lectures, handwritten chapter notes, and weekly Sunday mock exams.'
              )}
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {stats.map((s, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center">
                  <div className="text-base sm:text-lg font-black text-blue-700">{s.value}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

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
                <span>{t('बैच देखें', 'Explore Batches')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('UPI भुगतान: azhargodda@ybl', 'UPI: azhargodda@ybl')}
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('सुरक्षित ओटीपी लॉगिन', 'Secure OTP Login')}
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {t('ऑफलाइन PDF डाउनलोड', 'Offline PDF Notes')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Director Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-900/60 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-2xl shrink-0 bg-slate-800">
            <Image
              src="/bade-sir.png"
              alt="Director BADE SIR"
              width={192}
              height={192}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-center md:text-left space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
              {t('संस्थापक निदेशक', 'Founder & Academic Director')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">BADE SIR</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t(
                '12 वर्षों से कक्षा 1 से 12वीं तक के बिहार एवं झारखंड बोर्ड के छात्रों को व्यक्तिगत मार्गदर्शन, रोज की उपस्थिति, हस्तलिखित नोट्स और साप्ताहिक रविवार टेस्ट के साथ सफलता दिला रहे हैं।',
                'Leading students of Classes 1–12 to board exam success for 12+ years through personal mentorship, daily attendance, handwritten notes, and weekly Sunday tests at Sarotiya campus.'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="tel:+919771350910"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition"
              >
                <Phone className="w-3.5 h-3.5" />
                +91 9771350910
              </a>
              <a
                href="https://wa.me/919771350910?text=Hello%20BADE%20SIR,%20I%20want%20admission%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href="https://youtube.com/@icckeguruji"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition border border-white/15"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                YouTube Channel
              </a>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                Sarotiya, Godda (JH)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
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
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('यूट्यूब लाइव एवं रिकॉर्डेड कक्षाएं', 'Live & Recorded Video Classes')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'यूट्यूब (@icckeguruji) पर असीमित लाइव कक्षाएं। छूटी हुई क्लास को रिकॉर्ड से कभी भी देखें।',
                'Unlimited live classes on YouTube (@icckeguruji). Watch missed lectures anytime from recorded archives.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('हस्तलिखित टॉपर नोट्स', 'Handwritten Topper Notes')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'नवीनतम SCERT/JCERT पाठ्यपुस्तकों पर आधारित अध्यायवार हस्तलिखित नोट्स, फॉर्मूला शीट।',
                'Chapter-wise handwritten notes from SCERT/JCERT textbooks, formula sheets, and 10-year solved papers.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {t('साप्ताहिक रविवार टेस्ट सीरीज', 'Weekly Sunday Test Series')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'हर रविवार बोर्ड परीक्षा पैटर्न पर आधारित टेस्ट, मार्कशीट मूल्यांकन और रैंकिंग।',
                'Every Sunday, board exam pattern tests with marksheet evaluation and performance ranking.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="courses-section">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('सक्रिय बैच (Session 2026-27)', 'Active Batches (Session 2026-27)')}
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
            <span>{t('सभी देखें', 'View All')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <Image
                  src={c.thumbnail_url || '/thumbnails/batch-b3-class10.jpg'}
                  alt={c.title}
                  width={400}
                  height={176}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900/80 text-white">
                    {c.title.includes('JAC') || c.title.includes('B-1') || c.title.includes('B-2') ? 'JAC' : 'BSEB & JAC'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-slate-950">
                    {c.is_free ? 'FREE' : formatINR(c.discount_price || c.price)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    ⏱ {c.validity_days} {t('दिन', 'Days')}
                  </span>
                  <Link
                    href="/courses"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    {t('प्रवेश लें', 'Enroll Now')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toppers Wall of Fame */}
      <ToppersWallOfFame />

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
                'Download the Ideal Coaching Centre App'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t(
                'धीमे इंटरनेट पर भी सुगम लाइव क्लास, ऑफलाइन PDF रीडिंग और मोबाइल पर बोर्ड परीक्षा की तैयारी।',
                'Optimized for all Android devices. Watch live sessions, download PDF notes offline, and take mock tests anywhere.'
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/download-app"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-md transition"
              >
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span>{t('डायरेक्ट एपीके डाउनलोड', 'Direct APK Download')}</span>
              </Link>
              <a
                href="https://t.me/icckeguruji_official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition"
              >
                <span>📢 Telegram Channel</span>
              </a>
            </div>
          </div>

          <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 p-4 text-center shrink-0">
            <div>
              <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center mx-auto mb-2 overflow-hidden border border-white/40">
                <Image
                  src="/logo.png"
                  alt="IDEAL COACHING CENTRE"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <p className="font-bold text-xs">ICC Student App</p>
              <p className="text-[10px] text-blue-200 mt-1">Android APK</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
