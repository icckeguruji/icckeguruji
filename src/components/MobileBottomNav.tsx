'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Award, Bot, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '@/types';

interface MobileBottomNavProps {
  currentUser: User;
  onOpenLogin?: () => void;
}

export default function MobileBottomNav({ currentUser, onOpenLogin }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');
  const isCourse = pathname.startsWith('/course');

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {/* 1. Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          isHome ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Home</span>
      </Link>

      {/* 2. All Batches */}
      <Link
        href="/#courses"
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          isHome && !isAdmin ? 'text-slate-600 hover:text-blue-600' : 'text-slate-500'
        }`}
      >
        <BookOpen className="w-5 h-5 stroke-2" />
        <span className="text-[10px] mt-0.5">Batches</span>
      </Link>

      {/* 3. My Classroom / First Enrolled Course */}
      <Link
        href={`/course/${currentUser.enrolledCourseIds[0] || 'course-1'}`}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
          isCourse ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-semibold'
        }`}
      >
        <div className="relative">
          <Award className={`w-5 h-5 ${isCourse ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          {currentUser.enrolledCourseIds.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Classroom</span>
      </Link>

      {/* 4. Admin Portal (or Profile/Login) */}
      {currentUser.role === 'admin' ? (
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            isAdmin ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-semibold'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Admin</span>
        </Link>
      ) : (
        <button
          onClick={onOpenLogin}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition-all font-semibold"
        >
          <UserIcon className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">Account</span>
        </button>
      )}
    </nav>
  );
}
