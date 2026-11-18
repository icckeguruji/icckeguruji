'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import WhatsAppFloatingWidget from './WhatsAppFloatingWidget';
import GrokAICounselorWidget from './GrokAICounselorWidget';
import { Menu, ShieldCheck } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  // 1. Admin Section: Mobile Topbar + Responsive Sidebar + White Canvas
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Mobile Topbar for Admin */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setMobileAdminOpen(true)}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-slate-700 flex items-center justify-center">
              <Image src="/logo.png" alt="ICC Logo" width={28} height={28} className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h1 className="font-bold text-xs leading-none text-white tracking-wide">
                IDEAL COACHING
              </h1>
              <span className="text-[10px] text-amber-400 font-semibold">
                Director BADE SIR
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Sidebar Component (Desktop Sticky + Mobile Slide Drawer) */}
        <AdminSidebar
          mobileOpen={mobileAdminOpen}
          onCloseMobile={() => setMobileAdminOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // 2. Dedicated Login Page
  if (isLogin) {
    return (
      <main className="min-h-screen bg-slate-900">
        {children}
      </main>
    );
  }

  // 3. Public Website Mode (Header + Body + Footer + WhatsApp + AI Counselor)
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <WhatsAppFloatingWidget />
      <GrokAICounselorWidget />
    </div>
  );
}
