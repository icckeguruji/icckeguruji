'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Send,
  Save,
  CheckCircle,
  FileText,
  Trophy,
  Users,
  Search,
  X
} from 'lucide-react';
import { User, Course, WeeklyTest, WeeklyTestStudentResult } from '@/types';
import { saveStoredData } from '@/lib/storage';

interface WeeklyTestManagerProps {
  students: User[];
  courses: Course[];
  weeklyTests: WeeklyTest[];
  onUpdate: () => void;
}

export default function WeeklyTestManager({
  students,
  courses,
  weeklyTests,
  onUpdate,
}: WeeklyTestManagerProps) {
  const [activeTestId, setActiveTestId] = useState<string>(
    weeklyTests[0]?.id || ''
  );
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [editingTest, setEditingTest] = useState<WeeklyTest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveAlert, setSaveAlert] = useState(false);

  // New Test Form State
  const [newTest, setNewTest] = useState({
    courseId: courses[0]?.id || 'course-1',
    testTitle: '',
    subject: 'Physics',
    totalMarks: 50,
    testDate: '2026-10-26',
  });

  React.useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setNewTest((prev) => ({ ...prev, testDate: today }));
    } catch {
      // fallback
    }
  }, []);

  const currentTest = weeklyTests.find((t) => t.id === activeTestId);

  // Filter students for the current test batch
  const batchStudents = students.filter(
    (s) =>
      !currentTest ||
      (s.enrolledCourseIds || []).includes(currentTest.courseId) ||
      s.enrolledCourseIds?.length === 0
  );

  const filteredStudents = batchStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.phone.includes(searchQuery)
  );

  // Get marks for student in current test
  const getStudentResult = (studentId: string): WeeklyTestStudentResult | undefined => {
    return currentTest?.results.find((r) => r.studentId === studentId);
  };

  // Create new weekly test
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === newTest.courseId);

    const testId = `wtest-${Date.now()}`;
    const created: WeeklyTest = {
      id: testId,
      courseId: newTest.courseId,
      courseTitle: course?.title || 'Batch',
      testTitle: newTest.testTitle,
      subject: newTest.subject,
      totalMarks: Number(newTest.totalMarks),
      testDate: newTest.testDate,
      results: [],
    };

    const updated = [created, ...weeklyTests];
    saveStoredData('WEEKLY_TESTS', updated);
    setActiveTestId(testId);
    setIsCreatingTest(false);
    setNewTest({
      courseId: courses[0]?.id || 'course-1',
      testTitle: '',
      subject: 'Physics',
      totalMarks: 50,
      testDate: new Date().toISOString().split('T')[0],
    });
    onUpdate();
  };

  // Update existing test meta
  const handleUpdateTestMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    const updated = weeklyTests.map((t) =>
      t.id === editingTest.id ? editingTest : t
    );
    saveStoredData('WEEKLY_TESTS', updated);
    setEditingTest(null);
    onUpdate();
  };

  // Delete a weekly test
  const handleDeleteTest = (id: string) => {
    if (confirm('Are you sure you want to delete this weekly test and its marksheet results?')) {
      const updated = weeklyTests.filter((t) => t.id !== id);
      saveStoredData('WEEKLY_TESTS', updated);
      if (activeTestId === id) {
        setActiveTestId(updated[0]?.id || '');
      }
      onUpdate();
    }
  };

  // Update marks for a specific student in current test and recalculate ranks
  const handleUpdateStudentMarks = (
    student: User,
    marksObtained: number,
    feedback?: string
  ) => {
    if (!currentTest) return;

    const existingResults = [...currentTest.results];
    const index = existingResults.findIndex((r) => r.studentId === student.id);

    if (index >= 0) {
      existingResults[index] = {
        ...existingResults[index],
        marksObtained,
        feedback: feedback ?? existingResults[index].feedback,
      };
    } else {
      existingResults.push({
        studentId: student.id,
        studentName: student.name,
        studentPhone: student.phone,
        rollNo: student.rollNo,
        marksObtained,
        feedback: feedback || '',
      });
    }

    // Sort descending by marks to assign ranks
    const sorted = [...existingResults].sort(
      (a, b) => b.marksObtained - a.marksObtained
    );
    const rankedResults: WeeklyTestStudentResult[] = sorted.map((res, i) => ({
      ...res,
      rank: i + 1,
    }));

    const updatedTests = weeklyTests.map((t) => {
      if (t.id === currentTest.id) {
        return {
          ...t,
          results: rankedResults,
        };
      }
      return t;
    });

    saveStoredData('WEEKLY_TESTS', updatedTests);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
    onUpdate();
  };

  // 1-Click WhatsApp Test Marksheet Alert to Parents
  const handleSendMarksWhatsApp = (
    student: User,
    result: WeeklyTestStudentResult
  ) => {
    if (!currentTest) return;
    const rawDigits = student.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

    const percent = ((result.marksObtained / currentTest.totalMarks) * 100).toFixed(1);
    const rankText = result.rank ? `Rank: *#${result.rank}*` : '';

    const msg = encodeURIComponent(
      `Dear Parent,\n\nGreetings from *ICC KE GURUJI* Coaching Institute.\n\nWeekly Offline Test Report Card:\n\nStudent: *${student.name}* (Roll: ${student.rollNo || 'N/A'})\nTest: *${currentTest.testTitle}*\nSubject: *${currentTest.subject}*\nDate: *${currentTest.testDate}*\n\nScore: *${result.marksObtained} / ${currentTest.totalMarks}* (${percent}%)\n${rankText}\n\nRemarks: ${result.feedback || 'Good effort! Continue regular practice.'}\n\nThank you,\n*ICC KE GURUJI*\nHelpline: +91 98765 43210`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Weekly Tests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Record Sunday offline test marks, view ranks, and send report cards to parents via WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTest(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Test</span>
        </button>
      </div>

      {/* Tests Horizontal Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {weeklyTests.map((t) => {
          const isActive = activeTestId === t.id;
          return (
            <div
              key={t.id}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTestId(t.id)}
            >
              <Award className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500'}`} />
              <div className="text-left">
                <div className="truncate max-w-[200px]">{t.testTitle}</div>
                <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {t.subject} • {t.totalMarks} Marks • {t.testDate}
                </div>
              </div>

              {/* Edit & Delete Test Buttons */}
              <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setEditingTest(t)}
                  className={`p-1 rounded-lg ${isActive ? 'hover:bg-blue-500 text-blue-100' : 'hover:bg-slate-100 text-slate-400'}`}
                  title="Edit Test"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTest(t.id)}
                  className={`p-1 rounded-lg ${isActive ? 'hover:bg-rose-500 text-blue-100' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'}`}
                  title="Delete Test"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {currentTest ? (
        <div className="space-y-4">
          {/* Active Test Meta Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-black uppercase">
                  Active Marksheet
                </span>
                <span className="text-xs font-bold text-slate-700">{currentTest.subject}</span>
                <span className="text-xs text-slate-400">• Total Marks: {currentTest.totalMarks}</span>
                <span className="text-xs text-slate-400">• Date: {currentTest.testDate}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {currentTest.testTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {saveAlert && (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fadeIn">
                  Marks Saved!
                </span>
              )}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Marksheet Entry Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                    <th className="py-3 px-4">Rank / Roll</th>
                    <th className="py-3 px-4">Student Name & Phone</th>
                    <th className="py-3 px-4">Marks (Out of {currentTest.totalMarks})</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Remarks / Feedback</th>
                    <th className="py-3 px-4 text-right">WhatsApp Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No students found in this batch.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const res = getStudentResult(student.id);
                      const marks = res?.marksObtained ?? 0;
                      const percent = ((marks / currentTest.totalMarks) * 100).toFixed(1);
                      const isEntered = res !== undefined;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Rank / Roll */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {res?.rank ? (
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                                    res.rank === 1
                                      ? 'bg-amber-400 text-slate-950 font-black'
                                      : res.rank === 2
                                      ? 'bg-slate-300 text-slate-900 font-bold'
                                      : res.rank === 3
                                      ? 'bg-amber-700 text-white font-bold'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  #{res.rank}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono">-</span>
                              )}
                              <span className="font-mono text-slate-500 font-bold">
                                {student.rollNo || 'ICC'}
                              </span>
                            </div>
                          </td>

                          {/* Student Name */}
                          <td className="py-3 px-4">
                            <div className="font-black text-slate-900 text-sm">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {student.phone}
                            </div>
                          </td>

                          {/* Marks Input */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={currentTest.totalMarks}
                                defaultValue={res?.marksObtained ?? ''}
                                placeholder="0"
                                onBlur={(e) => {
                                  const val = e.target.value;
                                  if (val !== '') {
                                    handleUpdateStudentMarks(
                                      student,
                                      Number(val),
                                      res?.feedback
                                    );
                                  }
                                }}
                                className="w-18 px-2.5 py-1.5 border border-slate-200 rounded-xl font-black text-sm text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                              <span className="text-slate-400 font-bold">
                                / {currentTest.totalMarks}
                              </span>
                            </div>
                          </td>

                          {/* Percentage */}
                          <td className="py-3 px-4">
                            {isEntered ? (
                              <span
                                className={`px-2.5 py-1 rounded-full font-black text-xs ${
                                  Number(percent) >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : Number(percent) >= 50
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {percent}%
                              </span>
                            ) : (
                              <span className="text-slate-400">Not Entered</span>
                            )}
                          </td>

                          {/* Feedback Input */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              defaultValue={res?.feedback || ''}
                              placeholder="e.g. Excellent problem solving..."
                              onBlur={(e) => {
                                handleUpdateStudentMarks(
                                  student,
                                  res?.marksObtained ?? 0,
                                  e.target.value
                                );
                              }}
                              className="w-full min-w-[160px] px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>

                          {/* WhatsApp Result Button */}
                          <td className="py-3 px-4 text-right">
                            {isEntered ? (
                              <button
                                onClick={() => handleSendMarksWhatsApp(student, res)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                                title="Send WhatsApp report to parent"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send WhatsApp</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-300">Enter marks first</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No weekly tests added yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create a new Sunday test to record and evaluate student marks.
          </p>
          <button
            onClick={() => setIsCreatingTest(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
          >
            + Create First Test
          </button>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE NEW WEEKLY TEST
      ===================================================================== */}
      {isCreatingTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Add New Weekly Test
              </h3>
              <button
                onClick={() => setIsCreatingTest(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Test Title
                </label>
                <input
                  type="text"
                  value={newTest.testTitle}
                  onChange={(e) =>
                    setNewTest({ ...newTest, testTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="e.g. Sunday Test 02: Physics Electrostatics Numericals"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Batch / Class
                </label>
                <select
                  value={newTest.courseId}
                  onChange={(e) =>
                    setNewTest({ ...newTest, courseId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newTest.subject}
                    onChange={(e) =>
                      setNewTest({ ...newTest, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    placeholder="e.g. Physics / Mathematics"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={newTest.totalMarks}
                    onChange={(e) =>
                      setNewTest({ ...newTest, totalMarks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-blue-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  value={newTest.testDate}
                  onChange={(e) =>
                    setNewTest({ ...newTest, testDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingTest(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT EXISTING WEEKLY TEST
      ===================================================================== */}
      {editingTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Weekly Test
              </h3>
              <button
                onClick={() => setEditingTest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTestMeta} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Test Title
                </label>
                <input
                  type="text"
                  value={editingTest.testTitle}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, testTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingTest.subject}
                    onChange={(e) =>
                      setEditingTest({ ...editingTest, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={editingTest.totalMarks}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        totalMarks: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-blue-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Date</label>
                <input
                  type="date"
                  value={editingTest.testDate}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, testDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
