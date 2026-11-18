'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
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
  Bell,
  MessageSquare,
  Globe,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
      }
    });
  }, []);

  if (pathname === '/login' || !pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0';
      document.cookie = 'icc-role=; path=/; max-age=0';
    }
    router.replace('/login');
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/academics', icon: GraduationCap, label: 'Classes & Subjects' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/live-classes', icon: Video, label: 'Live Classes' },
    { href: '/admin/recorded-lectures', icon: PlaySquare, label: 'Recorded Videos' },
    { href: '/admin/study-materials', icon: FileText, label: 'Notes & PDFs' },
    { href: '/admin/payments', icon: CreditCard, label: 'Payments & UTR' },
    { href: '/admin/examinations', icon: FileCheck2, label: 'Examinations' },
    { href: '/admin/notifications', icon: Bell, label: 'Push Notifications' },
    { href: '/admin/whatsapp', icon: MessageSquare, label: 'WhatsApp AI Bot' },
    { href: '/admin/teachers', icon: UserCheck, label: 'Teacher Records (रिकॉर्ड)' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { href: '/admin/settings', icon: Settings, label: 'Settings & Quota' },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1 border border-slate-700">
              <Image src="/logo.png" alt="ICC Logo" width={36} height={36} className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm leading-tight text-white tracking-wide truncate">
                IDEAL COACHING
              </h1>
              <p className="text-[11px] font-semibold text-amber-400">
                Director BADE SIR Portal
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Link to Public Website */}
        <div className="mt-3">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center justify-center space-x-1.5 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>🌐 View Website / मुख्य वेबसाइट</span>
          </Link>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
        {userEmail ? (
          <p className="text-slate-400 text-[10px] truncate" title={userEmail}>
            👤 {userEmail}
          </p>
        ) : (
          <p className="text-slate-400 text-[10px] truncate">
            👑 Director BADE SIR
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-semibold text-[10px]">Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-900/30 hover:bg-red-800/50 text-red-300 text-[11px] font-semibold transition"
            title="Logout"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Slide-Over with Backdrop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
