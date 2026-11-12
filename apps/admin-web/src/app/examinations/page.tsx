'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import {
  FileCheck2,
  Plus,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface MockExam {
  id: string;
  title: string;
  title_hi: string;
  duration_minutes: number;
  total_marks: number;
  pass_marks: number;
  negative_marking: number;
  exam_type: string;
  question_count: number;
}

export default function ExaminationsPage() {
  const { lang, t } = useLanguage();
  const [exams, setExams] = useState<MockExam[]>([
    {
      id: 'ex-1',
      title: 'BSEB Class 10 Science: Chemical Reactions Practice Test',
      title_hi: 'बिहार बोर्ड कक्षा 10 विज्ञान: रासायनिक अभिक्रियाएँ अभ्यास परीक्षा',
      duration_minutes: 30,
      total_marks: 20,
      pass_marks: 7,
      negative_marking: 0.25,
      exam_type: 'chapter_test',
      question_count: 20,
    },
    {
      id: 'ex-2',
      title: 'JAC Class 10 Mathematics: Real Numbers Mock Test',
      title_hi: 'झारखंड बोर्ड कक्षा 10 गणित: वास्तविक संख्याएं मॉक टेस्ट',
      duration_minutes: 45,
      total_marks: 25,
      pass_marks: 9,
      negative_marking: 0.0,
      exam_type: 'chapter_test',
      question_count: 25,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    duration_minutes: 30,
    total_marks: 20,
    pass_marks: 7,
    negative_marking: 0.25,
    exam_type: 'chapter_test',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: MockExam = {
      id: `ex-${Date.now()}`,
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      duration_minutes: Number(formData.duration_minutes),
      total_marks: Number(formData.total_marks),
      pass_marks: Number(formData.pass_marks),
      negative_marking: Number(formData.negative_marking),
      exam_type: formData.exam_type,
      question_count: 10,
    };
    setExams([newExam, ...exams]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      title_hi: '',
      duration_minutes: 30,
      total_marks: 20,
      pass_marks: 7,
      negative_marking: 0.25,
      exam_type: 'chapter_test',
    });
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="ऑनलाइन परीक्षा प्रबंधन"
        titleEn="Online Examination Portal"
        subtitleHi="एमसीक्यू प्रश्न पत्र निर्माण, सर्वर-साइड मूल्यांकन एवं परिणाम प्रकाशन"
        subtitleEn="Create MCQ tests, configure negative marking and server-side evaluation"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`सक्रिय परीक्षाएं: ${exams.length}`, `Active Tests: ${exams.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('सर्वर-साइड सुरक्षित मूल्यांकन (क्लाइंट में उत्तर लीक नहीं होते)', 'Server-side tamper-proof grading')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नई परीक्षा बनाएं', 'Create New Test')}</span>
          </button>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                  {exam.exam_type}
                </span>
                <span className="text-xs text-slate-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {exam.duration_minutes} {t('मिनट', 'mins')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {lang === 'hi' ? exam.title_hi : exam.title}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('कुल अंक', 'Marks')}</span>
                  <span className="font-bold text-slate-800">{exam.total_marks}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('उत्तीर्ण अंक', 'Pass Marks')}</span>
                  <span className="font-bold text-slate-800">{exam.pass_marks}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('निगेटिव मार्किंग', 'Negative')}</span>
                  <span className="font-bold text-rose-600">-{exam.negative_marking}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-slate-500 font-medium">
                  {exam.question_count} {t('प्रश्न संलग्न', 'Questions')}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition">
                  {t('प्रश्न प्रबंधित करें', 'Manage Questions')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Exam Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('नई परीक्षा बनाएं (Create Exam)', 'Create Examination')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('परीक्षा शीर्षक (English)', 'Exam Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Science Chapter 1 MCQ Practice Test"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('परीक्षा शीर्षक (हिंदी)', 'Exam Title (Hindi)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="उदा. विज्ञान अध्याय 1 वस्तुनिष्ठ प्रश्न परीक्षा"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('अवधि (मिनट)', 'Duration (Minutes)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('कुल अंक', 'Total Marks')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('उत्तीर्ण अंक (Pass Marks)', 'Pass Marks')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.pass_marks}
                      onChange={(e) => setFormData({ ...formData, pass_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('निगेटिव मार्किंग (Negative Mark)', 'Negative Mark (per error)')}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.negative_marking}
                      onChange={(e) => setFormData({ ...formData, negative_marking: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {t('परीक्षा सुरक्षित करें', 'Save Exam')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
