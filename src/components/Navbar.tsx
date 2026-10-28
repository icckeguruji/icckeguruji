'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShieldAlert,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  HelpCircle,
  GraduationCap,
  Clock,
  Sparkles,
  Bot,
  IdCard
} from 'lucide-react';
import { User as UserType, CoachingConfig } from '@/types';
import Logo from '@/components/Logo';
import LoginModal from '@/components/LoginModal';
import NotificationCenter from '@/components/NotificationCenter';
import StudentProfileModal from '@/components/StudentProfileModal';
import AiStudentProblemSolver from '@/components/AiStudentProblemSolver';
import TimedQuizHub from '@/components/TimedQuizHub';
import { saveStoredData } from '@/lib/storage';

interface NavbarProps {
  currentUser: UserType;
  config: CoachingConfig;
  onToggleRole?: () => void;
  onUserChange?: (user: UserType) => void;
}

export default function Navbar({ currentUser, config, onUserChange }: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStudentProfile, setShowStudentProfile] = useState(false);
  const [showAiSolver, setShowAiSolver] = useState(false);
  const [showTimedQuiz, setShowTimedQuiz] = useState(false);

  const handleLoginSuccess = (user: UserType) => {
    if (onUserChange) {
      onUserChange(user);
    }
  };

  const handleLogout = () => {
    const guestUser: UserType = {
      id: '',
      name: '',
      phone: '',
      email: '',
      role: 'student',
      enrolledCourseIds: [],
      joinedDate: '',
    };
    saveStoredData('USER', guestUser);
    if (onUserChange) {
      onUserChange(guestUser);
    }
    setShowUserDropdown(false);
  };

  const primaryLinks = [
    { label: 'Batches', href: '/#courses-section' },
    { label: 'Faculty', href: '/#faculty' },
    { label: 'Timetable', href: '/#timetable' },
    { label: 'Free PYQs', href: '/#pyq' },
    { label: 'Daily MCQ', href: '/#daily-practice' },
  ];

  const allMobileLinks = [
    { label: 'Batches', href: '/#courses-section' },
    { label: 'Faculty', href: '/#faculty' },
    { label: 'Timetable', href: '/#timetable' },
    { label: 'Free PYQs', href: '/#pyq' },
    { label: 'Daily MCQ', href: '/#daily-practice' },
    { label: 'Study Guides', href: '/#articles' },
    { label: 'Toppers Wall', href: '/#toppers' },
    { label: 'FAQs & Help', href: '/#faqs' },
  ];

  const isLoggedIn = Boolean(currentUser && currentUser.id && currentUser.name && currentUser.phone);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo: ICC KE GURUJI (Guaranteed never to wrap or shrink) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="hover:opacity-95 transition-opacity shrink-0">
              <Logo size="md" logoUrl={config?.logoUrl} />
            </Link>
          </div>

          {/* Desktop Navigation Links - Modern Frosted Capsule */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600">
            {primaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all whitespace-nowrap active:scale-95"
              >
                {link.label}
              </a>
            ))}

            {/* More Menu Dropdown (Guides, FAQs) */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                className="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-100">
                  <Link
                    href="/#articles"
                    className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Study Guides</span>
                  </Link>
                  <Link
                    href="/#faqs"
                    className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>FAQs &amp; Help</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Control: NotificationCenter, AI & User Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Action Pills: Timed Quiz & AI Solver */}
            <button
              onClick={() => setShowTimedQuiz(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Launch Timed Mock Quiz"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Timed Quiz</span>
            </button>

            <button
              onClick={() => setShowAiSolver(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Ask Guruji AI Doubt Solver"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>AI Solver</span>
            </button>

            {/* Personalized Role-Aware Notification Center */}
            <NotificationCenter currentUser={currentUser} />

            {isLoggedIn ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  {currentUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-lg object-cover ring-1 ring-blue-500 shrink-0"
                    />
                  ) : (
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* User Profile Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 p-2.5 z-50 text-xs animate-in fade-in duration-150">
                    <div className="p-3 border-b border-slate-100 mb-1 flex items-center gap-3">
                      {currentUser.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-blue-500 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.phone}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 capitalize">
                          {currentUser.role === 'admin'
                            ? 'Admin Portal'
                            : currentUser.role === 'teacher'
                            ? 'Faculty Portal'
                            : `${currentUser.enrolledCourseIds?.length || 0} Batches Enrolled`}
                        </span>
                      </div>
                    </div>

                    {/* Student Profile & Address Action */}
                    {currentUser.role === 'student' && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowStudentProfile(true);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100 font-bold transition-colors cursor-pointer mb-1"
                      >
                        <IdCard className="w-4 h-4 text-blue-600" />
                        <span>My Profile &amp; Address</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' ? (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : currentUser.role === 'teacher' ? (
                      <Link
                        href="/teacher"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>Faculty Portal</span>
                      </Link>
                    ) : (
                      <Link
                        href="/course/course-1"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>My Classroom</span>
                      </Link>
                    )}

                    {/* Quick Tools */}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowTimedQuiz(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-800 font-semibold transition-colors cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Timed Mock Quizzes</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowAiSolver(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 font-semibold transition-colors cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span>Guruji AI Problem Solver</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowLoginModal(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold border-t border-slate-100 mt-1 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-xs font-bold animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {allMobileLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 flex items-center gap-2 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {currentUser.role === 'admin' ? (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </div>
                      <span className="text-[10px] bg-purple-200/60 text-purple-900 px-2 py-0.5 rounded-full font-bold">Admin</span>
                    </Link>
                  ) : currentUser.role === 'teacher' ? (
                    <Link
                      href="/teacher"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Faculty Portal</span>
                      </div>
                      <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-full font-bold">Faculty</span>
                    </Link>
                  ) : (
                    <Link
                      href="/course/course-1"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>My Classroom</span>
                      </div>
                      <span className="text-[10px] bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold">Open</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out ({currentUser.name ? currentUser.name.split(' ')[0] : 'User'})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Student Profile & Address Modal */}
      {showStudentProfile && (
        <StudentProfileModal
          isOpen={showStudentProfile}
          onClose={() => setShowStudentProfile(false)}
          currentUser={currentUser}
          onUpdate={(updated) => {
            if (onUserChange) onUserChange(updated);
          }}
        />
      )}

      {/* AI Doubt & Homework Problem Solver */}
      {showAiSolver && (
        <AiStudentProblemSolver
          isOpen={showAiSolver}
          onClose={() => setShowAiSolver(false)}
          studentName={currentUser.name || 'Student'}
        />
      )}

      {/* Timed Mock Quiz Hub */}
      {showTimedQuiz && (
        <TimedQuizHub
          isOpen={showTimedQuiz}
          onClose={() => setShowTimedQuiz(false)}
          studentName={currentUser.name || 'Student'}
        />
      )}
    </>
  );
}
