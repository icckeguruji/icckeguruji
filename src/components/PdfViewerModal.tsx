'use client';

import React from 'react';
import {
  X,
  Download,
  FileText,
  Shield,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { PdfNote, User } from '@/types';

interface PdfViewerModalProps {
  note: PdfNote;
  user: User;
  onClose: () => void;
}

export default function PdfViewerModal({ note, user, onClose }: PdfViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Floating Premium Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white truncate">{note.title}</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                  PDF Study Material
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {note.fileSize} • {note.pageCount ? `${note.pageCount} Pages • ` : ''}Uploaded: {note.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              title="Open full PDF in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </a>

            <a
              href={note.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security watermark banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 border-b border-indigo-700/50 px-4 py-2 flex items-center justify-between text-xs text-indigo-100 font-medium">
          <div className="flex items-center gap-2 truncate">
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Licensed Copy for: <strong className="text-white font-bold">{user.name}</strong> •{' '}
              <span className="font-mono text-indigo-200">{user.phone || user.email}</span>
            </span>
          </div>
          <span className="text-[11px] text-amber-300 font-mono hidden md:inline shrink-0">
            ICC KE GURUJI Anti-Piracy Protected
          </span>
        </div>

        {/* PDF Viewer Body with Repeating Security Watermark Overlay */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden flex flex-col">
          
          {/* Subtle Security Diagonal Watermark Grid across preview */}
          <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-2 sm:grid-cols-3 gap-16 p-8 items-center justify-center opacity-[0.045] select-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="transform -rotate-25 text-center">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  ICC KE GURUJI
                </p>
                <p className="text-[10px] font-mono text-slate-700 font-bold">
                  {user.phone || user.email}
                </p>
              </div>
            ))}
          </div>

          <iframe
            src={`${note.fileUrl}#toolbar=0`}
            className="w-full h-full border-0 relative z-0"
            title={note.title}
          />

          {/* Bottom Toolbar & Fallback */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Chapter Notes &amp; Derivations</span>
            </span>
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
            >
              <span>If preview doesn&apos;t render, click here to open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
