'use client';

import React from 'react';
import Link from 'next/link';
import { TimetableSlot } from '@/types';
import { Calendar, Clock, User, Radio, ArrowRight } from 'lucide-react';

interface WeeklyTimetableProps {
  slots: TimetableSlot[];
  showCourseLink?: boolean;
}

export default function WeeklyTimetable({ slots, showCourseLink = true }: WeeklyTimetableProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:border-blue-200 transition-colors">
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            Weekly Live Routine
          </span>
          <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-0.5 tracking-tight">
            Regular Class Timetable (Monday to Saturday)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Batch Session 2026</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              slot.isLiveNow ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              {/* Day badge */}
              <div
                className={`w-20 text-center py-2 px-1 rounded-2xl text-xs font-extrabold shrink-0 shadow-xs ${
                  slot.isLiveNow
                    ? 'bg-rose-600 text-white shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-700 border border-slate-200/70'
                }`}
              >
                {slot.day}
              </div>

              {/* Time & Topic */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {slot.time}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                    {slot.subject}
                  </span>
                  {slot.isLiveNow && (
                    <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-300 animate-pulse flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      LIVE NOW
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                  {slot.topic}
                </h4>

                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Faculty: <strong className="text-slate-800">{slot.faculty}</strong></span>
                </div>
              </div>
            </div>

            {/* Action */}
            {showCourseLink && (
              <Link
                href={`/course/${slot.courseId}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                  slot.isLiveNow
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {slot.isLiveNow ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Join Live Now</span>
                  </>
                ) : (
                  <>
                    <span>Go to Class</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
