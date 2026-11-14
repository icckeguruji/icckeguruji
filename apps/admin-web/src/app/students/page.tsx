'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { UserProfile } from '@icc/shared-types';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  MapPin,
  School,
  Clock,
  Eye,
  MessageCircle,
} from 'lucide-react';

export default function StudentsPage() {
  const { lang, t } = useLanguage();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const loadStudents = () => {
    setLoading(true);
    AdminApi.getStudents(searchQuery, selectedBoard)
      .then((data) => setStudents(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [searchQuery, selectedBoard]);

  const handleToggleStatus = async (student: UserProfile) => {
    const nextStatus = !student.is_active;
    await AdminApi.toggleStudentStatus(student.id, nextStatus);
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, is_active: nextStatus } : s))
    );
  };

  const sendParentWhatsApp = (student: UserProfile, reportType: 'attendance' | 'performance') => {
    const rawPhone = (student.guardian_phone || student.mobile_number || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    let msg = '';
    if (reportType === 'attendance') {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📋 *साप्ताहिक उपस्थिति एवं अनुशासन रिपोर्ट (Attendance Report)*
विद्यार्थी का नाम: *${student.full_name}*
कक्षा एवं बोर्ड: *${student.board_code} Class 10*
अभिभावक: *${student.guardian_name || 'आदरणीय अभिभावक'}*

✅ इस सप्ताह उपस्थिति: *6 / 6 दिन (100% उपस्थित)*
⭐ क्लास अनुशासन: *उत्कृष्ट (Excellent)*
💡 शिक्षक टिप्पणी: विद्यार्थी नियमित रूप से समय पर उपस्थित हो रहा है एवं कक्षा अभ्यास पूरा कर रहा है।
----------------------------------------
आदर्श कोचिंग सेन्टर द्वारा स्वचालित अभिभावक संदेश`;
    } else {
      msg = `🏫 *आदर्श कोचिंग सेन्टर (IDEAL COACHING CENTRE)*
📍 सरोतिया, महगामा, गोड्डा (झारखंड)
निदेशक: बड़े सर (BADE SIR) | +91 9771350910
----------------------------------------
📝 *साप्ताहिक टेस्ट परिणाम (Sunday Mock Test Scorecard)*
विद्यार्थी का नाम: *${student.full_name}*
बोर्ड: *${student.board_code}*
विषय: *विज्ञान एवं गणित (Science & Math)*
प्राप्तांक (Score): *46 / 50 Marks (92%)*
रैंक (Batch Rank): *#3 (Top 5% in Batch)*
परिणाम: *उत्तीर्ण (PASSED ⭐⭐⭐)*
अभिभावक: *${student.guardian_name || 'आदरणीय अभिभावक'}*
----------------------------------------
बधाई! आपके बच्चे का प्रदर्शन बहुत सराहनीय है। बोर्ड परीक्षा 2027 की तैयारी सही दिशा में है।`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="विद्यार्थी प्रबंधन"
        titleEn="Student Management"
        subtitleHi="बिहार एवं झारखंड बोर्ड नामांकित छात्रों का विवरण एवं नियंत्रण"
        subtitleEn="Manage registered students, board enrollments and account status"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('नाम, मोबाइल, यूज़रनेम या ईमेल से खोजें...', 'Search name, mobile, username or email...')}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('सभी बोर्ड (All Boards)', 'All Boards')}</option>
              <option value="BSEB">बिहार बोर्ड (BSEB)</option>
              <option value="JAC">झारखंड बोर्ड (JAC)</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('विद्यार्थी', 'Student')}</th>
                  <th className="py-3 px-4">{t('बोर्ड एवं ज़िला', 'Board & District')}</th>
                  <th className="py-3 px-4">{t('संपर्क (मोबाइल / ईमेल)', 'Contact Info')}</th>
                  <th className="py-3 px-4">{t('पंजीकरण तिथि', 'Registered Date')}</th>
                  <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {student.full_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.full_name}</p>
                          <p className="text-[11px] text-slate-500">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                          student.board_code === 'BSEB'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {student.board_code}
                      </span>
                      <span className="text-slate-600">{student.district}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">+91 {student.mobile_number}</p>
                      <p className="text-[11px] text-slate-500">{student.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(student.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {student.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('सक्रिय', 'Active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('निष्क्रिय', 'Blocked')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => sendParentWhatsApp(student, 'attendance')}
                          title="Send WhatsApp Attendance Report to Parent"
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition flex items-center gap-1 text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`px-2.5 py-1 rounded font-medium transition ${
                            student.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {student.is_active ? t('ब्लॉक करें', 'Block') : t('सक्रिय करें', 'Activate')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Profile Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('विद्यार्थी विवरण', 'Student Details')}
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
                    {selectedStudent.full_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{selectedStudent.full_name}</h4>
                    <p className="text-slate-500">@{selectedStudent.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('बोर्ड', 'Board')}</span>
                    <span className="font-bold text-slate-700 text-xs">
                      {selectedStudent.board_code === 'BSEB' ? 'बिहार बोर्ड (BSEB)' : 'झारखंड बोर्ड (JAC)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ज़िला', 'District')}</span>
                    <span className="font-bold text-slate-700 text-xs">{selectedStudent.district}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('मोबाइल / व्हाट्सएप', 'Mobile / WhatsApp')}</span>
                    <span className="font-bold text-slate-700 text-xs">+91 {selectedStudent.mobile_number}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ईमेल', 'Email')}</span>
                    <span className="font-bold text-slate-700 text-xs truncate block">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.dob && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('जन्म तिथि', 'Date of Birth')}</span>
                      <span className="font-bold text-slate-700 text-xs">{selectedStudent.dob}</span>
                    </div>
                  )}
                  {selectedStudent.guardian_name && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('अभिभावक का नाम', 'Guardian Name')}</span>
                      <span className="font-bold text-slate-700 text-xs">{selectedStudent.guardian_name}</span>
                    </div>
                  )}
                  {selectedStudent.guardian_phone && (
                    <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('अभिभावक संपर्क नंबर', 'Guardian Contact')}</span>
                      <span className="font-bold text-slate-700 text-xs">+91 {selectedStudent.guardian_phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-xs">
                      {t('अभिभावक व्हाट्सएप अलर्ट (Parent WhatsApp Alerts)', 'Parent WhatsApp Alerts')}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {t(
                      'सीधे माता-पिता के व्हाट्सएप नंबर (+91 ' + (selectedStudent.guardian_phone || selectedStudent.mobile_number) + ') पर 1-क्लिक में रिपोर्ट भेजें:',
                      'Send instant reports directly to guardian WhatsApp (+91 ' + (selectedStudent.guardian_phone || selectedStudent.mobile_number) + '):'
                    )}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => sendParentWhatsApp(selectedStudent, 'attendance')}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>📋 {t('उपस्थिति रिपोर्ट भेजें', 'Send Attendance Report')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendParentWhatsApp(selectedStudent, 'performance')}
                      className="flex-1 py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>📝 {t('टेस्ट रिजल्ट भेजें', 'Send Test Scorecard')}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="font-semibold text-blue-900 text-[11px]">
                    {t('ओटीपी लॉगिन नीति सुरक्षा स्थिति', 'OTP Security Policy')}
                  </p>
                  <p className="text-blue-700 text-[10px] mt-0.5">
                    {t(
                      'विद्यार्थी मोबाइल अथवा यूज़रनेम से लॉगिन कर सकता है, परंतु सुरक्षा कारणों से ओटीपी केवल इसके पंजीकृत ईमेल पर भेजा जाएगा। कोई एसएमएस नहीं भेजा जाएगा।',
                      'Login is supported via mobile/username, but OTP is delivered strictly to registered email with zero SMS fee.'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  {t('बंद करें', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
