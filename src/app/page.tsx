'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Radio,
  FileText,
  Bot,
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
  Zap,
  Flame,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import { Course, User, CoachingConfig, Announcement, Article, Testimonial, FaqItem, TimetableSlot } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import UpiPaymentModal from '@/components/UpiPaymentModal';
import WeeklyTimetable from '@/components/WeeklyTimetable';
import PyqSection from '@/components/PyqSection';
import MobileBottomNav from '@/components/MobileBottomNav';
import Logo from '@/components/Logo';

export default function HomePage() {
  const [data, setData] = useState(getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(data.user);
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
    refreshState();
    const handleStorageUpdate = () => refreshState();
    window.addEventListener('coaching_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleStorageUpdate);
  }, []);

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

  const categories = ['All', 'Competitive Exams', 'Board Exams', 'Coding & Tech'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
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
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-2 px-4 text-xs font-semibold shadow-inner">
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
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-slate-200">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>New Academic Session 2026 Admissions Open • Direct UPI Zero Commission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Apne Career Ka Lakshya Haasil Karein with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {data.config.coachingName}
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {data.config.heroSubheadline || "Daily YouTube Live interactive classes, chapter-wise handwritten PDF notes, 24/7 AI Doubt Guruji aur paid Telegram group alerts."}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#courses-section"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore All Batches</span>
            </a>

            <Link
              href="/course/course-1"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm border border-slate-300 shadow-xs flex items-center gap-2 transition-all"
            >
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Watch Live Classroom Demo</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
              <div className="text-2xl font-black text-slate-900">10,000+</div>
              <div className="text-xs font-bold text-blue-600">Enrolled Students</div>
              <div className="text-[11px] text-slate-400">Trusted all over India</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
              <div className="text-2xl font-black text-slate-900">98.4%</div>
              <div className="text-xs font-bold text-emerald-600">Highest Board Score</div>
              <div className="text-[11px] text-slate-400">CBSE &amp; State Boards</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
              <div className="text-2xl font-black text-slate-900">24/7</div>
              <div className="text-xs font-bold text-amber-600">AI Guruji Doubt Tutor</div>
              <div className="text-[11px] text-slate-400">Step-by-step solutions</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
              <div className="text-2xl font-black text-slate-900">0% Fee</div>
              <div className="text-xs font-bold text-purple-600">Direct UPI Transfer</div>
              <div className="text-[11px] text-slate-400">Zero Gateway Commission</div>
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
                className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                        {course.category}
                      </span>
                    </div>

                    {course.isPopular && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        Bestseller
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                      <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        <Radio className="w-3.5 h-3.5 text-rose-400" />
                        YouTube Live
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {course.instructorName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{course.instructorName}</div>
                        <div className="text-[10px] text-slate-500">{course.instructorRole}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      {course.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-black text-slate-900">₹{course.price}</div>
                      <div className="text-xs text-slate-400 line-through">₹{course.originalPrice}</div>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Link
                      href={`/course/${course.id}`}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
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
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-colors border border-slate-200"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => setSelectedCourseForPayment(course)}
                        className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
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
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyTimetable slots={data.timetable} />
        </div>
      </section>

      {/* =========================================================================
          FEATURE: INTERACTIVE DAILY PRACTICE MCQ PREVIEW
      ========================================================================= */}
      <section className="py-16 bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Daily Practice Problem (DPP)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Aaj Ka Free Practice Question
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Try karein aur dekhein kaise hamara system instantly solution aur Guruji explanation dikhata hai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-bold">
              <span>Class 12 Physics • Electrostatics</span>
              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                +4 Marks
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 mb-4">
              Agar do static charges ke beech ki distance ko half (r/2) kar diya jaye, toh unke beech lagne wala electrostatic force kitna ho jayega?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {['2 Guna (Double)', '4 Guna (4 Times)', 'Aadha (Half)', '1/4th (One-Fourth)'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSampleQuizAnswer(i);
                    setShowSampleResult(true);
                  }}
                  className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                    sampleQuizAnswer === i
                      ? i === 1
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-rose-50 border-rose-500 text-rose-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{String.fromCharCode(65 + i)}. {opt}</span>
                  {showSampleResult && i === 1 && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                </button>
              ))}
            </div>

            {showSampleResult && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-slate-700 space-y-1 animate-in fade-in duration-200">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Guruji Solution:
                </span>
                <p className="leading-relaxed">
                  Correct Answer: <strong>B (4 Guna)</strong>! Coulomb's law ke mutabiq <code>F ∝ 1/r²</code>. Jab distance aadhi (r/2) hogi, toh force 4 guna badh jayega. Sabhi batches mein aise chapter-wise mock tests available hain!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE: PREVIOUS YEARS QUESTION PAPERS (PYQ) & SOLUTIONS
      ========================================================================= */}
      <section id="pyq" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PyqSection papers={data.pyqPapers || []} />
        </div>
      </section>

      {/* =========================================================================
          CMS: STUDY GUIDES & ARTICLES SECTION
      ========================================================================= */}
      {data.articles.length > 0 && (
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Guruji's Free Learning Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Study Guides, Derivations &amp; Exam Tips
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Board exams aur competitive exams me top score karne ke liye secret study strategies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.articles.map((art) => (
                <div
                  key={art.id}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {art.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">• {art.readTime}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base mb-2 hover:text-blue-600 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">By {art.author}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
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
        <section className="py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Hall of Fame &amp; Results
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Hamare Toppers Ki Zubani
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Hazaron students ne ICC KE GURUJI se padhkar board aur competitive exams me top ranks score ki hain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                      "{t.review}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{t.studentName}</div>
                      <div className="text-[10px] text-slate-400">{t.examName}</div>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
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
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Frequently Asked Questions (FAQ)
              </h2>
            </div>

            <div className="space-y-3">
              {data.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4.5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
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

      {/* Footer */}
      <footer className="bg-white py-10 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />

          <div className="text-slate-500 font-medium">
            © 2026 {data.config.coachingName}. All Rights Reserved. Free Hosting Architecture.
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <a
              href={`https://wa.me/${data.config.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600"
            >
              WhatsApp Support
            </a>
            <span>•</span>
            <a
              href={data.config.telegramGroupLink}
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600"
            >
              Telegram Community
            </a>
            <span>•</span>
            <Link href="/admin" className="hover:text-purple-600">
              Admin Portal
            </Link>
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
