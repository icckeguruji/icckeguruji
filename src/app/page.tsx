'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Radio,
  FileText,
  Send,
  CheckCircle,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Clock,
  Users,
  Check,
  Search,
  ChevronDown,
  Bell,
  Star,
  Award,
  Calendar,
  TrendingUp,
  MessageCircle,
  LogIn,
  Code2,
  Phone
} from 'lucide-react';
import { Course, User } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import UpiPaymentModal from '@/components/UpiPaymentModal';
import WeeklyTimetable from '@/components/WeeklyTimetable';
import PyqSection from '@/components/PyqSection';
import MobileBottomNav from '@/components/MobileBottomNav';
import Logo from '@/components/Logo';

export default function HomePage() {
  const [data, setData] = useState(() => getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredData().user);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sample interactive quiz demo on homepage
  const [sampleQuizAnswer, setSampleQuizAnswer] = useState<number | null>(null);
  const [showSampleResult, setShowSampleResult] = useState(false);

  const refreshState = () => {
    const fresh = getStoredData();
    setData(fresh);
    setCurrentUser(fresh.user);
  };

  useEffect(() => {
    const handleStorageUpdate = () => refreshState();
    window.addEventListener('coaching_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (data.config?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.config.faviconUrl;
    }
  }, [data.config?.faviconUrl]);

  const toggleRole = () => {
    const nextRole = currentUser.role === 'student' ? 'admin' : 'student';
    const updatedUser = { ...currentUser, role: nextRole as 'student' | 'admin' };
    saveStoredData('USER', updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleEnrollSuccess = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setSelectedCourseForPayment(null);
    refreshState();
  };

  // Filtered courses
  const filteredCourses = data.courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Board Exams', 'Competitive Exams', 'Special Batches'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
      <Navbar
        currentUser={currentUser}
        config={data.config}
        onToggleRole={toggleRole}
        onUserChange={(u) => {
          setCurrentUser(u);
          refreshState();
        }}
      />

      {/* =========================================================================
          CMS: LIVE ANNOUNCEMENT NOTICE TICKER BAR
      ========================================================================= */}
      {data.announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-2 px-4 text-xs font-semibold shadow-inner w-full overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">
                <Bell className="w-3 h-3 fill-slate-950" />
                Live Notice
              </span>
              <span className="truncate">
                {data.announcements[0]?.title} —{' '}
                <span className="text-blue-100 font-normal">{data.announcements[0]?.message}</span>
              </span>
            </div>

            <Link
              href="/course/course-1"
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white shrink-0"
            >
              <span>Join Class</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-b border-slate-200/80 w-full max-w-full">
        {/* Modern Ambient Mesh Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-tr from-blue-400/15 via-indigo-400/15 to-violet-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-10 w-72 h-72 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Admission / Promo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold shadow-xs hover:border-blue-300 transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>{data.config.admissionBadgeText || "Admissions Open for Academic Session 2026"}</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            {data.config.heroHeadline || (
              <>
                Achieve Academic Excellence with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {data.config.coachingName}
                </span>
              </>
            )}
          </h1>

          {/* Hero Subheadline */}
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            {data.config.heroSubheadline || "Daily YouTube Live interactive classes, chapter-wise handwritten PDF notes, 24/7 AI Doubt Guruji, and Telegram group alerts."}
          </p>

          {/* Modern CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#courses-section"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore All Batches</span>
            </a>

            <Link
              href="/course/course-1"
              className="px-6 py-3.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 font-bold rounded-2xl text-sm border border-slate-200/90 shadow-xs hover:shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <Radio className="w-4 h-4 text-rose-600" />
              <span>Live Classroom Demo</span>
            </Link>

            <a
              href={`https://wa.me/${(data.config.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 font-bold rounded-2xl text-sm border border-emerald-200/90 shadow-xs hover:shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask Guruji on WhatsApp</span>
            </a>
          </div>

          {/* Floating Navigation Capsule */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
              <a
                href="#courses-section"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>🎯 Batches</span>
              </a>
              <a
                href="#timetable"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>📅 Live Routine</span>
              </a>
              <a
                href="#daily-practice"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>📝 Daily MCQ</span>
              </a>
              <a
                href="#pyq"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>📚 Free PYQs</span>
              </a>
              <a
                href="#articles"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>📖 Study Guides</span>
              </a>
              <a
                href="#toppers"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>🏆 Toppers</span>
              </a>
              <a
                href="#faqs"
                className="px-3 py-1.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>❓ FAQs</span>
              </a>
            </div>
          </div>

          {/* Modern Elevated Stat Cards */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="group p-5 rounded-3xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600">{data.config.stat1Label || "Enrolled Students"}</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{data.config.stat1Value || "10,000+"}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Verified Active Learners</div>
            </div>

            <div className="group p-5 rounded-3xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600">{data.config.stat2Label || "Highest Board Score"}</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{data.config.stat2Value || "98.4%"}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">CBSE &amp; State Boards</div>
            </div>

            <div className="group p-5 rounded-3xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600">{data.config.stat3Label || "Weekly Tests"}</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{data.config.stat3Value || "Every Sunday"}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Offline Drill &amp; Marksheet</div>
            </div>

            <div className="group p-5 rounded-3xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-600">{data.config.stat4Label || "Easy Fee Options"}</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{data.config.stat4Value || "Cash / UPI"}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Direct UPI &amp; Instant Receipts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Catalog Section */}
      <section id="courses-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-blue-600 font-bold mb-1">
              Select Your Target Batch
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Popular Batches &amp; Membership Plans
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch or teacher..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isEnrolled = currentUser.enrolledCourseIds.includes(course.id) || currentUser.role === 'admin';
            const pendingPayment = data.payments.find(
              (p) => p.courseId === course.id && p.userId === currentUser.id && p.status === 'pending'
            );

            return (
              <div
                key={course.id}
                className="group relative bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-white/40">
                        {course.category}
                      </span>
                    </div>

                    {course.isPopular && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        Bestseller
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                      <span className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/10">
                        <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        YouTube Live
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                        {course.instructorName[0]}
                      </div>
                      <div className="truncate">
                        <div className="font-extrabold text-slate-900 truncate">{course.instructorName}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">{course.instructorRole}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      {course.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span className="line-clamp-1 font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">₹{course.price}</div>
                      <div className="text-xs text-slate-400 line-through font-mono">₹{course.originalPrice}</div>
                    </div>
                    <div className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Link
                      href={`/course/${course.id}`}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Membership Active • Go to Classroom</span>
                    </Link>
                  ) : pendingPayment ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-amber-800 text-center font-bold bg-amber-50 py-1.5 rounded-xl border border-amber-200">
                        Payment Under Review (UTR: {pendingPayment.utrNumber.slice(0, 6)}...)
                      </div>
                      <Link
                        href={`/course/${course.id}`}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300"
                      >
                        Check Status in Classroom
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/course/${course.id}`}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-colors border border-slate-200 active:scale-95"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => setSelectedCourseForPayment(course)}
                        className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay via UPI</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FEATURE: LIVE WEEKLY TIMETABLE ROUTINE
      ========================================================================= */}
      <section id="timetable" className="py-14 bg-white border-y border-slate-200 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyTimetable slots={data.timetable} />
        </div>
      </section>

      {/* =========================================================================
          FEATURE: INTERACTIVE DAILY PRACTICE MCQ PREVIEW
      ========================================================================= */}
      <section id="daily-practice" className="py-16 bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Daily Practice Problem (DPP)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Daily Free Practice Question
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Try this problem and see how our system instantly delivers step-by-step solutions and explanations.
            </p>
          </div>

          <div className="relative overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-4 text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Live Daily Numerical Drill
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 text-[11px] font-extrabold">
                +4 Marks
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-5 leading-snug">
              {data.config.homeQuizQuestion || "If the distance between two static point charges is halved (r/2), what happens to the electrostatic force between them?"}
            </h4>

            {(() => {
              const options = (data.config.homeQuizOptions && data.config.homeQuizOptions.length === 4)
                ? data.config.homeQuizOptions
                : ['Double (2x)', '4 Times (4x)', 'Half (0.5x)', 'One-Fourth (0.25x)'];
              const correctIdx = data.config.homeQuizCorrectIndex ?? 1;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {options.map((opt, i) => {
                    const isSelected = sampleQuizAnswer === i;
                    const isCorrect = i === correctIdx;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSampleQuizAnswer(i);
                          setShowSampleResult(true);
                        }}
                        className={`group p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between active:scale-[0.99] cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                            : 'bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {showSampleResult && isCorrect && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {showSampleResult && (
              <div className="p-4.5 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border border-blue-200/90 rounded-2xl text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-200 shadow-xs">
                <span className="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Guruji Concept Explanation:
                </span>
                <p className="leading-relaxed text-slate-600">
                  {data.config.homeQuizExplanation || "Correct Answer: B (4 Times)! According to Coulomb's Law, F ∝ 1/r². When distance is halved (r/2), the force increases by a factor of 4. Comprehensive chapter-wise mock tests and drills are included in all batches!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE: PREVIOUS YEARS QUESTION PAPERS (PYQ) & SOLUTIONS
      ========================================================================= */}
      <section id="pyq" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PyqSection papers={data.pyqPapers || []} />
        </div>
      </section>

      {/* =========================================================================
          CMS: STUDY GUIDES & ARTICLES SECTION
      ========================================================================= */}
      {data.articles.length > 0 && (
        <section id="articles" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Guruji&apos;s Free Learning Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Study Guides, Derivations &amp; Exam Tips
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Proven study techniques and derivation breakdowns to excel in board and competitive exams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.articles.map((art) => (
                <div
                  key={art.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                        {art.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">• {art.readTime}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-2 hover:text-blue-600 transition-colors tracking-tight">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-800">By {art.author}</span>
                    <span className="text-blue-600 font-extrabold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CMS: TOPPERS & TESTIMONIALS (HALL OF FAME)
      ========================================================================= */}
      {data.testimonials.length > 0 && (
        <section id="toppers" className="py-16 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Hall of Fame &amp; Results
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                Words from Our Toppers &amp; Achievers
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Thousands of students have secured top ranks in board and entrance exams through ICC KE GURUJI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3.5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed mb-5 font-normal">
                      &quot;{t.review}&quot;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm tracking-tight">{t.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{t.examName}</div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 shadow-xs">
                      {t.examRank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CMS: FREQUENTLY ASKED QUESTIONS (FAQ)
      ========================================================================= */}
      {data.faqs.length > 0 && (
        <section id="faqs" className="py-16 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                Frequently Asked Questions (FAQ)
              </h2>
            </div>

            <div className="space-y-3">
              {data.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? 'border-blue-400/80 bg-blue-50/20 shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4.5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="tracking-tight">{faq.question}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-200/60 text-slate-500'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-white/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          COMPREHENSIVE DIRECTORY FOOTER (4 COLUMNS + DIRECT LINKS)
      ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 pt-14 pb-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Institute Branding & Info */}
            <div className="space-y-4">
              <Logo size="md" logoUrl={data.config.logoUrl} />
              <p className="text-slate-500 text-xs leading-relaxed">
                {data.config.tagline || "Live Classes, Smart Notes & 24/7 AI Guruji"}. India&apos;s dedicated learning platform for Board exams and competitive exams.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                {data.config.address && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-slate-800">Address:</span>
                    <span className="text-slate-600">{data.config.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Helpline:</span>
                  <a href={`tel:${data.config.whatsappNumber}`} className="hover:text-blue-600 font-mono">
                    {data.config.whatsappNumber}
                  </a>
                </div>
                {data.config.alternatePhone && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Student Helpline:</span>
                    <a href={`tel:${data.config.alternatePhone}`} className="hover:text-blue-600 font-mono">
                      {data.config.alternatePhone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Official UPI ID:</span>
                  <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    {data.config.upiId}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Jump Directory */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider text-xs">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li>
                  <a href="#courses-section" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>🎯</span> Popular Batches
                  </a>
                </li>
                <li>
                  <a href="#timetable" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>📅</span> Weekly Live Routine
                  </a>
                </li>
                <li>
                  <a href="#daily-practice" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>📝</span> Daily Practice MCQ
                  </a>
                </li>
                <li>
                  <a href="#pyq" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>📚</span> Free PYQs &amp; Solutions
                  </a>
                </li>
                <li>
                  <a href="#articles" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>📖</span> Study Guides &amp; Tips
                  </a>
                </li>
                <li>
                  <a href="#toppers" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>🏆</span> Toppers Hall of Fame
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>❓</span> Common FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Student Tools & Classroom */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider text-xs">
                Student Learning Tools
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li>
                  <Link href="/course/course-1" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-500" />
                    <span>Live YouTube Classroom</span>
                  </Link>
                </li>
                <li>
                  <Link href="/course/course-1" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>24/7 AI Guruji Doubt Solver</span>
                  </Link>
                </li>
                <li>
                  <Link href="/course/course-1" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Handwritten PDF Golden Notes</span>
                  </Link>
                </li>
                <li>
                  <Link href="/course/course-1" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Moving Anti-Piracy Watermark</span>
                  </Link>
                </li>
                <li>
                  <Link href="/course/course-1" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    <span>Verifiable Course Certificates</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Official Community & Admin */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider text-xs">
                Community &amp; Connect
              </h4>
              <div className="space-y-2.5">
                <a
                  href={`https://wa.me/${(data.config.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-2.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">WhatsApp AI Counselor</div>
                    <div className="text-[10px] text-emerald-600">Scan QR / Instant Chat 24/7</div>
                  </div>
                </a>

                <a
                  href={data.config.telegramGroupLink || 'https://t.me/icckeguruji_official'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-2.5 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Telegram Community Channel</div>
                    <div className="text-[10px] text-sky-600">Daily Alerts &amp; Free Study Materials</div>
                  </div>
                </a>

                <Link
                  href="/login"
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-2.5 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">Student &amp; Faculty Portal</div>
                    <div className="text-[10px] text-blue-600">Sign in with Email or Mobile</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Modern Footer Bottom: Copyright, Developer Attribution & Quick Links */}
          <div className="relative mt-12 pt-8 border-t border-slate-200/80">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 border border-slate-200/80 p-6 sm:p-8 text-center shadow-xs">
              {/* Subtle ambient glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center gap-3.5">
                {/* 1. Brand Copyright - Monasib & Crisp */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                  <span>© 2026</span>
                  <span className="font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {data.config.coachingName || 'ICC KE GURUJI'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">All Rights Reserved.</span>
                </div>

                {/* 2. Developer Attribution & Direct Helpline - Modern Interactive Pill */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all duration-300">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                    <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Developed by</span>
                    <strong className="font-extrabold text-slate-900 tracking-tight">
                      Muzaffar Iqbal Ishaati
                    </strong>
                  </span>

                  <span className="text-slate-300 font-light hidden sm:inline">•</span>

                  <a
                    href="tel:9934215013"
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all"
                  >
                    <Phone className="w-3 h-3 group-hover:rotate-12 transition-transform shrink-0" />
                    <span className="tracking-wide font-mono">+91 9934215013</span>
                  </a>
                </div>

                {/* 3. Essential Navigation & Support Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-xs font-semibold text-slate-500">
                  <a
                    href="#faqs"
                    className="px-3 py-1 rounded-xl hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  >
                    Privacy &amp; Terms
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href="#courses-section"
                    className="px-3 py-1 rounded-xl hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  >
                    All Batches
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href={`https://wa.me/${(data.config.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors font-bold"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Help &amp; Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* UPI QR Payment Modal */}
      {selectedCourseForPayment && (
        <UpiPaymentModal
          course={selectedCourseForPayment}
          config={data.config}
          currentUser={currentUser}
          onClose={() => setSelectedCourseForPayment(null)}
          onSuccess={handleEnrollSuccess}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
