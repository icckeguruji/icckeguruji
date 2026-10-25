'use client';

import React, { useState } from 'react';
import { Flashcard } from '@/types';
import { Sparkles, ArrowRight, ArrowLeft, RotateCw, CheckCircle2, Bookmark } from 'lucide-react';

interface FormulaFlashcardsProps {
  cards: Flashcard[];
}

export default function FormulaFlashcards({ cards }: FormulaFlashcardsProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
        No flashcards available right now.
      </div>
    );
  }

  const currentCard = cards[currentIdx];
  const isMastered = masteredIds.includes(currentCard.id);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0); // loop back
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    } else {
      setCurrentIdx(cards.length - 1);
    }
  };

  const toggleMastered = (cardId: string) => {
    if (masteredIds.includes(cardId)) {
      setMasteredIds((prev) => prev.filter((id) => id !== cardId));
    } else {
      setMasteredIds((prev) => [...prev, cardId]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Card {currentIdx + 1} of {cards.length} ({currentCard.chapter})
        </span>

        <button
          onClick={() => toggleMastered(currentCard.id)}
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all border ${
            isMastered
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isMastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
        </button>
      </div>

      {/* Main Flashcard Container */}
      <div
        onClick={handleFlip}
        className={`min-h-[260px] p-8 rounded-3xl border transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between select-none relative overflow-hidden ${
          isFlipped
            ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300 ring-2 ring-indigo-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isFlipped
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isFlipped ? '💡 Formula Solution & Explanation' : '❓ Formula / Concept'}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-slate-400" /> Tap anywhere to flip
            </span>
          </div>

          <div className="py-4">
            {isFlipped ? (
              <div className="space-y-2">
                <div className="text-sm sm:text-base font-mono font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                  {currentCard.back}
                </div>
              </div>
            ) : (
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {currentCard.front}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
          <span>ICC KE GURUJI Quick Revision Desk</span>
          <span className="text-blue-600 font-bold">
            {isFlipped ? 'Click to show front' : 'Click to reveal answer'}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span>Next Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
