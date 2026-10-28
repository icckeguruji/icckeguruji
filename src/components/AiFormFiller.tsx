'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, X, Check, HelpCircle } from 'lucide-react';

interface AiFormFillerProps {
  formType: 'student' | 'teacher' | 'course' | 'quiz' | 'announcement' | 'fee' | 'timetable';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFill: (extractedData: any) => void;
  buttonLabel?: string;
}

export default function AiFormFiller({ formType, onFill, buttonLabel }: AiFormFillerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const getPlaceholder = () => {
    switch (formType) {
      case 'student':
        return 'e.g. "Rohan Verma, 9876543212, rohan@gmail.com, Class 12 PCM JEE, lives at Bailey Road Patna, fee 1000"';
      case 'teacher':
        return 'e.g. "Dr. Amit Roy, 9876543233, Chemistry Specialist, 12 years experience, M.Sc Ph.D, salary 45000, Patna"';
      case 'course':
        return 'e.g. "Class 11 Chemistry Foundation 2026, Comprehensive board prep, price 899, instructor Er. Alok Sharma"';
      case 'quiz':
        return 'e.g. "Create 5 questions on Newton\'s Laws of Motion with 10 minutes duration for Class 11"';
      case 'announcement':
        return 'e.g. "Tomorrow morning doubt clearing session will start at 9:00 AM sharp for Class 10 & 12"';
      case 'fee':
        return 'e.g. "Rahul Kumar, 9876543210, paid 1000 for October month via PhonePe"';
      default:
        return 'Type or paste raw details here and AI will parse all form fields automatically...';
    }
  };

  const handleAutofill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'autofill',
          formType,
          prompt: prompt.trim()
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        onFill(json.data);
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          setIsOpen(false);
          setPrompt('');
        }, 1200);
      }
    } catch (err) {
      console.error('Autofill error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
        title="Fill form fields automatically with AI"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>{buttonLabel || '✨ Fill with AI'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    AI Smart Form Autofill
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Paste raw unformatted text to populate {formType} fields instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">Form Fields Auto-Filled!</h5>
                <p className="text-xs text-slate-500">Details successfully extracted and placed into inputs.</p>
              </div>
            ) : (
              <form onSubmit={handleAutofill} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe or paste {formType} info:
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Works with rough Hindi or English notes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Auto-Fill Form</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
