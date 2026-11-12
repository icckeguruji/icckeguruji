'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { AcademicBoard, ClassItem, SubjectItem } from '@icc/shared-types';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Plus,
  CheckCircle,
  Hash,
} from 'lucide-react';

export default function AcademicsPage() {
  const { lang, t } = useLanguage();
  const [boards, setBoards] = useState<AcademicBoard[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('BSEB');

  useEffect(() => {
    AdminApi.getAcademics().then((data) => {
      setBoards(data.boards);
      setClasses(data.classes);
      setSubjects(data.subjects);
    });
  }, []);

  const currentBoard = boards.find((b) => b.code === selectedBoard) || boards[0];
  const boardSubjects = subjects.filter((s) =>
    selectedBoard === 'BSEB'
      ? s.code.startsWith('BSEB')
      : s.code.startsWith('JAC')
  );

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="शैक्षणिक ढांचा (Academic Management)"
        titleEn="Academic Hierarchy Management"
        subtitleHi="केवल बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC) पाठ्यक्रम संरचना"
        subtitleEn="Restricted strictly to Bihar Board and Jharkhand Board curriculums"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Board Switcher */}
        <div className="flex space-x-3">
          <button
            onClick={() => setSelectedBoard('BSEB')}
            className={`flex-1 p-4 rounded-xl border text-left transition ${
              selectedBoard === 'BSEB'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-100'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-blue-900">
                बिहार विद्यालय परीक्षा समिति (BSEB)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                Bihar Board
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('मैट्रिक एवं इंटरमीडिएट पाठ्यक्रम (Classes 9, 10, 11, 12)', 'Matric & Inter Curriculum')}
            </p>
          </button>

          <button
            onClick={() => setSelectedBoard('JAC')}
            className={`flex-1 p-4 rounded-xl border text-left transition ${
              selectedBoard === 'JAC'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-900">
                झारखंड अधिविद्य परिषद् (JAC Ranchi)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                Jharkhand Board
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('मैट्रिक एवं इंटरमीडिएट पाठ्यक्रम (Classes 9, 10, 11, 12)', 'Matric & Inter Curriculum')}
            </p>
          </button>
        </div>

        {/* Classes & Subjects for Selected Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Column */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                {t('समर्थित कक्षाएं', 'Supported Classes')}
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">4 Classes</span>
            </div>

            <div className="space-y-2">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{c.name_hi}</p>
                    <p className="text-[11px] text-slate-500">{c.name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {t('सक्रिय', 'Active')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Column */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                  {t(
                    `${selectedBoard} बोर्ड के विषय एवं कोड`,
                    `${selectedBoard} Board Subjects & Codes`
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('द्विभाषी नाम (हिंदी एवं अंग्रेज़ी) तथा आधिकारिक बोर्ड कोड', 'Bilingual curriculum & codes')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {boardSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{t('कक्षा 10', 'Class 10')}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{sub.name_hi}</h5>
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
