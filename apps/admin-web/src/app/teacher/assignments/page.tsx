'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface SubmissionItem {
  id: string;
  studentNameHi: string;
  studentNameEn: string;
  assignmentTitleHi: string;
  assignmentTitleEn: string;
  submittedAtHi: string;
  submittedAtEn: string;
  status: 'submitted' | 'graded';
  marks?: number;
  maxMarks: number;
  remarksHi?: string;
  remarksEn?: string;
}

export default function TeacherAssignmentsPage() {
  const { lang, t } = useLanguage();

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    {
      id: 'sub-1',
      studentNameHi: 'रोहित कुमार',
      studentNameEn: 'Rohit Kumar',
      assignmentTitleHi: 'अध्याय 1: रासायनिक समीकरणों को संतुलित करने का गृहकार्य',
      assignmentTitleEn: 'Chapter 1: Balancing Chemical Equations Homework Sheet',
      submittedAtHi: '12 अप्रैल 2026, 04:15 PM',
      submittedAtEn: '12 Apr 2026, 04:15 PM',
      status: 'graded',
      marks: 18,
      maxMarks: 20,
      remarksHi: 'अति उत्तम प्रस्तुति। केवल प्रश्न 6(b) में ताप का संकेत छोड़ दिया गया था।',
      remarksEn: 'Excellent work. Only missing temperature notation in Q6(b).',
    },
    {
      id: 'sub-2',
      studentNameHi: 'प्रिया सिंह',
      studentNameEn: 'Priya Singh',
      assignmentTitleHi: 'अध्याय 1: रासायनिक समीकरणों को संतुलित करने का गृहकार्य',
      assignmentTitleEn: 'Chapter 1: Balancing Chemical Equations Homework Sheet',
      submittedAtHi: '12 अप्रैल 2026, 05:30 PM',
      submittedAtEn: '12 Apr 2026, 05:30 PM',
      status: 'submitted',
      maxMarks: 20,
    },
  ]);

  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState('19');
  const [gradeRemarks, setGradeRemarks] = useState('Good work!');

  const handleSaveGrade = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'graded',
              marks: Number(gradeMarks),
              remarksHi: gradeRemarks,
              remarksEn: gradeRemarks,
            }
          : s
      )
    );
    setActiveGradeId(null);
  };

  return (
    <div className="flex-1 pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">
          {t('गृहकार्य मूल्यांकन', 'Homework & Assignment Evaluation')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t(
            'छात्रों की कॉपियां जांचें, अंक दर्ज करें एवं सुझाव प्रदान करें',
            'Review student assignment submissions, assign scores, and provide constructive feedback'
          )}
        </p>
      </header>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">{t('विद्यार्थी', 'Student')}</th>
                <th className="py-3 px-4">{t('गृहकार्य शीर्षक', 'Assignment Title')}</th>
                <th className="py-3 px-4">{t('जमा करने का समय', 'Submitted At')}</th>
                <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-4">{t('अंक', 'Marks')}</th>
                <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {lang === 'hi' ? s.studentNameHi : s.studentNameEn}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {lang === 'hi' ? s.assignmentTitleHi : s.assignmentTitleEn}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {lang === 'hi' ? s.submittedAtHi : s.submittedAtEn}
                  </td>
                  <td className="py-3 px-4">
                    {s.status === 'graded' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {t('मूल्यांकित', 'Graded')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        {t('जांच बाकी', 'Pending')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {s.status === 'graded' ? (
                      <span className="text-emerald-700">
                        {s.marks} / {s.maxMarks}
                      </span>
                    ) : (
                      <span className="text-slate-400">- / {s.maxMarks}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveGradeId(s.id)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                    >
                      {s.status === 'graded' ? t('समीक्षा', 'Review') : t('जांचें', 'Grade')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grade Modal */}
        {activeGradeId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('कॉपी का मूल्यांकन एवं अंक', 'Evaluate Submission & Assign Grade')}
                </h3>
                <button onClick={() => setActiveGradeId(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('प्राप्त अंक (कुल 20 में से)', 'Marks Awarded (Out of 20)')}
                  </label>
                  <input
                    type="number"
                    max={20}
                    min={0}
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('शिक्षक सुझाव एवं टिप्पणी', 'Teacher Remarks & Feedback')}
                  </label>
                  <textarea
                    rows={3}
                    value={gradeRemarks}
                    onChange={(e) => setGradeRemarks(e.target.value)}
                    placeholder={t('विद्यार्थी के लिए उपयोगी सुझाव लिखें...', 'Write constructive remarks for the student...')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setActiveGradeId(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    onClick={() => handleSaveGrade(activeGradeId)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  >
                    {t('अंक सहेजें', 'Save Grade')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
