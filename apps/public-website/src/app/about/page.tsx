import React from 'react';
import { Award, Target, BookOpen, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          आइडियल कोचिंग सेंटर (IDEAL COACHING CENTRE) के बारे में
        </h1>
        <p className="text-sm text-slate-500">
          बिहार और झारखंड के विद्यार्थियों के उज्ज्वल भविष्य के लिए समर्पित शैक्षणिक संस्थान
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">संस्थान का उद्देश्य एवं दृष्टि</h2>
        <p>
          आइडियल कोचिंग सेंटर की स्थापना 2015 में इस मुख्य उद्देश्य के साथ की गई थी कि बिहार एवं झारखंड के दूरदराज के क्षेत्रों और साधारण पृष्ठभूमि के विद्यार्थियों को भी राज्य के सर्वश्रेष्ठ शिक्षकों से गुणवत्तापूर्ण और परिणामोन्मुखी शिक्षा प्राप्त हो सके।
        </p>
        <p>
          हमारा पूरा पाठ्यक्रम बिहार विद्यालय परीक्षा समिति (BSEB) एवं झारखंड अधिविद्य परिषद् (JAC) के आधिकारिक ब्लूप्रिंट, एनसीईआरटी पाठ्यक्रम और पिछले वर्षों के परीक्षा पैटर्न पर पूर्णतः आधारित है।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h3 className="font-bold text-blue-900 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              हमारा लक्ष्य (Our Mission)
            </h3>
            <p className="text-xs text-blue-800">
              प्रत्येक छात्र को उसकी मातृभाषा (हिंदी) में कठिन से कठिन वैज्ञानिक और गणितीय सिद्धांतों को सरलता से समझाना और बोर्ड परीक्षा में 90%+ अंक दिलाना।
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              शून्य-अनावश्यक शुल्क नीति
            </h3>
            <p className="text-xs text-emerald-800">
              संस्थान केवल वास्तविक शैक्षणिक मार्गदर्शन का न्यूनतम शुल्क लेता है। आधार बैच पूर्णतः निःशुल्क उपलब्ध कराए जाते हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
