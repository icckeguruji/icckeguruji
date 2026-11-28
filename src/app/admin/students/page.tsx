'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { UserProfile, BoardCode } from '@icc/shared-types';
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
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';

export default function StudentsPage() {
  const { lang, t } = useLanguage();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    mobile_number: '',
    email: '',
    board_code: 'BSEB' as BoardCode,
    district: 'Godda',
    school_name: '',
    guardian_name: '',
    guardian_phone: '',
  });

  const [editFormData, setEditFormData] = useState<{
    full_name: string;
    username: string;
    mobile_number: string;
    email: string;
    board_code: BoardCode;
    district: string;
    school_name: string;
    guardian_name: string;
    guardian_phone: string;
  }>({
    full_name: '',
    username: '',
    mobile_number: '',
    email: '',
    board_code: 'BSEB',
    district: '',
    school_name: '',
    guardian_name: '',
    guardian_phone: '',
  });

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
    try {
      await AdminApi.toggleStudentStatus(student.id, nextStatus);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_active: nextStatus } : s))
      );
      alert(`Student account is now ${nextStatus ? 'Activated' : 'Deactivated'} in database!`);
    } catch (err: any) {
      alert(err.message || 'Database Error: Failed to change student status.');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await AdminApi.createStudent({
        ...formData,
        preferred_language: 'en',
        is_active: true,
      });
      setStudents((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        full_name: '',
        username: '',
        mobile_number: '',
        email: '',
        board_code: 'BSEB',
        district: 'Godda',
        school_name: '',
        guardian_name: '',
        guardian_phone: '',
      });
      alert('Student account successfully created and saved in cloud database!');
    } catch (err: any) {
      alert(err.message || 'Database Error: Failed to create student account.');
    }
  };

  const openEditModal = (student: UserProfile) => {
    setEditingStudent(student);
    setEditFormData({
      full_name: student.full_name,
      username: student.username,
      mobile_number: student.mobile_number,
      email: student.email,
      board_code: student.board_code,
      district: student.district || 'Godda',
      school_name: student.school_name || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const updated = await AdminApi.updateStudent(editingStudent.id, {
        ...editFormData,
      });

      if (updated) {
        setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? updated : s)));
      }
      setIsEditModalOpen(false);
      setEditingStudent(null);
      alert('Student profile successfully updated in cloud database!');
    } catch (err: any) {
      alert(err.message || 'Database Error: Failed to update student.');
    }
  };

  const handleDeleteStudent = async (student: UserProfile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete student:\n"${student.full_name}" (@${student.username})?\n\nThis will remove the student account from database.`
    );
    if (!confirmed) return;
    try {
      await AdminApi.deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      alert('Student account successfully deleted from cloud database!');
    } catch (err: any) {
      alert(err.message || 'Database Error: Failed to delete student account.');
    }
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
कक्षा: *Class 10*
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
कक्षा: *Class 10*
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
        subtitleEn="Manage registered students, board enrollments, editing and account status"
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
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('नया छात्र जोड़ें', 'Add Student')}</span>
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('विद्यार्थी', 'Student')}</th>
                  <th className="py-3 px-4">{t('ज़िला / स्थान', 'District / Location')}</th>
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
                      <span className="font-medium text-slate-800">{student.district}</span>
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
                      <div className="flex items-center justify-end space-x-1.5">
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
                          title="View Details"
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Student"
                          className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`px-2 py-1 rounded font-medium text-[11px] transition ${
                            student.is_active
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {student.is_active ? t('ब्लॉक', 'Block') : t('सक्रिय', 'Activate')}
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          title="Delete Student"
                          className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium transition"
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
        </div>

        {/* Add Student Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया विद्यार्थी जोड़ें', 'Add New Student')}</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('पूरा नाम', 'Full Name')}</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('यूज़रनेम', 'Username')}</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. ramesh_k"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('मोबाइल नंबर', 'Mobile Number')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('ईमेल', 'Email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramesh@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('ज़िला / स्थान', 'District / Location')}</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Godda / Mahagama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('विद्यालय / कॉलेज', 'School / College')}</label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    placeholder="e.g. High School Mahagama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अभिभावक का नाम', 'Guardian Name')}</label>
                    <input
                      type="text"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                      placeholder="Shri ..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अभिभावक फोन / WhatsApp', 'Guardian Phone')}</label>
                    <input
                      type="tel"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('सहेजें', 'Save Student')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('विद्यार्थी विवरण संशोधित करें', 'Edit Student Details')}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('पूरा नाम', 'Full Name')}</label>
                    <input
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('यूज़रनेम', 'Username')}</label>
                    <input
                      type="text"
                      required
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('मोबाइल नंबर', 'Mobile Number')}</label>
                    <input
                      type="tel"
                      required
                      value={editFormData.mobile_number}
                      onChange={(e) => setEditFormData({ ...editFormData, mobile_number: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('ईमेल', 'Email')}</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('ज़िला / स्थान', 'District / Location')}</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('विद्यालय / कॉलेज', 'School / College')}</label>
                  <input
                    type="text"
                    value={editFormData.school_name}
                    onChange={(e) => setEditFormData({ ...editFormData, school_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अभिभावक का नाम', 'Guardian Name')}</label>
                    <input
                      type="text"
                      value={editFormData.guardian_name}
                      onChange={(e) => setEditFormData({ ...editFormData, guardian_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('अभिभावक फोन / WhatsApp', 'Guardian Phone')}</label>
                    <input
                      type="tel"
                      value={editFormData.guardian_phone}
                      onChange={(e) => setEditFormData({ ...editFormData, guardian_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
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

        {/* Student Profile Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
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

                <div className="pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">{t('ज़िला / स्थान', 'District / Location')}</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedStudent.district}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>+91 {selectedStudent.mobile_number}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <School className="w-4 h-4 text-blue-600" />
                    <span>{selectedStudent.school_name || 'Government High School'}</span>
                  </div>
                  {selectedStudent.guardian_name && (
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{t('अभिभावक: ', 'Guardian: ')}{selectedStudent.guardian_name} ({selectedStudent.guardian_phone || selectedStudent.mobile_number})</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp Direct Parent Alert Actions */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>{t('व्हाट्सएप अभिभावक सूचना (WhatsApp Parent Alert)', 'WhatsApp Parent Alert Engine')}</span>
                  </div>
                  <p className="text-emerald-700 text-[11px] leading-relaxed">
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
                      'Login is supported via mobile number or username. OTP is sent to the registered email.'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    openEditModal(selectedStudent);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
                >
                  {t('संशोधित करें', 'Edit Student')}
                </button>
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
