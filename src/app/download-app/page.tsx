'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, ShieldCheck, CheckCircle2, AlertCircle, Zap, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function DownloadAppPage() {
  const { t } = useLanguage();
  const [downloadingMirror, setDownloadingMirror] = useState<string | null>(null);

  const directDownloadUrl = 'https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk';
  const cdnMirrorUrl = 'https://ghproxy.net/https://github.com/icckeguruji/icckeguruji/releases/download/v1.0.1/ideal-coaching-release.apk';

  const handleDownload = (mirror: string, url: string) => {
    setDownloadingMirror(mirror);
    window.location.href = url;
    setTimeout(() => setDownloadingMirror(null), 4000);
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg shadow-blue-500/20 mx-auto flex items-center justify-center p-1 border-2 border-slate-100">
          <Image src="/logo.png" alt="ICC Logo" width={64} height={64} className="w-full h-full object-contain rounded-full" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('सुपरफ़ास्ट डाउनलोड: केवल ~20 MB (3 सेकंड में)', 'Superfast Download: Only ~20 MB (In ~3 Seconds)')}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {t('आइडियल कोचिंग सेंटर एंड्रॉयड ऐप डाउनलोड', 'Download Ideal Coaching Centre Android App')}
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          {t(
            'बिहार (BSEB) एवं झारखंड (JAC) बोर्ड परीक्षा की डिजिटल तैयारी के लिए आधिकारिक मोबाइल एप्लिकेशन। ग्रामीण 4G/5G नेटवर्क हेतु पूर्णतः अनुकूलित।',
            'Official Android mobile application for Bihar Board and Jharkhand Board examinations. Highly optimized for rural 4G/5G mobile networks.'
          )}
        </p>
      </div>

      {/* APK Download Box */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-400/20">
              v1.0.1 Official Release
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {t('68% साइज़ कम', '68% Size Reduced')}
            </span>
          </div>
          <h3 className="text-2xl font-black text-white">ideal-coaching-release.apk</h3>
          <p className="text-xs text-slate-300 font-medium">
            {t(
              'साइज़: ~20 MB (पहले 63 MB था) · डाउनलोड समय: 2-4 सेकंड (Jio / Airtel / BSNL) · Android 7.0+',
              'Size: ~20 MB (Reduced from 63 MB) · Download Time: 2-4 seconds on Jio/Airtel/BSNL · Android 7.0+'
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Primary Direct Download */}
          <button
            onClick={() => handleDownload('primary', directDownloadUrl)}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl transition w-full sm:w-auto justify-center active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>
              {downloadingMirror === 'primary'
                ? t('डाउनलोड शुरू...', 'Starting...')
                : t('मुख्य डाउनलोड (~20 MB)', 'Primary Download (~20 MB)')}
            </span>
          </button>

          {/* High-Speed Edge CDN Mirror */}
          <button
            onClick={() => handleDownload('cdn', cdnMirrorUrl)}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-bold text-xs shadow-lg transition w-full sm:w-auto justify-center border border-slate-700 cursor-pointer"
            title="Alternative fast CDN mirror for rural mobile networks"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>
              {downloadingMirror === 'cdn'
                ? t('कनेक्ट हो रहा है...', 'Connecting...')
                : t('फास्ट मिरर (CDN ⚡)', 'Fast Mirror (CDN ⚡)')}
            </span>
          </button>
        </div>
      </div>

      {/* Speed Optimization Guarantee Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{t('3x तीव्र गति', '3x Faster Speed')}</h4>
          <p className="text-xs text-slate-500">
            {t('64-bit ARM आर्किटेक्चर एवं R8 कंप्रेशन के साथ 3 सेकंड में डाउनलोड।', 'Downloads in 3 seconds with native 64-bit ARM & R8 byte compression.')}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{t('100% सुरक्षित एवं सत्यापित', '100% Safe & Verified')}</h4>
          <p className="text-xs text-slate-500">
            {t('कोई विज्ञापन या ट्रैकिंग नहीं। संस्थान के सर्वर द्वारा सीधे संकलित।', 'Zero ads, zero bloatware. Directly built and signed for ICC students.')}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{t('ऑटो अपडेट सपोर्ट', 'In-App Auto Update')}</h4>
          <p className="text-xs text-slate-500">
            {t('नया वर्जन आने पर ऐप के अंदर स्वतः नोटिफिकेशन व 1-टैप इंस्टॉलेशन।', 'Get instant in-app update notifications with automatic 1-tap package install.')}
          </p>
        </div>
      </div>

      {/* Step by Step Install Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">
          {t('स्थापना निर्देश (इंस्टॉलेशन गाइड)', 'Step-by-Step Installation Guide')}
        </h3>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p className="leading-relaxed">
              {t(
                'ऊपर दिए गए "मुख्य डाउनलोड" या "फास्ट मिरर" बटन पर क्लिक करके ~20 MB की फ़ाइल को अपने फोन में सेव करें।',
                'Tap the "Primary Download" or "Fast Mirror" button above to save the ~20 MB installation file.'
              )}
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p className="leading-relaxed">
              {t(
                'डाउनलोड पूर्ण होने पर नोटिफिकेशन बार से फ़ाइल खोलें अथवा अपने फोन के "Files / Downloads" फ़ोल्डर में जाकर ideal-coaching-release.apk पर टैप करें।',
                'Once downloaded, tap the download notification or locate ideal-coaching-release.apk in your Files or Downloads app.'
              )}
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              3
            </span>
            <p className="leading-relaxed">
              {t(
                'यदि फोन अज्ञात स्रोत (Install Unknown Apps / Unknown Sources) की अनुमति मांगे, तो सेटिंग्स में जाकर "Allow from this source" चालू करें।',
                'If Android prompts "Install Unknown Apps" or "Unknown Sources", open Settings and enable "Allow from this source".'
              )}
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              4
            </span>
            <p className="leading-relaxed">
              {t(
                '"Install" पर क्लिक करें। ऐप कुछ ही सेकंडों में आपके फोन में सुरक्षित रूप से इंस्टॉल हो जाएगा।',
                'Click "Install". The application will be verified and installed on your device in seconds.'
              )}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start space-x-3 text-xs text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            {t(
              'सुरक्षा सूचना: यह ऐप सीधे संस्थान द्वारा संकलित एवं हस्ताक्षरित (Signed) है। यदि डाउनलोड के दौरान नेटवर्क धीमा हो तो "फास्ट मिरर (CDN)" बटन का उपयोग करें।',
              'Security Assurance: This application is compiled and signed directly by IDEAL COACHING CENTRE. If mobile network is slow, use the "Fast Mirror (CDN)" option.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
