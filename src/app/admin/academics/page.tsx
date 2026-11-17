'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { ClassItem, SubjectItem } from '@icc/shared-types';
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Hash,
  Sparkles,
} from 'lucide-react';

export default function AcademicsPage() {
  const { lang, t } = useLanguage();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  useEffect(() => {
    AdminApi.getAcademics().then((data) => {
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
    });
  }, []);

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="कक्षा एवं विषय प्रबंधन"
        titleEn="Classes & Curriculum Management"
        subtitleHi="संस्थान की शैक्षणिक कक्षाएं, संकाय एवं विषय संरचना"
        subtitleEn="Academic grades, streams, and subject curriculum structure"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                {t('संचालित कक्षाएं', 'Active Classes')}
              </h4>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {classes.length} {t('कक्षाएं', 'Classes')}
              </span>
            </div>

            <div className="space-y-2.5">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{c.name_hi || c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {t('सक्रिय', 'Active')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                  {t('अध्यापन विषय एवं पाठ्यक्रम सूची', 'Curriculum Subjects')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('द्विभाषी नाम (हिंदी एवं अंग्रेज़ी) तथा मानक पाठ्यक्रम कोड', 'Bilingual subject titles and curriculum codes')}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {subjects.length} {t('विषय', 'Subjects')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {sub.code.replace(/^(BSEB|JAC)-?/, '') || sub.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {t('नियमित पाठ्यक्रम', 'Standard')}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{sub.name_hi || sub.name}</h5>
                    <p className="text-[11px] text-slate-500">{sub.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
