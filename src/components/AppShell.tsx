'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import WhatsAppFloatingWidget from './WhatsAppFloatingWidget';
import GrokAICounselorWidget from './GrokAICounselorWidget';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  // 1. Admin Section: Clean Dark Sidebar + White Canvas
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
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
