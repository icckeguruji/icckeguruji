'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Award,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Bookmark,
  Play,
  X,
  FileQuestion
} from 'lucide-react';
import { Quiz, QuizQuestion } from '@/types';
import { getStoredData } from '@/lib/storage';

interface TimedQuizHubProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  initialQuizId?: string;
}

export default function TimedQuizHub({
  isOpen,
  onClose,
  studentName = 'Student',
  initialQuizId
}: TimedQuizHubProps) {
  const [data] = useState(() => getStoredData());
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(() => {
    const list = data.quizzes || [];
    return list.find((q) => q.id === initialQuizId) || list[0] || null;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState((selectedQuiz?.durationMinutes || 10) * 60);

  const handleSelectQuiz = (q: Quiz) => {
    setSelectedQuiz(q);
    setTimeLeft(q.durationMinutes * 60);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setIsSubmitted(false);
    setIsRunning(false);
  };

  // Live countdown timer
  useEffect(() => {
    if (!isRunning || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isSubmitted, timeLeft]);

  if (!isOpen) return null;

  const questions: QuizQuestion[] = selectedQuiz?.questions || [];
  const currentQ = questions[currentIdx];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 120 && isRunning; // Less than 2 minutes

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((prev) => prev - 1);
  };

  const handleStartQuiz = () => {
    setIsRunning(true);
    setIsSubmitted(false);
    setTimeLeft((selectedQuiz?.durationMinutes || 10) * 60);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsRunning(false);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setIsRunning(false);
    setTimeLeft((selectedQuiz?.durationMinutes || 10) * 60);
  };

  // Score Calculation
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const attemptedCount = Object.keys(selectedAnswers).length;
  const incorrectCount = attemptedCount - correctCount;
  const totalScore = correctCount * 4 - incorrectCount * 1; // Standard +4 / -1 marking
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  ICC KE GURUJI Timed Mock Quiz
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase">
                  Timed Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedQuiz?.title || 'Speed Drill'} • Candidate: {studentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer Pill */}
            {isRunning && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-black text-sm transition-all border ${
                  isLowTime
                    ? 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse'
                    : 'bg-indigo-600/30 text-indigo-200 border-indigo-400/40'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Available Quiz Selector Pill Bar */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Choose Quiz:
          </span>
          {(data.quizzes || []).map((q) => (
            <button
              key={q.id}
              onClick={() => {
                if (!isRunning || confirm('Switch quiz? Current test progress will reset.')) {
                  handleSelectQuiz(q);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedQuiz?.id === q.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>{q.title}</span>
              <span className="text-[10px] opacity-80">({q.durationMinutes}m)</span>
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isRunning && !isSubmitted ? (
            /* Quiz Start Welcome Screen */
            <div className="max-w-md mx-auto text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 mx-auto flex items-center justify-center shadow-sm">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedQuiz?.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Chapter: {selectedQuiz?.chapter} • Total Questions: {questions.length}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Duration</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedQuiz?.durationMinutes} Mins</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Questions</span>
                  <span className="font-extrabold text-blue-600 text-sm">{questions.length} MCQs</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Marking</span>
                  <span className="font-extrabold text-emerald-600 text-sm">+4 / -1</span>
                </div>
              </div>

              <div className="text-left text-xs text-slate-600 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Exam Instructions:
                </span>
                <p>• The timer will countdown automatically once you hit start.</p>
                <p>• When the timer reaches 00:00, your test will auto-submit.</p>
                <p>• You can bookmark questions for review and change answers anytime before submission.</p>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Timed Quiz Now</span>
              </button>
            </div>
          ) : isSubmitted ? (
            /* Result Scorecard Screen */
            <div className="max-w-2xl mx-auto py-4 space-y-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-200 rounded-3xl text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center shadow-md">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Quiz Completed, {studentName}!
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedQuiz?.title} • Comprehensive Score Analysis
                </p>

                {/* Score Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                    <span className="text-lg font-black text-blue-600">{totalScore} Marks</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Accuracy</span>
                    <span className="text-lg font-black text-emerald-600">{accuracy}%</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Correct</span>
                    <span className="text-lg font-black text-emerald-600">✓ {correctCount}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Incorrect</span>
                    <span className="text-lg font-black text-rose-600">✗ {incorrectCount}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-Attempt Quiz</span>
                  </button>
                </div>
              </div>

              {/* Question Review & Solutions */}
              <div className="space-y-4">
                <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Detailed Solutions &amp; Explanations ({questions.length})
                </h5>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const chosen = selectedAnswers[idx];
                    const isRight = chosen === q.correctIndex;
                    return (
                      <div
                        key={q.id || idx}
                        className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 ${
                          chosen === undefined
                            ? 'bg-slate-50 border-slate-200'
                            : isRight
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-slate-900">
                            Q{idx + 1}. {q.question}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            chosen === undefined
                              ? 'bg-slate-200 text-slate-700'
                              : isRight
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}>
                            {chosen === undefined ? 'Skipped' : isRight ? '+4 Correct' : '-1 Wrong'}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctIndex;
                            const isSelectedOpt = oIdx === chosen;
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                                  isCorrectOpt
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                    : isSelectedOpt
                                    ? 'bg-rose-100 text-rose-900 border-rose-400'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                {isCorrectOpt && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-800 block mb-0.5">
                              💡 Guruji Explanation:
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Active Live Quiz Interface */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Area */}
              <div className="lg:col-span-3 space-y-4">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <button
                      onClick={() =>
                        setMarkedForReview((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }))
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                        markedForReview[currentIdx]
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}</span>
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {currentQ?.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {currentQ?.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigator */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                    >
                      Submit Test
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={currentIdx === questions.length - 1}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 shadow-xs cursor-pointer"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Grid Sidebar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    Question Palette
                  </h5>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {attemptedCount}/{questions.length} Attempted
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, qIdx) => {
                    const isAnswered = selectedAnswers[qIdx] !== undefined;
                    const isMarked = markedForReview[qIdx];
                    const isCurrent = currentIdx === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentIdx(qIdx)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                          isCurrent
                            ? 'ring-2 ring-blue-600 scale-105 shadow-xs font-black'
                            : ''
                        } ${
                          isMarked
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isAnswered
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] space-y-1 text-slate-500 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-blue-600" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-white border border-slate-200" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
