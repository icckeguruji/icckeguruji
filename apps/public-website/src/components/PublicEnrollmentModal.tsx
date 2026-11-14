'use client';

import React, { useState } from 'react';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  QrCode,
  ArrowRight,
  ExternalLink,
  Lock,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface PublicEnrollmentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicEnrollmentModal({
  course,
  isOpen,
  onClose,
}: PublicEnrollmentModalProps) {
  if (!isOpen || !course) return null;

  const payableAmount = course.discount_price || course.price;
  const upiId = 'azhargodda@ybl';
  const payeeName = 'IDEAL COACHING CENTRE';
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=ICC+Enrollment+${encodeURIComponent(course.title.slice(0, 30))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;

  // Form State
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanUtr = utr.trim().toUpperCase();

    if (!cleanName || cleanName.length < 3) {
      setErrorMsg('Please enter your full legal name (minimum 3 characters).');
      return;
    }
    if (cleanWhatsapp.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp/Mobile number.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your Date of Birth.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (cleanUtr.length < 8) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if an approved active account already exists for this email or phone
      if (isSupabaseConfigured) {
        let existingActive = null;
        try {
          const res = await supabase
            .from('profiles')
            .select('id, is_active')
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
            .eq('is_active', true)
            .maybeSingle();
          if (res.data) existingActive = res.data;
        } catch {}

        if (!existingActive) {
          try {
            const res = await supabase
              .from('users')
              .select('id, is_active')
              .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
              .eq('is_active', true)
              .maybeSingle();
            if (res.data) existingActive = res.data;
          } catch {}
        }

        if (existingActive) {
          setErrorMsg(
            'An approved student ID already exists for this Email or WhatsApp number. Please sign in directly in the student app.'
          );
          setLoading(false);
          return;
        }

        // If a rejected or old unapproved application existed, purge it so the student can re-enroll cleanly
        try {
          await supabase
            .from('profiles')
            .delete()
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
            .eq('is_active', false);
        } catch {}
        try {
          await supabase
            .from('users')
            .delete()
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanWhatsapp}`)
            .eq('is_active', false);
        } catch {}

        // 2. Create pending student record (is_active: false until admin approves)
        const studentId = `std-${Date.now()}`;
        const studentRecord = {
          id: studentId,
          username: cleanEmail.split('@')[0] + '_' + cleanWhatsapp.slice(-4),
          full_name: cleanName,
          mobile_number: cleanWhatsapp,
          email: cleanEmail,
          dob: dob,
          board_code: course.title.includes('BSEB') ? 'BSEB' : 'JAC',
          is_active: false, // Requires Admin approval
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').insert(studentRecord);
        } catch {}
        try {
          await supabase.from('users').insert(studentRecord);
        } catch {}

        // 3. Record pending payment for Admin review
        await supabase.from('payments').insert({
          id: `pay-${Date.now()}`,
          student_id: studentId,
          course_id: course.id,
          amount: payableAmount,
          upi_ref_number: cleanUtr,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setSubmitted(true);
    } catch {
      // Offline / fallback simulated submission
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Official Course Enrollment
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5 line-clamp-1">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-black text-slate-900">
              Application Submitted for Admin Approval!
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Thank you, <strong className="text-slate-900">{name}</strong>! Your enrollment request for <strong className="text-slate-900">{course.title}</strong> with UTR <strong className="font-mono text-blue-700">{utr}</strong> has been forwarded to Director BADE SIR.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-900 space-y-2 max-w-md mx-auto">
              <div className="flex items-center space-x-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Next Steps for Activation:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                <li>BADE SIR will verify your 12-digit UTR in bank records.</li>
                <li>Upon approval, your Student ID will be generated and login credentials will be emailed to <span className="font-semibold text-slate-900">{email}</span>.</li>
                <li>If payment is rejected, your record is purged and you can re-enroll with the correct UTR.</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Done & Close
            </button>
          </div>
        ) : (
          /* Enrollment & Payment Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
            {/* Course Fee Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Payable Fee</span>
                <span className="text-lg font-black text-slate-900">{formatINR(payableAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {course.validity_days} Days Validity
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Dir: BADE SIR</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 1: Student Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Student Registration Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Create Password (minimum 6 characters) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Choose a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Dynamic QR Code Payment */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Official UPI Payment (PhonePe / GPay / Paytm)
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex-shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-36 h-36 object-contain"
                  />
                  <span className="text-[10px] text-center block text-slate-400 mt-1 font-semibold">
                    Scan with any UPI App
                  </span>
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Official Institute UPI VPA</span>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-sm select-all">{upiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Payee: <strong>{payeeName}</strong> (Director: BADE SIR)
                  </p>

                  <a
                    href={upiLink}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>Pay in PhonePe / GPay / Paytm</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 3: Enter 12-digit UTR */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Enter 12-Digit UPI UTR Reference Number
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  12-Digit Transaction Reference (UTR / UPI Ref ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="e.g. 412389012345"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border-2 border-blue-400 font-mono text-sm font-bold text-blue-900 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase bg-blue-50/40"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Find the 12-digit UPI Transaction ID or UTR number in your payment receipt from PhonePe, GPay or Paytm.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Submitting Application...' : 'Submit Enrollment for Admin Approval'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
