'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function PublicTeachersPage() {
  const { lang, t } = useLanguage();

  const faculty = [
    {
      nameHi: 'इंजी. आर. के. शर्मा',
      nameEn: 'Er. R. K. Sharma',
      degreeHi: 'B.Tech (NIT Patna) · 10+ वर्ष शिक्षण अनुभव',
      degreeEn: 'B.Tech (NIT Patna) · 10+ Years Teaching Experience',
      subjectHi: 'भौतिकी एवं गणित',
      subjectEn: 'Physics & Mathematics',
      descHi: 'बिहार एवं झारखंड बोर्ड के हज़ारों छात्रों को गणित और भौतिकी के कठिन सूत्रों को आसान बनाकर सिखाने का विशाल अनुभव। इनके पढ़ाए सैकड़ों छात्र राज्य मेरिट लिस्ट में आ चुके हैं।',
      descEn: 'Extensive experience in teaching state board matric and intermediate physics and mathematics with simplified formulas and problem-solving techniques.',
    },
    {
      nameHi: 'डॉ. एस. एन. मिश्रा',
      nameEn: 'Dr. S. N. Mishra',
      degreeHi: 'M.Sc, Ph.D (Patna University)',
      degreeEn: 'M.Sc, Ph.D (Patna University)',
      subjectHi: 'रसायन शास्त्र एवं जीव विज्ञान',
      subjectEn: 'Chemistry & Biology',
      descHi: 'रासायनिक अभिक्रियाओं और जीव विज्ञान के नामांकित चित्रों को सरलता से याद कराने की विशेष तकनीक के प्रणेता। बिहार बोर्ड के छात्रों के सर्वाधिक लोकप्रिय शिक्षक।',
      descEn: 'Renowned expert in simplifying organic chemistry reactions and biological diagrams for board examinations.',
    },
    {
      nameHi: 'प्रो. विजय कुमार सिंह',
      nameEn: 'Prof. V. K. Singh',
      degreeHi: 'M.A. (Gold Medalist), B.Ed',
      degreeEn: 'M.A. (Gold Medalist), B.Ed',
      subjectHi: 'सामाजिक विज्ञान एवं हिंदी',
      subjectEn: 'Social Science & Hindi',
      descHi: 'इतिहास, भूगोल, नागरिक शास्त्र एवं हिंदी व्याकरण में बोर्ड परीक्षा के मॉडल उत्तर लिखने की सटीक कला सिखाने में सिद्धहस्त।',
      descEn: 'Specialist in teaching board-level answer writing, essay structuring, and grammar concepts for scoring full marks.',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          {t('हमारे विशेषज्ञ शिक्षक', 'Our Expert Faculty')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t(
            'बिहार और झारखंड बोर्ड परीक्षा में छात्रों को टॉपर बनाने वाली अनुभवी शिक्षक टीम',
            'Experienced faculty team dedicated to producing board toppers in BSEB & JAC examinations'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {faculty.map((member, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center">
                {lang === 'hi' ? member.nameHi.slice(0, 1) : member.nameEn.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {lang === 'hi' ? member.nameHi : member.nameEn}
                </h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  {lang === 'hi' ? member.degreeHi : member.degreeEn}
                </p>
                <p className="text-xs text-amber-600 font-bold mt-1">
                  {t('विषय: ', 'Subject: ')}
                  {lang === 'hi' ? member.subjectHi : member.subjectEn}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {lang === 'hi' ? member.descHi : member.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
