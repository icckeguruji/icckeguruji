'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, RecordedLectureItem } from '@/lib/api';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@icc/shared-utils';
import {
  PlaySquare,
  Plus,
  Play,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function RecordedLecturesPage() {
  const { lang, t } = useLanguage();
  const [lectures, setLectures] = useState<RecordedLectureItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<RecordedLectureItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    youtube_video_id: '',
    duration_minutes: 45,
    is_free_preview: false,
    lecture_order: 1,
    subject: 'Science (विज्ञान)',
    chapter: 'Ch 1: Basics',
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    title_hi: '',
    youtube_video_id: '',
    duration_minutes: 45,
    is_free_preview: false,
    lecture_order: 1,
    subject: 'Science (विज्ञान)',
    chapter: 'Ch 1: Basics',
  });

  const loadLectures = () => {
    AdminApi.getRecordedLectures().then((data) => setLectures(data));
  };

  useEffect(() => {
    loadLectures();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractYouTubeVideoId(formData.youtube_video_id);
    const created = await AdminApi.createRecordedLecture({
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      youtube_video_id: vidId,
      duration_minutes: Number(formData.duration_minutes),
      lecture_order: Number(formData.lecture_order),
      is_free_preview: formData.is_free_preview,
      subject: formData.subject,
      chapter: formData.chapter,
    });
    setLectures((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      title_hi: '',
      youtube_video_id: '',
      duration_minutes: 45,
      is_free_preview: false,
      lecture_order: (lectures.length + 1),
      subject: 'Science (विज्ञान)',
      chapter: 'Ch 1: Basics',
    });
  };

  const openEditModal = (lec: RecordedLectureItem) => {
    setEditingLecture(lec);
    setEditFormData({
      title: lec.title,
      title_hi: lec.title_hi || lec.title,
      youtube_video_id: lec.youtube_video_id,
      duration_minutes: lec.duration_minutes || 45,
      is_free_preview: Boolean(lec.is_free_preview),
      lecture_order: lec.lecture_order || 1,
      subject: lec.subject || 'Core Subject',
      chapter: lec.chapter || 'Chapter 1',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture) return;

    const vidId = extractYouTubeVideoId(editFormData.youtube_video_id);
    const updated = await AdminApi.updateRecordedLecture(editingLecture.id, {
      title: editFormData.title,
      title_hi: editFormData.title_hi,
      youtube_video_id: vidId,
      duration_minutes: Number(editFormData.duration_minutes),
      lecture_order: Number(editFormData.lecture_order),
      is_free_preview: editFormData.is_free_preview,
      subject: editFormData.subject,
      chapter: editFormData.chapter,
    });

    if (updated) {
      setLectures((prev) => prev.map((l) => (l.id === editingLecture.id ? updated : l)));
    }
    setIsEditModalOpen(false);
    setEditingLecture(null);
  };

  const handleDelete = async (lec: RecordedLectureItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this recorded lecture:\n"${lec.title}"?\n\nThis will remove it from the catalog.`
    );
    if (!confirmed) return;

    await AdminApi.deleteRecordedLecture(lec.id);
    setLectures((prev) => prev.filter((l) => l.id !== lec.id));
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="रिकॉर्डेड कक्षाएं एवं वीडियो व्याख्यान"
        titleEn="Recorded Video Lectures Manager"
        subtitleHi="यूट्यूब वीडियो आईडी द्वारा अध्यायवार व्याख्यान संगठन"
        subtitleEn="Add, edit and organize chapter-wise video playlists with real-time Supabase sync"
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
        {lectures.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <PlaySquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              {t('कोई रिकॉर्डेड व्याख्यान अभी मौजूद नहीं है', 'No recorded video lectures yet')}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {t('ऊपर दिए गए बटन से पहला वीडियो व्याख्यान जोड़ें।', 'Click the button above to add your first lecture.')}
            </p>
          </div>
        ) : (
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
                            {lang === 'hi' ? lec.title_hi || lec.title : lec.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            YouTube ID: {lec.youtube_video_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{lec.subject || 'Science'}</p>
                      <p className="text-[11px] text-slate-500">{lec.chapter || 'Basics'}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">#{lec.lecture_order}</td>
                    <td className="py-3 px-4 text-slate-600">{lec.duration_minutes} {t('मिनट', 'mins')}</td>
                    <td className="py-3 px-4">
                      {lec.is_free_preview ? (
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          <Unlock className="w-3 h-3 mr-1" /> {t('ट्रायल डेमो (Free)', 'Trial Demo')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          <Lock className="w-3 h-3 mr-1" /> {t('सशुल्क (Enrolled)', 'Enrolled Only')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <a
                          href={`https://www.youtube.com/watch?v=${lec.youtube_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on YouTube"
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium inline-flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditModal(lec)}
                          title="Edit Lecture"
                          className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lec)}
                          title="Delete Lecture"
                          className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया वीडियो व्याख्यान जोड़ें', 'Add Video Lecture')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (अंग्रेज़ी)', 'Lecture Title')}</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Lec 01: Introduction to Real Numbers"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (हिंदी)', 'Lecture Title (Hindi)')}</label>
                  <input
                    type="text"
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="उदा. लेक्चर 01: वास्तविक संख्याएं परिचय"
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
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
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
                    id="freePreviewAdd"
                    checked={formData.is_free_preview}
                    onChange={(e) => setFormData({ ...formData, is_free_preview: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <label htmlFor="freePreviewAdd" className="text-slate-700 font-semibold cursor-pointer">
                    {t('निःशुल्क ट्रायल डेमो के रूप में रखें (सार्वजनिक रूप से देखने योग्य)', 'Allow Free Trial Preview (Publicly accessible)')}
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    {t('व्याख्यान जोड़ें', 'Add Lecture')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('वीडियो व्याख्यान संपादित करें (Edit)', 'Edit Video Lecture')}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (अंग्रेज़ी)', 'Lecture Title')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('व्याख्यान का शीर्षक (हिंदी)', 'Lecture Title (Hindi)')}</label>
                  <input
                    type="text"
                    value={editFormData.title_hi}
                    onChange={(e) => setEditFormData({ ...editFormData, title_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('यूट्यूब वीडियो आईडी या लिंक', 'YouTube Video ID or Link')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.youtube_video_id}
                    onChange={(e) => setEditFormData({ ...editFormData, youtube_video_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('क्रम संख्या', 'Order Number')}</label>
                    <input
                      type="number"
                      value={editFormData.lecture_order}
                      onChange={(e) => setEditFormData({ ...editFormData, lecture_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अवधि (मिनट)', 'Duration (Minutes)')}</label>
                    <input
                      type="number"
                      value={editFormData.duration_minutes}
                      onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="freePreviewEdit"
                    checked={editFormData.is_free_preview}
                    onChange={(e) => setEditFormData({ ...editFormData, is_free_preview: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <label htmlFor="freePreviewEdit" className="text-slate-700 font-semibold cursor-pointer">
                    {t('निःशुल्क ट्रायल डेमो (Free Trial Preview)', 'Allow Free Trial Preview')}
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    {t('बदलाव सहेजें', 'Save Changes')}
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
