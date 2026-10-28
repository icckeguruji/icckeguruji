'use client';

import React, { useRef, useState } from 'react';
import {
  Share2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
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
  certificate,
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Generate deterministic certificate details if not provided
  const certId =
    certificate?.certificateId ||
    `ICC-2026-${course.id.toUpperCase()}-${currentUser.phone ? currentUser.phone.slice(-4) : '9821'}`;
  const issueDate =
    certificate?.issueDate ||
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  const studentName = currentUser.name || 'Rahul Kumar';
  const grade = certificate?.grade || 'A+';
  const scorePercent = certificate?.scorePercent || 94.2;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const fakeUrl = `https://icckeguruji.vercel.app/verify/${certId}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `I have successfully completed "${course.title}" from "ICC KE GURUJI"! 🎓🎉\nMy Official Verified Certificate ID is ${certId}.\nVerify online here: https://icckeguruji.vercel.app/verify/${certId}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions (Hidden during window.print) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Verified Board Certificate
            </span>
            <span className="text-blue-100 text-xs font-mono">ID: {certId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Official Certificate of Course Completion</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Congratulations {studentName}! You have successfully completed all live lectures, DPP problem sets, and passed the final board mock tests.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            <span>Print / Save PDF</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Certificate</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE DIPLOMA CERTIFICATE
      ========================================================================= */}
      <div className="bg-slate-200/60 p-2 sm:p-8 rounded-3xl overflow-x-auto flex justify-center print:bg-transparent print:p-0">
        <div
          ref={certRef}
          id="printable-certificate"
          className="relative w-full max-w-4xl bg-[#FFFDF8] text-slate-900 border-[12px] border-double border-amber-600/80 p-8 sm:p-14 shadow-2xl rounded-sm print:m-0 print:border-amber-700 print:shadow-none print:w-full"
          style={{ minHeight: '620px' }}
        >
          {/* Inner Ornate Corner Accents */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

          {/* Watermark in center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <span className="text-8xl sm:text-9xl font-black uppercase text-amber-900 transform -rotate-12">
              ICC KE GURUJI
            </span>
          </div>

          <div className="relative z-10 text-center space-y-6">
            
            {/* Institute Header */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <Logo size="lg" />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-amber-900 font-extrabold mt-2.5">
                Premier Coaching Institute for Academic &amp; Competitive Excellence
              </p>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-3" />
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
            <div className="py-1">
              <span className="text-3xl sm:text-5xl font-serif font-black text-blue-900 border-b-2 border-amber-500 pb-2 px-8 inline-block italic tracking-tight">
                {studentName}
              </span>
            </div>

            {/* Certificate Body Text */}
            <p className="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
              For successfully completing the comprehensive curriculum, live interactive sessions, problem sets, and chapter-wise mock tests for the course:
            </p>

            {/* Course Title Badge */}
            <div className="inline-block px-7 py-3 bg-amber-50/90 rounded-2xl border border-amber-300 shadow-xs">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif">
                {course.title}
              </h3>
              <p className="text-xs text-amber-800 font-bold mt-1">
                Academic Grade: <strong className="text-amber-950 font-black">{grade}</strong> • Mock Score: <strong className="text-amber-950 font-black">{scorePercent}%</strong> • Category: {course.category}
              </p>
            </div>

            {/* Signatures & Golden Holographic Seal */}
            <div className="pt-8 grid grid-cols-3 items-end text-center gap-4">
              
              {/* Left Signature */}
              <div>
                <div className="font-serif italic text-blue-900 text-lg font-bold">
                  Er. Alok Sharma
                </div>
                <div className="w-32 h-0.5 bg-slate-400 mx-auto my-1.5" />
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Er. Alok Sharma (IIT-K)
                </div>
                <div className="text-[10px] text-slate-500">Founder &amp; Chief Mentor</div>
              </div>

              {/* Center Golden Seal */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900 flex flex-col items-center justify-center bg-amber-50 text-amber-900 text-center px-1">
                    <ShieldCheck className="w-6 h-6 text-amber-700" />
                    <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                      SEAL OF MERIT
                    </span>
                    <span className="text-[7px] font-bold text-amber-800">ICC KE GURUJI</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Issued: {issueDate}
                </span>
              </div>

              {/* Right Signature */}
              <div>
                <div className="font-serif italic text-blue-900 text-lg font-bold">
                  Academic Council
                </div>
                <div className="w-32 h-0.5 bg-slate-400 mx-auto my-1.5" />
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Academic Director
                </div>
                <div className="text-[10px] text-slate-500">Board of Examination</div>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Certificate ID: {certId}
              </span>
              <span>Verify Online at: icckeguruji.vercel.app/verify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
