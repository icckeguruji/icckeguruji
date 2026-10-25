'use client';

import React, { useRef, useState } from 'react';
import {
  Award,
  CheckCircle,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Course, User, CertificateRecord } from '@/types';
import Logo from './Logo';

interface CertificateViewProps {
  course: Course;
  currentUser: User;
  certificate?: CertificateRecord;
}

export default function CertificateView({
  course,
  currentUser,
  certificate
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Generate deterministic certificate details if not provided
  const certId = certificate?.certificateId || `ICC-2026-${course.id.toUpperCase()}-${currentUser.phone ? currentUser.phone.slice(-4) : '9821'}`;
  const issueDate = certificate?.issueDate || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const studentName = currentUser.name || 'Rahul Kumar';
  const grade = certificate?.grade || 'A+';
  const scorePercent = certificate?.scorePercent || 94.2;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const fakeUrl = `https://icckeguruji.com/verify/${certId}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Maine "ICC KE GURUJI" se apna "${course.title}" course successfully complete kar liya hai! 🎉 Mera Verified Certificate ID: ${certId}. Check here: https://icckeguruji.com/verify/${certId}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Verified Certificate
            </span>
            <span className="text-blue-100 text-xs">ID: {certId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Official Certificate of Course Completion</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Congratulations {studentName}! You have successfully completed all lectures, submitted DPPs, and passed the final mock tests.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            Print / Save PDF
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-xs transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE CERTIFICATE CARD
      ========================================================================= */}
      <div className="bg-slate-100 p-2 sm:p-6 rounded-3xl overflow-x-auto flex justify-center">
        <div
          ref={certRef}
          id="printable-certificate"
          className="relative w-full max-w-4xl bg-[#FFFDF8] text-slate-900 border-[12px] border-double border-amber-600/70 p-8 sm:p-14 shadow-2xl rounded-sm print:m-0 print:border-amber-700 print:shadow-none"
          style={{ minHeight: '600px' }}
        >
          {/* Inner Ornate Corner Accents */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600"></div>

          {/* Watermark in center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <span className="text-9xl font-black uppercase text-amber-900 transform -rotate-12">
              ICC KE GURUJI
            </span>
          </div>

          <div className="relative z-10 text-center space-y-6">
            {/* Institute Header */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <Logo size="lg" />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-amber-900 font-extrabold mt-2">
                Premier Coaching Institute for Academic &amp; Competitive Excellence
              </p>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-3"></div>
            </div>

            {/* Certificate Title */}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold block mb-1">
                Certificate of Merit &amp; Completion
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide">
                PROUDLY PRESENTED TO
              </h1>
            </div>

            {/* Student Name */}
            <div className="py-2">
              <span className="text-3xl sm:text-5xl font-serif font-black text-blue-900 border-b-2 border-amber-500 pb-2 px-8 inline-block italic">
                {studentName}
              </span>
            </div>

            {/* Certificate Body Text */}
            <p className="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
              For successfully completing the comprehensive curriculum, live lectures, assignments, and chapter-wise mock tests of the course
            </p>

            {/* Course Title Badge */}
            <div className="inline-block px-6 py-2.5 bg-amber-50 rounded-2xl border border-amber-300 shadow-xs">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                {course.title}
              </h3>
              <p className="text-xs text-amber-800 font-bold mt-0.5">
                Grade: {grade} • Score: {scorePercent}% • Category: {course.category}
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-10 grid grid-cols-3 items-end text-center gap-4">
              {/* Left Sign */}
              <div>
                <div className="font-serif italic text-blue-900 text-lg font-bold">
                  Er. Alok Sharma
                </div>
                <div className="w-32 h-0.5 bg-slate-400 mx-auto my-1.5"></div>
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Er. Alok Sharma (IIT-K)
                </div>
                <div className="text-[10px] text-slate-500">Founder &amp; Chief Mentor</div>
              </div>

              {/* Center Golden Seal */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900 flex flex-col items-center justify-center bg-amber-50 text-amber-900 text-center px-1">
                    <ShieldCheck className="w-6 h-6 text-amber-700" />
                    <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                      SEAL OF EXCELLENCE
                    </span>
                    <span className="text-[7px] font-bold text-amber-800">ICC KE GURUJI</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Issue Date: {issueDate}
                </span>
              </div>

              {/* Right Sign */}
              <div>
                <div className="font-serif italic text-blue-900 text-lg font-bold">
                  Academic Board
                </div>
                <div className="w-32 h-0.5 bg-slate-400 mx-auto my-1.5"></div>
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Director of Examination
                </div>
                <div className="text-[10px] text-slate-500">Academic Council</div>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Certificate ID: {certId}
              </span>
              <span>Verify Online at: icckeguruji.com/verify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
