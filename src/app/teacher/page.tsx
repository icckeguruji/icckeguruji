'use client';

import React, { useState, Suspense, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  DollarSign,
  LogOut,
  IdCard,
  QrCode,
  Clock,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { Teacher, TeacherAttendanceRecord, User } from '@/types';
import NotificationCenter from '@/components/NotificationCenter';
import TimedQuizHub from '@/components/TimedQuizHub';
import AiStudentProblemSolver from '@/components/AiStudentProblemSolver';

const emptySubscribe = () => () => {};
const getClientToday = () => new Date().toISOString().split('T')[0];
const getServerToday = () => '2026-10-28';

function TeacherDashboardContent() {
  const router = useRouter();
  const todayStr = useSyncExternalStore(emptySubscribe, getClientToday, getServerToday);
  const [data] = useState(() => getStoredData());
  const [currentUser, setCurrentUser] = useState<User>(() => data.user);
  const [showTimedQuiz, setShowTimedQuiz] = useState(false);
  const [showAiSolver, setShowAiSolver] = useState(false);

  // Find corresponding teacher profile
  const teacherProfile: Teacher =
    (data.teachers || []).find(
      (t) =>
        t.id === currentUser.id ||
        t.email === currentUser.email ||
        t.phone === currentUser.phone ||
        t.facultyId === currentUser.facultyId
    ) || (data.teachers && data.teachers[0]) || {
      id: 'teacher-1',
      facultyId: 'ICC-T-101',
      name: currentUser.name || 'Faculty Member',
      phone: currentUser.phone || '+91 99342 15013',
      email: currentUser.email || 'teacher@icckeguruji.com',
      subject: 'Physics',
      qualification: 'M.Tech IIT Kanpur',
      experience: '12+ Years',
      salaryMonthly: 45000,
      joiningDate: '2020-04-01',
      assignedBatches: ['Class 12 Physics Complete Mastery'],
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Lead Physics Faculty at ICC KE GURUJI.',
      address: 'Main Campus, Ward No. 4',
      bloodGroup: 'O+',
      specialization: 'Mechanics & Electrodynamics',
      achievements: ['Best Teacher Award', 'Mentored 120+ IITians']
    };

  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'batches' | 'my_salary'>('profile');

  // Teacher's personal attendance history
  const myAttendanceRecords: TeacherAttendanceRecord[] = (data.teacherAttendance || []).filter(
    (a) => a.teacherId === teacherProfile.id || a.teacherPhone === teacherProfile.phone
  );

  const presentDays = myAttendanceRecords.filter((r) => r.status === 'present').length;
  const leaveDays = myAttendanceRecords.filter((r) => r.status === 'leave').length;

  const handleLogout = () => {
    const guestUser: User = {
      id: '',
      name: '',
      phone: '',
      email: '',
      role: 'student',
      enrolledCourseIds: [],
    };
    saveStoredData('USER', guestUser);
    setCurrentUser(guestUser);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="sm" logoUrl={data.config?.logoUrl} />
            </Link>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty Portal
            </span>
          </div>

          {/* Teacher Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowTimedQuiz(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Inspect Timed Quizzes"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Quizzes</span>
            </button>

            <button
              onClick={() => setShowAiSolver(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Ask Guruji AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>AI Solver</span>
            </button>

            {/* Notifications */}
            <NotificationCenter currentUser={currentUser} />

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl">
              {teacherProfile.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={teacherProfile.avatar}
                  alt={teacherProfile.name}
                  className="w-8 h-8 rounded-xl object-cover border border-indigo-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  {teacherProfile.name[0]}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1">
                  {teacherProfile.name}
                  <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">
                    {teacherProfile.facultyId || 'ICC-T-101'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">{teacherProfile.subject}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/15">
              <span>Academic Year 2026 • ICC KE GURUJI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {teacherProfile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl font-medium">
              You are logged in with Faculty ID <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{teacherProfile.facultyId || 'ICC-T-101'}</span>. Manage your batches, inspect your official faculty dossier, and track your attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center min-w-28">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Duty Status</span>
              <span className="text-sm font-black text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Faculty
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center min-w-28">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Monthly Pay</span>
              <span className="text-sm font-black text-white mt-0.5 block">
                ₹{teacherProfile.salaryMonthly.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>My Profile &amp; ID Card</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Attendance &amp; Shifts</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'batches'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assigned Batches &amp; Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('my_salary')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'my_salary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Slip &amp; Payouts</span>
          </button>
        </div>

        {/* Tab 1: Profile & ID Card */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Official ID Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-700/50 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-black text-sm tracking-wide uppercase text-indigo-300">ICC KE GURUJI</h4>
                    <p className="text-[10px] text-slate-400">Official Faculty ID Card</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Active Mentor
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {teacherProfile.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={teacherProfile.avatar}
                        alt={teacherProfile.name}
                        className="w-20 h-24 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl border-2 border-indigo-400">
                        {teacherProfile.name[0]}
                      </div>
                    )}
                    <div className="text-center mt-1">
                      <span className="font-mono text-[10px] font-bold text-indigo-200">
                        {teacherProfile.bloodGroup || 'Blood: B+'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="font-black text-base text-white leading-tight">{teacherProfile.name}</h3>
                    <p className="text-xs font-bold text-indigo-300">{teacherProfile.subject}</p>
                    <p className="text-[11px] text-slate-300">{teacherProfile.qualification}</p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold">Faculty ID</span>
                        <span className="font-mono font-bold text-white text-xs">
                          {teacherProfile.facultyId || 'ICC-T-101'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold">Experience</span>
                        <span className="font-medium text-slate-200">{teacherProfile.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-300" />
                    <span className="font-mono font-bold text-white">PORTAL VERIFIED</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif italic text-indigo-200">Guruji Alok Sharma</span>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-500">Authorized Signature</span>
                  </div>
                </div>
              </div>

              {/* Security Credentials */}
              <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Login &amp; Security Credentials
                </span>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Faculty Username:</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {teacherProfile.facultyId || teacherProfile.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registered Phone:</span>
                    <span className="font-mono font-bold text-slate-800">{teacherProfile.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-bold text-slate-800 truncate block max-w-44">{teacherProfile.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Full Dossier & Achievements */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Academic Profile &amp; Background
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Highest Degree</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1 block">{teacherProfile.qualification}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Specialization</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                      {teacherProfile.specialization || teacherProfile.subject}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Teaching Experience</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1 block">{teacherProfile.experience}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Address</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                      {teacherProfile.address || 'ICC Coaching Campus'}
                    </span>
                  </div>
                </div>

                {teacherProfile.bio && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">Faculty Bio &amp; Philosophy</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                      &quot;{teacherProfile.bio}&quot;
                    </p>
                  </div>
                )}

                {teacherProfile.achievements && teacherProfile.achievements.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Key Mentorship Milestones</span>
                    <div className="space-y-2">
                      {teacherProfile.achievements.map((ach, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-bold text-indigo-900"
                        >
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs uppercase font-bold text-slate-400">Present Days</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">{presentDays} Days</div>
                <span className="text-[11px] text-emerald-600 font-bold">Recorded On-Duty</span>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs uppercase font-bold text-slate-400">Approved Leaves</span>
                <div className="text-2xl font-black text-blue-700 mt-1">{leaveDays} Days</div>
                <span className="text-[11px] text-blue-600 font-bold">Planned Staff Leaves</span>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs uppercase font-bold text-slate-400">Regular Shift</span>
                <div className="text-2xl font-black text-slate-900 mt-1">08:00 AM</div>
                <span className="text-[11px] text-slate-500 font-bold">Daily Check-In</span>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs uppercase font-bold text-slate-400">Monthly Target</span>
                <div className="text-2xl font-black text-indigo-700 mt-1">98.5%</div>
                <span className="text-[11px] text-indigo-600 font-bold">Presence Ratio</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">My Attendance Records Register</h3>
                <span className="text-xs font-bold text-slate-400">Today: {todayStr}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">In Time</th>
                      <th className="py-3 px-4">Out Time</th>
                      <th className="py-3 px-4">Remarks / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttendanceRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{rec.date}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'leave'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{rec.inTime || '--'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{rec.outTime || '--'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{rec.remarks || 'Regular Shift'}</td>
                      </tr>
                    ))}
                    {myAttendanceRecords.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                          No previous attendance logs recorded yet for your ID.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Batches & Timetable */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <h3 className="font-black text-slate-900 text-base mb-4">My Assigned Batches &amp; Classrooms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(teacherProfile.assignedBatches || []).map((batch, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{batch}</h4>
                      <p className="text-xs text-indigo-700 font-bold mt-0.5">Faculty: {teacherProfile.name}</p>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
                        Active Curriculum 2026
                      </span>
                    </div>
                    <Link
                      href="/course/course-1"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                    >
                      Open Batch ➜
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Salary Slip */}
        {activeTab === 'my_salary' && (
          <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Monthly Salary Slip Preview</h3>
                <p className="text-xs text-slate-500">Issued by ICC KE GURUJI Coaching Management</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                Paid On Time
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Faculty Member:</span>
                <span className="font-extrabold text-slate-900">{teacherProfile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Faculty ID:</span>
                <span className="font-mono font-bold text-slate-900">{teacherProfile.facultyId || 'ICC-T-101'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Base Monthly Remuneration:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{teacherProfile.salaryMonthly.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Performance &amp; Doubt Bonus:</span>
                <span className="font-bold text-emerald-700">₹2,500</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-black text-slate-900">Total Net Disbursed:</span>
                <span className="font-black text-indigo-700 text-base">
                  ₹{(teacherProfile.salaryMonthly + 2500).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Timed Quiz Hub Modal */}
      {showTimedQuiz && (
        <TimedQuizHub
          isOpen={showTimedQuiz}
          onClose={() => setShowTimedQuiz(false)}
          studentName={teacherProfile.name}
        />
      )}

      {/* AI Problem Solver Modal */}
      {showAiSolver && (
        <AiStudentProblemSolver
          isOpen={showAiSolver}
          onClose={() => setShowAiSolver(false)}
          studentName={teacherProfile.name}
        />
      )}
    </div>
  );
}

export default function TeacherPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-400">Loading ICC Faculty Portal...</p>
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  );
}
