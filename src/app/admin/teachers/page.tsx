'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { UserCheck, Plus, CheckCircle, Mail, Phone, BookOpen, Layers, ShieldAlert, Award } from 'lucide-react';

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
      id: 't-0',
      full_name: 'BADE SIR (Director / बड़े सर)',
      qualification: 'Founder & Academic Director - 12+ Years Experience',
      subjects: 'Senior Physics, Mathematics & Board Strategy',
      email: 'icckeguruji@gmail.com',
      mobile: '+91 9771350910',
      assignedBatches: 4,
    },
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
        titleHi="शिक्षक रिकॉर्ड प्रबंधन (Teacher Records)"
        titleEn="Teacher Records Management"
        subtitleHi="शिक्षकों का प्रशासनिक रिकॉर्ड (केवल रिकॉर्ड - कोई पोर्टल लॉगिन अनुमति नहीं)"
        subtitleEn="Faculty administrative records (Record keeping only - No portal login allowed)"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-950">
              {t('सुरक्षा एवं प्रशासनिक नियम', 'Security & Administrative Policy')}
            </h4>
            <p className="leading-relaxed">
              {t(
                'संस्थान के नियमानुसार शिक्षकों का कोई लॉगिन पोर्टल नहीं है। शिक्षकों का विवरण, विषय विशेषज्ञता एवं बैच आवंटन केवल डायरेक्टर बड़े सर के प्रशासनिक रिकॉर्ड के रूप में सुरक्षित रहता है। शिक्षक सीधे संस्थान में ऑफलाइन अध्यापन कराते हैं।',
                'As per institute policy, faculty members do not have login access to the software portal. Teacher profiles, subject expertise, and batch assignments are maintained strictly as administrative records by Director BADE SIR.'
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {t(`कुल शिक्षक रिकॉर्ड: ${teachers.length}`, `Total Faculty Records: ${teachers.length}`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('विशेषज्ञ संकाय - बिहार एवं झारखंड बोर्ड (BSEB & JAC)', 'Specialized Faculty Records - BSEB & JAC')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('नया शिक्षक रिकॉर्ड जोड़ें', 'Add Teacher Record')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base">
                  {tItem.full_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{tItem.full_name}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{tItem.qualification}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('अध्यापन विषय:', 'Subjects:')}</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[60%]">{tItem.subjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('आवंटित बैच:', 'Assigned Batches:')}</span>
                  <span className="font-bold text-blue-700">{tItem.assignedBatches} Batches</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-400">{t('पोर्टल लॉगिन:', 'Portal Login:')}</span>
                  <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {t('अक्षम (Disabled)', 'Disabled')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] truncate">{tItem.email}</span>
                <span className="font-mono text-[11px]">{tItem.mobile}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया शिक्षक रिकॉर्ड जोड़ें', 'Add Teacher Record')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('शिक्षक का पूरा नाम', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. प्रो. राकेश रंजन"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('योग्यता (Qualification & Exp.)', 'Qualification')}</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. M.Sc. (Physics), B.Ed. - 8 Years Exp."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('विषय (Subjects Taught)', 'Subjects')}</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Physics, Chemistry, Math"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('ईमेल (Email)', 'Email')}</label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@idealcoaching.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('मोबाइल (Mobile No.)', 'Mobile')}</label>
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <p>🔒 <strong>नोट:</strong> शिक्षक के लिए कोई लॉगिन पासवर्ड नहीं बनेगा। यह केवल संस्थान का प्रशासनिक रिकॉर्ड है।</p>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('रिकॉर्ड सुरक्षित करें', 'Save Teacher Record')}
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
