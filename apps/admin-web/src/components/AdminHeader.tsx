'use client';

import React from 'react';

interface AdminHeaderProps {
  titleHi: string;
  titleEn: string;
  subtitleHi?: string;
  subtitleEn?: string;
}

export function AdminHeader({ titleEn, subtitleEn }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{titleEn}</h2>
        {subtitleEn && (
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitleEn}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Zero Paid Policy Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>₹0/mo Plan (Active)</span>
        </div>

        {/* Super Admin Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
            DIR
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">BADE SIR (Director)</p>
            <p className="text-[10px] text-slate-500 mt-0.5">+91 9771350910</p>
          </div>
        </div>
      </div>
    </header>
  );
}
