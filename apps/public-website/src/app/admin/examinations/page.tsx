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
  Sparkles,
  Copy,
  Check,
  Printer,
  Bot,
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

  // Grok AI Exam Paper Generator State
  const [isAiExamModalOpen, setIsAiExamModalOpen] = useState(false);
  const [aiExamPayload, setAiExamPayload] = useState({
    board: 'BSEB',
    classLevel: 'Class 10',
    subject: 'Science',
    topic: 'Chemical Reactions & Equations',
    totalMarks: 50,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
  const [paperModel, setPaperModel] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateAiPaper = async () => {
    setAiLoading(true);
    setGeneratedPaper(null);
    try {
      const res = await fetch('/api/ai/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_exam_paper',
          payload: aiExamPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.paper) {
        setGeneratedPaper(data.paper);
        setPaperModel(data.model || 'ICC Smart AI');
      }
    } catch {
      alert('Unable to connect to AI engine. Please check network connection.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyPaper = () => {
    if (!generatedPaper) return;
    navigator.clipboard?.writeText(generatedPaper);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAiPaperToExams = () => {
    if (!generatedPaper) return;
    const newExam: MockExam = {
      id: `ex-${Date.now()}`,
      title: `${aiExamPayload.board} ${aiExamPayload.classLevel} ${aiExamPayload.subject}: ${aiExamPayload.topic} (AI Model Paper)`,
      title_hi: `${aiExamPayload.board} ${aiExamPayload.classLevel} ${aiExamPayload.subject}: ${aiExamPayload.topic} (आदर्श एआई मॉडल पेपर)`,
      duration_minutes: 90,
      total_marks: Number(aiExamPayload.totalMarks),
      pass_marks: Math.round(Number(aiExamPayload.totalMarks) * 0.33),
      negative_marking: 0.0,
      exam_type: 'Board Pattern',
      question_count: 17,
    };
    setExams([newExam, ...exams]);
    setIsAiExamModalOpen(false);
    alert('AI Exam Paper added successfully to active examination list!');
  };

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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAiExamModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>{t('ICC AI से प्रश्न पत्र बनाएं', 'Generate Paper with ICC AI')}</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('नई परीक्षा बनाएं', 'Create New Test')}</span>
            </button>
          </div>
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
        {/* Grok AI Exam Paper Generator Modal */}
        {isAiExamModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      {t('ICC Smart AI बोर्ड प्रश्न पत्र जनरेटर', 'ICC Smart AI Board Exam Paper Generator')}
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                        AI Engine
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('बिहार एवं झारखंड बोर्ड पाठ्यक्रम के अनुसार 1-क्लिक में पूरा प्रश्न पत्र और उत्तर कुंजी बनाएं', 'Generate full board-pattern papers with marking scheme & answer key')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiExamModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Generator Configuration Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Board</label>
                  <select
                    value={aiExamPayload.board}
                    onChange={(e) => setAiExamPayload({ ...aiExamPayload, board: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="BSEB">Bihar Board (BSEB)</option>
                    <option value="JAC">Jharkhand Board (JAC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Class</label>
                  <select
                    value={aiExamPayload.classLevel}
                    onChange={(e) => setAiExamPayload({ ...aiExamPayload, classLevel: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                  <select
                    value={aiExamPayload.subject}
                    onChange={(e) => setAiExamPayload({ ...aiExamPayload, subject: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Science">Science (विज्ञान)</option>
                    <option value="Mathematics">Mathematics (गणित)</option>
                    <option value="Social Science">Social Science (सामाजिक विज्ञान)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Sanskrit">Sanskrit (संस्कृत)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Marks</label>
                  <select
                    value={aiExamPayload.totalMarks}
                    onChange={(e) => setAiExamPayload({ ...aiExamPayload, totalMarks: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={20}>20 Marks (Quick Test)</option>
                    <option value={50}>50 Marks (Mid-Term)</option>
                    <option value={100}>100 Marks (Full Board Mock)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Chapter / Topic</label>
                  <input
                    type="text"
                    value={aiExamPayload.topic}
                    onChange={(e) => setAiExamPayload({ ...aiExamPayload, topic: e.target.value })}
                    placeholder="e.g. Chemical Reactions, Electricity, Trigonometry, Light..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <button
                    onClick={handleGenerateAiPaper}
                    disabled={aiLoading}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Generating...' : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {/* Generated Paper Preview Box */}
              <div className="flex-1 overflow-hidden flex flex-col border border-slate-200 rounded-2xl bg-slate-900 text-slate-100 min-h-[300px]">
                <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {paperModel || 'Ready to Generate'}
                  </span>
                  {generatedPaper && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyPaper}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-[11px] font-medium flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleSaveAiPaperToExams}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Test List</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                  {aiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                      <p className="font-sans text-xs font-semibold">
                        ICC Smart AI is drafting complete question paper with answer keys...
                      </p>
                    </div>
                  ) : generatedPaper ? (
                    generatedPaper
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                      <Bot className="w-8 h-8 text-slate-500" />
                      <p className="font-sans text-xs">
                        Select board, class & topic above and click <strong>Generate</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px]">
                  💡 ICC Smart AI generates bilingual MCQs, short questions, long questions, and answer keys.
                </span>
                <button
                  onClick={() => setIsAiExamModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
