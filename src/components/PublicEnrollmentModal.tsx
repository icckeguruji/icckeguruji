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
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY } from '@/lib/supabase';

const makeUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const isValidUuid = (v?: string) =>
  Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));

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

  // Mode: 'new' (New Student) vs 'existing' (Already Enrolled Student buying 2nd course)
  const [enrollMode, setEnrollMode] = useState<'new' | 'existing'>('new');
  const [lookupIdentifier, setLookupIdentifier] = useState('');
  const [existingStudent, setExistingStudent] = useState<{
    id: string;
    full_name: string;
    email: string;
    mobile_number: string;
    username: string;
  } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

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
  const [acceptTerms, setAcceptTerms] = useState(true);
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

  const handleLookupExisting = async () => {
    setErrorMsg('');
    const clean = lookupIdentifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    if (!clean) {
      setErrorMsg('Please enter your registered Mobile Number or Email.');
      return;
    }
    setLookupLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, mobile_number, username, is_active')
        .or(`email.eq.${clean},mobile_number.eq.${digits || clean},username.eq.${clean}`)
        .maybeSingle();

      if (!profile) {
        setErrorMsg('No existing student account found. Please use New Student Registration.');
        setLookupLoading(false);
        return;
      }

      // Check if they have any pending payment right now
      const { data: pendingPays } = await supabase
        .from('payments')
        .select('id, course_id, status')
        .eq('student_id', profile.id)
        .eq('status', 'pending');

      if (pendingPays && pendingPays.length > 0) {
        setErrorMsg('⏳ Approval Pending: You already have a payment pending verification by Director BADE SIR. You cannot submit a new enrollment until it is approved or rejected.');
        setLookupLoading(false);
        return;
      }

      // Check if already approved for THIS course
      const { data: approvedThis } = await supabase
        .from('payments')
        .select('id')
        .eq('student_id', profile.id)
        .eq('course_id', course.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (approvedThis) {
        setErrorMsg('✅ You are already enrolled in this course! Open the ICC Student App and log in with your ID.');
        setLookupLoading(false);
        return;
      }

      if (!profile.is_active) {
        setErrorMsg('⏳ Your previous registration is still pending approval.');
        setLookupLoading(false);
        return;
      }

      setExistingStudent(profile);
      setFullName(profile.full_name);
      setEmail(profile.email);
      setMobileNumber(profile.mobile_number);
      setUsername(profile.username);
    } catch {
      setErrorMsg('Unable to verify account right now. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUtr = utr.trim().toUpperCase();
    if (cleanUtr.length < 8) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    // EXISTING ACTIVE STUDENT FLOW (2nd+ Course — Payment Only, NO new ID!)
    if (enrollMode === 'existing') {
      if (!existingStudent) {
        setErrorMsg('Please verify your existing Mobile Number or Email first.');
        return;
      }
      setLoading(true);
      try {
        const payId = makeUuid();
        const { error: payErr } = await supabase.from('payments').insert({
          id: payId,
          student_id: existingStudent.id,
          course_id: isValidUuid(course.id) ? course.id : null,
          amount: payableAmount,
          upi_ref_number: cleanUtr,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (payErr) throw payErr;

        await supabase.from('enrollments').insert({
          id: makeUuid(),
          student_id: existingStudent.id,
          course_id: isValidUuid(course.id) ? course.id : null,
          status: 'pending',
          enrolled_at: new Date().toISOString(),
        });

        // Notify Admin & Student
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'icckeguruji@gmail.com',
            subject: `💰 [ICC] New Course Payment (Existing Student): ${existingStudent.full_name} — ${course.title}`,
            body: `Existing Student buying another course:\n\nStudent: ${existingStudent.full_name} (${existingStudent.username})\nMobile: ${existingStudent.mobile_number}\nEmail: ${existingStudent.email}\nCourse: ${course.title}\nAmount: ₹${payableAmount}\nUTR: ${cleanUtr}\n\nOpen Admin Dashboard -> Payments to Approve or Reject.`,
          }),
        }).catch(() => {});

        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: existingStudent.email,
            subject: `📩 [ICC] Payment Submitted — ${course.title}`,
            body: `Dear ${existingStudent.full_name},\n\nYour payment of ₹${payableAmount} (UTR: ${cleanUtr}) for ${course.title} has been submitted.\nOnce approved by Director BADE SIR, this course will unlock on your existing login ID (${existingStudent.email} / ${existingStudent.mobile_number}).`,
          }),
        }).catch(() => {});

        setSubmitted(true);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to submit payment. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // NEW STUDENT REGISTRATION FLOW
    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();

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

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        // 1. Check if profile already exists for this Email, Mobile, or Username
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, is_active, full_name, email, mobile_number, username')
          .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanMobile},username.eq.${cleanUsername}`)
          .maybeSingle();

        if (existingProfile) {
          // Check if they have a pending payment right now
          const { data: pendingPays } = await supabase
            .from('payments')
            .select('id')
            .eq('student_id', existingProfile.id)
            .eq('status', 'pending');

          if (pendingPays && pendingPays.length > 0) {
            setErrorMsg(
              '⏳ Approval Pending: Your previous enrollment request is still pending verification by Director BADE SIR. You cannot re-enroll until it is approved or rejected.'
            );
            setLoading(false);
            return;
          }

          if (existingProfile.is_active) {
            setEnrollMode('existing');
            setExistingStudent(existingProfile);
            setErrorMsg(
              'You already have an active Student ID! Switched to Existing Student mode — no need to re-enter details, just confirm your UTR below.'
            );
            setLoading(false);
            return;
          }
        }

        // 2. Create Auth user + pending profile (is_active: false until Admin approves)
        let studentId = '';
        try {
          const ephemeral = createClient(LIVE_SUPABASE_URL, LIVE_SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: authData } = await ephemeral.auth.signUp({
            email: cleanEmail,
            password,
            options: { data: { full_name: cleanName, username: cleanUsername } },
          });
          if (authData?.user?.id) studentId = authData.user.id;
        } catch {}
        if (!studentId) studentId = makeUuid();

        const classNumMatch = (className || '').match(/\d+/);
        const classNum = classNumMatch ? classNumMatch[0].padStart(2, '0') : '10';
        const resolvedClassId = `c0000000-0000-0000-0000-0000000000${classNum}`;

        await supabase.from('profiles').upsert({
          id: studentId,
          username: cleanUsername,
          full_name: cleanName,
          mobile_number: cleanMobile,
          email: cleanEmail,
          board_code: 'BSEB',
          class_id: resolvedClassId,
          district: district,
          school_name: schoolName || 'General',
          preferred_language: 'hi',
          is_active: false, // Requires Admin approval
          updated_at: new Date().toISOString(),
        });

        // 3. Record pending payment for Admin review
        const { error: payErr } = await supabase.from('payments').insert({
          id: makeUuid(),
          student_id: studentId,
          course_id: isValidUuid(course.id) ? course.id : null,
          amount: payableAmount,
          upi_ref_number: cleanUtr,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (payErr) throw payErr;

        // 4. Record pending enrollment
        await supabase.from('enrollments').insert({
          id: makeUuid(),
          student_id: studentId,
          course_id: isValidUuid(course.id) ? course.id : null,
          status: 'pending',
          enrolled_at: new Date().toISOString(),
        });

        // 5. Notify Admin & Student via Email + Push
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'icckeguruji@gmail.com',
            subject: `💰 [ICC] New Enrollment Request: ${cleanName} — ${course.title}`,
            body: `New Student Enrollment & Payment Received!\n\nName: ${cleanName}\nUsername: ${cleanUsername}\nMobile: ${cleanMobile}\nEmail: ${cleanEmail}\nCourse: ${course.title}\nAmount: ₹${payableAmount}\n12-Digit UTR: ${cleanUtr}\n\nOpen ICC Admin Dashboard -> Payments to Approve or Reject.`,
          }),
        }).catch(() => {});

        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: cleanEmail,
            subject: `📩 [ICC] Enrollment Request Received — ${course.title}`,
            body: `Dear ${cleanName},\n\nThank you for enrolling in ${course.title} (₹${payableAmount}).\nYour UTR (${cleanUtr}) has been sent to Director BADE SIR for verification.\n\nOnce approved, you will receive your Login ID confirmation and the ICC Android App download link.`,
          }),
        }).catch(() => {});
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to submit enrollment. Please check your details and try again.');
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

            {/* Mode Switcher: New Student vs Existing Active Student (2nd Course) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEnrollMode('new');
                  setExistingStudent(null);
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition ${
                  enrollMode === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                New Student Registration
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnrollMode('existing');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition ${
                  enrollMode === 'existing' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Already Enrolled? (Add Course)
              </button>
            </div>

            {enrollMode === 'existing' ? (
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  1. Verify Your Existing Student ID (No Re-Registration Needed)
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Registered Mobile Number or Email"
                    value={lookupIdentifier}
                    onChange={(e) => setLookupIdentifier(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleLookupExisting}
                    disabled={lookupLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs whitespace-nowrap"
                  >
                    {lookupLoading ? 'Checking...' : 'Verify ID'}
                  </button>
                </div>
                {existingStudent && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs">✅ Verified: {existingStudent.full_name}</div>
                      <div className="text-[11px] text-emerald-700">
                        {existingStudent.mobile_number} • {existingStudent.email}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Same Login ID
                    </span>
                  </div>
                )}
              </div>
            ) : (
            /* Step 1: Student Registration Information */
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
                      placeholder="e.g. Student Full Name"
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
            )}

            {/* Step 2: Official Dynamic UPI QR Payment */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Scan Dynamic UPI QR / PhonePe / GPay / Paytm
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                {/* Dynamic QR Display */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col items-center p-2 bg-white rounded-xl border-2 border-dashed border-blue-300 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiLink)}`}
                      alt="Dynamic UPI QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg object-contain"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                      Scan with any UPI App
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Amount: {formatINR(payableAmount)}
                    </div>
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

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? 'Copied VPA!' : 'Copy UPI ID'}</span>
                      </button>

                      <a
                        href={upiLink}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <span>Pay in UPI App</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl">
                  💡 <strong>Payment Instructions:</strong> Scan the QR code above or send{' '}
                  <strong className="text-slate-900">{formatINR(payableAmount)}</strong> to <span className="font-mono font-bold text-blue-800">{upiId}</span> using PhonePe, Google Pay, or Paytm. After payment, enter your 12-digit UTR reference below.
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
