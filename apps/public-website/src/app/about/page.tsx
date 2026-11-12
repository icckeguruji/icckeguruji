'use client';

import React from 'react';
import { Target, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          {t('संस्थान का परिचय', 'About Ideal Coaching Centre')}
        </h1>
        <p className="text-sm text-slate-500">
          {t(
            'बिहार और झारखंड के विद्यार्थियों के उज्ज्वल भविष्य के लिए समर्पित शैक्षणिक संस्थान',
            'Dedicated academic institution empowering state board students across Bihar and Jharkhand'
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">
          {t('संस्थान का उद्देश्य एवं दृष्टि', 'Our Mission & Vision')}
        </h2>
        <p>
          {t(
            'आइडियल कोचिंग सेंटर की स्थापना 2015 में इस मुख्य उद्देश्य के साथ की गई थी कि बिहार एवं झारखंड के दूरदराज के क्षेत्रों और साधारण पृष्ठभूमि के विद्यार्थियों को भी राज्य के सर्वश्रेष्ठ शिक्षकों से गुणवत्तापूर्ण और परिणामोन्मुखी शिक्षा प्राप्त हो सके।',
            'IDEAL COACHING CENTRE was founded with the prime objective of bringing top-quality board examination coaching to students across Bihar and Jharkhand, eliminating geographic and economic barriers.'
          )}
        </p>
        <p>
          {t(
            'हमारा पूरा पाठ्यक्रम बिहार विद्यालय परीक्षा समिति (BSEB) एवं झारखंड अधिविद्य परिषद् (JAC) के आधिकारिक ब्लूप्रिंट, एनसीईआरटी पाठ्यक्रम और पिछले वर्षों के परीक्षा पैटर्न पर पूर्णतः आधारित है।',
            'Our structured syllabus closely matches the official BSEB and JAC academic blueprints, NCERT textbooks, and past examination papers with verified model solutions.'
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h3 className="font-bold text-blue-900 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              {t('हमारा लक्ष्य', 'Our Target')}
            </h3>
            <p className="text-xs text-blue-800">
              {t(
                'प्रत्येक छात्र को कठिन से कठिन वैज्ञानिक और गणितीय सिद्धांतों को सरलता से समझाना और बोर्ड परीक्षा में 90%+ अंक दिलाना।',
                'Simplifying complex scientific concepts and mathematical formulas to empower students to score 90%+ in state board matric and intermediate exams.'
              )}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t('शून्य-अनावश्यक शुल्क नीति', 'Affordable Learning Commitment')}
            </h3>
            <p className="text-xs text-emerald-800">
              {t(
                'संस्थान केवल वास्तविक शैक्षणिक मार्गदर्शन का न्यूनतम शुल्क लेता है। आधार बैच पूर्णतः निःशुल्क उपलब्ध कराए जाते हैं।',
                'Our institute runs on a zero-waste infrastructure philosophy, ensuring affordable course fees and completely free basic foundation batches.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
