'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Sparkles,
  QrCode,
  Lock,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Zap
} from 'lucide-react';
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
      setError('Please enter a valid 12-digit UTR or Transaction Reference Number from your UPI receipt.');
      return;
    }
    if (!studentName.trim() || !studentPhone.trim()) {
      setError('Please enter your full Name and Mobile Number for watermark & verification.');
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
      enrolledCourseIds: Array.from(new Set([...currentUser.enrolledCourseIds, course.id])),
    };

    saveStoredData('PAYMENTS', updatedPayments);
    saveStoredData('USER', updatedUser);

    onSuccess(updatedUser);
  };

  const discountPercent = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4.5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">Direct UPI Checkout</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  0% Commission
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Official Account: <strong className="text-white">{config.coachingName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white relative z-10 active:scale-95"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* =========================================================================
              SUCCESS STATE
          ========================================================================= */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-black">
                Verification in Progress
              </span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">
                Payment Request Submitted!
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Thank you! Your UTR has been submitted to the institute administration for instant verification.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4.5 text-left max-w-md mx-auto text-xs sm:text-sm border border-slate-200/90 space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Selected Batch:</span>
                <span className="font-extrabold text-slate-900 text-right truncate max-w-[200px]">{course.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-black text-emerald-600 text-base">₹{course.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Submitted UTR:</span>
                <span className="font-mono font-black text-indigo-600">{utrNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Pending Admin Approval
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={handleInstantDemoApproval}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Instant Self-Approve (Demo Test)</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 transition-colors"
              >
                Close &amp; View Batches
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              CHECKOUT FORM & QR DISPLAY
          ========================================================================= */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: QR Code & UPI Details */}
            <div className="flex flex-col items-center justify-between bg-slate-50/80 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-full space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-blue-600 font-black">
                  Step 1 • Scan via Any UPI App
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">₹{course.price}</div>
                  {discountPercent > 0 && (
                    <span className="text-xs text-slate-400 line-through font-mono">₹{course.originalPrice}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic QR Container with Scanner Accents */}
              <div className="relative p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 my-3 inline-block group">
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-600 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-600 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-600 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-600 rounded-br-sm pointer-events-none" />
                
                <QRCodeSVG
                  value={upiUri}
                  size={175}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg',
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              {/* Supported apps */}
              <div className="w-full space-y-2.5">
                <div className="text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1">
                  <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span> • <span>Cred</span>
                </div>

                {/* Mobile Direct Intent Button */}
                <a
                  href={upiUri}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-sm md:hidden"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Tap to Pay Directly in UPI App</span>
                </a>

                {/* Copyable Details */}
                <div className="w-full bg-white rounded-xl p-3 border border-slate-200/90 text-left text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">UPI ID:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(config.upiId, 'upi')}
                      className="flex items-center gap-1 font-mono font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Click to copy UPI ID"
                    >
                      <span>{config.upiId}</span>
                      {copiedUpi ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Payee Name:</span>
                    <span className="font-extrabold text-slate-800">{config.merchantName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Exact Amount:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(course.price.toString(), 'amount')}
                      className="flex items-center gap-1 font-mono font-black text-emerald-600 hover:text-emerald-700"
                    >
                      <span>₹{course.price}</span>
                      {copiedAmount ? (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: UTR & Verification Form */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    Step 2 • Submit UTR Reference
                  </h4>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                    Fast Track
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  After completing the payment in your app, enter your 12-digit <strong>UTR or Transaction Reference Number</strong> below.
                </p>

                {error && (
                  <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{error}</span>
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp / Mobile Number * (Used for Moving Watermark)
                    </label>
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        12-Digit UPI Ref / UTR Number *
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Found on UPI receipt
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 428938472910"
                      maxLength={20}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-indigo-400/80 rounded-xl text-sm font-mono font-black text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Commonly named &quot;UPI Ref No&quot;, &quot;UTR&quot;, or &quot;Google Transaction ID&quot;.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Submitting Reference...'
                  ) : (
                    <>
                      <span>Submit UTR &amp; Activate Membership</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleInstantDemoApproval}
                    className="text-xs text-amber-700 hover:text-amber-800 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Testing: Instant Auto-Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
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
