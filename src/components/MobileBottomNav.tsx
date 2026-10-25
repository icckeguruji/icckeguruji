'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  PlayCircle,
  Sparkles,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { User as UserType } from '@/types';

interface MobileBottomNavProps {
  currentUser: UserType;
  onOpenLogin?: () => void;
}

export default function MobileBottomNav({ currentUser, onOpenLogin }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');
  const isCourse = pathname.startsWith('/course');
  const isLogin = pathname.startsWith('/login');

  const handleAccountClick = () => {
    if (currentUser && currentUser.phone && currentUser.name) {
      if (currentUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/course/course-1');
      }
    } else {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-transform active:scale-95 ${
            isHome && !isLogin
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isHome && !isLogin ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {isHome && !isLogin && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </Link>

        {/* 2. Batches */}
        <a
          href="/#courses-section"
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-slate-500 hover:text-blue-600 font-semibold transition-transform active:scale-95"
        >
          <BookOpen className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">Batches</span>
        </a>

        {/* 3. Live Classroom (Center Hero Button) */}
        <Link
          href={`/course/${currentUser.enrolledCourseIds?.[0] || 'course-1'}`}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-transform active:scale-95 ${
            isCourse
              ? 'text-indigo-600 font-black'
              : 'text-slate-500 hover:text-indigo-600 font-semibold'
          }`}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <PlayCircle className="w-5 h-5 fill-white/20 stroke-[2.2px]" />
            </div>
            {/* Blinking Live indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-slate-800 tracking-tight">Classroom</span>
        </Link>

        {/* 4. AI Doubt Solver */}
        <Link
          href="/course/course-1#doubt-ai"
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-slate-500 hover:text-amber-600 font-semibold transition-transform active:scale-95"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-500 stroke-2" />
            <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-amber-100 text-[8px] font-black text-amber-800 leading-none">
              AI
            </span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Doubt AI</span>
        </Link>

        {/* 5. Account / Admin Portal */}
        {currentUser && currentUser.role === 'admin' ? (
          <Link
            href="/admin"
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-transform active:scale-95 ${
              isAdmin
                ? 'text-purple-700 font-black'
                : 'text-slate-500 hover:text-purple-700 font-semibold'
            }`}
          >
            <div className="relative">
              <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'stroke-[2.5px] text-purple-700' : 'stroke-2'}`} />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Admin</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAccountClick}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-transform active:scale-95 ${
              isLogin
                ? 'text-blue-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <div className="relative">
              <User className={`w-5 h-5 ${isLogin ? 'stroke-[2.5px] text-blue-600' : 'stroke-2'}`} />
              {currentUser?.phone && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {currentUser?.phone ? (currentUser.name?.split(' ')[0] || 'Profile') : 'Login'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
