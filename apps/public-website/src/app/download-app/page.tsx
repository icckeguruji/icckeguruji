'use client';

import React from 'react';
import Image from 'next/image';
import { Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function DownloadAppPage() {
  const { t } = useLanguage();

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg shadow-blue-500/20 mx-auto flex items-center justify-center p-1 border-2 border-slate-100">
          <Image src="/logo.png" alt="ICC Logo" width={64} height={64} className="w-full h-full object-contain rounded-full" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {t('आइडियल कोचिंग सेंटर एंड्रॉयड ऐप डाउनलोड', 'Download Ideal Coaching Centre Android App')}
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          {t(
            'बिहार (BSEB) एवं झारखंड (JAC) बोर्ड परीक्षा की डिजिटल तैयारी के लिए आधिकारिक मोबाइल एप्लिकेशन।',
            'Official Android mobile application for Bihar Board and Jharkhand Board matric and intermediate exam preparations.'
          )}
        </p>
      </div>

      {/* APK Download Box */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
            Official Release v1.1.0
          </span>
          <h3 className="text-xl font-bold mt-2">ideal-coaching-release.apk</h3>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'फ़ाइल साइज़: ~25 MB · समर्थित: Android 7.0+ (Nougat और नए)',
              'File Size: ~25 MB · Supported: Android 7.0+ (Nougat and above)'
            )}
          </p>
        </div>

        <a
          href="https://github.com/icckeguruji/icc/releases/latest/download/ideal-coaching-release.apk"
          download
          className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          <span>{t('एपीके डाउनलोड करें', 'Download APK')}</span>
        </a>
      </div>

      {/* Step by Step Install Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">
          {t('स्थापना निर्देश', 'Step-by-Step Installation Guide')}
        </h3>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p className="leading-relaxed">
              {t(
                'ऊपर दिए गए "एपीके डाउनलोड करें" बटन पर क्लिक करके फ़ाइल को अपने फोन में सेव करें।',
                'Tap the "Download APK" button above to save the installation file on your Android device.'
              )}
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p className="leading-relaxed">
              {t(
                'डाउनलोड पूर्ण होने पर नोटिफिकेशन बार से फ़ाइल खोलें अथवा अपने फोन के "Files/Downloads" फ़ोल्डर में जाएं।',
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
                'यदि फोन अज्ञात स्रोत (Unknown Sources / Install Unknown Apps) की अनुमति मांगे, तो सेटिंग्स में जाकर "Allow from this source" को चालू करें।',
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
              'सुरक्षा सूचना: यह ऐप सीधे संस्थान द्वारा संकलित एवं हस्ताक्षरित (Signed) है। इसमें कोई विज्ञापन अथवा हानिकारक कोड नहीं है।',
              'Security Assurance: This application is compiled and signed directly by IDEAL COACHING CENTRE. It contains zero ads and zero tracking.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
