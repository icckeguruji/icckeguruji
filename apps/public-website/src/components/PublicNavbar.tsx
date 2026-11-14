'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="IDEAL COACHING CENTRE"
            className="w-11 h-11 object-contain rounded-xl shadow-xs bg-white p-0.5 border border-slate-200"
          />
          <div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
              IDEAL COACHING CENTRE
            </span>
            <span className="text-[11px] font-bold text-amber-600 block">
              {t('बिहार एवं झारखंड बोर्ड', 'BSEB & JAC Board')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-blue-600 transition">
            {t('होम', 'Home')}
          </Link>
          <Link href="/courses" className="hover:text-blue-600 transition">
            {t('कोर्स', 'Courses')}
          </Link>
          <Link href="/teachers" className="hover:text-blue-600 transition">
            {t('शिक्षक', 'Faculty')}
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            {t('परिचय', 'About Us')}
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            {t('संपर्क', 'Contact')}
          </Link>
        </nav>

        {/* Right CTA & Language Toggle */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          <Link
            href="/download-app"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>{t('ऐप डाउनलोड करें', 'Download App')}</span>
          </Link>
        </div>

        {/* Mobile Hamburger & Lang Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 text-sm font-semibold text-slate-800">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            {t('होम', 'Home')}
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            {t('कोर्स', 'Courses')}
          </Link>
          <Link
            href="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            {t('शिक्षक', 'Faculty')}
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            {t('परिचय', 'About Us')}
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            {t('संपर्क', 'Contact')}
          </Link>
          <div className="pt-2">
            <Link
              href="/download-app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('ऐप डाउनलोड करें', 'Download App')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
