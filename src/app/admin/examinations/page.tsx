'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, ExaminationItem } from '@/lib/api';
import {
  FileCheck2,
  Plus,
  Clock,
  Award,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Trash2,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export default function ExaminationsPage() {
  const { lang, t } = useLanguage();
  const [exams, setExams] = useState<ExaminationItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExaminationItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    duration_minutes: 30,
    total_marks: 50,
    pass_marks: 17,
    negative_marking: 0.25,
    exam_type: 'chapter_test',
    question_count: 20,
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    title_hi: '',
    duration_minutes: 30,
    total_marks: 50,
    pass_marks: 17,
    negative_marking: 0.25,
    exam_type: 'chapter_test',
    question_count: 20,
  });

  // AI Exam Paper Generator State
  const [isAiExamModalOpen, setIsAiExamModalOpen] = useState(false);
  const [aiExamPayload, setAiExamPayload] = useState({
    classLevel: 'Class 10',
    subject: 'Science',
    topic: 'Chemical Reactions & Equations',
    totalMarks: 50,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadExams = () => {
    AdminApi.getExaminations().then((data) => setExams(data));
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await AdminApi.createExamination({
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      duration_minutes: Number(formData.duration_minutes),
      total_marks: Number(formData.total_marks),
      pass_marks: Number(formData.pass_marks),
      negative_marking: Number(formData.negative_marking),
      exam_type: formData.exam_type,
      question_count: Number(formData.question_count),
    });
    setExams((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      title_hi: '',
      duration_minutes: 30,
      total_marks: 50,
      pass_marks: 17,
      negative_marking: 0.25,
      exam_type: 'chapter_test',
      question_count: 20,
    });
  };

  const openEditModal = (exam: ExaminationItem) => {
    setEditingExam(exam);
    setEditFormData({
      title: exam.title,
      title_hi: exam.title_hi || exam.title,
      duration_minutes: exam.duration_minutes || 45,
      total_marks: exam.total_marks || 50,
      pass_marks: exam.pass_marks || 17,
      negative_marking: exam.negative_marking || 0,
      exam_type: exam.exam_type || 'chapter_test',
      question_count: exam.question_count || 20,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    const updated = await AdminApi.updateExamination(editingExam.id, {
      title: editFormData.title,
      title_hi: editFormData.title_hi,
      duration_minutes: Number(editFormData.duration_minutes),
      total_marks: Number(editFormData.total_marks),
      pass_marks: Number(editFormData.pass_marks),
      negative_marking: Number(editFormData.negative_marking),
      exam_type: editFormData.exam_type,
      question_count: Number(editFormData.question_count),
    });

    if (updated) {
      setExams((prev) => prev.map((x) => (x.id === editingExam.id ? updated : x)));
    }
    setIsEditModalOpen(false);
    setEditingExam(null);
  };

  const handleDelete = async (exam: ExaminationItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this examination:\n"${exam.title}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    await AdminApi.deleteExamination(exam.id);
    setExams((prev) => prev.filter((x) => x.id !== exam.id));
  };

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
      } else {
        alert(data.error || 'Failed to generate paper.');
      }
    } catch {
      alert('Network error while generating paper.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiPaperToExams = async () => {
    if (!generatedPaper) return;
    const title = `${aiExamPayload.classLevel} ${aiExamPayload.subject}: ${aiExamPayload.topic} (AI Model Paper)`;
    const title_hi = `${aiExamPayload.classLevel} ${aiExamPayload.subject}: ${aiExamPayload.topic} (आदर्श एआई मॉडल पेपर)`;

    const created = await AdminApi.createExamination({
      title,
      title_hi,
      duration_minutes: 90,
      total_marks: Number(aiExamPayload.totalMarks),
      pass_marks: Math.round(Number(aiExamPayload.totalMarks) * 0.33),
      negative_marking: 0.0,
      exam_type: 'mock_test',
      question_count: 25,
      description: generatedPaper.slice(0, 300),
    });

    setExams((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
    setIsAiExamModalOpen(false);
    setGeneratedPaper(null);
    alert('AI Exam Paper saved successfully to database!');
  };

  const handleCopyPaper = () => {
    if (!generatedPaper) return;
    navigator.clipboard?.writeText(generatedPaper);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="ऑनलाइन परीक्षा प्रबंधन"
        titleEn="Online Examination Portal"
        subtitleHi="एमसीक्यू प्रश्न पत्र निर्माण, संपादन एवं परिणाम प्रकाशन"
        subtitleEn="Create, edit and manage examinations with real-time sync"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`सक्रिय परीक्षाएं: ${exams.length}`, `Active Tests: ${exams.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('सर्वर-साइड सुरक्षित मूल्यांकन एवं अंक प्रणाली', 'Tamper-proof server-side grading & negative marking')}
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
        {exams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              {t('कोई परीक्षा अभी मौजूद नहीं है', 'No examinations created yet')}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {t('ऊपर दिए गए बटन से नई परीक्षा बनाएं या AI से प्रश्न पत्र तैयार करें।', 'Create a new test or generate one instantly using ICC AI.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
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
                      {lang === 'hi' ? exam.title_hi || exam.title : exam.title}
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
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    {exam.question_count || 15} {t('प्रश्न', 'Questions')}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(exam)}
                      title="Edit Test"
                      className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam)}
                      title="Delete Test"
                      className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                    {t('परीक्षा का शीर्षक (English)', 'Exam Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Class 10 Science: Weekly Sunday Test"
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
                      min={10}
                      max={180}
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('परीक्षा का प्रकार', 'Exam Type')}
                    </label>
                    <select
                      value={formData.exam_type}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="chapter_test">{t('अध्याय टेस्ट (Chapter Test)', 'Chapter Test')}</option>
                      <option value="mock_test">{t('साप्ताहिक मॉक टेस्ट (Mock Test)', 'Mock Test')}</option>
                      <option value="subject_test">{t('विषयवार टेस्ट (Subject Test)', 'Subject Test')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('कुल अंक', 'Total Marks')}</label>
                    <input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('उत्तीर्ण अंक', 'Pass Marks')}</label>
                    <input
                      type="number"
                      value={formData.pass_marks}
                      onChange={(e) => setFormData({ ...formData, pass_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('निगेटिव मार्किंग', 'Negative')}</label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.negative_marking}
                      onChange={(e) => setFormData({ ...formData, negative_marking: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    {t('परीक्षा बनाएं', 'Create Test')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Exam Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('परीक्षा संपादित करें (Edit Exam)', 'Edit Examination')}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('परीक्षा का शीर्षक (English)', 'Exam Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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
                      min={10}
                      max={180}
                      value={editFormData.duration_minutes}
                      onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('परीक्षा का प्रकार', 'Exam Type')}
                    </label>
                    <select
                      value={editFormData.exam_type}
                      onChange={(e) => setEditFormData({ ...editFormData, exam_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="chapter_test">Chapter Test</option>
                      <option value="mock_test">Mock Test</option>
                      <option value="subject_test">Subject Test</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('कुल अंक', 'Total Marks')}</label>
                    <input
                      type="number"
                      value={editFormData.total_marks}
                      onChange={(e) => setEditFormData({ ...editFormData, total_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('उत्तीर्ण अंक', 'Pass Marks')}</label>
                    <input
                      type="number"
                      value={editFormData.pass_marks}
                      onChange={(e) => setEditFormData({ ...editFormData, pass_marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('निगेटिव मार्किंग', 'Negative')}</label>
                    <input
                      type="number"
                      step="0.05"
                      value={editFormData.negative_marking}
                      onChange={(e) => setEditFormData({ ...editFormData, negative_marking: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    {t('बदलाव सहेजें', 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Exam Paper Modal */}
        {isAiExamModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    {t('ICC AI प्रश्न पत्र जनरेटर', 'ICC AI Exam Paper Generator')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAiExamModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 py-4 space-y-4 text-xs">
                {!generatedPaper ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">{t('कक्षा', 'Class')}</label>
                        <select
                          value={aiExamPayload.classLevel}
                          onChange={(e) => setAiExamPayload({ ...aiExamPayload, classLevel: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="Class 10">Class 10</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 11">Class 11</option>
                          <option value="Class 12">Class 12</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">{t('विषय', 'Subject')}</label>
                        <select
                          value={aiExamPayload.subject}
                          onChange={(e) => setAiExamPayload({ ...aiExamPayload, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="Science">Science (विज्ञान)</option>
                          <option value="Mathematics">Mathematics (गणित)</option>
                          <option value="Social Science">Social Science (सामाजिक विज्ञान)</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="English">English (अंग्रेजी)</option>
                          <option value="Sanskrit">Sanskrit (संस्कृत)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('अध्याय / टॉपिक', 'Chapter / Topic')}</label>
                      <input
                        type="text"
                        value={aiExamPayload.topic}
                        onChange={(e) => setAiExamPayload({ ...aiExamPayload, topic: e.target.value })}
                        placeholder="e.g. Chemical Reactions or Real Numbers"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('कुल अंक', 'Total Marks')}</label>
                      <input
                        type="number"
                        value={aiExamPayload.totalMarks}
                        onChange={(e) => setAiExamPayload({ ...aiExamPayload, totalMarks: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={handleGenerateAiPaper}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
                    >
                      {aiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('एआई मॉडल पेपर तैयार कर रहा है...', 'Generating AI Paper...')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('1-क्लिक में प्रश्न पत्र तैयार करें', 'Generate Model Paper (1-Click)')}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                      {generatedPaper}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCopyPaper}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Paper</span>
                        </button>
                      </div>

                      <button
                        onClick={handleSaveAiPaperToExams}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('परीक्षा सूची में जोड़ें', 'Add to Active Exams')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
