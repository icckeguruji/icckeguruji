'use client';

import React, { useState, useEffect } from 'react';
import { Target, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BoardExamCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    bsebDays: number;
    bsebHours: number;
    jacDays: number;
    jacHours: number;
  }>({
    bsebDays: 95,
    bsebHours: 12,
    jacDays: 102,
    jacHours: 8,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      // Target: BSEB Board Exam commences Feb 15, 2027; JAC Board commences Feb 22, 2027
      const bsebTarget = new Date('2027-02-15T09:30:00+05:30').getTime();
      const jacTarget = new Date('2027-02-22T09:30:00+05:30').getTime();

      const bsebDiff = Math.max(0, bsebTarget - now);
      const jacDiff = Math.max(0, jacTarget - now);

      setTimeLeft({
        bsebDays: Math.floor(bsebDiff / (1000 * 60 * 60 * 24)),
        bsebHours: Math.floor((bsebDiff / (1000 * 60 * 60)) % 24),
        jacDays: Math.floor(jacDiff / (1000 * 60 * 60 * 24)),
        jacHours: Math.floor((jacDiff / (1000 * 60 * 60)) % 24),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-indigo-900/60 shadow-xs py-2 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Left: Badge & Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            <Target className="w-3 h-3 text-slate-950" />
            <span>Target Board 2027</span>
          </span>
          <span className="text-slate-300 font-semibold hidden md:inline text-[11px]">
            Official State Examination Countdown:
          </span>
        </div>

        {/* Center: Live Board Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center font-mono tabular-nums">
          {/* BSEB Pill */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/15 text-[11px]">
            <span className="font-sans font-bold text-amber-300">BSEB Matric:</span>
            <span className="font-black text-white">{timeLeft.bsebDays}d {timeLeft.bsebHours}h</span>
          </div>

          {/* JAC Pill */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/15 text-[11px]">
            <span className="font-sans font-bold text-sky-300">JAC Inter:</span>
            <span className="font-black text-white">{timeLeft.jacDays}d {timeLeft.jacHours}h</span>
          </div>
        </div>

        {/* Right: Quick Action Link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 shrink-0"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Explore Target Batches</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
