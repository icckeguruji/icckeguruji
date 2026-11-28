'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LiveClass, Course } from '@icc/shared-types';
import { extractYouTubeVideoId, formatIST } from '@icc/shared-utils';
import {
  Video,
  Plus,
  PlayCircle,
  Calendar,
  Clock,
  ExternalLink,
  Radio,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export default function LiveClassesPage() {
  const { lang, t } = useLanguage();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subSubjects, setSubSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [ytStatus, setYtStatus] = useState<{ configured: boolean; connected: boolean; channelTitle?: string | null }>({
    configured: false,
    connected: false,
  });
  const [ytErrorMsg, setYtErrorMsg] = useState<string | null>(null);
  const [ytBroadcastResult, setYtBroadcastResult] = useState<{ rtmpUrl: string; streamKey: string; videoId: string } | null>(null);
  const [ytCreating, setYtCreating] = useState(false);

  const [formData, setFormData] = useState({
    course_id: '',
    subject_id: '',
    sub_subject_id: '',
    chapter_id: '',
    class_name: '',
    title: '',
    title_hi: '',
    youtube_video_id: '',
    thumbnail_url: '',
    visibility: 'unlisted' as 'unlisted' | 'public' | 'private',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    duration_minutes: 60,
    status: 'scheduled' as const,
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    title_hi: '',
    youtube_video_id: '',
    scheduled_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 60,
    status: 'scheduled' as 'scheduled' | 'live' | 'completed' | 'cancelled',
  });

  const loadSubjectsForCourse = async (courseId: string) => {
    if (!courseId) {
      setSubjects([]);
      setSubSubjects([]);
      setChapters([]);
      return;
    }
    const subs = await AdminApi.getCourseSubjects(courseId);
    setSubjects(subs || []);
    if (subs && subs.length > 0) {
      setFormData((prev) => ({ ...prev, subject_id: subs[0].id, sub_subject_id: '' }));
      await loadChaptersForSubject(subs[0].id);
    } else {
      setSubSubjects([]);
      setChapters([]);
      setFormData((prev) => ({ ...prev, subject_id: '', sub_subject_id: '', chapter_id: '' }));
    }
  };

  const loadChaptersForSubject = async (subjectId: string, subSubjectId?: string) => {
    if (!subjectId) {
      setSubSubjects([]);
      setChapters([]);
      return;
    }
    const subSubs = subSubjectId === undefined ? await AdminApi.getSubSubjects(subjectId) : subSubjects;
    if (subSubjectId === undefined) setSubSubjects(subSubs || []);
    const activeSubSubId = subSubjectId !== undefined ? subSubjectId : (subSubs?.[0]?.id || '');
    const chaps = await AdminApi.getSubjectChapters(subjectId, activeSubSubId || undefined);
    setChapters(chaps || []);
    setFormData((prev) => ({ ...prev, sub_subject_id: activeSubSubId, chapter_id: chaps?.[0]?.id || '' }));
  };

  const loadClasses = () => {
    AdminApi.getLiveClasses().then((data) => setClasses(data));
  };

  useEffect(() => {
    loadClasses();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ytErr = params.get('yt_error');
      const ytDesc = params.get('yt_error_desc');
      if (ytErr) {
        setYtErrorMsg(ytDesc ? `${ytErr}: ${ytDesc}` : ytErr);
      }
    }
    fetch('/api/youtube/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setYtStatus(d))
      .catch(() => {});
    AdminApi.getCourses().then((cList) => {
      setCourses(cList || []);
      if (cList && cList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          course_id: cList[0].id,
          class_name: cList[0].class_name || '',
        }));
        loadSubjectsForCourse(cList[0].id);
      }
    });

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-live-classes-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_classes' }, () => {
          loadClasses();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const vidId = extractYouTubeVideoId(formData.youtube_video_id);
    try {
      const created = await AdminApi.createLiveClass({
        course_id: formData.course_id || undefined,
        subject_id: formData.subject_id || undefined,
        chapter_id: formData.chapter_id || undefined,
        class_name: formData.class_name || undefined,
        title: formData.title,
        title_hi: formData.title_hi || formData.title,
        youtube_video_id: vidId,
        thumbnail_url: formData.thumbnail_url.trim() || undefined,
        visibility: formData.visibility,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        duration_minutes: Number(formData.duration_minutes),
        status: formData.status || 'scheduled',
      } as any);
      setClasses((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setIsModalOpen(false);
      setFormData((prev) => ({
        ...prev,
        title: '',
        title_hi: '',
        youtube_video_id: '',
        scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
        duration_minutes: 60,
        status: 'scheduled',
      }));
      alert('Success: Live class scheduled and mapped to Class -> Course -> Subject -> Chapter!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to schedule live class in database.'));
    }
  };

  const openEditModal = (cls: LiveClass) => {
    setEditingClass(cls);
    setEditFormData({
      title: cls.title,
      title_hi: cls.title_hi || cls.title,
      youtube_video_id: cls.youtube_video_id,
      scheduled_at: cls.scheduled_at ? new Date(cls.scheduled_at).toISOString().slice(0, 16) : '',
      duration_minutes: cls.duration_minutes || 60,
      status: cls.status || 'scheduled',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const vidId = extractYouTubeVideoId(editFormData.youtube_video_id);
    try {
      const updated = await AdminApi.updateLiveClass(editingClass.id, {
        title: editFormData.title,
        title_hi: editFormData.title_hi,
        youtube_video_id: vidId,
        scheduled_at: new Date(editFormData.scheduled_at).toISOString(),
        duration_minutes: Number(editFormData.duration_minutes),
        status: editFormData.status,
      });

      if (updated) {
        setClasses((prev) => prev.map((c) => (c.id === editingClass.id ? updated : c)));
      }
      setIsEditModalOpen(false);
      setEditingClass(null);
      alert('Success: Live class updated and saved to cloud database!');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to update live class in database.'));
    }
  };

  const handleDelete = async (cls: LiveClass) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this live class session:\n"${cls.title}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await AdminApi.deleteLiveClass(cls.id);
      setClasses((prev) => prev.filter((c) => c.id !== cls.id));
      alert('Success: Live class deleted from database.');
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to delete live class from database.'));
    }
  };

  const handleToggleLiveStatus = async (cls: LiveClass) => {
    const nextStatus = cls.status === 'live' ? 'completed' : 'live';
    try {
      const updated = await AdminApi.updateLiveClass(cls.id, { status: nextStatus });
      if (updated) {
        setClasses((prev) => prev.map((c) => (c.id === cls.id ? updated : c)));
      }
      alert(`Success: Live class status updated to ${nextStatus}.`);
    } catch (err: any) {
      alert('Database Error: ' + (err?.message || 'Failed to update live status in database.'));
    }
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="यूट्यूब लाइव क्लास शेड्यूलर"
        titleEn="YouTube Live Class Scheduler"
        subtitleHi="यूट्यूब लाइव स्ट्रीम आईडी द्वारा निःशुल्क असीमित बैंडविड्थ लाइव प्रसारण"
        subtitleEn="Schedule, edit and manage live classes with real-time sync"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* YouTube Channel Connect Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {ytStatus.connected ? `YouTube Connected: ${ytStatus.channelTitle || 'Channel Active'}` : 'Connect Your YouTube Channel'}
            </p>
            <p className="text-xs text-slate-500">
              {ytStatus.connected
                ? 'Schedule Unlisted Live broadcasts and generate RTMP Stream Keys directly from here.'
                : ytStatus.configured
                ? 'Connect your channel once to schedule & go live directly without opening YouTube Studio.'
                : 'Add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in Vercel to enable 1-click YouTube OAuth connect.'}
            </p>
            {ytErrorMsg && !ytStatus.connected && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                OAuth Error: {ytErrorMsg}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ytStatus.connected ? (
              <button
                onClick={async () => {
                  await fetch('/api/youtube/disconnect', { method: 'POST' });
                  setYtStatus((s) => ({ ...s, connected: false, channelTitle: null }));
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Disconnect YouTube
              </button>
            ) : (
              <a
                href="/api/youtube/auth?source=web"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
              >
                Connect YouTube Channel
              </a>
            )}
          </div>
        </div>

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
        {classes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              {t('कोई लाइव क्लास अभी शेड्यूल नहीं है', 'No live classes scheduled yet')}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {t('ऊपर दिए गए बटन से नई लाइव क्लास जोड़ें।', 'Click the button above to schedule your first live session.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => {
              const isLive = cls.status === 'live';
              const isCompleted = cls.status === 'completed';
              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                    isLive
                      ? 'border-red-500 ring-2 ring-red-100'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-slate-200'
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
                        ) : isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                            COMPLETED
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
                    {cls.youtube_video_id && (
                      <div className="mt-3 relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-200">
                        <img
                          src={`https://img.youtube.com/vi/${cls.youtube_video_id}/hqdefault.jpg`}
                          alt={cls.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/thumbnails/batch-b3-class10.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                            YT: {cls.youtube_video_id}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${cls.youtube_video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs text-red-600 font-semibold hover:text-red-700"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{t('यूट्यूब स्ट्रीम', 'Watch Stream')}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleLiveStatus(cls)}
                        title={isLive ? 'End Live Stream' : 'Go Live Now'}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          isLive
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isLive ? t('समाप्त करें', 'End Live') : t('लाइव शुरू करें', 'Go Live')}
                      </button>

                      <button
                        onClick={() => openEditModal(cls)}
                        title="Edit Live Class"
                        className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cls)}
                        title="Delete Live Class"
                        className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                {/* Class / Course -> Subject -> Chapter Cascading Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Course &amp; Class</label>
                    <select
                      value={formData.course_id}
                      onChange={(e) => {
                        const c = courses.find((item) => item.id === e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          course_id: e.target.value,
                          class_name: c?.class_name || '',
                        }));
                        loadSubjectsForCourse(e.target.value);
                      }}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} {c.class_name ? `(${c.class_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, subject_id: e.target.value, sub_subject_id: '' }));
                        loadChaptersForSubject(e.target.value);
                      }}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {subjects.length === 0 ? (
                        <option value="">No subjects</option>
                      ) : (
                        subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  {subSubjects.length > 0 && (
                    <div>
                      <label className="block font-semibold text-purple-700 mb-1">Sub-Subject / Unit</label>
                      <select
                        value={formData.sub_subject_id}
                        onChange={(e) => loadChaptersForSubject(formData.subject_id, e.target.value)}
                        className="w-full px-2.5 py-2 border border-purple-300 rounded-lg bg-white"
                      >
                        <option value="">All Units</option>
                        {subSubjects.map((ss) => (
                          <option key={ss.id} value={ss.id}>{ss.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Chapter</label>
                    <select
                      value={formData.chapter_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, chapter_id: e.target.value }))}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {chapters.length === 0 ? (
                        <option value="">All / General</option>
                      ) : (
                        chapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            Ch {ch.chapter_number}: {ch.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      YouTube Video ID or Full URL
                    </label>
                    {ytStatus.connected && (
                      <button
                        type="button"
                        disabled={ytCreating}
                        onClick={async () => {
                          if (!formData.title.trim()) {
                            alert('Please enter Class Title first.');
                            return;
                          }
                          setYtCreating(true);
                          try {
                            const res = await fetch('/api/youtube/broadcast', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                action: 'create',
                                title: formData.title.trim(),
                                visibility: formData.visibility,
                                scheduledAt: new Date(formData.scheduled_at).toISOString(),
                                thumbnailUrl: formData.thumbnail_url.trim() || undefined,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              throw new Error(data.error || 'Failed to create YouTube broadcast');
                            }
                            setFormData((prev) => ({ ...prev, youtube_video_id: data.videoId }));
                            setYtBroadcastResult({
                              videoId: data.videoId,
                              rtmpUrl: data.rtmpUrl,
                              streamKey: data.streamKey,
                            });
                          } catch (err: any) {
                            alert('YouTube Error: ' + (err?.message || 'Failed to create broadcast'));
                          } finally {
                            setYtCreating(false);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition disabled:opacity-50"
                      >
                        {ytCreating ? 'Creating on YouTube...' : 'Create Directly on YouTube (Unlisted)'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.youtube_video_id}
                    onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  {ytBroadcastResult && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-100 text-xs space-y-1">
                      <p className="font-bold text-emerald-400">YouTube Broadcast Created ({formData.visibility.toUpperCase()})</p>
                      <p className="font-mono break-all">RTMP: {ytBroadcastResult.rtmpUrl}</p>
                      <p className="font-mono break-all">Key: {ytBroadcastResult.streamKey}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="unlisted">Unlisted (App Only)</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Thumbnail URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('तारीख एवं समय', 'Scheduled Date & Time')}
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
                      min={15}
                      max={240}
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm"
                  >
                    {t('शेड्यूल सुरक्षित करें', 'Save & Schedule')}
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
                <h3 className="font-bold text-base text-slate-900">
                  {t('लाइव क्लास संपादित करें (Edit Live Class)', 'Edit Live Class')}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('क्लास का शीर्षक (English)', 'Class Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('यूट्यूब वीडियो आईडी या लिंक', 'YouTube Video ID or Full URL')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.youtube_video_id}
                    onChange={(e) => setEditFormData({ ...editFormData, youtube_video_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('तारीख एवं समय', 'Date & Time')}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editFormData.scheduled_at}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduled_at: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('अवधि (मिनट)', 'Duration (Mins)')}
                    </label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={240}
                      value={editFormData.duration_minutes}
                      onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('स्थिति (Status)', 'Status')}
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live Now</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
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
