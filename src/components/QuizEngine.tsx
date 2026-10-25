'use client';

import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Check
} from 'lucide-react';

interface QuizEngineProps {
  quiz: Quiz;
  studentName: string;
}

export default function QuizEngine({ quiz, studentName }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ = quiz.questions[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setTimeLeft(quiz.durationMinutes * 60);
  };

  // Score calculation
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const marksPerQ = Math.round(quiz.totalMarks / quiz.questions.length);
  const earnedScore = correctCount * marksPerQ;
  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-blue-100">
            {quiz.chapter}
          </span>
          <h3 className="font-black text-lg sm:text-xl text-white mt-1">{quiz.title}</h3>
          <p className="text-xs text-blue-100 font-medium">
            Total Questions: {quiz.questions.length} • Max Marks: {quiz.totalMarks}
          </p>
        </div>

        {!isSubmitted && (
          <div className="flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-2xl border border-white/20 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-mono font-black text-sm text-white">
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Body: Result Card or Question View */}
      {isSubmitted ? (
        <div className="p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-md">
            <Award className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-slate-900">
              Mock Test Completed, {studentName}!
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is your performance report and detailed solutions.
            </p>
          </div>

          {/* Score overview pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase">Score</div>
              <div className="text-2xl font-black text-blue-600">{earnedScore} / {quiz.totalMarks}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase">Accuracy</div>
              <div className="text-2xl font-black text-emerald-600">{percentage}%</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase">Correct</div>
              <div className="text-2xl font-black text-indigo-600">{correctCount} / {quiz.questions.length}</div>
            </div>
          </div>

          {/* Solutions Breakdown */}
          <div className="text-left space-y-4 max-w-2xl mx-auto pt-4">
            <h5 className="font-black text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Detailed Solutions &amp; Guruji Explanations:
            </h5>

            {quiz.questions.map((q, qIdx) => {
              const studentChoice = selectedAnswers[qIdx];
              const isCorrect = studentChoice === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border ${
                    isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-slate-500 font-mono">Q{qIdx + 1}</span>
                    {isCorrect ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Correct (+{marksPerQ})
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Incorrect (0)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-3">{q.question}</p>

                  <div className="space-y-1.5 text-xs mb-3">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isOptionStudentChoice = optIdx === studentChoice;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isOptionCorrect
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                              : isOptionStudentChoice
                              ? 'bg-rose-100 text-rose-900 border-rose-300 font-medium line-through'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {isOptionCorrect && <Check className="w-4 h-4 text-emerald-700" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-blue-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Guruji's Concept Explanation:
                    </span>
                    <p className="leading-relaxed text-slate-600">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Mock Test</span>
            </button>
          </div>
        </div>
      ) : (
        /* Question Form */
        <div className="p-6 sm:p-8 space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Submit &amp; View Result</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
