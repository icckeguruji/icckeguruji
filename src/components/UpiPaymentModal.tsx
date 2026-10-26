'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ShieldCheck, AlertCircle, ArrowRight, Smartphone, Sparkles, QrCode } from 'lucide-react';
import { Course, CoachingConfig, PaymentRequest, User } from '@/types';
import { getStoredData, saveStoredData } from '@/lib/storage';

interface UpiPaymentModalProps {
  course: Course;
  config: CoachingConfig;
  currentUser: User;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

export default function UpiPaymentModal({
  course,
  config,
  currentUser,
  onClose,
  onSuccess,
}: UpiPaymentModalProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [studentName, setStudentName] = useState(currentUser.name || '');
  const [studentPhone, setStudentPhone] = useState(currentUser.phone || '');
  const [studentEmail, setStudentEmail] = useState(currentUser.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Standard UPI URI protocol specification
  const upiUri = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.merchantName)}&am=${course.price}&tn=${encodeURIComponent(`Course-${course.id}`)}&cu=INR`;

  const copyToClipboard = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setError('Please enter a valid 12-digit UTR or Transaction Reference Number.');
      return;
    }
    if (!studentName.trim() || !studentPhone.trim()) {
      setError('Please enter your Name and Mobile Number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = getStoredData();
      const newPayment: PaymentRequest = {
        id: `pay-${Date.now()}`,
        userId: currentUser.id,
        userName: studentName.trim(),
        userPhone: studentPhone.trim(),
        userEmail: studentEmail.trim() || `${studentPhone.trim()}@student.local`,
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        utrNumber: cleanUtr,
        upiIdUsed: config.upiId,
        status: 'pending',
        createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };

      const updatedPayments = [newPayment, ...data.payments];
      saveStoredData('PAYMENTS', updatedPayments);

      // Trigger automatic email alert to Guruji/Admin
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_alert_to_admin',
          to: config.contactEmail || 'admin@icckeguruji.com',
          studentName: studentName.trim(),
          studentPhone: studentPhone.trim(),
          courseTitle: course.title,
          amount: course.price,
          utr: cleanUtr,
        }),
      }).catch((emailErr) => console.warn('Payment email alert failed:', emailErr));

      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Submission error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Instant demo approve for quick testing
  const handleInstantDemoApproval = () => {
    const data = getStoredData();
    const cleanUtr = utrNumber.trim() || `TEST-${Date.now().toString().slice(-6)}`;

    const approvedPayment: PaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: currentUser.id,
      userName: studentName.trim() || currentUser.name,
      userPhone: studentPhone.trim() || currentUser.phone,
      userEmail: studentEmail.trim() || currentUser.email,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      utrNumber: cleanUtr,
      upiIdUsed: config.upiId,
      status: 'approved',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    const updatedPayments = [approvedPayment, ...data.payments];
    const updatedUser: User = {
      ...currentUser,
      name: studentName.trim() || currentUser.name,
      phone: studentPhone.trim() || currentUser.phone,
      enrolledCourseIds: Array.from(new Set([...currentUser.enrolledCourseIds, course.id]))
    };

    saveStoredData('PAYMENTS', updatedPayments);
    saveStoredData('USER', updatedUser);

    onSuccess(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Direct UPI Payment • {config.coachingName}</h3>
              <p className="text-xs text-blue-100 font-medium">0% Extra Commission • Direct Coaching Bank Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Payment Request Submitted!</h4>
            <div className="bg-slate-50 rounded-2xl p-4 text-left max-w-md mx-auto text-sm border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-bold text-slate-800">{course.title.slice(0, 32)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-extrabold text-emerald-600">₹{course.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted UTR:</span>
                <span className="font-mono font-bold text-indigo-600">{utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Pending Verification
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Your membership will be activated as soon as your UTR is verified.
              You can also approve it instantly via the Admin Panel in 1-Click for demo testing.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleInstantDemoApproval}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Instant Demo Approve (Self-Test)
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 transition-colors"
              >
                Close &amp; View Batches
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: QR Code & UPI Details */}
            <div className="flex flex-col items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-full space-y-1">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Scan to Pay via Any UPI App</div>
                <div className="text-3xl font-black text-slate-900">₹{course.price}</div>
                <div className="text-xs text-slate-400 line-through">MRP: ₹{course.originalPrice}</div>
              </div>

              {/* Dynamic QR Code in clean container */}
              <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 my-3 inline-block">
                <QRCodeSVG
                  value={upiUri}
                  size={180}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              {/* Supported apps */}
              <div className="w-full space-y-2">
                <div className="text-[11px] text-slate-500 font-semibold">GPay • PhonePe • Paytm • BHIM • Cred</div>

                {/* Mobile Direct Intent Button */}
                <a
                  href={upiUri}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-sm md:hidden"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Tap to Pay in UPI App Directly
                </a>

                {/* Copyable Details */}
                <div className="w-full bg-white rounded-xl p-3 border border-slate-200 text-left text-xs space-y-1.5 mt-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Coaching UPI ID:</span>
                    <button
                      onClick={() => copyToClipboard(config.upiId, 'upi')}
                      className="flex items-center gap-1 font-mono font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      {config.upiId}
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Payee Name:</span>
                    <span className="font-bold text-slate-800">{config.merchantName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: UTR & Verification Form */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Step 2: Enter Payment Details</h4>
                <p className="text-xs text-slate-500 mb-3">
                  After completing the payment, locate the 12-digit **UTR / Reference ID** on your UPI receipt and enter it below.
                </p>

                {error && (
                  <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp / Mobile Number * (For Moving Watermark)
                    </label>
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12-Digit UPI Ref / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 428938472910"
                      maxLength={20}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-blue-400 rounded-xl text-sm font-mono font-bold text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Look for "UPI Transaction ID" or "UTR" on your PhonePe/GPay/Paytm receipt.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit UTR & Activate Membership'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleInstantDemoApproval}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Quick Testing: Instant Auto-Approve
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
