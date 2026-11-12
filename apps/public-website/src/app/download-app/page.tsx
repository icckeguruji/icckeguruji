import React from 'react';
import { Smartphone, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DownloadAppPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          ICC
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          आइडियल कोचिंग सेंटर एंड्रॉयड ऐप डाउनलोड
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          बिहार (BSEB) एवं झारखंड (JAC) बोर्ड परीक्षा की डिजिटल तैयारी के लिए आधिकारिक मोबाइल एप्लिकेशन।
        </p>
      </div>

      {/* APK Download Box */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
            Official Release v1.0.0
          </span>
          <h3 className="text-xl font-bold mt-2">ideal-coaching-release.apk</h3>
          <p className="text-xs text-slate-400 mt-1">
            फ़ाइल साइज़: ~24.8 MB · समर्थित: Android 7.0+ (Nougat और नए)
          </p>
        </div>

        <a
          href="/ideal-coaching-release.apk"
          download
          className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          <span>एपीके डाउनलोड करें (Direct Download)</span>
        </a>
      </div>

      {/* Step by Step Install Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">
          स्थापना निर्देश (Step-by-Step Installation Guide)
        </h3>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p className="leading-relaxed">
              ऊपर दिए गए <span className="font-bold text-slate-800">"एपीके डाउनलोड करें"</span> बटन पर क्लिक करके फ़ाइल को अपने फोन में सेव करें।
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p className="leading-relaxed">
              डाउनलोड पूर्ण होने पर नोटिफिकेशन बार से एपीके फ़ाइल पर टैप करें। यदि आपका फोन <span className="font-bold text-slate-800">"अज्ञात स्रोत (Unknown Sources / Install unknown apps)"</span> की अनुमति मांगे, तो सेटिंग्स में जाकर क्रोम अथवा फ़ाइल मैनेजर के लिए अनुमति सक्रिय (Allow) करें।
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
              3
            </span>
            <p className="leading-relaxed">
              <span className="font-bold text-slate-800">"Install"</span> बटन पर क्लिक करें। ऐप इंस्टॉल होने के उपरांत खोलें और अपने मोबाइल नंबर अथवा ईमेल द्वारा सुरक्षित ईमेल ओटीपी से लॉगिन करें।
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">सुरक्षा एवं गोपनीयता गारंटी</h4>
            <p className="mt-0.5 leading-relaxed">
              यह एप्लिकेशन पूरी तरह सुरक्षित है। इसमें कोई अनपेक्षित परमिशन या विज्ञापन नहीं हैं। ऐप का निर्माण स्थानीय एंड्रॉयड एसडीके द्वारा किया गया है।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
