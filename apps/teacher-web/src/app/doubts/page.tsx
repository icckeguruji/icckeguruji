'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Send, Clock, User } from 'lucide-react';

interface TeacherDoubt {
  id: string;
  studentName: string;
  courseTitle: string;
  subject: string;
  title: string;
  description: string;
  status: 'open' | 'resolved';
  answer?: string;
}

export default function TeacherDoubtsPage() {
  const [doubts, setDoubts] = useState<TeacherDoubt[]>([
    {
      id: 'td-1',
      studentName: 'Amit Yadav (अमित यादव)',
      courseTitle: 'BSEB Class 10 Toppers Batch',
      subject: 'Mathematics (गणित)',
      title: 'यूक्लिड विभाजन प्रमेयिका द्वारा HCF ज्ञात करने में शेषफल शून्य न आने पर क्या करें?',
      description: 'कृपया 135 और 225 के HCF का चरणबद्ध हल समझाएं।',
      status: 'open',
    },
    {
      id: 'td-2',
      studentName: 'Rohit Kumar (रोहित कुमार)',
      courseTitle: 'BSEB Class 10 Toppers Batch',
      subject: 'Science (विज्ञान)',
      title: 'विस्थापन एवं द्विविस्थापन अभिक्रिया में क्या अंतर है?',
      description: 'सर, कृपया उदाहरण सहित समझाएं कि कॉपर सल्फेट और आयरन की क्रिया विस्थापन क्यों है?',
      status: 'resolved',
      answer: 'विस्थापन अभिक्रिया में अधिक क्रियाशील तत्व कम क्रियाशील तत्व को उसके यौगिक से विस्थापित करता है। Fe + CuSO4 -> FeSO4 + Cu। जबकि द्विविस्थापन में आयनों का आदान-प्रदान होता है।',
    },
  ]);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'resolved', answer: replyText } : d
      )
    );
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="flex-1 pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-slate-800">शंका समाधान केंद्र (Doubt Resolution)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          विद्यार्थियों द्वारा पूछे गए प्रश्नों का निवारण करें
        </p>
      </header>

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-4">
          {doubts.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {d.studentName[0]}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{d.studentName}</h4>
                    <p className="text-[11px] text-slate-500">{d.courseTitle} · {d.subject}</p>
                  </div>
                </div>

                {d.status === 'resolved' ? (
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> हल किया गया (Resolved)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 mr-1" /> उत्तर लंबित (Pending)
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{d.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.description}</p>
              </div>

              {d.answer ? (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block">आपका उत्तर:</span>
                  <p className="text-emerald-800 leading-relaxed">{d.answer}</p>
                </div>
              ) : activeReplyId === d.id ? (
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="छात्र के लिए विस्तृत एवं स्पष्ट समाधान लिखें..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={() => handleSendReply(d.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>उत्तर भेजें एवं हल मार्क करें</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveReplyId(d.id);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    उत्तर लिखें (Reply)
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
