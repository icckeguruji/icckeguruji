'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  X,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface AiStudentProblemSolverProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export default function AiStudentProblemSolver({
  isOpen,
  onClose,
  studentName = 'Student'
}: AiStudentProblemSolverProps) {
  const [problem, setProblem] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Board Exam Prep'];

  const sampleQuestions = [
    'A stone is thrown vertically upward with 20 m/s. Find maximum height and time of flight (g=10 m/s²).',
    'Explain Coulomb\'s Law and state what happens to force if charge distance is halved.',
    'State Ohm\'s Law and derive equivalent resistance for two resistors in parallel.',
    'How to find the roots of quadratic equation ax² + bx + c = 0 with discriminant rules?',
    'What is Raoult\'s Law for volatile liquids and how does vapour pressure change?'
  ];

  const handleSolve = async (queryText?: string) => {
    const q = queryText || problem;
    if (!q.trim() || loading) return;

    setLoading(true);
    setSolution(null);

    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'solve_problem',
          problem: q.trim(),
          subject,
          classLevel: 'Class 10-12'
        })
      });

      const data = await res.json();
      if (data.solution) {
        setSolution(data.solution);
      }
    } catch (err) {
      console.error('Problem solving error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySolution = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Guruji AI 24/7 Problem Solver
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-black uppercase">
                  Live
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Step-by-step solutions, derivations &amp; memory tricks for {studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Subject:</span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  subject === sub
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Problem Input Form */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Type your problem, numerical question, or conceptual doubt:
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. A particle starts from rest with acceleration 2 m/s² for 5 seconds. Calculate total distance travelled..."
                className="w-full p-3.5 pr-12 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSolve()}
                disabled={loading || !problem.trim()}
                className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                title="Solve this problem"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Preset Questions */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Popular Exam Doubts (Click to Solve):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setProblem(q);
                    handleSolve(q);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 text-[11px] text-slate-600 font-medium transition-all text-left line-clamp-1 cursor-pointer active:scale-98"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>
          </div>

          {/* Solution Display Card */}
          {loading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                Guruji AI is analyzing formulas &amp; computing step-by-step solution...
              </p>
              <p className="text-[11px] text-slate-400">Applying SI units, derivations, and mnemonic tips</p>
            </div>
          )}

          {solution && (
            <div className="p-5 bg-gradient-to-br from-blue-50/70 via-white to-purple-50/50 border border-blue-200 rounded-2xl shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <span className="font-black text-blue-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step-by-Step Guruji Solution
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Solution'}</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-normal whitespace-pre-line text-xs sm:text-sm">
                {solution}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-bold">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>24/7 AI Doubt Resolution • Powered by Gemini AI</span>
          </div>

          <button
            onClick={() => {
              setProblem('');
              setSolution(null);
            }}
            className="flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

      </div>
    </div>
  );
}
