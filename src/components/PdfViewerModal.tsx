'use client';

import React from 'react';
import { X, Download, FileText, Shield, ExternalLink } from 'lucide-react';
import { PdfNote, User } from '@/types';

interface PdfViewerModalProps {
  note: PdfNote;
  user: User;
  onClose: () => void;
}

export default function PdfViewerModal({ note, user, onClose }: PdfViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base line-clamp-1">{note.title}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {note.fileSize} • {note.pageCount ? `${note.pageCount} Pages • ` : ''}Uploaded {note.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={note.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security watermark banner */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-2 flex items-center justify-between text-xs text-indigo-700 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Watermarked Copy for: <strong>{user.name}</strong> ({user.phone || user.email})</span>
          </div>
          <span className="text-indigo-500 text-[11px] hidden sm:inline">ICC KE GURUJI Certified Material</span>
        </div>

        {/* PDF Viewer Body */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden flex flex-col">
          <iframe
            src={`${note.fileUrl}#toolbar=0`}
            className="w-full h-full border-0"
            title={note.title}
          />

          {/* Fallback Overlay banner */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Agar PDF preview load nahi ho raha hai:</span>
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
