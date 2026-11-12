'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe, Shield, Bell, User } from 'lucide-react';

interface AdminHeaderProps {
  titleHi: string;
  titleEn: string;
  subtitleHi?: string;
  subtitleEn?: string;
}

export function AdminHeader({ titleHi, titleEn, subtitleHi, subtitleEn }: AdminHeaderProps) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t(titleHi, titleEn)}</h2>
        {(subtitleHi || subtitleEn) && (
          <p className="text-xs text-slate-500 mt-0.5">
            {t(subtitleHi || '', subtitleEn || '')}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Zero Paid Policy Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>₹0/mo Plan (Free Tier)</span>
        </div>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{lang === 'hi' ? 'हिंदी (Switch to EN)' : 'English (हिंदी बदलें)'}</span>
        </button>

        {/* Super Admin Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">Super Admin</p>
            <p className="text-[10px] text-slate-500 mt-0.5">superadmin@icc.in</p>
          </div>
        </div>
      </div>
    </header>
  );
}
