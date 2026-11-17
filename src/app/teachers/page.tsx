'use client';

import React from 'react';
import Image from 'next/image';
import { Award, Phone, Mail, CheckCircle, Sparkles } from 'lucide-react';
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
      descHi: 'कक्षा 1 से 12वीं के हज़ारों छात्रों को गणित और भौतिकी के कठिन सूत्रों को आसान बनाकर सिखाने का विशाल अनुभव। इनके पढ़ाए सैकड़ों छात्र सर्वोच्च अंक प्राप्त कर चुके हैं।',
      descEn: 'Extensive experience in teaching matric and intermediate physics and mathematics with simplified formulas and problem-solving techniques.',
    },
    {
      nameHi: 'डॉ. एस. एन. मिश्रा',
      nameEn: 'Dr. S. N. Mishra',
      degreeHi: 'M.Sc, Ph.D (Patna University)',
      degreeEn: 'M.Sc, Ph.D (Patna University)',
      subjectHi: 'रसायन शास्त्र एवं जीव विज्ञान',
      subjectEn: 'Chemistry & Biology',
      descHi: 'रासायनिक अभिक्रियाओं और जीव विज्ञान के नामांकित चित्रों को सरलता से याद कराने की विशेष तकनीक के प्रणेता। छात्रों के सर्वाधिक लोकप्रिय शिक्षक।',
      descEn: 'Renowned expert in simplifying organic chemistry reactions and biological diagrams for academic excellence.',
    },
    {
      nameHi: 'प्रो. विजय कुमार सिंह',
      nameEn: 'Prof. V. K. Singh',
      degreeHi: 'M.A. (Gold Medalist), B.Ed',
      degreeEn: 'M.A. (Gold Medalist), B.Ed',
      subjectHi: 'सामाजिक विज्ञान एवं हिंदी',
      subjectEn: 'Social Science & Hindi',
      descHi: 'इतिहास, भूगोल, नागरिक शास्त्र एवं हिंदी व्याकरण में मॉडल उत्तर लिखने की सटीक कला सिखाने में सिद्धहस्त।',
      descEn: 'Specialist in teaching high-scoring answer writing, essay structuring, and grammar concepts for scoring full marks.',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('अनुभवी संकाय एवं नेतृत्व', 'Expert Faculty & Leadership')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          {t('हमारे विशेषज्ञ शिक्षक एवं मार्गदर्शक', 'Our Faculty & Mentors')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t(
            'कक्षा 1 से 12वीं में छात्रों को टॉपर बनाने वाली समर्पित एवं अनुभवी शिक्षक टीम',
            'Experienced faculty team dedicated to academic excellence from Class 1st to 12th'
          )}
        </p>
      </div>

      {/* Featured Director Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-900/60 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-2xl shrink-0 bg-slate-800">
          <Image
            src="/bade-sir.png"
            alt="Director BADE SIR"
            width={208}
            height={208}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2 text-center">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
              Director
            </span>
          </div>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span>{t('संस्थान निदेशक एवं मुख्य शिक्षक', 'Founder & Academic Director')}</span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              <span>BADE SIR (बड़े सर)</span>
              <CheckCircle className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-amber-300 font-bold mt-1">
              IDEAL COACHING CENTRE · Sarotiya, Godda (Jharkhand)
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {t(
              'विगत 12 वर्षों से छात्रों को गुणवत्तापूर्ण शिक्षा, व्यक्तिगत मार्गदर्शन एवं शत-प्रतिशत सफलता दिलाने में समर्पित। इनके मार्गदर्शन में सैकड़ों छात्र सर्वोच्च अंक प्राप्त कर सफलता हासिल कर चुके हैं।',
              'Dedicated to academic excellence for over 12 years. Under his mentorship, hundreds of students have achieved top ranks and academic honors.'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold">
            <a
              href="tel:+919771350910"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 9771350910</span>
            </a>
            <a
              href="mailto:icckeguruji@gmail.com"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>icckeguruji@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Faculty Members Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900">
          {t('विषय विशेषज्ञ शिक्षक', 'Subject Specialist Faculty')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faculty.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center shadow-xs">
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
    </div>
  );
}
