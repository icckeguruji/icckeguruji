'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function AdminSidebar() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();

  const navItems = [
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
    { href: '/teachers', icon: UserCheck, labelHi: 'शिक्षक', labelEn: 'Teachers' },
    { href: '/reports', icon: BarChart3, labelHi: 'रिपोर्ट्स', labelEn: 'Reports' },
    { href: '/settings', icon: Settings, labelHi: 'सेटिंग्स एवं कोटा', labelEn: 'Settings & Quota' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            ICC
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide">
              IDEAL COACHING
            </h1>
            <p className="text-[11px] text-amber-400 font-medium">
              {lang === 'hi' ? 'बिहार एवं झारखंड बोर्ड' : 'BSEB & JAC Board'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(item.labelHi, item.labelEn)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Free Tier Compliance Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px]">
        <div className="flex items-center space-x-2 text-emerald-400 mb-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">Zero-Paid Free Policy: Active</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-snug">
          ₹0/mo Target · Supabase Free · YouTube Live
        </p>
      </div>
    </aside>
  );
}
