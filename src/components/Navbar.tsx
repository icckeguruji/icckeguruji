'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ShieldAlert, User, LogIn, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { User as UserType, CoachingConfig } from '@/types';
import Logo from '@/components/Logo';
import LoginModal from '@/components/LoginModal';

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

  const handleLoginSuccess = (user: UserType) => {
    if (onUserChange) {
      onUserChange(user);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo: ICC KE GURUJI */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Batches
            </Link>

            <Link
              href="/course/course-1"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/course')
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Classroom</span>
            </Link>

            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/admin'
                  ? 'bg-purple-50 text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>Admin Portal</span>
            </Link>
          </nav>

          {/* User & Login Section */}
          <div className="flex items-center gap-3">
            {/* Login / User Profile Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold text-slate-800 shadow-xs"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black ${currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  {currentUser.name[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="leading-tight text-slate-900">{currentUser.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500 font-medium capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="p-3 border-b border-slate-100 mb-1">
                    <div className="font-black text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{currentUser.phone}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {currentUser.enrolledCourseIds.length} Courses Enrolled
                    </span>
                  </div>

                  <Link
                    href="/course/course-1"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>My Classroom</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Admin Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLoginModal(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold border-t border-slate-100 mt-1"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Switch User / Login</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Login Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
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
