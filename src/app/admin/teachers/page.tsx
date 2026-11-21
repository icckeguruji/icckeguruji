'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi, TeacherItem } from '@/lib/api';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export default function TeachersPage() {
  const { lang, t } = useLanguage();
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    qualification: '',
    subjects: '',
    email: '',
    mobile: '',
    assignedBatches: 1,
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    qualification: '',
    subjects: '',
    email: '',
    mobile: '',
    assignedBatches: 1,
  });

  useEffect(() => {
    AdminApi.getTeachers().then((data) => setTeachers(data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await AdminApi.createTeacher({
      full_name: formData.full_name,
      qualification: formData.qualification,
      subjects: formData.subjects,
      email: formData.email,
      mobile: formData.mobile,
      assignedBatches: Number(formData.assignedBatches) || 1,
    });
    setTeachers((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setFormData({
      full_name: '',
      qualification: '',
      subjects: '',
      email: '',
      mobile: '',
      assignedBatches: 1,
    });
  };

  const openEditModal = (teacher: TeacherItem) => {
    setEditingTeacher(teacher);
    setEditFormData({
      full_name: teacher.full_name,
      qualification: teacher.qualification,
      subjects: teacher.subjects,
      email: teacher.email,
      mobile: teacher.mobile,
      assignedBatches: teacher.assignedBatches || 1,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    const updated = await AdminApi.updateTeacher(editingTeacher.id, {
      full_name: editFormData.full_name,
      qualification: editFormData.qualification,
      subjects: editFormData.subjects,
      email: editFormData.email,
      mobile: editFormData.mobile,
      assignedBatches: Number(editFormData.assignedBatches) || 1,
    });
    if (updated) {
      setTeachers((prev) => prev.map((tItem) => (tItem.id === editingTeacher.id ? updated : tItem)));
    }
    setIsEditModalOpen(false);
    setEditingTeacher(null);
  };

  const handleDelete = async (teacher: TeacherItem) => {
    if (confirm(`Are you sure you want to remove teacher record "${teacher.full_name}"?`)) {
      await AdminApi.deleteTeacher(teacher.id);
      setTeachers((prev) => prev.filter((tItem) => tItem.id !== teacher.id));
    }
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="शिक्षक प्रबंधन (Teachers)"
        titleEn="Teachers Management"
        subtitleHi="संस्थान के शिक्षकों का विवरण, विषय विशेषज्ञता एवं बैच प्रबंधन"
        subtitleEn="Faculty records, subject specializations and batch assignments"
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
                'शिक्षकों का विवरण, विषय विशेषज्ञता एवं बैच आवंटन डायरेक्टर बड़े सर के प्रशासनिक नियंत्रण में है। यहां से आप किसी भी शिक्षक को जोड़, संपादित अथवा हटा सकते हैं।',
                'Faculty details, subject specializations and batch assignments are under administrative control of Director BADE SIR. You can add, edit, or delete any teacher record.'
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
            <span>{t('नया शिक्षक जोड़ें', 'Add Teacher')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base flex-shrink-0">
                      {tItem.full_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{tItem.full_name}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{tItem.qualification}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => openEditModal(tItem)}
                      title="Edit Teacher"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tItem)}
                      title="Delete Teacher"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('विषय:', 'Subjects:')}</span>
                    <span className="font-bold text-slate-800 text-right truncate max-w-[60%]">{tItem.subjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('आवंटित बैच:', 'Assigned Batches:')}</span>
                    <span className="font-bold text-blue-700">{tItem.assignedBatches || 1} Batches</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {tItem.email}
                </span>
                <span className="font-mono text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {tItem.mobile}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('नया शिक्षक जोड़ें', 'Add Teacher Record')}</h3>
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
                  <label className="block font-semibold text-slate-700 mb-1">{t('योग्यता (Qualification)', 'Qualification')}</label>
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
                    placeholder="उदा. Physics, Mathematics"
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('आवंटित बैच संख्या', 'Assigned Batches')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.assignedBatches}
                    onChange={(e) => setFormData({ ...formData, assignedBatches: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
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
                    {t('सुरक्षित करें', 'Save Teacher')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingTeacher && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">{t('शिक्षक विवरण संपादित करें', 'Edit Teacher Details')}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('शिक्षक का पूरा नाम', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('योग्यता (Qualification)', 'Qualification')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('विषय (Subjects Taught)', 'Subjects')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.subjects}
                    onChange={(e) => setEditFormData({ ...editFormData, subjects: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('ईमेल (Email)', 'Email')}</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('मोबाइल (Mobile No.)', 'Mobile')}</label>
                    <input
                      type="text"
                      required
                      value={editFormData.mobile}
                      onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('आवंटित बैच संख्या', 'Assigned Batches')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editFormData.assignedBatches}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedBatches: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('बदलाव सहेजें', 'Update Teacher')}
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
