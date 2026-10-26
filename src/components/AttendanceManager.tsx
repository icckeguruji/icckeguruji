'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Save,
  Users,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { User, Course, AttendanceRecord } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface AttendanceManagerProps {
  students: User[];
  courses: Course[];
  initialAttendance: AttendanceRecord[];
  onUpdate: () => void;
}

export default function AttendanceManager({
  students,
  courses,
  initialAttendance,
  onUpdate,
}: AttendanceManagerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || 'course-1'
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [formattedDateText, setFormattedDateText] = useState<string>('2026-10-26');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(initialAttendance);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  React.useEffect(() => {
    try {
      setFormattedDateText(
        new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    } catch {
      setFormattedDateText(selectedDate);
    }
  }, [selectedDate]);

  // Filter students enrolled in the selected course/batch
  const batchStudents = students.filter(
    (s) => (s.enrolledCourseIds || []).includes(selectedCourseId) || s.enrolledCourseIds?.length === 0
  );

  const filteredStudents = batchStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.phone.includes(searchQuery)
  );

  // Get status for a student on the selected date & course
  const getStudentStatus = (studentId: string): 'present' | 'absent' | 'leave' => {
    const record = attendanceList.find(
      (a) =>
        a.date === selectedDate &&
        a.courseId === selectedCourseId &&
        a.studentId === studentId
    );
    return record?.status || 'present'; // Default to present
  };

  // Toggle student attendance status
  const handleSetStatus = (student: User, status: 'present' | 'absent' | 'leave') => {
    const existingIndex = attendanceList.findIndex(
      (a) =>
        a.date === selectedDate &&
        a.courseId === selectedCourseId &&
        a.studentId === student.id
    );

    let updated: AttendanceRecord[];
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (existingIndex >= 0) {
      updated = [...attendanceList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        markedAt: nowTime,
      };
    } else {
      const selectedCourse = courses.find((c) => c.id === selectedCourseId);
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${student.id}`,
        date: selectedDate,
        courseId: selectedCourseId,
        courseTitle: selectedCourse?.title || 'Batch',
        studentId: student.id,
        studentName: student.name,
        studentPhone: student.phone,
        rollNo: student.rollNo || 'ICC',
        status,
        markedAt: nowTime,
      };
      updated = [newRecord, ...attendanceList];
    }

    setAttendanceList(updated);
    saveStoredData('ATTENDANCE', updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onUpdate();
  };

  // Mark all students present with 1-click
  const handleMarkAllPresent = () => {
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const otherRecords = attendanceList.filter(
      (a) => !(a.date === selectedDate && a.courseId === selectedCourseId)
    );

    const newRecords: AttendanceRecord[] = batchStudents.map((s) => ({
      id: `att-${Date.now()}-${s.id}`,
      date: selectedDate,
      courseId: selectedCourseId,
      courseTitle: selectedCourse?.title || 'Batch',
      studentId: s.id,
      studentName: s.name,
      studentPhone: s.phone,
      rollNo: s.rollNo || 'ICC',
      status: 'present',
      markedAt: nowTime,
    }));

    const updated = [...newRecords, ...otherRecords];
    setAttendanceList(updated);
    saveStoredData('ATTENDANCE', updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onUpdate();
  };

  // WhatsApp Alert to parents of absent students
  const handleSendAbsentWhatsApp = (student: User) => {
    const rawDigits = student.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const msg = encodeURIComponent(
      `Dear Parent,\n\nThis is an official update that your ward *${student.name}* (Roll: ${student.rollNo || 'N/A'}) was marked *Absent* today (${selectedDate}) at *ICC KE GURUJI* Coaching Institute.\n\nPlease ensure regular attendance for optimal academic progress.\n\nWarm regards,\n*ICC KE GURUJI*\nHelpline: +91 98765 43210`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // Calculate current counts
  const presentCount = batchStudents.filter(
    (s) => getStudentStatus(s.id) === 'present'
  ).length;
  const absentCount = batchStudents.filter(
    (s) => getStudentStatus(s.id) === 'absent'
  ).length;
  const leaveCount = batchStudents.filter(
    (s) => getStudentStatus(s.id) === 'leave'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Daily Attendance Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select date and batch, mark attendance, and send instant WhatsApp alerts to parents of absent students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {savedSuccess && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              Attendance Saved!
            </span>
          )}
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Date & Batch Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Date Selector */}
        <div>
          <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Batch Selector */}
        <div>
          <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
            Select Batch / Class
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Student Search */}
        <div>
          <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
            Search Student
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Name, Roll No, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="text-xl font-black text-blue-900">{batchStudents.length}</div>
          <div className="text-[11px] font-bold text-blue-700">Total Students</div>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="text-xl font-black text-emerald-800">{presentCount}</div>
          <div className="text-[11px] font-bold text-emerald-700">Present</div>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
          <div className="text-xl font-black text-rose-800">{absentCount}</div>
          <div className="text-[11px] font-bold text-rose-700">Absent</div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="text-xl font-black text-amber-800">{leaveCount}</div>
          <div className="text-[11px] font-bold text-amber-700">On Leave</div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-700">
            Batch: {courses.find((c) => c.id === selectedCourseId)?.title || 'Selected Batch'} ({filteredStudents.length} Students)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {formattedDateText}
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No students found in this batch.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student, idx) => {
              const status = getStudentStatus(student.id);

              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Student Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>{student.name}</span>
                        {student.rollNo && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                            {student.rollNo}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {student.fatherName && (
                          <span>Father: {student.fatherName} • </span>
                        )}
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Toggle Buttons & WhatsApp */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Present Button */}
                    <button
                      onClick={() => handleSetStatus(student, 'present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Present (P)</span>
                    </button>

                    {/* Absent Button */}
                    <button
                      onClick={() => handleSetStatus(student, 'absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent (A)</span>
                    </button>

                    {/* Leave Button */}
                    <button
                      onClick={() => handleSetStatus(student, 'leave')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        status === 'leave'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Leave (L)</span>
                    </button>

                    {/* WhatsApp Alert Button for Absent */}
                    {status === 'absent' && (
                      <button
                        onClick={() => handleSendAbsentWhatsApp(student)}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 animate-pulse"
                        title="Send WhatsApp alert to parent"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden sm:inline">WhatsApp Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
