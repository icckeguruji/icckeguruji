'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Video,
  PlaySquare,
  FileText,
  CreditCard,
  FileCheck2,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { supabase } from '@/lib/supabase';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, toggleLang, t } = useLanguage();
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [userEmail, setUserEmail] = useState<string>('');

  const isTeacherSection = pathname.startsWith('/teacher');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
        const userRole = (user.app_metadata?.role as string) || '';
        if (userRole === 'teacher' || isTeacherSection) {
          setRole('teacher');
        } else {
          setRole('admin');
        }
      } else if (isTeacherSection) {
        setRole('teacher');
      }
    });
  }, [pathname, isTeacherSection]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      document.cookie = 'icc-role=; path=/; max-age=0';
    }
    router.replace('/login');
  };

  const adminNavItems = [
    { href: '/', icon: LayoutDashboard, labelHi: 'डैशबोर्ड', labelEn: 'Dashboard' },
    { href: '/students', icon: Users, labelHi: 'विद्यार्थी', labelEn: 'Students' },
    { href: '/academics', icon: GraduationCap, labelHi: 'शैक्षणिक ढांचा', labelEn: 'Academics' },
    { href: '/courses', icon: BookOpen, labelHi: 'कोर्स', labelEn: 'Courses' },
    { href: '/batches', icon: Layers, labelHi: 'बैच', labelEn: 'Batches' },
    { href: '/live-classes', icon: Video, labelHi: 'लाइव क्लास', labelEn: 'Live Classes' },
    { href: '/recorded-lectures', icon: PlaySquare, labelHi: 'रिकॉर्डेड वीडियो', labelEn: 'Recorded Videos' },
    { href: '/study-materials', icon: FileText, labelHi: 'पीडीएफ एवं नोट्स', labelEn: 'Notes & PDFs' },
    { href: '/payments', icon: CreditCard, labelHi: 'शुल्क सत्यापन', labelEn: 'Payments' },
    { href: '/examinations', icon: FileCheck2, labelHi: 'ऑनलाइन परीक्षा', labelEn: 'Examinations' },
    { href: '/teachers', icon: UserCheck, labelHi: 'शिक्षक प्रबंधन', labelEn: 'Teachers' },
    { href: '/reports', icon: BarChart3, labelHi: 'रिपोर्ट्स', labelEn: 'Reports' },
    { href: '/settings', icon: Settings, labelHi: 'सेटिंग्स एवं कोटा', labelEn: 'Settings & Quota' },
  ];

  const teacherNavItems = [
    { href: '/teacher', icon: LayoutDashboard, labelHi: 'डैशबोर्ड अवलोकन', labelEn: 'Overview' },
    { href: '/teacher/batches', icon: Layers, labelHi: 'मेरे बैच एवं छात्र', labelEn: 'My Batches' },
    { href: '/teacher/assignments', icon: FileCheck2, labelHi: 'गृहकार्य मूल्यांकन', labelEn: 'Assignments' },
    { href: '/teacher/doubts', icon: HelpCircle, labelHi: 'शंका समाधान केंद्र', labelEn: 'Doubt Center' },
    { href: '/teacher/live-classes', icon: Video, labelHi: 'लाइव कक्षाएं', labelEn: 'Live Classes' },
    { href: '/teacher/study-materials', icon: FileText, labelHi: 'नोट्स अपलोड करें', labelEn: 'Upload Notes' },
  ];

  const currentNav = role === 'teacher' || isTeacherSection ? teacherNavItems : adminNavItems;
  const isTeacherMode = role === 'teacher' || isTeacherSection;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-md flex-shrink-0">
            <Image src="/logo.png" alt="ICC Logo" width={40} height={40} className="object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide truncate">
              IDEAL COACHING
            </h1>
            <p className={`text-[11px] font-semibold ${isTeacherMode ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isTeacherMode
                ? t('शिक्षक पोर्टल (Faculty)', 'Faculty Portal')
                : t('प्रशासक पोर्टल (Admin)', 'Admin Portal')}
            </p>
          </div>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="px-3 pt-3">
        <button
          onClick={toggleLang}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('भाषा बदलें', 'Language')}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
            {lang === 'en' ? 'हिंदी' : 'English'}
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {currentNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? isTeacherMode
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t(item.labelHi, item.labelEn)}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
        {userEmail && (
          <p className="text-slate-400 text-[10px] truncate" title={userEmail}>
            👤 {userEmail}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-semibold text-[10px]">Zero-Paid Mode</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-red-900/30 hover:bg-red-800/50 text-red-300 text-[11px] font-semibold transition"
            title={t('लॉगआउट करें', 'Logout')}
          >
            <LogOut className="w-3 h-3" />
            <span>{t('लॉगआउट', 'Logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
