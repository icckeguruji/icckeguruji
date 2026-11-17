'use client';

import React, { useState } from 'react';
import { Course } from '@icc/shared-types';
import { formatINR } from '@icc/shared-utils';
import {
  X,
  CheckCircle2,
  Copy,
  ArrowRight,
  ExternalLink,
  Lock,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles,
  School,
  MapPin,
  GraduationCap,
  ShieldCheck,
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

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [district, setDistrict] = useState('Godda');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
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

  const handleAutoFillUsername = (enteredName: string) => {
    setFullName(enteredName);
    if (!username) {
      const slug = enteredName.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 15);
      if (slug) setUsername(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanUtr = utr.trim().toUpperCase();

    if (!cleanName || cleanName.length < 3) {
      setErrorMsg('Please enter your full legal name (minimum 3 characters).');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Please enter a username (minimum 3 characters).');
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your Date of Birth.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter confirm password.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must agree to the Terms and Conditions to proceed.');
      return;
    }
    if (cleanUtr.length < 8) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        // 1. Check if an approved active account already exists
        let existingActive = null;
        try {
          const res = await supabase
            .from('profiles')
            .select('id, is_active')
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanMobile},username.eq.${cleanUsername}`)
            .eq('is_active', true)
            .maybeSingle();
          if (res.data) existingActive = res.data;
        } catch {}

        if (existingActive) {
          setErrorMsg(
            'An approved student ID already exists for this Email, Mobile, or Username. Please sign in directly in the student app.'
          );
          setLoading(false);
          return;
        }

        // If a rejected or old unapproved application existed, purge it so the student can re-enroll cleanly
        try {
          await supabase
            .from('profiles')
            .delete()
            .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanMobile}`)
            .eq('is_active', false);
        } catch {}

        // 2. Create pending student record (is_active: false until admin approves)
        const studentId = `std-${Date.now()}`;
        const studentRecord = {
          id: studentId,
          username: cleanUsername,
          full_name: cleanName,
          mobile_number: cleanMobile,
          email: cleanEmail,
          dob: dob,
          board_code: 'BSEB',
          class_id: className,
          district: district,
          school_name: schoolName || 'General',
          is_active: false, // Requires Admin approval
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').insert(studentRecord);
        } catch {}

        // 3. Record pending payment for Admin review
        await supabase.from('payments').insert({
          id: `pay-${Date.now()}`,
          student_id: studentId,
          course_id: course.id,
          amount: payableAmount,
          utr_number: cleanUtr,
          status: 'pending',
          student_name: cleanName,
          student_phone: cleanMobile,
          student_email: cleanEmail,
          course_title: course.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // 4. Record pending enrollment
        await supabase.from('enrollments').insert({
          id: `enr-${Date.now()}`,
          student_id: studentId,
          course_id: course.id,
          status: 'pending',
          enrolled_at: new Date().toISOString(),
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
                Course Enrollment & Student Registration
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white mt-1 leading-snug">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Submission Success State */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900">
                Enrollment Application Submitted!
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Thank you, <strong className="text-slate-900">{fullName}</strong>! Your enrollment application for{' '}
                <strong className="text-slate-900">{course.title}</strong> with UTR{' '}
                <strong className="font-mono text-blue-700">{utr}</strong> has been forwarded to Director BADE SIR for verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2 text-xs text-blue-900">
              <div className="font-bold flex items-center space-x-1.5 text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Next Steps for Student Access:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-blue-700">
                <li>Administration will verify your 12-digit UTR against the institute bank account.</li>
                <li>Upon approval, your login ID and course access will activate automatically.</li>
                <li>You will receive an email confirmation once verified.</li>
                <li>If payment is rejected, your pending record is reset so you can re-apply with the correct UTR.</li>
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
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Payable Course Fee</span>
                <span className="text-xl font-black text-slate-900">{formatINR(payableAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {course.validity_days || 365} Days Full Access
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Dir: BADE SIR</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 1: Student Registration Information */}
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
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Kumar"
                      value={fullName}
                      onChange={(e) => handleAutoFillUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Choose Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. rohit_kumar"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none lowercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
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
                    Class / Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Class 10">Class 10 (Matric)</option>
                    <option value="Class 12">Class 12 (Intermediate Science/Arts)</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 11">Class 11</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Godda / Patna"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    School / College Name (Optional)
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. High School Mahagama"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Official UPI Payment Details (No external dynamic QR) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Official Manual UPI Payment Rail
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Official Institute UPI VPA
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-base select-all block mt-0.5">
                      {upiId}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Payee: <strong>{payeeName}</strong> (Director: BADE SIR)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied VPA!' : 'Copy UPI ID'}</span>
                    </button>

                    <a
                      href={upiLink}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <span>Pay in UPI App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl">
                  💡 <strong>Payment Instructions:</strong> Open your PhonePe, Google Pay, or Paytm app. Send{' '}
                  <strong className="text-slate-900">{formatINR(payableAmount)}</strong> to <span className="font-mono font-bold text-blue-800">{upiId}</span>. After completing payment, copy the 12-digit UTR number from your payment receipt and enter it below.
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
                  Enter 12-Digit UPI Transaction Reference (UTR)
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
                  The 12-digit UPI Transaction ID is listed on your PhonePe / GPay / Paytm payment confirmation.
                </p>
              </div>

              {/* Terms & Conditions Acceptance */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-[11px] text-slate-600">
                    I agree to the <strong>Terms and Conditions</strong> of IDEAL COACHING CENTRE and understand that my course access will be activated upon manual verification of my UTR by the institute administration.
                  </span>
                </label>
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
