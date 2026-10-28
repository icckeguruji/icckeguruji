'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  DollarSign,
  Edit3,
  Trash2,
  Award,
  BookOpen,
  Briefcase,
  MessageCircle,
  Check,
  X,
  UserCheck,
  KeyRound,
  Copy,
  IdCard,
  QrCode
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
  const [viewingProfileTeacher, setViewingProfileTeacher] = useState<Teacher | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form state for creating / editing
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    phone: '',
    email: '',
    password: 'teacher123',
    subject: '',
    qualification: '',
    experience: '',
    salaryMonthly: 35000,
    joiningDate: '2026-01-01',
    assignedBatches: 'Class 12 Physics, Class 10 Science',
    avatar: '',
    status: 'active' as Teacher['status'],
    bio: '',
    address: '',
    bloodGroup: 'B+',
    specialization: '',
    achievements: ''
  });

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      (t.facultyId && t.facultyId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const activeCount = teachers.filter((t) => t.status === 'active').length;
  const leaveCount = teachers.filter((t) => t.status === 'on_leave').length;
  const totalMonthlyPayroll = teachers.reduce((sum, t) => sum + (t.salaryMonthly || 0), 0);

  const handleOpenAdd = () => {
    const nextNumber = teachers.length + 101;
    setEditingTeacher(null);
    setFormData({
      facultyId: `ICC-T-${nextNumber}`,
      name: '',
      phone: '',
      email: '',
      password: 'teacher123',
      subject: '',
      qualification: '',
      experience: '5+ Years',
      salaryMonthly: 35000,
      joiningDate: new Date().toISOString().split('T')[0],
      assignedBatches: 'Class 12 Physics',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      bio: '',
      address: 'Main Town, Ward No. 4',
      bloodGroup: 'B+',
      specialization: 'Core Conceptual Foundations & Board Scoring',
      achievements: 'Mentored 50+ students with 90%+ in Board Exams'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      facultyId: t.facultyId || `ICC-T-${100 + teachers.indexOf(t) + 1}`,
      name: t.name,
      phone: t.phone,
      email: t.email,
      password: t.password || 'teacher123',
      subject: t.subject,
      qualification: t.qualification,
      experience: t.experience,
      salaryMonthly: t.salaryMonthly,
      joiningDate: t.joiningDate,
      assignedBatches: (t.assignedBatches || []).join(', '),
      avatar: t.avatar || '',
      status: t.status,
      bio: t.bio || '',
      address: t.address || '',
      bloodGroup: t.bloodGroup || 'B+',
      specialization: t.specialization || '',
      achievements: (t.achievements || []).join(', ')
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

    const achievementsArray = formData.achievements
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    let updated: Teacher[];

    if (editingTeacher) {
      updated = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              ...formData,
              assignedBatches: batchesArray,
              achievements: achievementsArray
            }
          : t
      );
    } else {
      const newTeacher: Teacher = {
        id: `teacher-${Date.now()}`,
        facultyId: formData.facultyId.trim() || `ICC-T-${teachers.length + 101}`,
        name: formData.name.trim(),
        phone: formData.phone.trim() || '+91 99999 00000',
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@icckeguruji.com`,
        password: formData.password.trim() || 'teacher123',
        subject: formData.subject.trim(),
        qualification: formData.qualification.trim() || 'Post Graduate Faculty',
        experience: formData.experience.trim() || '5+ Years',
        salaryMonthly: Number(formData.salaryMonthly) || 0,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        assignedBatches: batchesArray,
        avatar: formData.avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        status: formData.status,
        bio: formData.bio.trim(),
        address: formData.address.trim(),
        bloodGroup: formData.bloodGroup.trim(),
        specialization: formData.specialization.trim(),
        achievements: achievementsArray
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

  const handleCopyCredentials = (teacher: Teacher) => {
    const creds = `ICC KE GURUJI Faculty Login\nID / Phone: ${teacher.facultyId || teacher.phone}\nPassword: ${teacher.password || 'teacher123'}\nPortal URL: https://icckeguruji.vercel.app/login`;
    navigator.clipboard.writeText(creds);
    setCopiedKey(teacher.id);
    setTimeout(() => setCopiedKey(null), 2500);
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
                Complete faculty profiles with photos, unique login IDs, qualifications, assigned subjects, and monthly payroll.
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
              <GraduationCap className="w-4 h-4" />
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
            placeholder="Search by faculty ID, name, subject..."
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
                {/* Top Row: Photo, ID, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Faculty Photo */}
                    <div className="relative shrink-0">
                      {t.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                          {t.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-900 text-white text-[9px] font-mono font-black rounded-md border border-white">
                        {t.facultyId || 'FAC'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                          {t.name}
                        </h3>
                      </div>
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">{t.subject}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 font-semibold">
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

                {/* Faculty ID & Login Credentials Pill */}
                <div className="mt-3.5 flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Login ID: </span>
                      <span className="font-mono font-bold text-slate-800">{t.facultyId || t.phone}</span>
                      <span className="text-[10px] text-slate-400 ml-2">Pass: </span>
                      <span className="font-mono font-bold text-slate-800">{t.password || 'teacher123'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyCredentials(t)}
                    className="p-1 px-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    title="Copy Login Details"
                  >
                    {copiedKey === t.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-extrabold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bio / Quote (if present) */}
                {t.bio && (
                  <p className="text-xs text-slate-600 mt-2.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100 leading-relaxed font-normal">
                    &quot;{t.bio}&quot;
                  </p>
                )}

                {/* Assigned Batches */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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

              {/* Bottom Row: Profile Preview, Actions & Salary */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* View Full Profile & ID Card */}
                  <button
                    onClick={() => setViewingProfileTeacher(t)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                    title="View Official Faculty ID Card & Profile"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>ID Card</span>
                  </button>

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

                  <div className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    ₹{t.salaryMonthly.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-medium">/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
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

      {/* Official Faculty ID Card & Profile Modal */}
      {viewingProfileTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">Faculty Identity Card &amp; Dossier</h3>
              </div>
              <button
                onClick={() => setViewingProfileTeacher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rendered Physical ID Card Style */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-indigo-700/50">
              {/* Watermark Logo effect */}
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h4 className="font-black text-sm tracking-wide uppercase text-indigo-300">ICC KE GURUJI</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Faculty Identity Credential</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Authorized Faculty
                </span>
              </div>

              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="shrink-0">
                  {viewingProfileTeacher.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={viewingProfileTeacher.avatar}
                      alt={viewingProfileTeacher.name}
                      className="w-20 h-24 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl border-2 border-indigo-400">
                      {viewingProfileTeacher.name[0]}
                    </div>
                  )}
                  <div className="text-center mt-1">
                    <span className="font-mono text-[10px] font-bold text-indigo-200">
                      {viewingProfileTeacher.bloodGroup || 'Blood: B+'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-black text-lg text-white leading-tight">
                    {viewingProfileTeacher.name}
                  </h3>
                  <p className="text-xs font-bold text-indigo-300">
                    {viewingProfileTeacher.subject}
                  </p>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {viewingProfileTeacher.qualification}
                  </p>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">Faculty ID</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {viewingProfileTeacher.facultyId || 'ICC-T-101'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">Joined On</span>
                      <span className="font-medium text-slate-200">
                        {viewingProfileTeacher.joiningDate || '2022-04-01'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-300" />
                  <span className="font-mono font-bold text-white">LOGIN: {viewingProfileTeacher.phone}</span>
                </div>
                <div className="text-right">
                  <span className="font-serif italic text-indigo-200">Guruji Alok Sharma</span>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-500">Authorized Signature</span>
                </div>
              </div>
            </div>

            {/* Detailed Dossier Table */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Faculty Login Credentials
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Login ID / Username:</span>
                  <span className="font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {viewingProfileTeacher.facultyId || viewingProfileTeacher.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Default Password:</span>
                  <span className="font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {viewingProfileTeacher.password || 'teacher123'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Login Role:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Faculty / Teacher Portal
                  </span>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <span className="font-bold text-slate-900">{viewingProfileTeacher.phone}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Email</span>
                  <span className="font-bold text-slate-900 truncate block">{viewingProfileTeacher.email}</span>
                </div>
              </div>

              {/* Specialization & Achievements */}
              {viewingProfileTeacher.specialization && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Specialization</span>
                  <p className="font-semibold text-slate-800">{viewingProfileTeacher.specialization}</p>
                </div>
              )}

              {viewingProfileTeacher.achievements && viewingProfileTeacher.achievements.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Key Achievements</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700 font-medium">
                    {viewingProfileTeacher.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyCredentials(viewingProfileTeacher)}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Login Link &amp; Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingProfileTeacher(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICC-T-101"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="teacher123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teacher Profile Photo URL (Direct image link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or uploaded photo link"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                  {formData.avatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. Physics"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+, B+, A+"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Achievements (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 50+ Students 95%+, Best Teacher Award 2024"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
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
