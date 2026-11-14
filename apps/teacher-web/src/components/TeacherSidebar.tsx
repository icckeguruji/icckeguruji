'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  HelpCircle,
  Video,
  FileText,
  Globe,
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function TeacherSidebar() {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { href: '/', icon: LayoutDashboard, labelHi: 'डैशबोर्ड अवलोकन', labelEn: 'Overview' },
    { href: '/batches', icon: Layers, labelHi: 'मेरे बैच एवं छात्र', labelEn: 'My Batches' },
    { href: '/assignments', icon: FileCheck2, labelHi: 'गृहकार्य मूल्यांकन', labelEn: 'Assignments' },
    { href: '/doubts', icon: HelpCircle, labelHi: 'शंका समाधान केंद्र', labelEn: 'Doubt Center' },
    { href: '/live-classes', icon: Video, labelHi: 'लाइव कक्षाएं', labelEn: 'Live Classes' },
    { href: '/study-materials', icon: FileText, labelHi: 'नोट्स अपलोड करें', labelEn: 'Upload Notes' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-md">
            <Image src="/logo.png" alt="ICC Logo" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide">
              IDEAL COACHING
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium">
              {t('शिक्षक पोर्टल', 'Faculty Portal')}
            </p>
          </div>
        </div>
      </div>

      {/* Language Switcher Button */}
      <div className="px-3 pt-3">
        <button
          onClick={toggleLang}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
        >
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('भाषा बदलें', 'Language')}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
            {lang === 'en' ? 'हिंदी' : 'English'}
          </span>
        </button>
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
              <span>{t(item.labelHi, item.labelEn)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">
          {t('BADE SIR — निदेशक', 'BADE SIR — Director')}
        </p>
        <p className="text-[10px]">
          {t('आइडियल कोचिंग सेंटर, सरोतिया, गोड्डा', 'IDEAL COACHING CENTRE, Sarotiya, Godda')}
        </p>
      </div>
    </aside>
  );
}
