'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ShieldAlert,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  FileText,
  HelpCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { User as UserType, CoachingConfig } from '@/types';
import Logo from '@/components/Logo';
import LoginModal from '@/components/LoginModal';
import { saveStoredData } from '@/lib/storage';

interface NavbarProps {
  currentUser: UserType;
  config: CoachingConfig;
  onToggleRole: () => void;
  onUserChange?: (user: UserType) => void;
}

export default function Navbar({ currentUser, config, onToggleRole, onUserChange }: NavbarProps) {
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { label: 'Timetable', href: '/#timetable' },
    { label: 'Free PYQs', href: '/#pyq' },
    { label: 'Daily MCQ', href: '/#daily-practice' },
    { label: 'Toppers', href: '/#toppers' },
  ];

  const allMobileLinks = [
    { label: 'Batches', href: '/#courses-section' },
    { label: 'Timetable', href: '/#timetable' },
    { label: 'Free PYQs', href: '/#pyq' },
    { label: 'Daily MCQ', href: '/#daily-practice' },
    { label: 'Study Guides', href: '/#articles' },
    { label: 'Toppers Wall', href: '/#toppers' },
    { label: 'FAQs & Help', href: '/#faqs' },
  ];

  const isLoggedIn = Boolean(currentUser && currentUser.phone && currentUser.name);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
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
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links - Clean, Spacious, Professional */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-600">
            {primaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-2.5 py-1.5 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}

            {/* More Menu Dropdown (Guides, FAQs) */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                className="px-2.5 py-1.5 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-100">
                  <a
                    href="/#articles"
                    className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Study Guides</span>
                  </a>
                  <a
                    href="/#faqs"
                    className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>FAQs &amp; Help</span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Controls: Classroom, Admin, WhatsApp & User Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Classroom Direct Link */}
            <Link
              href="/course/course-1"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                pathname.startsWith('/course')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Classroom</span>
            </Link>

            {/* Admin Console Direct Link */}
            <Link
              href="/admin"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                pathname === '/admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/70'
              }`}
              title="Guruji Admin Console (CMS)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Admin</span>
            </Link>

            {/* WhatsApp 1-Click Helpline */}
            <a
              href={`https://wa.me/${(config.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}?text=Namaste%20Guruji,%20mujhe%20admission%20ke%20bare%20me%20jankari%20chahiye`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-xs shrink-0"
              title="Chat with Guruji on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
              <span>WhatsApp</span>
            </a>

            {/* Authentication: Display User Profile OR Login Button (Never both simultaneously!) */}
            {isLoggedIn ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold text-slate-800 shadow-xs"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {currentUser.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="leading-tight text-slate-900 truncate max-w-[80px]">{currentUser.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize leading-none">{currentUser.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* User Profile Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="p-3 border-b border-slate-100 mb-1">
                      <div className="font-black text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{currentUser.phone}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {currentUser.enrolledCourseIds?.length || 0} Courses Enrolled
                      </span>
                    </div>

                    <Link
                      href="/course/course-1"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-blue-50 font-semibold transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>My Classroom</span>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-purple-50 font-semibold transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-600" />
                      <span>Admin Console (CMS)</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowLoginModal(true);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold border-t border-slate-100 mt-1 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
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
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
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
              <Link
                href="/course/course-1"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Live Classroom &amp; Notes</span>
                </div>
                <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-full">Open</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Guruji Admin Console (CMS)</span>
                </div>
                <span className="text-[10px] bg-purple-200/60 text-purple-900 px-2 py-0.5 rounded-full">Admin</span>
              </Link>

              <a
                href={`https://wa.me/${(config.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '')}?text=Namaste%20Guruji,%20mujhe%20admission%20ke%20bare%20me%20jankari%20chahiye`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Helpline</span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full">24/7</span>
              </a>
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
    </>
  );
}
