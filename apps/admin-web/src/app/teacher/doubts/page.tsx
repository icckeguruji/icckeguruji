'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Send, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface TeacherDoubt {
  id: string;
  studentNameHi: string;
  studentNameEn: string;
  courseTitle: string;
  subjectHi: string;
  subjectEn: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  status: 'open' | 'resolved';
  answerHi?: string;
  answerEn?: string;
}

export default function TeacherDoubtsPage() {
  const { lang, t } = useLanguage();

  const [doubts, setDoubts] = useState<TeacherDoubt[]>([
    {
      id: 'td-1',
      studentNameHi: 'अमित यादव',
      studentNameEn: 'Amit Yadav',
      courseTitle: 'BSEB Class 10 Toppers Batch',
      subjectHi: 'गणित',
      subjectEn: 'Mathematics',
      titleHi: 'यूक्लिड विभाजन प्रमेयिका द्वारा HCF ज्ञात करने में शेषफल शून्य न आने पर क्या करें?',
      titleEn: 'How to proceed with Euclid division algorithm if remainder is non-zero?',
      descriptionHi: 'कृपया 135 और 225 के HCF का चरणबद्ध हल समझाएं।',
      descriptionEn: 'Please explain the step-by-step solution for finding HCF of 135 and 225.',
      status: 'open',
    },
    {
      id: 'td-2',
      studentNameHi: 'रोहित कुमार',
      studentNameEn: 'Rohit Kumar',
      courseTitle: 'BSEB Class 10 Toppers Batch',
      subjectHi: 'विज्ञान',
      subjectEn: 'Science',
      titleHi: 'विस्थापन एवं द्विविस्थापन अभिक्रिया में क्या अंतर है?',
      titleEn: 'What is the difference between single and double displacement reactions?',
      descriptionHi: 'सर, कृपया उदाहरण सहित समझाएं।',
      descriptionEn: 'Sir, please explain with examples.',
      status: 'resolved',
      answerHi:
        'विस्थापन अभिक्रिया में अधिक क्रियाशील तत्व कम क्रियाशील तत्व को विस्थापित करता है। Fe + CuSO4 → FeSO4 + Cu।',
      answerEn:
        'In single displacement, a more reactive element displaces a less reactive one. Fe + CuSO4 → FeSO4 + Cu.',
    },
  ]);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  const handleAiDraftDoubt = async (d: TeacherDoubt) => {
    setAiDrafting(true);
    try {
      const res = await fetch('/api/ai/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft_doubt_solution',
          payload: {
            title: lang === 'hi' ? d.titleHi : d.titleEn,
            description: lang === 'hi' ? d.descriptionHi : d.descriptionEn,
            subject: lang === 'hi' ? d.subjectHi : d.subjectEn,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.solution) {
        setReplyText(data.solution);
      }
    } catch {
      alert('Unable to draft solution with Grok AI at the moment.');
    } finally {
      setAiDrafting(false);
    }
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'resolved',
              answerHi: lang === 'hi' ? replyText : d.answerHi || replyText,
              answerEn: lang === 'en' ? replyText : d.answerEn || replyText,
            }
          : d
      )
    );
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="flex-1 pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">{t('शंका समाधान केंद्र', 'Doubt Resolution Center')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('विद्यार्थियों द्वारा पूछे गए प्रश्नों का निवारण करें', 'Answer subject questions submitted by students')}
        </p>
      </header>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-4">
          {doubts.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {lang === 'hi' ? d.studentNameHi[0] : d.studentNameEn[0]}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {lang === 'hi' ? d.studentNameHi : d.studentNameEn}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {d.courseTitle} · {lang === 'hi' ? d.subjectHi : d.subjectEn}
                    </p>
                  </div>
                </div>

                {d.status === 'resolved' ? (
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    {t('हल किया गया', 'Resolved')}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {t('उत्तर लंबित', 'Pending Reply')}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {lang === 'hi' ? d.titleHi : d.titleEn}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {lang === 'hi' ? d.descriptionHi : d.descriptionEn}
                </p>
              </div>

              {d.answerHi || d.answerEn ? (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block">{t('आपका उत्तर:', 'Your Answer:')}</span>
                  <p className="text-emerald-800 leading-relaxed">
                    {lang === 'hi' ? d.answerHi : d.answerEn}
                  </p>
                </div>
              ) : activeReplyId === d.id ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {t('समाधान आलेख (Solution Draft):', 'Solution Draft:')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAiDraftDoubt(d)}
                      disabled={aiDrafting}
                      className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-purple-200" />
                      <span>{aiDrafting ? t('ड्राफ्टिंग जारी...', 'Drafting with Grok...') : t('Grok AI से हल ड्राफ्ट करें', 'Draft with Grok AI')}</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t(
                      'छात्र के लिए स्पष्ट समाधान लिखें या Grok AI से तुरंत ड्राफ्ट करें...',
                      'Write clear guidance or click Draft with Grok AI...'
                    )}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {t('रद्द करें', 'Cancel')}
                    </button>
                    <button
                      onClick={() => handleSendReply(d.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('उत्तर भेजें', 'Submit & Mark Resolved')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setActiveReplyId(d.id); setReplyText(''); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    {t('उत्तर लिखें', 'Write Answer')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
