'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  Mail,
  DollarSign,
  Edit3,
  Trash2,
  Award,
  BookOpen,
  Briefcase,
  MessageCircle,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { Teacher } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface TeacherManagerProps {
  teachers: Teacher[];
  onUpdate: () => void;
}

export default function TeacherManager({ teachers, onUpdate }: TeacherManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form state for creating / editing
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    qualification: '',
    experience: '',
    salaryMonthly: 30000,
    joiningDate: '2026-01-01',
    assignedBatches: 'Class 12 Physics, Class 10 Science',
    status: 'active' as Teacher['status'],
    bio: ''
  });

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const activeCount = teachers.filter((t) => t.status === 'active').length;
  const leaveCount = teachers.filter((t) => t.status === 'on_leave').length;
  const totalMonthlyPayroll = teachers.reduce((sum, t) => sum + (t.salaryMonthly || 0), 0);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      qualification: '',
      experience: '5+ Years',
      salaryMonthly: 30000,
      joiningDate: new Date().toISOString().split('T')[0],
      assignedBatches: 'Class 12 Physics',
      status: 'active',
      bio: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      phone: t.phone,
      email: t.email,
      subject: t.subject,
      qualification: t.qualification,
      experience: t.experience,
      salaryMonthly: t.salaryMonthly,
      joiningDate: t.joiningDate,
      assignedBatches: (t.assignedBatches || []).join(', '),
      status: t.status,
      bio: t.bio || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim()) return;

    const batchesArray = formData.assignedBatches
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    let updated: Teacher[];

    if (editingTeacher) {
      updated = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              ...formData,
              assignedBatches: batchesArray
            }
          : t
      );
    } else {
      const newTeacher: Teacher = {
        id: `teacher-${Date.now()}`,
        name: formData.name.trim(),
        phone: formData.phone.trim() || '+91 99999 00000',
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@icckeguruji.com`,
        subject: formData.subject.trim(),
        qualification: formData.qualification.trim() || 'Post Graduate Faculty',
        experience: formData.experience.trim() || '5+ Years',
        salaryMonthly: Number(formData.salaryMonthly) || 0,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        assignedBatches: batchesArray,
        status: formData.status,
        bio: formData.bio.trim()
      };
      updated = [newTeacher, ...teachers];
    }

    saveStoredData('TEACHERS', updated);
    setIsAddModalOpen(false);
    onUpdate();
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove faculty member "${name}"?`)) {
      const updated = teachers.filter((t) => t.id !== id);
      saveStoredData('TEACHERS', updated);
      onUpdate();
    }
  };

  const handleToggleStatus = (teacher: Teacher) => {
    const nextStatus: Teacher['status'] =
      teacher.status === 'active' ? 'on_leave' : teacher.status === 'on_leave' ? 'inactive' : 'active';
    const updated = teachers.map((t) => (t.id === teacher.id ? { ...t, status: nextStatus } : t));
    saveStoredData('TEACHERS', updated);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <GraduationCap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Teachers &amp; Faculty Directory
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {teachers.length} Staff
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage coaching faculty profiles, qualifications, assigned subjects, and monthly payroll.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faculty */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Faculty</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <div className="mt-1 text-[11px] text-indigo-600 font-bold">ICC KE GURUJI Mentors</div>
        </div>

        {/* Active Teaching */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Active Teachers</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-bold">
            {teachers.length > 0 ? Math.round((activeCount / teachers.length) * 100) : 0}% on Duty
          </div>
        </div>

        {/* On Leave */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">On Leave</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{leaveCount}</div>
          <div className="mt-1 text-[11px] text-amber-600 font-bold">Approved Staff Leaves</div>
        </div>

        {/* Monthly Payroll */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Monthly Payroll</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[11px] text-purple-600 font-bold">Faculty Salary Commitment</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by teacher name, subject, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'on_leave', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'All Staff' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeachers.map((t) => {
          const cleanPhone = t.phone.replace(/[^0-9]/g, '');
          return (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
            >
              <div>
                {/* Top Row: Name, Status & Controls */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0 overflow-hidden">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">{t.subject}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          {t.qualification}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {t.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <button
                    onClick={() => handleToggleStatus(t)}
                    title="Click to toggle status (Active / On Leave / Inactive)"
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      t.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : t.status === 'on_leave'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </button>
                </div>

                {/* Bio (if present) */}
                {t.bio && (
                  <p className="text-xs text-slate-600 mt-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
                    &quot;{t.bio}&quot;
                  </p>
                )}

                {/* Assigned Batches */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Batches:</span>
                  {(t.assignedBatches || []).map((batch, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 text-[11px] font-semibold border border-indigo-100"
                    >
                      {batch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Contact Actions, Salary & Edit/Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(t.name)},%20Greetings%20from%20ICC%20KE%20GURUJI.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Phone */}
                  <a
                    href={`tel:${t.phone}`}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                    title={`Call ${t.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {/* Email */}
                  {t.email && (
                    <a
                      href={`mailto:${t.email}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title={t.email}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}

                  <div className="ml-2 text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    ₹{t.salaryMonthly.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-medium">/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 rounded-xl hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Edit Teacher Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-3xl">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-extrabold text-slate-700 text-sm">No Faculty Found</h4>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or add a new faculty member.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingTeacher ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
                  </h3>
                  <p className="text-xs text-slate-500">ICC KE GURUJI Teaching Staff</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Alok Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject &amp; Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics (NEET / JEE)"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 99342 15013"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="teacher@icckeguruji.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Educational Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. Physics (IIT Kanpur)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={formData.salaryMonthly}
                    onChange={(e) => setFormData({ ...formData, salaryMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Teacher['status'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  >
                    <option value="active">Active (On Duty)</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Batches (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 12 Physics, NEET Mastery, Class 10 Board"
                  value={formData.assignedBatches}
                  onChange={(e) => setFormData({ ...formData, assignedBatches: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Faculty Bio / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mentored 40+ students to 95%+ marks in CBSE and state board exams."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingTeacher ? 'Update Faculty' : 'Save Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return <GraduationCap className={className} />;
}
