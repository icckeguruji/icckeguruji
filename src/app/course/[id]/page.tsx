'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock,
  Play,
  FileText,
  Bot,
  Send,
  CheckCircle,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Award,
  Zap,
  Flame,
  HelpCircle,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { Course, Lesson, PdfNote, User, CoachingConfig, PaymentRequest, Quiz, Flashcard } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import VideoPlayerWithWatermark from '@/components/VideoPlayerWithWatermark';
import PdfViewerModal from '@/components/PdfViewerModal';
import AiDoubtSolver from '@/components/AiDoubtSolver';
import TelegramWhatsAppCard from '@/components/TelegramWhatsAppCard';
import UpiPaymentModal from '@/components/UpiPaymentModal';
import QuizEngine from '@/components/QuizEngine';
import FormulaFlashcards from '@/components/FormulaFlashcards';
import DppManager from '@/components/DppManager';
import CertificateView from '@/components/CertificateView';
import CommunityForum from '@/components/CommunityForum';
import LiveInteractiveWidget from '@/components/LiveInteractiveWidget';
import MobileBottomNav from '@/components/MobileBottomNav';

function CourseClassroomContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params?.id as string) || 'course-1';

  const [data, setData] = useState(getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(data.user);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notes, setNotes] = useState<PdfNote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Active Tab: 'lectures' | 'notes' | 'dpp' | 'quizzes' | 'flashcards' | 'forum' | 'certificate' | 'ai' | 'community'
  const [activeTab, setActiveTab] = useState<
    'lectures' | 'notes' | 'dpp' | 'quizzes' | 'flashcards' | 'forum' | 'certificate' | 'ai' | 'community'
  >('lectures');

  // Modals
  const [selectedNote, setSelectedNote] = useState<PdfNote | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Reload data from local storage
  const refreshState = () => {
    const fresh = getStoredData();
    setData(fresh);
    setCurrentUser(fresh.user);
    const foundCourse = fresh.courses.find((c: Course) => c.id === courseId) || fresh.courses[0];
    setCourse(foundCourse);

    const courseLessons = fresh.lessons.filter((l: Lesson) => l.courseId === foundCourse?.id);
    setLessons(courseLessons);
    if (courseLessons.length > 0 && !activeLesson) {
      setActiveLesson(courseLessons[0]);
    }

    const courseNotes = fresh.notes.filter((n: PdfNote) => n.courseId === foundCourse?.id);
    setNotes(courseNotes);

    const courseQuizzes = fresh.quizzes.filter((q: Quiz) => q.courseId === foundCourse?.id || q.courseId === 'course-1');
    setQuizzes(courseQuizzes);

    const courseFlashcards = fresh.flashcards.filter((f: Flashcard) => f.courseId === foundCourse?.id || f.courseId === 'course-1');
    setFlashcards(courseFlashcards);
  };

  useEffect(() => {
    refreshState();

    const handleStorageUpdate = () => refreshState();
    window.addEventListener('coaching_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('coaching_storage_updated', handleStorageUpdate);
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <p className="font-semibold text-slate-500">Loading classroom...</p>
      </div>
    );
  }

  const isEnrolled = currentUser.enrolledCourseIds.includes(course.id) || currentUser.role === 'admin';
  const pendingPayment = data.payments.find(
    (p: PaymentRequest) => p.courseId === course.id && p.userId === currentUser.id && p.status === 'pending'
  );

  const toggleRole = () => {
    const nextRole = currentUser.role === 'student' ? 'admin' : 'student';
    const updatedUser = { ...currentUser, role: nextRole as 'student' | 'admin' };
    saveStoredData('USER', updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleEnrollSuccess = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowPaymentModal(false);
    refreshState();
  };

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {course.category}
                </span>
                {isEnrolled && (
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active Membership
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{course.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEnrolled && (
              <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                  <span>{currentUser.streakDays || 7} Day Streak!</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">4 / {lessons.length} Lectures Watched</span>
              </div>
            )}

            {!isEnrolled && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Enroll Now (₹{course.price})
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            PAYWALL: If user is not enrolled, show locked screen
        ========================================================================= */}
        {!isEnrolled ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center justify-center mx-auto text-rose-600 shadow-sm">
                <Lock className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-rose-600 font-black">
                  Restricted Classroom Content
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Ye Course Sirf Paid Members Ke Liye Available Hai
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
                  Daily YouTube Live sessions, golden handwritten PDF notes, chapter mock tests, 24/7 AI Doubt Guruji aur Telegram private community access karne ke liye membership unlock karein.
                </p>
              </div>

              {pendingPayment ? (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-left max-w-lg mx-auto flex items-start gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-black text-amber-950">Aapka Payment Request Under Review Hai!</p>
                    <p className="mt-0.5 text-slate-700">
                      UTR: <span className="font-mono font-bold text-indigo-700">{pendingPayment.utrNumber}</span>.
                      Admin verification ke baad turant unlock ho jayega.
                    </p>
                    <p className="mt-2 text-indigo-700 font-bold">
                      💡 Self-Testing ke liye aap Admin Panel par jakar 1-Click mein Approve kar sakte hain.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2">
                {course.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black rounded-2xl text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Unlock Course via Direct UPI (₹{course.price})</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct Bank Transfer • 0% Extra Commission • ICC KE GURUJI Certified</span>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              ENROLLED VIEW: Full Access to Live Player, Notes, Quizzes, Flashcards & AI
          ========================================================================= */
          <div className="space-y-6">
            {/* Video Player Section & Live Interactive Widget */}
            {activeLesson ? (
              <div className="space-y-4">
                <VideoPlayerWithWatermark
                  lesson={activeLesson}
                  user={currentUser}
                  courseTitle={course.title}
                />
                <LiveInteractiveWidget
                  lesson={activeLesson}
                  currentUser={currentUser}
                />
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-slate-500 font-medium">Is course me abhi koi lecture schedule nahi hai.</p>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('lectures')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'lectures'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Play className="w-4 h-4" />
                All Lectures &amp; Live ({lessons.length})
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Golden Notes ({notes.length})
              </button>

              <button
                onClick={() => setActiveTab('dpp')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'dpp'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                DPP &amp; Homework ({(data.dpps || []).filter((d) => d.courseId === course.id).length})
              </button>

              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'quizzes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                Chapter Mock Tests ({quizzes.length})
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'flashcards'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-indigo-500" />
                Formula Flashcards ({flashcards.length})
              </button>

              <button
                onClick={() => setActiveTab('forum')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'forum'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Doubt Forum
              </button>

              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'certificate'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Certificate 🎓
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'ai'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-500" />
                AI Guruji 24/7
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'community'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Send className="w-4 h-4 text-sky-500" />
                Telegram &amp; WhatsApp Bot
              </button>
            </div>

            {/* Tab 1: Lectures List */}
            {activeTab === 'lectures' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`p-5 rounded-3xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-slate-500 font-bold">
                            Chapter {lesson.chapterNumber}
                          </span>
                          {lesson.isLive ? (
                            <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-300 animate-pulse">
                              <Radio className="w-3 h-3" /> LIVE NOW
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                              Recorded
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.duration || '60 min'}
                        </span>
                        <span className={`font-bold flex items-center gap-1 text-[11px] ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>
                          {isActive ? 'Currently Watching' : 'Click to Play'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: PDF Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900 font-medium shadow-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Saare PDF notes aapke mobile number ke sath watermarked aur secured hain.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
                            {note.fileSize}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{note.title}</h4>
                        <p className="text-xs text-slate-500 mb-3">{note.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {note.pageCount ? `${note.pageCount} Pages • ` : ''}Uploaded {note.uploadedAt}
                        </span>
                        <button
                          onClick={() => setSelectedNote(note)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2.5: DPP & Homework */}
            {activeTab === 'dpp' && (
              <DppManager
                courseId={course.id}
                courseTitle={course.title}
                dpps={data.dpps || []}
                submissions={data.dppSubmissions || []}
                currentUser={currentUser}
                onRefresh={refreshState}
              />
            )}

            {/* Tab 3: Interactive Mock Test / Quizzes */}
            {activeTab === 'quizzes' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {quizzes.length > 0 ? (
                  <QuizEngine quiz={quizzes[0]} studentName={currentUser.name} />
                ) : (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                    Is batch ke liye abhi koi mock test active nahi hai.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Formula Flashcards */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto">
                  <h3 className="font-black text-slate-900 text-lg">Formula Flashcards &amp; Memory Shortcuts</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Exam revision ke liye formulas ko tap karke flip karein aur derivation recall karein.
                  </p>
                </div>
                <FormulaFlashcards cards={flashcards} />
              </div>
            )}

            {/* Tab 4.5: Doubt Discussion Forum */}
            {activeTab === 'forum' && (
              <CommunityForum
                posts={data.communityPosts || []}
                courses={data.courses}
                currentUser={currentUser}
                courseId={course.id}
                onRefresh={refreshState}
              />
            )}

            {/* Tab 4.8: Certificate of Completion */}
            {activeTab === 'certificate' && (
              <CertificateView
                course={course}
                currentUser={currentUser}
                certificate={(data.certificates || []).find(
                  (c) => c.courseId === course.id && c.userId === currentUser.id
                )}
              />
            )}

            {/* Tab 5: AI Doubt Solver */}
            {activeTab === 'ai' && (
              <div className="max-w-3xl mx-auto">
                <AiDoubtSolver course={course} studentName={currentUser.name} />
              </div>
            )}

            {/* Tab 6: Telegram & WhatsApp */}
            {activeTab === 'community' && (
              <div className="max-w-4xl mx-auto">
                <TelegramWhatsAppCard config={data.config} courseTitle={course.title} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* PDF Viewer Modal */}
      {selectedNote && (
        <PdfViewerModal
          note={selectedNote}
          user={currentUser}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* UPI QR Payment Modal */}
      {showPaymentModal && (
        <UpiPaymentModal
          course={course}
          config={data.config}
          currentUser={currentUser}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleEnrollSuccess}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}

export default function CourseClassroomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-500">Loading classroom...</p>
        </div>
      }
    >
      <CourseClassroomContent />
    </Suspense>
  );
}
