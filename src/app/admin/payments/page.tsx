'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { Payment } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileCheck,
  Trash2,
} from 'lucide-react';

export default function PaymentsPage() {
  const { lang, t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPayments = () => {
    setLoading(true);
    AdminApi.getPayments(filterStatus)
      .then((data) => setPayments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  const handleDeletePayment = async (p: Payment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this payment record (Ref: ${p.upi_ref_number})?`
    );
    if (!confirmed) return;
    await AdminApi.deletePayment(p.id);
    setPayments((prev) => prev.filter((item) => item.id !== p.id));
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    const res = await AdminApi.approvePayment(selectedPayment.id, actionRemarks || 'बैंक खाते में राशि सत्यापित हुई');
    setSelectedPayment(null);
    setActionRemarks('');
    setProcessing(false);
    setFeedbackMsg({ type: 'success', text: res.message || 'Payment approved! Student account activated & email notification sent.' });
    loadPayments();
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    const res = await AdminApi.rejectPayment(
      selectedPayment.id,
      actionRemarks || 'अमान्य UTR नंबर अथवा बैंक में राशि प्राप्त नहीं हुई'
    );
    setSelectedPayment(null);
    setActionRemarks('');
    setProcessing(false);
    setFeedbackMsg({ type: 'error', text: res.message || 'Payment rejected. Student details purged; student can re-enroll.' });
    loadPayments();
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="शुल्क भुगतान सत्यापन (Manual UPI Rail)"
        titleEn="Manual UPI Payment Verifications"
        subtitleHi="विद्यार्थियों द्वारा भेजे गए UPI UTR एवं रसीदों की जांच एवं कोर्स एक्टिवेशन"
        subtitleEn="Audit transaction references and activate course enrollments"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Strict Verification Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">
              {t(
                'अनिवार्य सुरक्षा नियम: केवल स्क्रीनशॉट को भुगतान न मानें',
                'Mandatory Security Rule: Cross-Verify with Bank Records'
              )}
            </h4>
            <p className="text-amber-800 leading-relaxed">
              {t(
                'कोर्स एक्टिवेट करने से पूर्व अपने संस्थान के बैंक खाते / UPI ऐप में 12 अंकों का UTR नंबर अवश्य मिलाएं। अनुमोदन (Approval) के उपरांत डेटाबेस ट्रिगर द्वारा विद्यार्थी का कोर्स तुरंत सक्रिय हो जाता है और अपरिवर्तनीय ऑडिट लॉग दर्ज होता है।',
                'Always verify the 12-digit UTR against your bank statement before approving. Approval triggers instant enrollment activation and writes to the immutable audit log.'
              )}
        {/* Official Institute Collection Dynamic QR Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-800">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Institute Collection UPI & QR
            </span>
            <h3 className="text-lg font-bold">
              IDEAL COACHING CENTRE Official UPI QR
            </h3>
            <p className="text-xs text-blue-200 max-w-lg leading-relaxed">
              Students scan this dynamic QR code using PhonePe, Google Pay, Paytm, or BHIM to pay course fees directly into Director BADE SIR account.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="bg-slate-950/60 border border-blue-400/30 px-3 py-1.5 rounded-lg text-xs font-mono">
                UPI ID: <strong className="text-amber-300">azhargodda@ybl</strong>
              </div>
              <div className="bg-slate-950/60 border border-blue-400/30 px-3 py-1.5 rounded-lg text-xs font-mono">
                Director Mobile: <strong className="text-amber-300">+91 9771350910</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-lg border-2 border-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=6&data=${encodeURIComponent('upi://pay?pa=azhargodda@ybl&pn=IDEAL%20COACHING%20CENTRE&cu=INR')}`}
              alt="IDEAL COACHING CENTRE UPI QR Code"
              className="w-32 h-32 rounded-lg"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1">Scan to Pay UPI</span>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-200 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <span className="text-base">{feedbackMsg.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          {[
            { id: 'pending', labelHi: 'लंबित सत्यापन', labelEn: 'Pending Review' },
            { id: 'approved', labelHi: 'स्वीकृत भुगतान', labelEn: 'Approved' },
            { id: 'rejected', labelHi: 'अस्वीकृत', labelEn: 'Rejected' },
            { id: 'all', labelHi: 'सभी भुगतान', labelEn: 'All Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t(tab.labelHi, tab.labelEn)}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('विद्यार्थी', 'Student')}</th>
                <th className="py-3 px-4">{t('कोर्स', 'Course')}</th>
                <th className="py-3 px-4">{t('राशि', 'Amount')}</th>
                <th className="py-3 px-4">{t('UPI / UTR रेफरेंस', 'UPI / UTR Ref')}</th>
                <th className="py-3 px-4">{t('दिनांक', 'Submitted At')}</th>
                <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('सत्यापन', 'Verify')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {t('कोई भुगतान रिकॉर्ड नहीं मिला', 'No payment records found')}
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{p.student?.full_name || 'Student'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">+91 {p.student?.mobile_number}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {p.course?.title || 'BSEB Class 10 Toppers'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{p.upi_ref_number}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('जांच बाकी', 'Pending')}
                        </span>
                      )}
                      {p.status === 'approved' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t('स्वीकृत', 'Approved')}
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('अस्वीकृत', 'Rejected')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setActionRemarks('');
                          }}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                          {p.status === 'pending' ? t('जांचें एवं निर्णय लें', 'Audit & Decide') : t('विवरण', 'View Details')}
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p)}
                          title="Delete Payment Record"
                          className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Verification Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('भुगतान सत्यापन एवं कोर्स सक्रियण', 'Verify Payment & Activate Enrollment')}
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('विद्यार्थी', 'Student')}</span>
                  <span className="font-bold text-slate-800">{selectedPayment.student?.full_name}</span>
                  <span className="text-slate-500 block text-[10px]">+91 {selectedPayment.student?.mobile_number}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('कोर्स एवं राशि', 'Course & Amount')}</span>
                  <span className="font-bold text-slate-800 block truncate">{selectedPayment.course?.title}</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatINR(selectedPayment.amount)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                <span className="text-blue-900 font-bold block">{t('प्रस्तुत UPI / UTR रेफरेंस नंबर:', 'Submitted UPI Reference Number:')}</span>
                <span className="font-mono text-sm font-bold text-blue-950 select-all block bg-white px-2 py-1 rounded border border-blue-200">
                  {selectedPayment.upi_ref_number}
                </span>
              </div>

              {selectedPayment.screenshot_url && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700">{t('रसीद का स्क्रीनशॉट:', 'Payment Screenshot:')}</span>
                  <div className="h-44 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img
                      src={selectedPayment.screenshot_url}
                      alt="Receipt"
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending' ? (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('निर्णय टिप्पणी', 'Admin Remarks')}
                    </label>
                    <input
                      type="text"
                      value={actionRemarks}
                      onChange={(e) => setActionRemarks(e.target.value)}
                      placeholder={t('उदा. बैंक स्टेटमेंट में राशि प्राप्त हुई', 'e.g. Verified in SBI bank statement')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold transition"
                    >
                      {t('अस्वीकार करें', 'Reject Payment')}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition"
                    >
                      {t('स्वीकार करें एवं कोर्स एक्टिवेट करें', 'Approve & Activate Enrollment')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-between items-center text-xs">
                  <div className="text-slate-500">
                    <p>{t('समीक्षा टिप्पणी:', 'Audit Remarks:')} {selectedPayment.admin_remarks || 'None'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                  >
                    {t('बंद करें', 'Close')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
