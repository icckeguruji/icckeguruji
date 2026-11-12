'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Award,
} from 'lucide-react';

interface SubmissionItem {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  marks?: number;
  maxMarks: number;
  remarks?: string;
}

export default function TeacherAssignmentsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    {
      id: 'sub-1',
      studentName: 'Rohit Kumar (रोहित कुमार)',
      assignmentTitle: 'अध्याय 1: रासायनिक समीकरणों को संतुलित करने का गृहकार्य',
      submittedAt: '12 अप्रैल 2026, 04:15 PM',
      status: 'graded',
      marks: 18,
      maxMarks: 20,
      remarks: 'अति उत्तम प्रस्तुति। केवल प्रश्न 6(b) में ताप का संकेत छोड़ दिया गया था।',
    },
    {
      id: 'sub-2',
      studentName: 'Priya Singh (प्रिया सिंह)',
      assignmentTitle: 'अध्याय 1: रासायनिक समीकरणों को संतुलित करने का गृहकार्य',
      submittedAt: '12 अप्रैल 2026, 05:30 PM',
      status: 'submitted',
      maxMarks: 20,
    },
  ]);

  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState('19');
  const [gradeRemarks, setGradeRemarks] = useState('बहुत अच्छा कार्य!');

  const handleSaveGrade = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'graded',
              marks: Number(gradeMarks),
              remarks: gradeRemarks,
            }
          : s
      )
    );
    setActiveGradeId(null);
  };

  return (
    <div className="flex-1 pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">गृहकार्य एवं उत्तर पुस्तिका मूल्यांकन</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          छात्रों की कॉपियां जांचें, अंक दर्ज करें एवं व्यक्तिगत सुझाव प्रदान करें
        </p>
      </header>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">विद्यार्थी</th>
                <th className="py-3 px-4">गृहकार्य शीर्षक</th>
                <th className="py-3 px-4">जमा करने का समय</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4">अंक (Marks)</th>
                <th className="py-3 px-4 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.studentName}</td>
                  <td className="py-3 px-4 text-slate-800">{s.assignmentTitle}</td>
                  <td className="py-3 px-4 text-slate-500">{s.submittedAt}</td>
                  <td className="py-3 px-4">
                    {s.status === 'graded' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        मूल्यांकित (Graded)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                        जांच बाकी (Pending)
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
                      {s.status === 'graded' ? 'समीक्षा' : 'जांचें एवं अंक दें'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Modal */}
        {activeGradeId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">विद्यार्थी कॉपी मूल्यांकन</h3>
                <button onClick={() => setActiveGradeId(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    अंक प्रदान करें (अधिकतम 20 अंक)
                  </label>
                  <input
                    type="number"
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    शिक्षक सुझाव एवं टिप्पणी
                  </label>
                  <textarea
                    rows={3}
                    value={gradeRemarks}
                    onChange={(e) => setGradeRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActiveGradeId(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  onClick={() => handleSaveGrade(activeGradeId)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  अंक सुरक्षित करें
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
