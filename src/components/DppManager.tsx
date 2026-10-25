'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Send,
  Download,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { DppAssignment, DppSubmission, User } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface DppManagerProps {
  courseId: string;
  courseTitle: string;
  dpps: DppAssignment[];
  submissions: DppSubmission[];
  currentUser: User;
  onRefresh: () => void;
}

export default function DppManager({
  courseId,
  courseTitle,
  dpps,
  submissions,
  currentUser,
  onRefresh
}: DppManagerProps) {
  const [selectedDpp, setSelectedDpp] = useState<DppAssignment | null>(dpps[0] || null);
  const [answerText, setAnswerText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Filter DPPs for this course
  const courseDpps = dpps.filter((d) => d.courseId === courseId);

  // Find submission for currently selected DPP by this user
  const currentSubmission = selectedDpp
    ? submissions.find((s) => s.dppId === selectedDpp.id && s.userId === currentUser.id)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDpp || !answerText.trim()) return;

    setSubmitting(true);

    const newSub: DppSubmission = {
      id: `sub-${Date.now()}`,
      dppId: selectedDpp.id,
      courseId: courseId,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      answerText: answerText.trim(),
      status: 'pending',
      attachmentName: attachmentName.trim() || `${currentUser.name.replace(/\s+/g, '_')}_Answers.pdf`
    };

    const updated = [newSub, ...submissions.filter((s) => !(s.dppId === selectedDpp.id && s.userId === currentUser.id))];
    saveStoredData('DPP_SUBMISSIONS', updated);

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setAnswerText('');
      setAttachmentName('');
      onRefresh();
      setTimeout(() => setSuccessMsg(false), 4000);
    }, 600);
  };

  if (courseDpps.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No DPPs Released Yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Guruji is preparing Daily Practice Problems for this chapter. They will appear here right after today&apos;s live lecture.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left List of DPPs */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Daily Practice Problems ({courseDpps.length})
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Chapter Tasks</span>
        </div>

        <div className="space-y-2.5">
          {courseDpps.map((dpp, idx) => {
            const sub = submissions.find((s) => s.dppId === dpp.id && s.userId === currentUser.id);
            const isSelected = selectedDpp?.id === dpp.id;

            return (
              <div
                key={dpp.id}
                onClick={() => {
                  setSelectedDpp(dpp);
                  setSuccessMsg(false);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{dpp.chapter}</span>
                  </div>
                  {sub ? (
                    sub.status === 'graded' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {sub.marksAwarded}/{dpp.totalMarks}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      Not Submitted
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">{dpp.title}</h4>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due: {dpp.dueDate}
                  </span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {dpp.totalMarks} Marks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Details & Submission Form */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        {selectedDpp ? (
          <>
            {/* Header */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {selectedDpp.chapter}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Submission Deadline: <strong className="text-slate-800">{selectedDpp.dueDate}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedDpp.title}</h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{selectedDpp.description}</p>

              {/* Action Bar */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={selectedDpp.pdfUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold inline-flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download DPP Sheet (PDF)
                </a>
                <span className="text-xs text-slate-500">
                  {selectedDpp.questionCount} Questions • Maximum Marks: {selectedDpp.totalMarks}
                </span>
              </div>
            </div>

            {/* If Student Already Submitted */}
            {currentSubmission ? (
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    currentSubmission.status === 'graded'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            currentSubmission.status === 'graded'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {currentSubmission.status === 'graded' ? (
                            <Award className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {currentSubmission.status === 'graded'
                              ? 'Evaluated by Guruji'
                              : 'Submitted — Under Review'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Submitted on {currentSubmission.submittedAt} by {currentSubmission.userName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {currentSubmission.status === 'graded' && (
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-700">
                          {currentSubmission.marksAwarded}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/{selectedDpp.totalMarks}</span>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          Marks Awarded
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guruji Feedback */}
                  {currentSubmission.feedback && (
                    <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-extrabold text-slate-800">
                          Guruji&apos;s Teacher Feedback:
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 italic">{currentSubmission.feedback}</p>
                    </div>
                  )}

                  {/* Student Answer Snapshot */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Aapka Solution:</span>
                    <p className="mt-1 font-mono text-slate-800 whitespace-pre-wrap bg-white/80 p-3 rounded-lg border border-slate-200">
                      {currentSubmission.answerText}
                    </p>
                    {currentSubmission.attachmentName && (
                      <span className="inline-flex items-center gap-1.5 mt-2 font-semibold text-blue-700">
                        <FileText className="w-3.5 h-3.5" />
                        {currentSubmission.attachmentName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Option to resubmit */}
                <div className="text-right">
                  <button
                    onClick={() => {
                      if (confirm('Kya aap naya solution resubmit karna chahte hain?')) {
                        setAnswerText(currentSubmission.answerText);
                        const updated = submissions.filter((s) => s.id !== currentSubmission.id);
                        saveStoredData('DPP_SUBMISSIONS', updated);
                        onRefresh();
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    Resubmit Solution
                  </button>
                </div>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Submit Your Solution / Answers
                  </label>
                  <span className="text-xs text-slate-400">Step-by-step or Final Answers</span>
                </div>

                <div>
                  <textarea
                    rows={6}
                    required
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Apna step-by-step numerical solution yahan type karein ya final answers likhein...&#10;Jaise:&#10;Q1: Formula used F = kq1q2/r^2 => Answer = 1.6 x 10^-14 N&#10;Q2: Zero due to symmetry"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm text-slate-800 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      File Name / Drive Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="e.g. Rahul_Notes.pdf ya Google Drive link"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={submitting || !answerText.trim()}
                      className="w-full py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {submitting ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit to Guruji for Review
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Shabash! Aapka solution successfully Guruji tak pahunch gaya hai. Evaluated marks jaldi update honge.
                  </div>
                )}
              </form>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
