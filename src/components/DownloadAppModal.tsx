'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Bell,
  Sparkles
} from 'lucide-react';
import { CoachingConfig } from '@/types';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: CoachingConfig;
}

export default function DownloadAppModal({ isOpen, onClose, config }: DownloadAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const downloadUrl = config?.apkDownloadUrl || '/api/download-apk';
  const appVersion = config?.appVersion || 'v1.0.0';

  const handleCopyLink = () => {
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api/download-apk`
      : downloadUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api/download-apk`
      : downloadUrl;
    const msg = encodeURIComponent(
      `📲 *Download Official ICC KE GURUJI Android App*\n\nAttend daily live classes, access handwritten notes, practice Sunday tests, and solve doubts 24x7 with Guruji AI!\n\nDirect Download Link (v${appVersion}):\n${fullUrl}\n\n100% Free & Safe for all students.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        
        {/* Header with Android Visual Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-400/20 blur-lg pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-xl flex items-center justify-center shrink-0 border-2 border-white/40">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
                <Smartphone className="w-7 h-7 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-emerald-100 mb-1 border border-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" /> Official Release
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                ICC KE GURUJI App
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                High-Speed Android App for Bihar &amp; CBSE Students
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/15 text-[11px] font-bold text-emerald-100">
            <span className="px-2 py-0.5 rounded-lg bg-black/20">Version {appVersion}</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/20">Size: ~4.5 MB</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/20">Android 7.0+</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/20">Zero Ads</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800">
          
          {/* Key Features Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-bold text-slate-700">Instant Live Classes</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-700">Class &amp; Test Alerts</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-bold text-slate-700">24x7 AI Doubt Solver</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-700">Offline Notes &amp; DPPs</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2">
            <a
              href={downloadUrl}
              download="icckeguruji-v1.0.0.apk"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>Download Android APK Now ({appVersion})</span>
            </a>
            <p className="text-[11px] text-center text-slate-500 font-medium">
              Direct official download from ICC KE GURUJI server • Safe &amp; Virus-Free
            </p>
          </div>

          {/* Installation Instructions Accordion */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>📖 How to Install on Android in 3 Steps</span>
            </h4>

            <div className="space-y-2 text-xs">
              {/* Step 1 */}
              <div
                onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                      1
                    </span>
                    <span>Download APK &amp; Tap &quot;Download anyway&quot;</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {activeStep === 1 ? '▲' : '▼'}
                  </span>
                </div>
                {(activeStep === 1 || activeStep === null) && (
                  <p className="mt-2 text-slate-600 pl-7 text-[11px] leading-relaxed">
                    Android displays a warning: <em className="text-slate-800 font-semibold">&quot;File might be harmful&quot;</em> for any APK downloaded outside Google Play. Tap <strong className="text-emerald-700 font-bold">&quot;Download anyway&quot;</strong> — this is standard and completely safe.
                  </p>
                )}
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                      2
                    </span>
                    <span>Allow &quot;Install Unknown Apps&quot; (One-Time)</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {activeStep === 2 ? '▲' : '▼'}
                  </span>
                </div>
                {activeStep === 2 && (
                  <p className="mt-2 text-slate-600 pl-7 text-[11px] leading-relaxed">
                    When you tap the downloaded file, if prompted: Tap <strong>Settings</strong> ➜ Toggle ON <strong>&quot;Allow from this source&quot;</strong> ➜ Press Back.
                  </p>
                )}
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                      3
                    </span>
                    <span>Tap &quot;Install&quot; and Open App</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {activeStep === 3 ? '▲' : '▼'}
                  </span>
                </div>
                {activeStep === 3 && (
                  <p className="mt-2 text-slate-600 pl-7 text-[11px] leading-relaxed">
                    Tap <strong>Install</strong>. Once completed, tap <strong>Open</strong> to start learning with full-screen experience and zero browser address bars!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Share with Friends / Parents */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Copy direct download link"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
          Need help installing? Contact Guruji Helpline: <a href="tel:+919876543210" className="text-blue-600 font-bold hover:underline">+91 98765 43210</a>
        </div>
      </div>
    </div>
  );
}
