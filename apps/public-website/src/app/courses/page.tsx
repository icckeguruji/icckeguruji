'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { initialCourses } from '../../../admin-web/src/lib/sample-data';
import { formatINR } from '@icc/shared-utils';
import { Clock, Video, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PublicCoursesPage() {
  const [boardFilter, setBoardFilter] = useState<'all' | 'BSEB' | 'JAC'>('all');

  const filtered = initialCourses.filter((c) => {
    if (boardFilter === 'all') return true;
    return boardFilter === 'BSEB'
      ? c.title.includes('BSEB') || c.board_id?.includes('1')
      : c.title.includes('JAC') || c.board_id?.includes('2');
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          पाठ्यक्रम एवं शुल्क संरचना (Courses & Fees)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC) मैट्रिक एवं इंटरमीडिएट के विशेष बैच
        </p>
      </div>

      {/* Board Filter Tabs */}
      <div className="flex justify-center space-x-3">
        {[
          { id: 'all', label: 'सभी पाठ्यक्रम (All Courses)' },
          { id: 'BSEB', label: 'बिहार बोर्ड (BSEB)' },
          { id: 'JAC', label: 'झारखंड बोर्ड (JAC)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBoardFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              boardFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div className="h-48 bg-slate-100 relative">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-950/80 text-white text-xs font-bold backdrop-blur-sm">
                  {course.title.includes('BSEB') ? 'BSEB पटना' : 'JAC रांची'}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold">
                  {course.is_free ? 'FREE' : formatINR(course.discount_price || course.price)}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {course.title_hi || course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description_hi || course.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {course.validity_days} दिन
                  </span>
                  <span className="flex items-center">
                    <Video className="w-3.5 h-3.5 mr-1 text-red-500" />
                    {course.lecture_count || 45}+ वीडियो
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    {course.material_count || 24}+ पीडीएफ
                  </span>
                </div>

                <Link
                  href="/download-app"
                  className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                >
                  <span>ऐप में प्रवेश लें (Enroll Now)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
