'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  FileCheck2,
  HelpCircle,
  Video,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string>('Faculty');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const role = user.app_metadata?.role as string | undefined;
      if (role !== 'teacher') {
        router.replace('/');
        return;
      }
      const name =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.email?.split('@')[0] ?? 'Faculty');
      setTeacherName(name);
    });
  }, [router]);

  const initials = teacherName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex-1 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {t('शिक्षक डैशबोर्ड अवलोकन', 'Teacher Dashboard Overview')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('आइडियल कोचिंग सेंटर - संकाय कार्यप्रणाली', 'Ideal Coaching Centre – Faculty Workspace')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{teacherName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {t('संकाय सदस्य', 'Faculty Member')}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Action Alert */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {t('1 नया विद्यार्थी प्रश्न उत्तर की प्रतीक्षा में है', '1 student question is waiting for your reply')}
              </p>
              <p className="text-xs text-amber-700">
                {t(
                  'अध्याय 1: यूक्लिड विभाजन प्रमेयिका से संबंधित शंका।',
                  'Chapter 1: Euclid Division Lemma doubt submitted.'
                )}
              </p>
            </div>
          </div>
          <Link
            href="/teacher/doubts"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            <span>{t('उत्तर दें', 'Reply Now')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('आवंटित बैच', 'Assigned Batches')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">2 {t('बैच', 'Batches')}</h3>
              <p className="text-xs text-slate-500 mt-1">83 {t('नामांकित विद्यार्थी', 'Enrolled Students')}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('लंबित गृहकार्य', 'Pending Homework')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">4 {t('कॉपियां', 'Submissions')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('मूल्यांकन बाकी है', 'Awaiting Grading')}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('छात्र शंकाएं', 'Student Doubts')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">1 {t('लंबित', 'Unresolved')}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">12 {t('हल की गईं', 'Resolved')}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('आज की लाइव क्लास', "Today's Live Class")}
              </span>
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-800">1 {t('क्लास', 'Session')}</h3>
              <p className="text-xs text-slate-500 mt-1">04:30 PM IST</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/teacher/batches"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {t('मेरे बैच एवं विद्यार्थी', 'My Batches & Students')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('आवंटित बैचों में नामांकित छात्रों की सूची देखें', 'View students enrolled in your assigned batches')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            href="/teacher/assignments"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {t('गृहकार्य असाइन करें एवं कॉपियां जांचें', 'Assign Homework & Review Submissions')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'विद्यार्थियों के पीडीएफ उत्तरों का मूल्यांकन कर अंक और सुझाव दें',
                  'Evaluate student homework PDFs, assign scores, and write feedback'
                )}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            href="/teacher/doubts"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {t('शंका समाधान केंद्र', 'Doubt Resolution Center')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'विद्यार्थियों द्वारा भेजे गए शैक्षणिक प्रश्नों का उत्तर दें',
                  'Answer academic questions submitted by students'
                )}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            href="/teacher/live-classes"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {t('लाइव कक्षाएं', 'Live Classes')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('अनुसूचित लाइव क्लास लिंक प्रबंधित करें', 'Manage scheduled live class links')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <Link
            href="/teacher/study-materials"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                {t('नोट्स एवं सामग्री अपलोड करें', 'Upload Notes & Study Materials')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('पीडीएफ नोट्स एवं अध्ययन सामग्री साझा करें', 'Share PDF notes and study resources with students')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </Link>

          <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm flex items-center space-x-3">
            <FileText className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                {t('IDEAL COACHING CENTRE', 'IDEAL COACHING CENTRE')}
              </p>
              <p className="text-[10px] text-emerald-700">
                {t('निदेशक: BADE SIR · +91 9771350910', 'Director: BADE SIR · +91 9771350910')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
