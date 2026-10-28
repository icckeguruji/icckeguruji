'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  Check,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { CoachingConfig } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface AiWebsiteCustomizerProps {
  currentConfig: CoachingConfig;
  onUpdate: (updatedConfig: CoachingConfig) => void;
}

export default function AiWebsiteCustomizer({ currentConfig, onUpdate }: AiWebsiteCustomizerProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewPatch, setPreviewPatch] = useState<Partial<CoachingConfig> | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const quickPrompts = [
    '🪔 Set Diwali Festival Offer with 50% Early Bird Scholarship and festive hero copy',
    '❄️ Update marquee notice for Winter Morning Batch timings starting at 7:30 AM',
    '🏆 Update hero stats to 500+ Selections, 99.4% Top Score, and 120+ IITians',
    '🎯 Set daily quiz for Class 10 Chemistry Carbon & Its Compounds'
  ];

  const handleGenerate = async (presetText?: string) => {
    const text = presetText || instruction;
    if (!text.trim() || loading) return;

    setLoading(true);
    setPreviewPatch(null);

    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'website_update',
          prompt: text.trim(),
          currentConfig
        })
      });

      const json = await res.json();
      if (json.success && json.patch) {
        setPreviewPatch(json.patch);
      }
    } catch (err) {
      console.error('Website customizer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = () => {
    if (!previewPatch) return;
    const merged: CoachingConfig = {
      ...currentConfig,
      ...previewPatch
    };

    saveStoredData('CONFIG', merged);
    onUpdate(merged);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setPreviewPatch(null);
      setInstruction('');
    }, 1800);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50/70 via-white to-blue-50/70 border border-purple-200/80 rounded-3xl shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-2">
              AI Homepage &amp; Website Customizer Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                Live Studio
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Type any instruction in Hindi or English to change hero headline, announcements, stats, and banners automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Try 1-Click AI Transformation Prompts:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInstruction(p);
                handleGenerate(p);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-purple-200/70 text-xs font-semibold transition-all shadow-2xs active:scale-98 cursor-pointer text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Or tell AI what details you want to change on the homepage:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Change hero headline for Board Exam Crash Course with 95%+ guarantee and add winter timings"
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading || !instruction.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Changes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Changes with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Card */}
      {previewPatch && (
        <div className="p-5 bg-white border-2 border-purple-300 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-extrabold text-sm text-purple-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-600" />
              Proposed Homepage Changes Preview:
            </span>
            <span className="text-[11px] font-bold text-slate-400">Review before applying</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {previewPatch.heroHeadline && (
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                <span className="text-[10px] text-purple-700 font-bold uppercase block">New Hero Headline</span>
                <span className="font-extrabold text-slate-900 text-sm">{previewPatch.heroHeadline}</span>
              </div>
            )}
            {previewPatch.admissionBadgeText && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">New Badge Text</span>
                <span className="font-bold text-slate-800">{previewPatch.admissionBadgeText}</span>
              </div>
            )}
            {previewPatch.marqueeNotice && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 sm:col-span-2">
                <span className="text-[10px] text-amber-700 font-bold uppercase block">New Marquee Ticker</span>
                <span className="font-bold text-slate-800">{previewPatch.marqueeNotice}</span>
              </div>
            )}
            {previewPatch.heroSubheadline && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">New Subheadline</span>
                <span className="font-medium text-slate-700">{previewPatch.heroSubheadline}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setPreviewPatch(null)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Discard
            </button>
            <button
              onClick={handleApplyChanges}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Changes Applied to Website!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Changes to Live Website ➜</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
