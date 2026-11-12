'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  CreditCard,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export default function ReportsPage() {
  const { lang, t } = useLanguage();
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportCards = [
    {
      id: 'registrations',
      titleHi: 'विद्यार्थी पंजीकरण रिपोर्ट',
      titleEn: 'Student Registration Report',
      descHi: 'सभी नामांकित छात्रों की सूची, बोर्ड, कक्षा, ज़िला एवं संपर्क जानकारी।',
      descEn: 'Full directory with Board, Class, District and contact details.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'payments',
      titleHi: 'शुल्क एवं राजस्व रिपोर्ट',
      titleEn: 'Fee Collection & Revenue Report',
      descHi: 'स्वीकृत, लंबित एवं अस्वीकृत भुगतानों का संपूर्ण वित्तीय लेखा-जोखा।',
      descEn: 'Complete financial statement of manual UPI payments with UTR reference.',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'exams',
      titleHi: 'ऑनलाइन परीक्षा परिणाम रिपोर्ट',
      titleEn: 'Online Examination Performance Report',
      descHi: 'अध्यायवार मॉक टेस्ट में छात्रों के प्राप्त अंक, सटीकता दर एवं स्थिति।',
      descEn: 'Student scores, accuracy rates and pass/fail rankings in online tests.',
      icon: FileCheck2,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'expiries',
      titleHi: 'सक्रियता एवं वैधता समाप्ति रिपोर्ट',
      titleEn: 'Course Validity & Expiry Audit',
      descHi: 'अगले 30 दिनों में समाप्त होने वाले कोर्स सब्सक्रिप्शन की सूची।',
      descEn: 'Subscribers due for course expiry within 30 days for renewal tracking.',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const handleExportCSV = (reportId: string, title: string) => {
    setDownloading(reportId);
    setTimeout(() => {
      // Mock CSV generation and download trigger
      const dummyCsv = `ID,Name,Board,Class,Date,Status\n1,Rohit Kumar,BSEB,Class 10,2026-04-01,Active\n2,Priya Singh,JAC,Class 10,2026-04-02,Active\n3,Amit Yadav,BSEB,Class 10,2026-04-03,Active`;
      const blob = new Blob([dummyCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportId}_report_ideal_coaching_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 600);
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="रिपोर्ट्स एवं डेटा निर्यात"
        titleEn="Reports & Data Analytics Export"
        subtitleHi="संस्थान के विद्यार्थियों, राजस्व एवं परीक्षा परिणामों का CSV डाउनलोड"
        subtitleEn="Generate audit-ready CSV exports for students, revenue and exams"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card) => {
            const Icon = card.icon;
            const isDownloading = downloading === card.id;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {lang === 'hi' ? card.titleHi : card.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'hi' ? card.descHi : card.descEn}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Format: .CSV (Excel Ready)</span>
                  <button
                    onClick={() => handleExportCSV(card.id, card.titleEn)}
                    disabled={isDownloading}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    {isDownloading ? (
                      <span>{t('तैयार हो रहा है...', 'Generating...')}</span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('CSV डाउनलोड करें', 'Export CSV')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
