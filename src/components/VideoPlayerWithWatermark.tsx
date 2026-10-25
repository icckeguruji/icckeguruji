'use client';

import React, { useState, useEffect } from 'react';
import { Lesson, User } from '@/types';
import { Radio, ShieldAlert, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

interface VideoPlayerWithWatermarkProps {
  lesson: Lesson;
  user: User;
  courseTitle: string;
}

export default function VideoPlayerWithWatermark({
  lesson,
  user,
  courseTitle,
}: VideoPlayerWithWatermarkProps) {
  // Moving watermark coordinates
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '15%' });
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Periodically change watermark position every 8 seconds to prevent recording & cropping
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', { hour12: true }));
    };
    updateTime();

    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70 + 10);
      const randomLeft = Math.floor(Math.random() * 70 + 10);
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
      updateTime();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
      {/* Top Banner */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {lesson.isLive ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              🔴 LIVE CLASS NOW
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              <Radio className="w-3.5 h-3.5" />
              Recorded Lecture
            </span>
          )}
          <span className="text-slate-600 font-semibold truncate max-w-xs sm:max-w-md">
            {courseTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Piracy Protected • Enrolled as:</span>
          <span className="font-bold text-slate-800">{user.name}</span>
        </div>
      </div>

      {/* Video Container with Dynamic Moving Watermark */}
      <div className="relative w-full aspect-video bg-black overflow-hidden select-none">
        {/* YouTube Iframe Embed */}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
        />

        {/* Dynamic Anti-Leak Moving Watermark */}
        <div
          style={{ top: watermarkPos.top, left: watermarkPos.left }}
          className="absolute pointer-events-none transition-all duration-1000 ease-in-out z-20 flex flex-col items-center bg-black/45 backdrop-blur-[2px] px-3 py-1 rounded-xl border border-white/20 shadow-xl select-none"
        >
          <div className="text-[11px] font-mono font-bold tracking-wider text-white/70 flex items-center gap-1.5">
            <span>{user.phone || user.email}</span>
            <span>•</span>
            <span>{user.name}</span>
          </div>
          <div className="text-[9px] font-mono text-white/50">
            ID: {user.id} | {currentTimeStr}
          </div>
        </div>

        {/* Corner Static watermark */}
        <div className="absolute bottom-3 right-4 pointer-events-none z-10 text-[10px] font-mono text-white/20 select-none hidden md:block">
          Secured for {user.phone}
        </div>
      </div>

      {/* Lesson Details Footer */}
      <div className="p-5 sm:p-6 bg-white border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {lesson.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {lesson.duration && (
              <span className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                Duration: {lesson.duration}
              </span>
            )}
            {lesson.scheduledAt && (
              <span className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
                {lesson.scheduledAt}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
