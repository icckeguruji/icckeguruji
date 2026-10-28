'use client';

import React, { useState } from 'react';
import { Flashcard } from '@/types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Shuffle,
  Lightbulb,
  Zap
} from 'lucide-react';

interface FormulaFlashcardsProps {
  cards: Flashcard[];
}

export default function FormulaFlashcards({ cards: initialCards }: FormulaFlashcardsProps) {
  const [shuffledDeck, setShuffledDeck] = useState<Flashcard[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  const cards = shuffledDeck || initialCards || [];

  if (!cards || cards.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-xs">
        <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-bold text-slate-800">No formula flashcards available right now.</p>
        <p className="text-xs text-slate-400 mt-1">Check back once the faculty uploads new formula decks.</p>
      </div>
    );
  }

  const currentCard = cards[currentIdx];
  const isMastered = masteredIds.includes(currentCard.id);
  const masteredPercent = Math.round((masteredIds.length / cards.length) * 100);

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

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledDeck(shuffled);
    setCurrentIdx(0);
  };

  const toggleMastered = (cardId: string) => {
    if (masteredIds.includes(cardId)) {
      setMasteredIds((prev) => prev.filter((id) => id !== cardId));
    } else {
      setMasteredIds((prev) => [...prev, cardId]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      
      {/* Top Header & Progress */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
            <Sparkles className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-2">
              <span>Card {currentIdx + 1} of {cards.length}</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                {currentCard.chapter || 'Formula Sheet'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Mastered: {masteredIds.length} / {cards.length} ({masteredPercent}%)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Shuffle card order"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-500" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={() => toggleMastered(currentCard.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
              isMastered
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isMastered ? 'Mastered ✓' : 'Mark Mastered'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Container with Flip Animation */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        className={`min-h-[290px] sm:min-h-[320px] p-6 sm:p-9 rounded-3xl border transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between select-none relative overflow-hidden group ${
          isFlipped
            ? 'bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white border-indigo-500/50 shadow-indigo-950/20 ring-2 ring-indigo-500/30'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-blue-400 hover:shadow-xl'
        }`}
      >
        {/* Subtle background glow */}
        {isFlipped && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div>
          {/* Top Pill & Flip Hint */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                isFlipped
                  ? 'bg-white/10 text-amber-300 border-white/20'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {isFlipped ? '💡 Formula Solution & Explanation' : '❓ Concept & Formula Query'}
            </span>

            <span
              className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                isFlipped ? 'text-blue-200' : 'text-slate-400 group-hover:text-blue-600'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin-hover" />
              <span>Click to Flip</span>
            </span>
          </div>

          {/* Card Body */}
          <div className="py-4">
            {isFlipped ? (
              <div className="space-y-3">
                <div className="text-base sm:text-xl font-mono font-bold text-amber-200 whitespace-pre-line leading-relaxed tracking-wide">
                  {currentCard.back}
                </div>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {currentCard.front}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div
          className={`pt-4 border-t flex items-center justify-between text-xs font-semibold ${
            isFlipped ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ICC KE GURUJI Rapid Revision Deck</span>
          </span>
          <span className={isFlipped ? 'text-amber-300 font-bold' : 'text-blue-600 font-bold'}>
            {isFlipped ? 'Tap to view Question' : 'Tap to reveal Formula & Steps'}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          Use buttons or spacebar to flip
        </div>

        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <span>Next Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
