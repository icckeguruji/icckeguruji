import React from 'react';
import { Award, BookOpen, GraduationCap } from 'lucide-react';

export default function PublicTeachersPage() {
  const faculty = [
    {
      name: 'इंजी. आर. के. शर्मा (Er. R. K. Sharma)',
      degree: 'B.Tech (NIT Patna) · 10+ वर्ष शिक्षण अनुभव',
      subject: 'भौतिकी एवं गणित (Physics & Mathematics)',
      desc: 'बिहार एवं झारखंड बोर्ड के हज़ारों छात्रों को गणित और भौतिकी के कठिन सूत्रों को आसान बनाकर सिखाने का विशाल अनुभव। इनके पढ़ाए सैकड़ों छात्र राज्य मेरिट लिस्ट में आ चुके हैं।',
    },
    {
      name: 'डॉ. एस. एन. मिश्रा (Dr. S. N. Mishra)',
      degree: 'M.Sc, Ph.D (Patna University)',
      subject: 'रसायन शास्त्र एवं जीव विज्ञान (Chemistry & Biology)',
      desc: 'रासायनिक अभिक्रियाओं और जीव विज्ञान के नामांकित चित्रों को सरलता से याद कराने की विशेष तकनीक के प्रणेता। बिहार बोर्ड के छात्रों के सर्वाधिक लोकप्रिय शिक्षक।',
    },
    {
      name: 'प्रो. विजय कुमार सिंह (Prof. V. K. Singh)',
      degree: 'M.A. (Gold Medalist), B.Ed',
      subject: 'सामाजिक विज्ञान एवं हिंदी (Social Science & Hindi)',
      desc: 'इतिहास, भूगोल, नागरिक शास्त्र एवं हिंदी व्याकरण में बोर्ड परीक्षा के मॉडल उत्तर लिखने की सटीक कला सिखाने में सिद्धहस्त।',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          हमारे विशेषज्ञ शिक्षक (Our Expert Faculty)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          बिहार और झारखंड बोर्ड परीक्षा में छात्रों को टॉपर बनाने वाली अनुभवी शिक्षक टीम
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {faculty.map((t, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center">
                {t.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{t.degree}</p>
                <p className="text-xs text-amber-600 font-bold mt-1">विषय: {t.subject}</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {t.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
