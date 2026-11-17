'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@icc/shared-utils';
import {
  PlaySquare,
  Plus,
  Play,
  Lock,
  Unlock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface MockLecture {
  id: string;
  title: string;
  title_hi: string;
  youtube_video_id: string;
  duration_minutes: number;
  lecture_order: number;
  is_free_preview: boolean;
  subject: string;
  chapter: string;
}

export default function RecordedLecturesPage() {
  const { lang, t } = useLanguage();
  const [lectures, setLectures] = useState<MockLecture[]>([
    {
      id: 'lec-1',
      title: 'Lec 01: Introduction to Chemical Reactions & Types',
      title_hi: 'लेक्चर 01: रासायनिक अभिक्रियाएँ एवं उनके प्रकार',
      youtube_video_id: 'dQw4w9WgXcQ',
      duration_minutes: 45,
      lecture_order: 1,
      is_free_preview: true,
      subject: 'Science (विज्ञान)',
      chapter: 'Ch 1: Chemical Reactions',
    },
    {
      id: 'lec-2',
      title: 'Lec 02: Balancing Chemical Equations (Hit & Trial Method)',
      title_hi: 'लेक्चर 02: रासायनिक समीकरणों को संतुलित करना (सरल विधि)',
      youtube_video_id: 'dQw4w9WgXcQ',
      duration_minutes: 52,
      lecture_order: 2,
      is_free_preview: false,
      subject: 'Science (विज्ञान)',
      chapter: 'Ch 1: Chemical Reactions',
    },
    {
      id: 'lec-3',
      title: 'Lec 01: Real Numbers & Euclid Division Lemma',
      title_hi: 'लेक्चर 01: वास्तविक संख्याएं और यूक्लिड विभाजन प्रमेयिका',
      youtube_video_id: 'dQw4w9WgXcQ',
      duration_minutes: 47,
      lecture_order: 1,
      is_free_preview: true,
      subject: 'Mathematics (गणित)',
      chapter: 'Ch 1: Real Numbers',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    youtube_video_id: '',
    duration_minutes: 45,
    is_free_preview: false,
    lecture_order: 1,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractYouTubeVideoId(formData.youtube_video_id);
    const newLec: MockLecture = {
      id: `lec-${Date.now()}`,
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      youtube_video_id: vidId,
      duration_minutes: Number(formData.duration_minutes),
      lecture_order: Number(formData.lecture_order),
      is_free_preview: formData.is_free_preview,
      subject: 'Science (विज्ञान)',
      chapter: 'Ch 1: Chemical Reactions',
    };
    setLectures([newLec, ...lectures]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      title_hi: '',
      youtube_video_id: '',
      duration_minutes: 45,
      is_free_preview: false,
      lecture_order: 1,
    });
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="रिकॉर्डेड कक्षाएं एवं वीडियो व्याख्यान"
        titleEn="Recorded Video Lectures Manager"
        subtitleHi="यूट्यूब वीडियो आईडी द्वारा अध्यायवार व्याख्यान संगठन"
        subtitleEn="Organize chapter-wise video playlists with free preview controls"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल वीडियो व्याख्यान: ${lectures.length}`, `Total Lectures: ${lectures.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('यूट्यूब अनलिस्टेड वीडियो द्वारा शून्य होस्टिंग लागत', 'Zero video hosting cost via YouTube unlisted')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नया व्याख्यान जोड़ें', 'Add Video Lecture')}</span>
          </button>
        </div>

        {/* Video Lectures List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('व्याख्यान शीर्षक एवं यूट्यूब आईडी', 'Lecture & YouTube ID')}</th>
                <th className="py-3 px-4">{t('विषय एवं अध्याय', 'Subject & Chapter')}</th>
                <th className="py-3 px-4">{t('क्रम', 'Order')}</th>
                <th className="py-3 px-4">{t('अवधि', 'Duration')}</th>
                <th className="py-3 px-4">{t('एक्सेस', 'Access')}</th>
                <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lectures.map((lec) => (
                <tr key={lec.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-9 bg-slate-900 rounded overflow-hidden flex-shrink-0 relative group">
                        <img
                          src={getYouTubeThumbnail(lec.youtube_video_id)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">
                          {lang === 'hi' ? lec.title_hi : lec.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          YouTube ID: {lec.youtube_video_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{lec.subject}</p>
                    <p className="text-[11px] text-slate-500">{lec.chapter}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">#{lec.lecture_order}</td>
                  <td className="py-3 px-4 text-slate-600">{lec.duration_minutes} {t('मिनट', 'mins')}</td>
                  <td className="py-3 px-4">
                    {lec.is_free_preview ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <Unlock className="w-3 h-3 mr-1" /> {t('ट्रायल डेमो', 'Trial Demo')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <Lock className="w-3 h-3 mr-1" /> {t('नामांकित छात्र', 'Enrolled Only')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`https://www.youtube.com/watch?v=${lec.youtube_video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium inline-flex items-center space-x-1"
                    >
                      <span>{t('देखें', 'View')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया वीडियो व्याख्यान जोड़ें', 'Add Video Lecture')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (अंग्रेज़ी)', 'Lecture Title')}</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (हिंदी)', 'Lecture Title (Hindi)')}</label>
                  <input
                    type="text"
                    required
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('यूट्यूब वीडियो आईडी या लिंक', 'YouTube Video ID or Link')}</label>
                  <input
                    type="text"
                    required
                    value={formData.youtube_video_id}
                    onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('क्रम संख्या', 'Order Number')}</label>
                    <input
                      type="number"
                      value={formData.lecture_order}
                      onChange={(e) => setFormData({ ...formData, lecture_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अवधि (मिनट)', 'Duration (Minutes)')}</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_free_preview"
                    checked={formData.is_free_preview}
                    onChange={(e) => setFormData({ ...formData, is_free_preview: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="is_free_preview" className="font-semibold text-slate-700">
                    {t('निःशुल्क डेमो के रूप में पूर्वावलोकन दें', 'Allow Free Preview')}
                  </label>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('व्याख्यान सहेजें', 'Save Lecture')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
