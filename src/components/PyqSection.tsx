'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PyqPaper } from '@/types';

interface PyqSectionProps {
  papers: PyqPaper[];
}

export default function PyqSection({ papers }: PyqSectionProps) {
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const exams = ['All', 'Class 10 Board', 'Class 12 Board', 'JEE Mains', 'NEET'];
  const years = ['All', '2024', '2023', '2022'];

  const filteredPapers = papers.filter((p) => {
    const matchExam = selectedExam === 'All' || p.exam === selectedExam;
    const matchYear = selectedYear === 'All' || p.year === selectedYear;
    const matchSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchExam && matchYear && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            100% Free PYQ Repository
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Previous Years Question Papers &amp; Guruji Solutions
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Guruji's proven methodology: Solving the last 5 years' papers guarantees a 90%+ score. Download comprehensive question papers and model answer keys completely free!
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, paper title or subject (e.g. Physics 2024, Maths)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Exams */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Exam:
            </span>
            {exams.map((exam) => (
              <button
                key={exam}
                onClick={() => setSelectedExam(exam)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedExam === exam
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {exam}
              </button>
            ))}
          </div>

          {/* Years */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Year:</span>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      {paper.exam}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-extrabold">
                      {paper.year}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {paper.fileSize} • {paper.downloadsCount}+ Downloads
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug mt-1">
                  {paper.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Subject: <strong className="text-slate-700">{paper.subject}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Question Paper
                </a>
                {paper.solutionPdfUrl && (
                  <a
                    href={paper.solutionPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Guruji Solution Key
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800">No Question Papers Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with another keyword or reset the filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
