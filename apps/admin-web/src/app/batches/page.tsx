'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { initialCourses } from '@/lib/sample-data';
import { Layers, Plus, Calendar, Clock, Users, BookOpen } from 'lucide-react';

interface BatchItem {
  id: string;
  name: string;
  name_hi: string;
  courseTitle: string;
  schedule_info: string;
  studentCount: number;
}

export default function BatchesPage() {
  const { lang, t } = useLanguage();
  const [batches, setBatches] = useState<BatchItem[]>([
    {
      id: 'ba-1',
      name: 'Morning Toppers Batch 2026-27',
      name_hi: 'प्रातःकालीन टॉपर बैच 2026-27',
      courseTitle: 'BSEB Class 10 Toppers Batch (2026-27)',
      schedule_info: 'Mon-Sat: 06:30 AM - 08:30 AM IST',
      studentCount: 48,
    },
    {
      id: 'ba-2',
      name: 'Evening Target Batch 2026-27',
      name_hi: 'सायंकालीन टारगेट बैच 2026-27',
      courseTitle: 'BSEB Class 10 Toppers Batch (2026-27)',
      schedule_info: 'Mon-Sat: 04:30 PM - 06:30 PM IST',
      studentCount: 35,
    },
    {
      id: 'ba-3',
      name: 'JAC Board Excellence Batch A',
      name_hi: 'झारखंड बोर्ड सफलता बैच A',
      courseTitle: 'JAC Class 10 Board Excellence Batch (2026-27)',
      schedule_info: 'Mon-Sat: 07:00 AM - 09:00 AM IST',
      studentCount: 29,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_hi: '',
    courseTitle: initialCourses[0].title,
    schedule_info: 'Mon-Sat: 05:00 PM - 07:00 PM IST',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: BatchItem = {
      id: `ba-${Date.now()}`,
      name: formData.name,
      name_hi: formData.name_hi || formData.name,
      courseTitle: formData.courseTitle,
      schedule_info: formData.schedule_info,
      studentCount: 0,
    };
    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      name_hi: '',
      courseTitle: initialCourses[0].title,
      schedule_info: 'Mon-Sat: 05:00 PM - 07:00 PM IST',
    });
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="बैच प्रबंधन (Batches)"
        titleEn="Batch Management"
        subtitleHi="पाठ्यक्रम अनुसार विद्यार्थियों एवं समय सारणी का आवंटन"
        subtitleEn="Create course batches, assign schedules and organize students"
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
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {batch.studentCount} {t('विद्यार्थी', 'Students')}
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

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {t('कक्षा समय सारणी (IST)', 'Schedule (IST)')}
                </span>
                <span className="font-mono text-slate-800 font-semibold block">{batch.schedule_info}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया बैच बनाएं', 'Create Batch')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच नाम (English)', 'Batch Name (English)')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('बैच नाम (हिंदी)', 'Batch Name (Hindi)')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name_hi}
                    onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('समय सारणी (Schedule Info)', 'Schedule Info')}</label>
                  <input
                    type="text"
                    required
                    value={formData.schedule_info}
                    onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
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
      </div>
    </div>
  );
}
