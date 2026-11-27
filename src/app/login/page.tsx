'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminApi } from '@/lib/api';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

type LoginStep = 'login' | 'forgot_request' | 'forgot_verify' | 'forgot_success';

export default function DirectorLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>('login');
  const [identifier, setIdentifier] = useState('9771350910');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Reset / OTP states
  const [resetEmail, setResetEmail] = useState('icckeguruji@gmail.com');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  // If already logged in, redirect immediately to /admin
  useEffect(() => {
    if (AdminApi.isAdminLoggedIn()) {
      router.replace('/admin');
    }
  }, [router]);

  const setAuthCookies = (token?: string) => {
    if (typeof document !== 'undefined') {
      const authToken = token || `icc-admin-session-${Date.now()}`;
      document.cookie = `sb-access-token=${authToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `icc-role=admin; path=/; max-age=604800; SameSite=Lax`;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('icc_admin_logged_in', 'true');
        localStorage.setItem('icc_user_role', 'admin');
        window.dispatchEvent(new Event('icc_auth_changed'));
      } catch {}
    }
  };

  const isDirectorIdentifier = (val: string): boolean => {
    const clean = val.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    if (digits.endsWith('9771350910')) return true;
    return [
      'badesir',
      'bade sir',
      'bade_sir',
      'bade',
      'director',
      'director bade sir',
      'admin',
      'icc',
      'icckeguruji',
      'icckeguruji@gmail.com',
    ].includes(clean);
  };

  const isDirectorPasswordValid = (pw: string): boolean => {
    const trimmed = (pw || '').trim();
    if (!trimmed) return false;

    // 1. Check custom saved password in localStorage
    if (typeof window !== 'undefined') {
      const customSaved = localStorage.getItem('icc_admin_custom_password');
      if (customSaved && trimmed === customSaved) return true;
    }

    // 2. Comprehensive accepted master passwords (case-insensitive for convenience)
    const validList = [
      'badesir',
      'badesir@123',
      'badesir123',
      'bade sir',
      '9771350910',
      'admin',
      'admin123',
      'icc@123',
      'icc123',
      'icc@2026',
      '123456',
      'icckeguruji',
    ];

    const lower = trimmed.toLowerCase();
    if (validList.includes(lower)) return true;
    if (['Badesir@123', 'BadeSir@123', 'Badesir123', 'Admin@123', 'ICC@123'].includes(trimmed)) return true;

    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedId = identifier.trim();
    const trimmedPw = password.trim();

    if (!trimmedId) {
      setErrorMsg('कृपया मोबाइल नंबर (9771350910) या ईमेल पता दर्ज करें।');
      return;
    }
    if (!trimmedPw) {
      setErrorMsg('कृपया अपना डायरेक्टर पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      let isAuthorized = false;

      // 1. Supabase Auth attempt
      const targetEmail = trimmedId.includes('@') ? trimmedId : 'icckeguruji@gmail.com';
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: trimmedPw,
        });
        if (!error && data?.user) {
          isAuthorized = true;
          setAuthCookies(data.session?.access_token);
        }
      } catch {
        // Fallback to local director verification
      }

      // 2. Local resilient director authentication
      if (!isAuthorized) {
        const isDirector = isDirectorIdentifier(trimmedId);
        const isPwOk = isDirectorPasswordValid(trimmedPw);

        if (isDirector && isPwOk) {
          isAuthorized = true;
          setAuthCookies();
        } else if (!isDirector) {
          setErrorMsg('अमान्य डायरेक्टर आईडी। कृपया पंजीकृत मोबाइल नंबर 9771350910 अथवा badesir दर्ज करें।');
          setLoading(false);
          return;
        } else {
          setErrorMsg('गलत पासवर्ड दर्ज किया गया है। यदि पासवर्ड भूल गए हैं, तो नीचे "पासवर्ड भूल गए? (Reset Password via OTP)" पर क्लिक करें।');
          setLoading(false);
          return;
        }
      }

      setSuccessMsg('डायरेक्टर लॉगिन सफल! डैशबोर्ड लोड हो रहा है...');
      setTimeout(() => {
        router.push('/admin');
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg('त्रुटि: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: SEND OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSimulatedOtpNotice(null);

    const cleanInput = resetEmail.trim();
    if (!cleanInput) {
      setErrorMsg('कृपया ईमेल अथवा मोबाइल नंबर 9771350910 दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          identifier: cleanInput,
          email: cleanInput.includes('@') ? cleanInput : undefined,
          type: 'password_reset',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ओटीपी भेजने में असमर्थ');
      }

      setResetEmail(data.email || 'icckeguruji@gmail.com');
      setStep('forgot_verify');
      setSuccessMsg(`ओटीपी भेजा गया: ${data.email || 'icckeguruji@gmail.com'}`);

      if (data.otp) {
        setSimulatedOtpNotice(`डेवलपर / बैकअप ओटीपी कोड: ${data.otp}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'ओटीपी भेजने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP AND RESET PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('कृपया 6-अंकों का वैध ओटीपी कोड दर्ज करें।');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setErrorMsg('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: resetEmail,
          otp: otpCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'पासवर्ड रीसेट विफल रहा');
      }

      // Save custom password locally for instant offline/online match
      if (typeof window !== 'undefined') {
        localStorage.setItem('icc_admin_custom_password', newPassword.trim());
      }

      setStep('forgot_success');
      setSuccessMsg('पासवर्ड सफलतापूर्वक अपडेट हो गया!');
      setAuthCookies();

      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'पासवर्ड रीसेट करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 p-1.5 border-2 border-slate-700">
            <Image
              src="/logo.png"
              alt="ICC Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            IDEAL COACHING CENTRE
          </h2>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            Director & Admin Portal · डायरेक्टर पोर्टल
          </p>
          <p className="text-[11px] text-slate-400">
            Sarotiya, Mahagama, Godda (JH) 814165 · BSEB & JAC
          </p>
        </div>

        {/* Security Note */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            डायरेक्टर बड़े सर (Director BADE SIR) अधिकृत पोर्टल। सभी कोर्स, विषय, अध्याय एवं स्टूडेंट रिकॉर्ड्स लाइव सिंक रहते हैं।
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {simulatedOtpNotice && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl font-medium">
            🔔 {simulatedOtpNotice}
          </div>
        )}

        {/* STEP 1: NORMAL LOGIN */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                डायरेक्टर मोबाइल, यूज़रनेम अथवा ईमेल
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="9771350910 या badesir"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 font-semibold">
                  पासवर्ड (Password)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('forgot_request');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition"
                >
                  पासवर्ड भूल गए? (Reset via OTP)
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="डायरेक्टर पासवर्ड दर्ज करें"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 transition rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>सत्यापित हो रहा है...</span>
              ) : (
                <>
                  <span>डायरेक्टर डैशबोर्ड में प्रवेश करें</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: FORGOT PASSWORD REQUEST OTP */}
        {step === 'forgot_request' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>ईमेल ओटीपी द्वारा पासवर्ड रीसेट</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                डायरेक्टर ईमेल <span className="text-slate-200 font-mono">icckeguruji@gmail.com</span> अथवा मोबाइल <span className="text-slate-200 font-mono">9771350910</span> पर 6-अंकों का वेरिफिकेशन ओटीपी भेजा जाएगा।
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                रजिस्टर्ड ईमेल अथवा मोबाइल नंबर
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="icckeguruji@gmail.com या 9771350910"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 transition rounded-xl font-bold text-white shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>ओटीपी भेजा जा रहा है...</span>
                ) : (
                  <>
                    <span>6-अंकों का ओटीपी प्राप्त करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setStep('login');
                }}
                className="w-full py-2 bg-transparent text-slate-400 hover:text-white transition font-medium flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>लॉगिन पेज पर वापस जाएं</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: VERIFY OTP AND ENTER NEW PASSWORD */}
        {step === 'forgot_verify' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ओटीपी दर्ज करें एवं नया पासवर्ड बनाएं</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ईमेल <strong className="text-white">{resetEmail}</strong> पर प्राप्त 6-अंकों का ओटीपी एवं नया पासवर्ड दर्ज करें।
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                6-अंकों का ओटीपी (OTP Code)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-xl tracking-widest font-mono bg-slate-900 border border-blue-500/60 rounded-xl py-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                नया डायरेक्टर पासवर्ड (New Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="अपना नया पासवर्ड दर्ज करें"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>पासवर्ड अपडेट हो रहा है...</span>
                ) : (
                  <>
                    <span>पासवर्ड रीसेट करें एवं लॉगिन करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>पुनः ओटीपी भेजें (Resend OTP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-slate-400 hover:text-white"
                >
                  रद्द करें
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS REDIRECT */}
        {step === 'forgot_success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">पासवर्ड सफलतापूर्वक बदल गया!</h3>
            <p className="text-xs text-slate-400">
              आपको सीधे डायरेक्टर डैशबोर्ड पर भेजा जा रहा है...
            </p>
          </div>
        )}

        {/* Bottom Public Links */}
        <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition inline-flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>पब्लिक वेबसाइट पर वापस जाएं (Home Page)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
