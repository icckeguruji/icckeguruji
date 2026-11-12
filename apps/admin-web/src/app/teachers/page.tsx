'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { UserCheck, Plus, CheckCircle, Mail, Phone, BookOpen, Layers } from 'lucide-react';

interface MockTeacher {
  id: string;
  full_name: string;
  qualification: string;
  subjects: string;
  email: string;
  mobile: string;
  assignedBatches: number;
}

export default function TeachersPage() {
  const { lang, t } = useLanguage();
  const [teachers, setTeachers] = useState<MockTeacher[]>([
    {
      id: 't-1',
      full_name: 'Er. R. K. Sharma (इंजी. आर. के. शर्मा)',
      qualification: 'B.Tech (NIT Patna) - 10+ Years Experience',
      subjects: 'Physics & Mathematics (भौतिकी एवं गणित)',
      email: 'rksharma@idealcoaching.in',
      mobile: '9876543220',
      assignedBatches: 3,
    },
    {
      id: 't-2',
      full_name: 'Dr. S. N. Mishra (डॉ. एस. एन. मिश्रा)',
      qualification: 'M.Sc, Ph.D (Patna University)',
      subjects: 'Chemistry & Biology (रसायन शास्त्र एवं जीव विज्ञान)',
      email: 'snmishra@idealcoaching.in',
      mobile: '9876543221',
      assignedBatches: 2,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    qualification: '',
    subjects: '',
    email: '',
    mobile: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: MockTeacher = {
      id: `t-${Date.now()}`,
      full_name: formData.full_name,
      qualification: formData.qualification,
      subjects: formData.subjects,
      email: formData.email,
      mobile: formData.mobile,
      assignedBatches: 1,
    };
    setTeachers([newTeacher, ...teachers]);
    setIsModalOpen(false);
    setFormData({
      full_name: '',
      qualification: '',
      subjects: '',
      email: '',
      mobile: '',
    });
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="शिक्षक एवं संकाय प्रबंधन (Faculty Management)"
        titleEn="Teacher & Faculty Management"
        subtitleHi="संकाय खाते, विषय विशेषज्ञता एवं बैच आवंटन"
        subtitleEn="Manage teacher profiles, subject assignments and portal permissions"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल शिक्षक: ${teachers.length}`, `Total Faculty: ${teachers.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('विशेषज्ञ संकाय - बिहार एवं झारखंड बोर्ड', 'Specialized State Board Faculty')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नया शिक्षक खाता जोड़ें', 'Add Faculty Member')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teachers.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base">
                  {tItem.full_name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{tItem.full_name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{tItem.qualification}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('अध्यापन विषय:', 'Subjects:')}</span>
                  <span className="font-bold text-slate-800">{tItem.subjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('आवंटित बैच:', 'Assigned Batches:')}</span>
                  <span className="font-bold text-blue-700">{tItem.assignedBatches} Batches</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{tItem.email}</span>
                <span className="font-mono">+91 {tItem.mobile}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('शिक्षक खाता जोड़ें', 'Add Teacher Account')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('पूरा नाम', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('योग्यता (Qualification)', 'Qualification')}</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('विषय (Subjects)', 'Subjects')}</label>
                  <input
                    type="text"
                    required
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('ईमेल', 'Email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('मोबाइल', 'Mobile')}</label>
                    <input
                      type="text"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
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
                    {t('खाता सुरक्षित करें', 'Save Teacher')}
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
