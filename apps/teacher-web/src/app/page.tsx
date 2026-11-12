'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  FileCheck2,
  HelpCircle,
  Video,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  return (
    <div className="flex-1 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800">शिक्षक डैशबोर्ड अवलोकन</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            आइडियल कोचिंग सेंटर - संकाय कार्यप्रणाली (Faculty Workspace)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
            SN
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">डॉ. एस. एन. मिश्रा</p>
            <p className="text-[10px] text-slate-500 mt-0.5">रसायन शास्त्र एवं विज्ञान संकाय</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Action Alert: Unanswered Doubts */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                1 नया विद्यार्थी प्रश्न उत्तर की प्रतीक्षा में है
              </p>
              <p className="text-xs text-amber-700">
                अध्याय 1: यूक्लिड विभाजन प्रमेयिका से संबंधित शंका का समाधान करें।
              </p>
            </div>
          </div>
          <Link
            href="/doubts"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            <span>उत्तर दें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                आवंटित बैच (Batches)
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">2 बैच</h3>
              <p className="text-xs text-slate-500 mt-1">83 नामांकित विद्यार्थी</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                लंबित गृहकार्य (Homework)
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">4 कॉपियां</h3>
              <p className="text-xs text-slate-500 mt-1">मूल्यांकन बाकी है</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                छात्र शंकाएं (Doubts)
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">1 खुली</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">12 हल की गईं</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                आज की लाइव क्लास
              </span>
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">1 क्लास</h3>
              <p className="text-xs text-slate-500 mt-1">शाम 04:30 PM</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/assignments"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                गृहकार्य असाइन करें एवं कॉपियां जांचें
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                विद्यार्थियों के पीडीएफ उत्तरों का मूल्यांकन कर अंक और सुझाव प्रदान करें
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            href="/doubts"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                शंका समाधान केंद्र (Doubt Resolution)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                विद्यार्थियों द्वारा भेजे गए शैक्षणिक प्रश्नों का लिखित एवं स्पष्ट उत्तर दें
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
