'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Menu, X, ArrowRight } from 'lucide-react';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
            ICC
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
              IDEAL COACHING CENTRE
            </span>
            <span className="text-[11px] font-bold text-amber-600 block">
              बिहार (BSEB) एवं झारखंड (JAC) बोर्ड
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-blue-600 transition">
            होम (Home)
          </Link>
          <Link href="/courses" className="hover:text-blue-600 transition">
            कोर्स (Courses)
          </Link>
          <Link href="/teachers" className="hover:text-blue-600 transition">
            शिक्षक (Faculty)
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            हमारे बारे में (About)
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            संपर्क (Contact)
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/download-app"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>ऐप डाउनलोड करें (APK)</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 text-sm font-semibold text-slate-800">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600"
          >
            होम (Home)
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600"
          >
            कोर्स (Courses)
          </Link>
          <Link
            href="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600"
          >
            शिक्षक (Faculty)
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600"
          >
            हमारे बारे में (About)
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600"
          >
            संपर्क (Contact)
          </Link>
          <div className="pt-2">
            <Link
              href="/download-app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <Smartphone className="w-4 h-4" />
              <span>एंड्रॉयड ऐप डाउनलोड करें (APK)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
