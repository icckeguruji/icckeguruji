'use client';

import React from 'react';
import { Trophy, Award, Star, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ToppersWallOfFame() {
  const toppers = [
    {
      id: 1,
      name: 'Amit Kumar',
      board: 'BSEB Matric (Class 10th)',
      score: '474 / 500',
      percentage: '94.8%',
      rank: 'District 2nd Rank',
      highlights: 'Math: 99 | Science: 98',
      quote: "Director BADE SIR's chapter-wise derivations and 50% OMR objective practice solved the entire board paper effortlessly.",
      initials: 'AK',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 2,
      name: 'Pooja Kumari',
      board: 'JAC Inter Science (Class 12th)',
      score: '468 / 500',
      percentage: '93.6%',
      rank: 'State Merit List',
      highlights: 'Physics: 96 | Chemistry: 95',
      quote: 'Handwritten notes and formula cheat-sheets provided by IDEAL COACHING CENTRE saved months of revision time.',
      initials: 'PK',
      gradient: 'from-blue-600 to-indigo-700',
    },
    {
      id: 3,
      name: 'Mohammad Rehan',
      board: 'BSEB Matric (Class 10th)',
      score: '461 / 500',
      percentage: '92.2%',
      rank: 'School Top Scorer',
      highlights: 'Urdu: 97 | Social Science: 94',
      quote: 'The dedicated Urdu special guidance and weekly Sunday mock tests gave me tremendous accuracy and speed.',
      initials: 'MR',
      gradient: 'from-emerald-600 to-teal-700',
    },
    {
      id: 4,
      name: 'Suman Verma',
      board: 'JAC Matric (Class 10th)',
      score: '458 / 500',
      percentage: '91.6%',
      rank: 'Top 1% Percentile',
      highlights: 'Math: 96 | Sanskrit: 92',
      quote: 'Daily doubt clearance and personal mentoring by BADE SIR made difficult concepts extremely simple to grasp.',
      initials: 'SV',
      gradient: 'from-purple-600 to-violet-700',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Wall of Fame • Hall of Toppers</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              State Board Examination Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Consistent top scores across Bihar School Examination Board (BSEB) &amp; Jharkhand Academic Council (JAC).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Over 1,200+ Students Mentored by Director BADE SIR</span>
          </div>
        </div>

        {/* Toppers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {toppers.map((top) => (
            <div
              key={top.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar and Score */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${top.gradient} text-white font-black text-sm flex items-center justify-center shadow-md shrink-0`}
                  >
                    {top.initials}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-amber-600 tracking-tight">
                      {top.percentage}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">
                      {top.score}
                    </div>
                  </div>
                </div>

                {/* Name & Board Info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {top.name}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {top.board}
                  </div>
                  <div className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {top.rank}
                  </div>
                </div>

                {/* Marks Highlight */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] font-bold text-slate-800 mb-3">
                  🎯 {top.highlights}
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                  &ldquo;{top.quote}&rdquo;
                </p>
              </div>

              {/* Verified badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Verified Board Record
                </span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Banner */}
        <div className="mt-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base">
                Target 95%+ in Bihar &amp; Jharkhand Board Exams 2026-27?
              </h4>
              <p className="text-xs text-slate-300">
                Admissions open for Class 7th, 8th, 9th, 10th Matric, 11th &amp; 12th Intermediate batches.
              </p>
            </div>
          </div>
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
          >
            <span>Explore Target Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
