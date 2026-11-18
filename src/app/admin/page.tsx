'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { formatINR } from '@icc/shared-utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  HardDrive,
  Database,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalRevenue: 0,
    pdfCount: 0,
    liveClassesToday: 0,
  });

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const data = await AdminApi.getDashboardAnalytics();
      setStats(data);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-dashboard-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
          loadStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          loadStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          loadStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="डैशबोर्ड अवलोकन"
        titleEn="Dashboard Overview"
        subtitleHi="आइडियल कोचिंग सेंटर - डायरेक्टर बड़े सर प्रशासनिक पोर्टल"
        subtitleEn="Ideal Coaching Centre - Director BADE SIR Management System"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">
              {t('लाइव क्लाउड सिंक सक्रिय (Supabase Live)', 'Live Cloud Sync (Supabase Live)')}
            </span>
          </div>
          <button
            onClick={loadStats}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{t('रिफ्रेश', 'Refresh')}</span>
          </button>
        </div>
        {/* Urgent Action Alert: Pending Payments */}
        {stats.pendingPayments > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {t(
                    `${stats.pendingPayments} नए शुल्क भुगतान सत्यापन की प्रतीक्षा में हैं`,
                    `${stats.pendingPayments} new UPI payments awaiting verification`
                  )}
                </p>
                <p className="text-xs text-amber-700">
                  {t(
                    'विद्यार्थी के भुगतान का यूटीआर (UTR) और स्क्रीनशॉट जांचकर कोर्स एक्टिवेट करें।',
                    'Review transaction reference & screenshot to activate student enrollments.'
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/admin/payments"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
            >
              <span>{t('अभी जांचें', 'Review Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('कुल विद्यार्थी', 'Total Students')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalStudents}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.activeStudents} {t('सक्रिय अध्येता', 'Active Learners')}
              </p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('सक्रिय पाठ्यक्रम', 'Published Courses')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalCourses}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('सत्र 2026-27 पाठ्यक्रम', 'Session 2026-27 Courses')}
              </p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('प्राप्त कुल शुल्क', 'Total Collected Fee')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{formatINR(stats.totalRevenue)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {stats.approvedPayments} {t('स्वीकृत भुगतान', 'Verified Payments')}
              </p>
            </div>
          </div>

          {/* Study Materials & Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('अपलोड की गई सामग्री', 'Study Materials')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">{stats.pdfCount}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('स्वचालित असाइन किए गए पीडीएफ', 'Auto-assigned PDFs')}
              </p>
            </div>
          </div>
        </div>

        {/* Free Tier Compliance & Resource Quota Meter */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {t('शून्य-लागत अवसंरचना स्थिति (Zero-Paid Policy)', 'Zero-Cost Infrastructure Meter')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t(
                  'प्रणाली केवल वैध निःशुल्क योजनाओं (₹0/माह) पर संचालित है। स्वचालित भुगतान उन्नयन पूर्णतः अक्षम है।',
                  'System strictly runs within verified free plans. Paid upgrades are disabled.'
                )}
              </p>
            </div>
            <div className="mt-3 md:mt-0 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold self-start md:self-auto">
              ₹0.00 / Monthly Spend
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            {/* Database Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1 text-blue-400" /> PostgreSQL DB
                </span>
                <span className="font-bold text-slate-200">14.2 MB / 500 MB (2.8%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2.8%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('तालिकाओं और अनुक्रमणिका का कुशल उपयोग', 'Efficient indexing & storage')}
              </p>
            </div>

            {/* Storage Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <HardDrive className="w-3.5 h-3.5 mr-1 text-purple-400" /> Supabase Storage
                </span>
                <span className="font-bold text-slate-200">42.8 MB / 1000 MB (4.2%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '4.2%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('केवल संपीड़ित पीडीएफ और रसीदें', 'Compressed PDFs & receipts only')}
              </p>
            </div>

            {/* Authentication Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Auth MAU Quota
                </span>
                <span className="font-bold text-slate-200">3 / 50,000 (&lt;0.1%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0.1%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('ईमेल ओटीपी (एसएमएस शुल्क ₹0)', 'Email OTP (₹0 SMS expense)')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/courses"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('नया कोर्स जोड़ें', 'Add New Course')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('कक्षा 1 से 12वीं के लिए', 'For Classes 1st to 12th')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>

          <Link
            href="/admin/study-materials"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('पीडीएफ नोट्स अपलोड करें', 'Upload PDF Notes')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('स्वचालित शैक्षणिक मैपिंग के साथ', 'With Automatic Academic Mapping')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>

          <Link
            href="/admin/live-classes"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                {t('यूट्यूब लाइव क्लास शेड्यूल करें', 'Schedule YouTube Live')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('बैच अनुसार कक्षा प्रसारण', 'Batch-wise live broadcast')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
