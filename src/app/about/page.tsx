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
            'कक्षा 1 से 12वीं के विद्यार्थियों के उज्ज्वल भविष्य के लिए समर्पित शैक्षणिक संस्थान',
            'Dedicated academic institution empowering students from Class 1st to 12th'
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">
          {t('संस्थान का उद्देश्य एवं दृष्टि', 'Our Mission & Vision')}
        </h2>
        <p>
          {t(
            'आइडियल कोचिंग सेंटर (सरोतिया, महागामा, गोड्डा) की स्थापना डायरेक्टर बड़े सर (BADE SIR) के मार्गदर्शन में इस मुख्य उद्देश्य के साथ की गई थी कि क्षेत्र के सभी विद्यार्थियों को सर्वश्रेष्ठ मार्गदर्शन से गुणवत्तापूर्ण और परिणामोन्मुखी शिक्षा प्राप्त हो सके।',
            'IDEAL COACHING CENTRE (Sarotiya, Mahagama, Godda) was established under the leadership of Director BADE SIR with the core mission of bringing premier, result-oriented coaching to students across Classes 1st to 12th.'
          )}
        </p>
        <p>
          {t(
            'हमारा पूरा पाठ्यक्रम एनसीईआरटी (NCERT) पाठ्यक्रम, व्यवस्थित अध्ययन सामग्री और पिछले वर्षों के परीक्षा पैटर्न पर पूर्णतः आधारित है।',
            'Our structured syllabus closely matches NCERT textbooks, comprehensive study materials, and examination patterns with verified model solutions.'
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
                'प्रत्येक छात्र को कठिन से कठिन वैज्ञानिक और गणितीय सिद्धांतों को सरलता से समझाना और वार्षिक परीक्षाओं में 90%+ अंक दिलाना।',
                'Simplifying complex scientific concepts and mathematical formulas to empower students to score 90%+ in matric and intermediate examinations.'
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
