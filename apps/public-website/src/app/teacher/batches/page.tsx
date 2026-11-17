'use client';

import React, { useState } from 'react';
import { Layers, Users, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface Student {
  id: string;
  nameHi: string;
  nameEn: string;
  rollNo: string;
  attendance: number;
}

interface Batch {
  id: string;
  nameHi: string;
  nameEn: string;
  subjectHi: string;
  subjectEn: string;
  students: Student[];
}

const BATCHES: Batch[] = [
  {
    id: 'b1',
    nameHi: 'BSEB कक्षा 10 टॉपर्स बैच',
    nameEn: 'BSEB Class 10 Toppers Batch',
    subjectHi: 'गणित एवं विज्ञान',
    subjectEn: 'Mathematics & Science',
    students: [
      { id: 's1', nameHi: 'अमित यादव', nameEn: 'Amit Yadav', rollNo: 'B10-001', attendance: 92 },
      { id: 's2', nameHi: 'प्रिया सिंह', nameEn: 'Priya Singh', rollNo: 'B10-002', attendance: 88 },
      { id: 's3', nameHi: 'रोहित कुमार', nameEn: 'Rohit Kumar', rollNo: 'B10-003', attendance: 76 },
    ],
  },
  {
    id: 'b2',
    nameHi: 'JAC कक्षा 12 विज्ञान बैच',
    nameEn: 'JAC Class 12 Science Batch',
    subjectHi: 'रसायन शास्त्र एवं भौतिकी',
    subjectEn: 'Chemistry & Physics',
    students: [
      { id: 's4', nameHi: 'सुनीता देवी', nameEn: 'Sunita Devi', rollNo: 'J12-001', attendance: 95 },
      { id: 's5', nameHi: 'मनोज कुमार', nameEn: 'Manoj Kumar', rollNo: 'J12-002', attendance: 81 },
    ],
  },
];

export default function TeacherBatchesPage() {
  const { lang, t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>('b1');

  return (
    <div className="flex-1 pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">
          {t('मेरे बैच एवं विद्यार्थी', 'My Batches & Students')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('आवंटित बैचों में नामांकित छात्रों की उपस्थिति एवं विवरण', 'Attendance and details of students in your assigned batches')}
        </p>
      </header>

      <div className="p-6 space-y-4 max-w-5xl mx-auto">
        {BATCHES.map((batch) => {
          const isOpen = expandedId === batch.id;
          return (
            <div key={batch.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : batch.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lang === 'hi' ? batch.nameHi : batch.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {lang === 'hi' ? batch.subjectHi : batch.subjectEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-xs text-slate-500 space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{batch.students.length} {t('छात्र', 'Students')}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-3 px-5">{t('विद्यार्थी', 'Student')}</th>
                        <th className="py-3 px-5">{t('रोल नंबर', 'Roll No.')}</th>
                        <th className="py-3 px-5">{t('उपस्थिति', 'Attendance')}</th>
                        <th className="py-3 px-5">{t('स्थिति', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {batch.students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-5 font-bold text-slate-900">
                            {lang === 'hi' ? s.nameHi : s.nameEn}
                          </td>
                          <td className="py-3 px-5 font-mono text-slate-500">{s.rollNo}</td>
                          <td className="py-3 px-5 font-bold">
                            <span className={s.attendance >= 85 ? 'text-emerald-700' : s.attendance >= 70 ? 'text-amber-700' : 'text-red-600'}>
                              {s.attendance}%
                            </span>
                          </td>
                          <td className="py-3 px-5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.attendance >= 85
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : s.attendance >= 70
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {s.attendance >= 85
                                ? t('नियमित', 'Regular')
                                : s.attendance >= 70
                                ? t('औसत', 'Average')
                                : t('अनियमित', 'Irregular')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
