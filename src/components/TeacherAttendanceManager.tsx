'use client';

import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Share2,
  Check,
  Search,
  Briefcase
} from 'lucide-react';
import { Teacher, TeacherAttendanceRecord, TeacherAttendanceStatus } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface TeacherAttendanceManagerProps {
  teachers: Teacher[];
  initialAttendance: TeacherAttendanceRecord[];
  onUpdate: () => void;
}

const emptySubscribe = () => () => {};
const getClientToday = () => new Date().toISOString().split('T')[0];
const getServerToday = () => '2026-10-28';

export default function TeacherAttendanceManager({
  teachers,
  initialAttendance,
  onUpdate,
}: TeacherAttendanceManagerProps) {
  const todayStr = useSyncExternalStore(emptySubscribe, getClientToday, getServerToday);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceList, setAttendanceList] = useState<TeacherAttendanceRecord[]>(initialAttendance);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [activeView, setActiveView] = useState<'daily' | 'monthly'>('daily');

  // Format date display
  const formattedDate = useMemo(() => {
    try {
      return new Date(selectedDate || todayStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, todayStr]);

  // Current records for selected date
  const dateRecords = useMemo(() => {
    return attendanceList.filter((a) => a.date === selectedDate);
  }, [attendanceList, selectedDate]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery)
    );
  }, [teachers, searchQuery]);

  // Status map for quick lookup
  const getTeacherRecord = useCallback(
    (teacherId: string): TeacherAttendanceRecord | undefined => {
      return attendanceList.find((a) => a.date === selectedDate && a.teacherId === teacherId);
    },
    [attendanceList, selectedDate]
  );

  // Status counts for selected date
  const presentCount = dateRecords.filter((r) => r.status === 'present').length;
  const absentCount = dateRecords.filter((r) => r.status === 'absent').length;
  const halfDayCount = dateRecords.filter((r) => r.status === 'half_day').length;
  const leaveCount = dateRecords.filter((r) => r.status === 'leave').length;

  // Update status for a teacher
  const handleSetStatus = useCallback(
    (teacher: Teacher, status: TeacherAttendanceStatus) => {
      const existingIndex = attendanceList.findIndex(
        (a) => a.date === selectedDate && a.teacherId === teacher.id
      );

      const nowTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let updated: TeacherAttendanceRecord[];

      if (existingIndex >= 0) {
        updated = [...attendanceList];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          status,
          markedAt: nowTime,
          inTime: status === 'present' || status === 'half_day' ? existing.inTime || '08:00 AM' : '--',
          outTime: status === 'present' || status === 'half_day' ? existing.outTime || '02:00 PM' : '--',
        };
      } else {
        const newRecord: TeacherAttendanceRecord = {
          id: `tatt-${selectedDate}-${teacher.id}`,
          date: selectedDate,
          teacherId: teacher.id,
          teacherName: teacher.name,
          teacherPhone: teacher.phone,
          subject: teacher.subject,
          status,
          markedAt: nowTime,
          inTime: status === 'present' || status === 'half_day' ? '08:00 AM' : '--',
          outTime: status === 'present' || status === 'half_day' ? '02:00 PM' : '--',
          remarks: status === 'present' ? 'Regular Classes Conducted' : status === 'leave' ? 'Approved Leave' : '',
        };
        updated = [newRecord, ...attendanceList];
      }

      setAttendanceList(updated);
      saveStoredData('TEACHER_ATTENDANCE', updated);
      onUpdate();

      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    },
    [attendanceList, selectedDate, onUpdate]
  );

  // Update in/out time or remarks
  const handleUpdateRecordDetails = useCallback(
    (teacherId: string, field: 'inTime' | 'outTime' | 'remarks', value: string) => {
      const teacher = teachers.find((t) => t.id === teacherId);
      if (!teacher) return;

      const existingIndex = attendanceList.findIndex(
        (a) => a.date === selectedDate && a.teacherId === teacherId
      );

      let updated: TeacherAttendanceRecord[];

      if (existingIndex >= 0) {
        updated = [...attendanceList];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: value,
        };
      } else {
        const newRecord: TeacherAttendanceRecord = {
          id: `tatt-${selectedDate}-${teacher.id}`,
          date: selectedDate,
          teacherId: teacher.id,
          teacherName: teacher.name,
          teacherPhone: teacher.phone,
          subject: teacher.subject,
          status: 'present',
          markedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          inTime: '08:00 AM',
          outTime: '02:00 PM',
          remarks: '',
          [field]: value,
        };
        updated = [newRecord, ...attendanceList];
      }

      setAttendanceList(updated);
      saveStoredData('TEACHER_ATTENDANCE', updated);
      onUpdate();
    },
    [attendanceList, selectedDate, teachers, onUpdate]
  );

  // Mark all teachers as Present
  const handleMarkAllPresent = () => {
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const otherDateRecords = attendanceList.filter((a) => a.date !== selectedDate);

    const newDateRecords: TeacherAttendanceRecord[] = teachers.map((teacher) => {
      const existing = attendanceList.find((a) => a.date === selectedDate && a.teacherId === teacher.id);
      return {
        id: existing?.id || `tatt-${selectedDate}-${teacher.id}`,
        date: selectedDate,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherPhone: teacher.phone,
        subject: teacher.subject,
        status: 'present',
        inTime: existing?.inTime || '08:00 AM',
        outTime: existing?.outTime || '02:00 PM',
        markedAt: nowTime,
        remarks: existing?.remarks || 'All Batches Conducted',
      };
    });

    const combined = [...newDateRecords, ...otherDateRecords];
    setAttendanceList(combined);
    saveStoredData('TEACHER_ATTENDANCE', combined);
    onUpdate();

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Date', 'Teacher Name', 'Subject', 'Phone', 'Status', 'In Time', 'Out Time', 'Remarks', 'Marked At'];
    const rows = attendanceList.map((r) => [
      r.date,
      `"${r.teacherName}"`,
      `"${r.subject}"`,
      r.teacherPhone,
      r.status.toUpperCase(),
      r.inTime || '--',
      r.outTime || '--',
      `"${r.remarks || ''}"`,
      r.markedAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teacher_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Broadcast Summary
  const handleShareReport = () => {
    const reportText = `📋 *ICC KE GURUJI - FACULTY ATTENDANCE REPORT*\n📅 Date: ${formattedDate}\n\n👥 Total Faculty: ${teachers.length}\n✅ Present: ${presentCount}\n❌ Absent: ${absentCount}\n⏳ Half-Day: ${halfDayCount}\n🏖️ On Leave: ${leaveCount}\n\n*Faculty Status:*\n${teachers
      .map((t) => {
        const rec = getTeacherRecord(t.id);
        const st = rec?.status || 'unmarked';
        const icon = st === 'present' ? '✅' : st === 'leave' ? '🏖️' : st === 'half_day' ? '⏳' : '❌';
        return `${icon} ${t.name} (${t.subject}): ${st.toUpperCase()} [${rec?.inTime || '--'} - ${rec?.outTime || '--'}]`;
      })
      .join('\n')}\n\n— ICC KE GURUJI Admin Command Center`;

    window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank');
  };

  // Monthly summary metrics per teacher
  const monthlyStats = useMemo(() => {
    const curMonth = selectedDate.slice(0, 7); // e.g. "2026-10"
    return teachers.map((t) => {
      const records = attendanceList.filter((a) => a.teacherId === t.id && a.date.startsWith(curMonth));
      const p = records.filter((r) => r.status === 'present').length;
      const hd = records.filter((r) => r.status === 'half_day').length;
      const l = records.filter((r) => r.status === 'leave').length;
      const ab = records.filter((r) => r.status === 'absent').length;
      const totalMarked = records.length;
      const score = totalMarked > 0 ? Math.round(((p + hd * 0.5) / totalMarked) * 100) : 100;
      return {
        teacher: t,
        present: p,
        halfDay: hd,
        leave: l,
        absent: ab,
        total: totalMarked,
        percent: score,
      };
    });
  }, [teachers, attendanceList, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Teacher Attendance Register
                {savedFeedback && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 animate-pulse">
                    ✓ Saved Live
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Mark daily faculty attendance, log entry &amp; exit timings, and monitor monthly teacher presence.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveView('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily Register
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly Summary
            </button>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            title="Mark all staff present for this day"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-xs"
            title="Download CSV Register"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleShareReport}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors shadow-xs"
            title="Share Attendance Report to WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Selector & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Date Picker Card */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Present */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Present</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {presentCount} <span className="text-xs text-slate-400 font-semibold">/ {teachers.length}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">On Duty Today</span>
        </div>

        {/* Absent */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700">
            <span>Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{absentCount}</div>
          <span className="text-[10px] text-rose-600 font-semibold">Not Reported</span>
        </div>

        {/* Half Day */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Half Day</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{halfDayCount}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Half Shifts</span>
        </div>

        {/* On Leave */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700">
            <span>On Leave</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{leaveCount}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Approved Leave</span>
        </div>
      </div>

      {activeView === 'daily' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search faculty by name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 hidden sm:block">
              Register for: <span className="text-slate-900 font-black">{formattedDate}</span>
            </div>
          </div>

          {/* Daily Table of Teachers */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Attendance Status</th>
                    <th className="py-3 px-4">Timings (In / Out)</th>
                    <th className="py-3 px-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((teacher) => {
                    const record = getTeacherRecord(teacher.id);
                    const currentStatus: TeacherAttendanceStatus = record?.status || 'present';

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Faculty Member Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              {teacher.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs">{teacher.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{teacher.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-4 font-bold text-indigo-700">
                          {teacher.subject}
                        </td>

                        {/* Status Buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present */}
                            <button
                              onClick={() => handleSetStatus(teacher, 'present')}
                              className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] transition-all flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              Present
                            </button>

                            {/* Absent */}
                            <button
                              onClick={() => handleSetStatus(teacher, 'absent')}
                              className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] transition-all flex items-center gap-1 ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs scale-105'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              Absent
                            </button>

                            {/* Half Day */}
                            <button
                              onClick={() => handleSetStatus(teacher, 'half_day')}
                              className={`px-2 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                                currentStatus === 'half_day'
                                  ? 'bg-amber-600 text-white shadow-xs scale-105'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              Half
                            </button>

                            {/* Leave */}
                            <button
                              onClick={() => handleSetStatus(teacher, 'leave')}
                              className={`px-2 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                                currentStatus === 'leave'
                                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>

                        {/* Timings (In / Out) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={record?.inTime ?? '08:00 AM'}
                              onChange={(e) => handleUpdateRecordDetails(teacher.id, 'inTime', e.target.value)}
                              placeholder="08:00 AM"
                              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                              type="text"
                              value={record?.outTime ?? '02:00 PM'}
                              onChange={(e) => handleUpdateRecordDetails(teacher.id, 'outTime', e.target.value)}
                              placeholder="02:00 PM"
                              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                            />
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            value={record?.remarks ?? ''}
                            onChange={(e) => handleUpdateRecordDetails(teacher.id, 'remarks', e.target.value)}
                            placeholder="Add daily notes / class topic..."
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Monthly Summary View */
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Monthly Faculty Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Attendance metrics for month of {selectedDate.slice(0, 7)}
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
              {teachers.length} Active Faculty Members
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyStats.map((stat) => (
              <div
                key={stat.teacher.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{stat.teacher.name}</h4>
                    <p className="text-xs font-bold text-indigo-600">{stat.teacher.subject}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Salary: ₹{stat.teacher.salaryMonthly.toLocaleString('en-IN')}/mo</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{stat.percent}%</div>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Attendance</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-emerald-100">
                    <div className="font-black text-emerald-700">{stat.present}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Present</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-rose-100">
                    <div className="font-black text-rose-700">{stat.absent}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Absent</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-amber-100">
                    <div className="font-black text-amber-700">{stat.halfDay}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Half Day</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <div className="font-black text-blue-700">{stat.leave}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Leave</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
