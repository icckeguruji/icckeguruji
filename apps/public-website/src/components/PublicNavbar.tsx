'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, Menu, X, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { supabase } from '@/lib/supabase';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 border-2 border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="IDEAL COACHING CENTRE"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
              IDEAL COACHING CENTRE
            </span>
            <span className="text-[11px] font-bold text-amber-600 block">
              BSEB & JAC Board
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/courses" className="hover:text-blue-600 transition">
            Courses
          </Link>
          <Link href="/teachers" className="hover:text-blue-600 transition">
            Faculty
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/download-app"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>Download App</span>
          </Link>

          <Link
            href={isLoggedIn ? '/admin' : '/login'}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md border border-slate-700 transition"
          >
            {isLoggedIn ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Dashboard</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Admin Login</span>
              </>
            )}
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center space-x-2">
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
            Home
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            Courses
          </Link>
          <Link
            href="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            Faculty
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 hover:text-blue-600"
          >
            Contact
          </Link>
          <div className="pt-2 space-y-2">
            <Link
              href="/download-app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Download App</span>
            </Link>

            <Link
              href={isLoggedIn ? '/admin' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs border border-slate-800 shadow-sm"
            >
              {isLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Dashboard</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Login</span>
                </>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
