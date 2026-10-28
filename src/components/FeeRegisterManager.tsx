'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Send,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  X,
  Download
} from 'lucide-react';
import { User, Course, FeeRecord } from '@/types';
import { saveStoredData, getStoredData } from '@/lib/storage';

interface FeeRegisterManagerProps {
  students: User[];
  courses: Course[];
  feeRecords: FeeRecord[];
  onUpdate: () => void;
}

export default function FeeRegisterManager({
  students,
  courses,
  feeRecords,
  onUpdate,
}: FeeRegisterManagerProps) {
  const [filterType, setFilterType] = useState<'all' | 'due' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState<{
    student: User;
    record?: FeeRecord;
  } | null>(null);

  // New Payment Form State
  const [newPayment, setNewPayment] = useState(() => {
    let curMonth = 'October 2026';
    try {
      curMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      // fallback
    }
    return {
      studentId: students[0]?.id || '',
      amountPaid: 1000,
      dueRemaining: 0,
      month: curMonth,
      paymentMode: 'Cash' as 'Cash' | 'PhonePe / GPay' | 'Paytm' | 'Bank Transfer',
      remarks: 'Regular monthly fee payment',
    };
  });

  // Filter students based on fee status
  const filteredStudents = students.filter((student) => {
    const due = student.feesDue ?? 0;
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'due' && due > 0) ||
      (filterType === 'paid' && due === 0);

    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.phone.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Calculate totals
  const totalMonthlyExpected = students.reduce(
    (acc, s) => acc + (s.monthlyFee || 1000),
    0
  );
  const totalDue = students.reduce((acc, s) => acc + (s.feesDue ?? 0), 0);
  const totalCollectedFromRecords = feeRecords.reduce(
    (acc, r) => acc + r.amountPaid,
    0
  );

  // Handle Recording a New Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === newPayment.studentId);
    if (!student) return;

    const receiptNo = `ICC-${Date.now().toString().slice(-6)}`;
    const studentCourse =
      courses.find((c) => (student.enrolledCourseIds || []).includes(c.id))?.title ||
      'Class Batch';

    const newRecord: FeeRecord = {
      id: `fee-${Date.now()}`,
      receiptNo,
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      fatherName: student.fatherName || 'Parent / Guardian',
      courseTitle: studentCourse,
      month: newPayment.month,
      amountPaid: Number(newPayment.amountPaid),
      dueRemaining: Number(newPayment.dueRemaining),
      paymentMode: newPayment.paymentMode,
      date: new Date().toISOString().split('T')[0],
      remarks: newPayment.remarks,
    };

    // Update student's feesDue in student list
    const updatedStudents = students.map((s) => {
      if (s.id === student.id) {
        return {
          ...s,
          feesDue: Number(newPayment.dueRemaining),
        };
      }
      return s;
    });

    const updatedRecords = [newRecord, ...feeRecords];

    saveStoredData('FEE_RECORDS', updatedRecords);
    saveStoredData('STUDENTS', updatedStudents);

    const stored = getStoredData();
    if (stored.user && (stored.user.id === student.id || stored.user.phone === student.phone)) {
      saveStoredData('USER', {
        ...stored.user,
        feesDue: Number(newPayment.dueRemaining),
      });
    }

    setIsAddingPayment(false);
    onUpdate();

    // Open receipt modal immediately
    setSelectedStudentForSlip({ student, record: newRecord });
  };

  // 1-Click WhatsApp Fee Due Reminder
  const handleSendFeeReminderWhatsApp = (student: User) => {
    const rawDigits = student.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const currentMonth = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const due = student.feesDue ?? 0;

    const msg = encodeURIComponent(
      `Dear Parent,\n\nGreetings from *ICC KE GURUJI* Coaching Institute.\n\nStudent: *${student.name}* (Roll: ${student.rollNo || 'N/A'})\nMonth: *${currentMonth}*\nPending Due Fees: *₹${due}*\n\nPlease arrange for the timely payment of the outstanding fee so your child's classes continue without interruption. You may pay in cash at the institute or online via UPI/PhonePe/GPay.\n\nThank you,\n*ICC KE GURUJI*\nHelpline: +91 98765 43210`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // Delete a fee record
  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this fee receipt record?')) {
      const updated = feeRecords.filter((r) => r.id !== id);
      saveStoredData('FEE_RECORDS', updated);
      onUpdate();
    }
  };

  // Export Fee Ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Mobile Number', 'Father Name', 'Monthly Fee', 'Due Remaining', 'Status'];
    const rows = filteredStudents.map((s, idx) => {
      const due = s.feesDue ?? 0;
      const status = due === 0 ? 'PAID' : 'DUE';
      return [
        s.rollNo || idx + 1,
        `"${s.name.replace(/"/g, '""')}"`,
        s.phone,
        `"${(s.fatherName || 'Parent / Guardian').replace(/"/g, '""')}"`,
        s.monthlyFee || 1000,
        due,
        status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Fees & Dues
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage student monthly fees, outstanding dues, print official receipts, and send instant WhatsApp reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Download Excel/CSV Fee Sheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddingPayment(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500">Monthly Expected Fees</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalMonthlyExpected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{students.length} Total Enrolled Students</div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-emerald-700">Total Fees Collected</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            ₹{totalCollectedFromRecords.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{feeRecords.length} Receipts Issued</div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-rose-700">Total Outstanding Dues</div>
          <div className="text-2xl font-black text-rose-900 mt-1">
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">
            {students.filter((s) => (s.feesDue ?? 0) > 0).length} students have pending dues
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'due'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            With Dues ({students.filter((s) => (s.feesDue ?? 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            Fully Paid ({students.filter((s) => (s.feesDue ?? 0) === 0).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Name, Roll No, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Student Fees Register Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px]">
                <th className="py-3 px-4">Roll / Student</th>
                <th className="py-3 px-4">Father&apos;s Name &amp; Phone</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Outstanding Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const due = student.feesDue ?? 0;
                  const latestRecord = feeRecords.find((r) => r.studentId === student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Roll */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {student.rollNo && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                              {student.rollNo}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {student.address || 'Enrolled Student'}
                        </div>
                      </td>

                      {/* Father & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">
                          {student.fatherName || 'Parent / Guardian'}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {student.phone}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        ₹{(student.monthlyFee || 1000).toLocaleString('en-IN')}/mo
                      </td>

                      {/* Due Amount */}
                      <td className="py-3.5 px-4">
                        {due > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-xs">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            ₹{due.toLocaleString('en-IN')} Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Paid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => {
                              setNewPayment({
                                studentId: student.id,
                                amountPaid: due > 0 ? due : (student.monthlyFee || 1000),
                                dueRemaining: 0,
                                month: new Date().toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric',
                                }),
                                paymentMode: 'Cash',
                                remarks: 'Monthly fee payment',
                              });
                              setIsAddingPayment(true);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                            title="Record Fee Payment"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>

                          {/* Print Receipt Slip */}
                          <button
                            onClick={() =>
                              setSelectedStudentForSlip({
                                student,
                                record: latestRecord,
                              })
                            }
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                            title="View & Print Official Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {/* WhatsApp Reminder if due */}
                          {due > 0 && (
                            <button
                              onClick={() => handleSendFeeReminderWhatsApp(student)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                              title="Send WhatsApp Fee Reminder"
                            >
                              <Send className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Fee Receipts History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          Recent Fee Receipts History
        </h3>

        {feeRecords.length === 0 ? (
          <p className="text-xs text-slate-400">No receipts issued yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {feeRecords.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/70 hover:bg-white transition-all space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {rec.receiptNo}
                  </span>
                  <span className="text-[10px] text-slate-400">{rec.date}</span>
                </div>

                <div>
                  <div className="font-black text-sm text-slate-900">{rec.studentName}</div>
                  <div className="text-[11px] text-slate-500">Month: {rec.month} • {rec.paymentMode}</div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="font-black text-emerald-600 text-xs">
                    ₹{rec.amountPaid.toLocaleString('en-IN')} Paid
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const st = students.find((s) => s.id === rec.studentId) || {
                          id: rec.studentId,
                          name: rec.studentName,
                          phone: rec.studentPhone,
                          email: '',
                          role: 'student' as const,
                          enrolledCourseIds: [],
                          fatherName: rec.fatherName,
                        };
                        setSelectedStudentForSlip({ student: st, record: rec });
                      }}
                      className="p-1 rounded text-slate-500 hover:text-blue-600"
                      title="Print Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: RECORD FEE PAYMENT
      ===================================================================== */}
      {isAddingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Record Fee Payment
              </h3>
              <button
                onClick={() => setIsAddingPayment(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={newPayment.studentId}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setNewPayment({
                      ...newPayment,
                      studentId: e.target.value,
                      amountPaid: st?.feesDue && st.feesDue > 0 ? st.feesDue : (st?.monthlyFee || 1000),
                      dueRemaining: 0,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo || 'ICC'}) — ₹{s.feesDue ?? 0} Due
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Month / Session
                </label>
                <input
                  type="text"
                  value={newPayment.month}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, month: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="e.g. October 2026"
                  required
                />
              </div>

              {/* Amount Paid & Due Remaining */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={newPayment.amountPaid}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        amountPaid: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-black text-sm text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Remaining Due (₹)
                  </label>
                  <input
                    type="number"
                    value={newPayment.dueRemaining}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        dueRemaining: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm text-rose-700"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={newPayment.paymentMode}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      paymentMode: e.target.value as typeof newPayment.paymentMode,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="PhonePe / GPay">PhonePe / Google Pay</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={newPayment.remarks}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  placeholder="e.g. Full monthly fee paid"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingPayment(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Save & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: BEAUTIFUL PRINTABLE FEE RECEIPT SLIP
      ===================================================================== */}
      {selectedStudentForSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            {/* Modal Controls */}
            <div className="flex items-center justify-between no-print border-b border-slate-100 pb-3">
              <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                ICC KE GURUJI — Official Fee Receipt
              </span>
              <button
                onClick={() => setSelectedStudentForSlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Container */}
            <div
              id="printable-slip"
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-amber-50/20 space-y-4 text-slate-900"
            >
              {/* Slip Header */}
              <div className="text-center border-b border-slate-200 pb-3 space-y-1">
                <h2 className="text-xl font-black text-blue-900 tracking-tight">
                  ICC KE GURUJI
                </h2>
                <p className="text-[11px] font-bold text-slate-600">
                  Coaching Institute • Classes 9th, 10th, 11th, 12th & Board Specialists
                </p>
                <p className="text-[10px] text-slate-400">
                  Helpline / WhatsApp: +91 98765 43210
                </p>
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                  Receipt No: {selectedStudentForSlip.record?.receiptNo || 'ICC-FEE-REC'}
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Student Name:</span>
                  <div className="font-black text-slate-900">
                    {selectedStudentForSlip.student.name}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Roll No:</span>
                  <div className="font-mono font-bold text-slate-800">
                    {selectedStudentForSlip.student.rollNo || 'ICC-REG'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Father&apos;s Name:</span>
                  <div className="font-bold text-slate-800">
                    {selectedStudentForSlip.student.fatherName || 'Parent / Guardian'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Mobile No:</span>
                  <div className="font-mono text-slate-800">
                    {selectedStudentForSlip.student.phone}
                  </div>
                </div>
              </div>

              {/* Fee Details Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Month / Session:</span>
                  <span className="font-bold">
                    {selectedStudentForSlip.record?.month || 'October 2026'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span className="font-bold">
                    {selectedStudentForSlip.record?.paymentMode || 'Cash'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-emerald-700">
                  <span>Amount Received:</span>
                  <span>
                    ₹{(selectedStudentForSlip.record?.amountPaid || selectedStudentForSlip.student.monthlyFee || 1000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Remaining Balance Due:</span>
                  <span className="font-bold text-rose-600">
                    ₹{(selectedStudentForSlip.record?.dueRemaining ?? selectedStudentForSlip.student.feesDue ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Signature / Stamp Footer */}
              <div className="pt-4 flex items-end justify-between text-[11px]">
                <div className="text-slate-400">
                  Date: {selectedStudentForSlip.record?.date || '2026-10-26'}
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-400 mb-1" />
                  <span className="font-bold text-slate-700">Guruji&apos;s Signature / Stamp</span>
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 no-print">
              <button
                onClick={() => setSelectedStudentForSlip(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
