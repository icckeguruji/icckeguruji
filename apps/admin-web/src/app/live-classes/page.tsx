'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { LiveClass } from '@icc/shared-types';
import { extractYouTubeVideoId, formatIST } from '@icc/shared-utils';
import {
  Video,
  Plus,
  PlayCircle,
  Calendar,
  Clock,
  ExternalLink,
  Radio,
  CheckCircle,
} from 'lucide-react';

export default function LiveClassesPage() {
  const { lang, t } = useLanguage();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    youtube_video_id: '',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    duration_minutes: 60,
  });

  useEffect(() => {
    AdminApi.getLiveClasses().then((data) => setClasses(data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractYouTubeVideoId(formData.youtube_video_id);
    const created = await AdminApi.createLiveClass({
      title: formData.title,
      title_hi: formData.title_hi || formData.title,
      youtube_video_id: vidId,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      duration_minutes: Number(formData.duration_minutes),
      status: 'scheduled',
    });
    setClasses((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      title_hi: '',
      youtube_video_id: '',
      scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
      duration_minutes: 60,
    });
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="यूट्यूब लाइव क्लास शेड्यूलर (Zero Server Cost)"
        titleEn="YouTube Live Class Scheduler"
        subtitleHi="यूट्यूब लाइव स्ट्रीम आईडी द्वारा निःशुल्क असीमित बैंडविड्थ लाइव प्रसारण"
        subtitleEn="Schedule and manage live classes using YouTube Live integration"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल लाइव सत्र: ${classes.length}`, `Total Live Sessions: ${classes.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('यूट्यूब लाइव के माध्यम से शून्य स्ट्रीमिंग लागत पर प्रसारण', 'Zero video streaming server expense')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('लाइव क्लास शेड्यूल करें', 'Schedule Live Class')}</span>
          </button>
        </div>

        {/* Live Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => {
            const isLive = cls.status === 'live';
            return (
              <div
                key={cls.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                  isLive ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      {isLive ? (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase animate-pulse">
                          <Radio className="w-3 h-3" />
                          <span>LIVE NOW</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase">
                          SCHEDULED
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {cls.youtube_video_id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {cls.duration_minutes} {t('मिनट', 'mins')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-3 leading-snug">
                    {lang === 'hi' ? cls.title_hi || cls.title : cls.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {formatIST(cls.scheduled_at)}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`https://www.youtube.com/watch?v=${cls.youtube_video_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-xs text-red-600 font-semibold hover:text-red-700"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{t('यूट्यूब पर स्ट्रीम देखें', 'Watch on YouTube')}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('यूट्यूब लाइव क्लास शेड्यूल करें', 'Schedule YouTube Live Class')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('क्लास का शीर्षक (English)', 'Class Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Science Chapter 1: Chemical Reactions Live Q&A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('क्लास का शीर्षक (हिंदी)', 'Class Title (Hindi)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="उदा. विज्ञान अध्याय 1: रासायनिक अभिक्रियाएँ लाइव प्रश्नोत्तर"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('यूट्यूब वीडियो / लाइव स्ट्रीम आईडी (या लिंक)', 'YouTube Live ID or URL')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.youtube_video_id}
                    onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                    placeholder="e.g. jfKfPfyJRdk or https://youtube.com/live/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('दिनांक एवं समय (IST)', 'Scheduled Date & Time')}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('अवधि (मिनट)', 'Duration (Minutes)')}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-sm"
                  >
                    {t('शेड्यूल करें', 'Schedule Class')}
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
