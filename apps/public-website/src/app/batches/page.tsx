'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, BatchWithMeta } from '@/lib/api';
import { initialCourses } from '@/lib/sample-data';
import { Layers, Plus, Calendar, Clock, Users, BookOpen, Edit3, Trash2, Upload } from 'lucide-react';

export default function BatchesPage() {
  const { lang, t } = useLanguage();
  const [batches, setBatches] = useState<BatchWithMeta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchWithMeta | null>(null);

  const [batchThumbnail, setBatchThumbnail] = useState('/thumbnails/batch-b3-class10.jpg');
  const [formData, setFormData] = useState({
    name: '',
    name_hi: '',
    courseTitle: initialCourses[0]?.title || 'BSEB Class 10 Toppers Batch (2026-27)',
    schedule_info: 'Mon-Sat: 05:00 PM - 07:00 PM IST',
  });

  const [editThumbnail, setEditThumbnail] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    name_hi: '',
    courseTitle: '',
    schedule_info: '',
  });

  const loadBatches = () => {
    AdminApi.getBatches().then((data) => setBatches(data));
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (isEdit) {
            setEditThumbnail(event.target.result as string);
          } else {
            setBatchThumbnail(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await AdminApi.createBatch({
      name: formData.name,
      name_hi: formData.name_hi || formData.name,
      courseTitle: formData.courseTitle,
      schedule_info: formData.schedule_info,
      studentCount: 0,
      thumbnail_url: batchThumbnail,
    });
    setBatches((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setBatchThumbnail('/thumbnails/batch-b3-class10.jpg');
    setFormData({
      name: '',
      name_hi: '',
      courseTitle: initialCourses[0]?.title || 'BSEB Class 10 Toppers Batch (2026-27)',
      schedule_info: 'Mon-Sat: 05:00 PM - 07:00 PM IST',
    });
  };

  const openEditModal = (batch: BatchWithMeta) => {
    setEditingBatch(batch);
    setEditThumbnail(batch.thumbnail_url || '/thumbnails/batch-b3-class10.jpg');
    setEditFormData({
      name: batch.name,
      name_hi: batch.name_hi || batch.name,
      courseTitle: batch.courseTitle || '',
      schedule_info: batch.schedule_info || 'Mon-Sat: 06:00 AM - 08:00 AM IST',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    const updated = await AdminApi.updateBatch(editingBatch.id, {
      name: editFormData.name,
      name_hi: editFormData.name_hi,
      courseTitle: editFormData.courseTitle,
      schedule_info: editFormData.schedule_info,
      thumbnail_url: editThumbnail,
    });

    if (updated) {
      setBatches((prev) => prev.map((b) => (b.id === editingBatch.id ? updated : b)));
    }
    setIsEditModalOpen(false);
    setEditingBatch(null);
  };

  const handleDelete = async (batch: BatchWithMeta) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete batch:\n"${batch.name}"?\n\nThis will remove it permanently.`
    );
    if (!confirmed) return;

    await AdminApi.deleteBatch(batch.id);
    setBatches((prev) => prev.filter((b) => b.id !== batch.id));
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="बैच प्रबंधन"
        titleEn="Batch Management"
        subtitleHi="पाठ्यक्रम अनुसार विद्यार्थियों एवं समय सारणी का आवंटन"
        subtitleEn="Create course batches, assign schedules and organize students with live database sync"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल बैच: ${batches.length}`, `Total Batches: ${batches.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('समय सारणी एवं छात्र आवंटन', 'Manage class schedules and students')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नया बैच जोड़ें', 'Create Batch')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              {batch.thumbnail_url && (
                <div className="h-36 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                  <img
                    src={batch.thumbnail_url}
                    alt={batch.name}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                    16:9 Uncropped Banner
                  </span>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => openEditModal(batch)}
                      title="Edit Batch"
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-sm transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch)}
                      title="Delete Batch"
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-sm transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </span>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {batch.studentCount || 0} {t('विद्यार्थी', 'Students')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {lang === 'hi' ? batch.name_hi : batch.name}
                    </h4>
                    <p className="text-xs text-blue-600 font-medium mt-1 truncate">
                      {batch.courseTitle}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {t('कक्षा समय सारणी', 'Class Schedule')}
                  </span>
                  <span className="font-mono text-slate-800 font-semibold block">{batch.schedule_info}</span>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(batch)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('संशोधित करें', 'Edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(batch)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('हटाएं', 'Delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Batch Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया बैच बनाएं', 'Create Batch')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच का नाम (अंग्रेज़ी)', 'Batch Name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच का नाम (हिंदी)', 'Batch Name (Hindi)')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name_hi}
                    onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('समय सारणी', 'Schedule Details')}</label>
                  <input
                    type="text"
                    required
                    value={formData.schedule_info}
                    onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Batch Thumbnail Upload */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('बैच थंबनेल / बैनर (Batch Banner 16:9)', 'Batch Thumbnail / Banner (16:9)')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-28 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={batchThumbnail}
                        alt="Batch Preview"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                        16:9 Uncropped
                      </span>
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('डिवाइस से फ़ोटो चुनें (PNG/JPG)', 'Upload Image from Device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
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
                    {t('बैच सहेजें', 'Save Batch')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Batch Modal */}
        {isEditModalOpen && editingBatch && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('बैच संशोधित करें', 'Edit Batch')}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच का नाम (अंग्रेज़ी)', 'Batch Name')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच का नाम (हिंदी)', 'Batch Name (Hindi)')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name_hi}
                    onChange={(e) => setEditFormData({ ...editFormData, name_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('समय सारणी', 'Schedule Details')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.schedule_info}
                    onChange={(e) => setEditFormData({ ...editFormData, schedule_info: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Edit Batch Thumbnail Upload */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('नया थंबनेल / बैनर (New Banner 16:9)', 'New Thumbnail / Banner (16:9)')}
                  </label>
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                    <div className="w-full h-28 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <img
                        src={editThumbnail}
                        alt="Batch Preview"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-400">
                        16:9 Uncropped Preview
                      </span>
                    </div>
                    <label className="flex items-center justify-center space-x-2 w-full py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('डिवाइस से नई फ़ोटो चुनें (PNG/JPG)', 'Upload New Image from Device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('परिवर्तन सहेजें', 'Save Changes')}
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
