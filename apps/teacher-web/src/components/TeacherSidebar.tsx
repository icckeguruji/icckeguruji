'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  HelpCircle,
  Video,
  FileText,
  UserCheck,
} from 'lucide-react';

export function TeacherSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: LayoutDashboard, labelHi: 'शिक्षक डैशबोर्ड', labelEn: 'Overview' },
    { href: '/batches', icon: Layers, labelHi: 'मेरे बैच एवं छात्र', labelEn: 'My Batches' },
    { href: '/assignments', icon: FileCheck2, labelHi: 'गृहकार्य एवं मूल्यांकन', labelEn: 'Assignments' },
    { href: '/doubts', icon: HelpCircle, labelHi: 'शंका समाधान केंद्र', labelEn: 'Doubt Center' },
    { href: '/live-classes', icon: Video, labelHi: 'लाइव कक्षाएं', labelEn: 'Live Classes' },
    { href: '/study-materials', icon: FileText, labelHi: 'नोट्स अपलोड करें', labelEn: 'Upload Notes' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md">
            ICC
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide">
              IDEAL COACHING
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium">
              शिक्षक पोर्टल (Faculty Portal)
            </p>
          </div>
        </div>
      </div>

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
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.labelHi}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">डॉ. एस. एन. मिश्रा</p>
        <p className="text-[10px]">वरिष्ठ संकाय - रसायन शास्त्र</p>
      </div>
    </aside>
  );
}
